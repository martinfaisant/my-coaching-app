import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { CoachAthletesListWithFilter } from '@/app/[locale]/dashboard/CoachAthletesListWithFilter'
import type { CoachSubscriptionRow } from '@/app/[locale]/dashboard/CoachSubscriptionDetailModal'
import { getFrozenTitleForLocale } from '@/lib/frozenOfferI18n'
import { PendingRequestTile } from '@/app/[locale]/dashboard/PendingRequestTile'
import {
  getPendingCoachRequests,
} from '@/app/[locale]/dashboard/actions'
import type { Profile } from '@/types/database'
import { formatShortDate } from '@/lib/dateUtils'
import { getDisplayName } from '@/lib/displayName'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'navigation' })
  return {
    title: t('athletes')
  }
}

type CoachAthleteData = {
  plannedUntil: string | null
  nextGoal: { date: string; race_name: string } | null
  isUpToDate: boolean
}

export default async function CoachAthletesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'coach') {
    redirect(pathWithLocale(locale, '/dashboard'))
  }

  const supabase = await createClient()
  const t = await getTranslations({ locale, namespace: 'athletes' })
  const tNav = await getTranslations({ locale, namespace: 'navigation' })

  const [pendingResult, athletesResult] = await Promise.all([
    getPendingCoachRequests(locale),
    supabase
      .from('profiles')
      .select('user_id, email, first_name, last_name, role, coach_id, created_at, updated_at, practiced_sports, avatar_url')
      .eq('coach_id', current.id)
      .order('email'),
  ])
  const pendingRequests = pendingResult
  const visibleProfiles = (athletesResult.data ?? []) as Profile[]
  const coachAthleteIds = visibleProfiles.map((p) => p.user_id)

  const isCoachProfileComplete =
    ([(current.profile.first_name ?? '').trim(), (current.profile.last_name ?? '').trim()].filter(Boolean).join(' ').trim() !== '') &&
    (current.profile.coached_sports ?? []).length > 0 &&
    (current.profile.languages ?? []).length > 0 &&
    (((current.profile.presentation_fr ?? '').trim() !== '' || (current.profile.presentation_en ?? '').trim() !== ''))

  let coachAthleteData: Record<string, CoachAthleteData> = {}
  let subscriptionByAthleteId: Record<string, CoachSubscriptionRow> = {}

  if (coachAthleteIds.length > 0) {
    const [workoutsResult, goalsResult, subscriptionsResult] = await Promise.all([
      supabase
        .from('workouts')
        .select('athlete_id, date')
        .in('athlete_id', coachAthleteIds),
      supabase
        .from('goals')
        .select('athlete_id, date, race_name, is_primary')
        .in('athlete_id', coachAthleteIds)
        .order('date', { ascending: true }),
      supabase
        .from('subscriptions')
        .select('id, athlete_id, frozen_title, frozen_title_fr, frozen_title_en, frozen_description, frozen_description_fr, frozen_description_en, frozen_price, frozen_price_type, start_date, end_date, status, cancellation_requested_by_user_id')
        .eq('coach_id', current.id)
        .in('status', ['active', 'cancellation_scheduled']),
    ])
    const now = new Date()
    for (const sub of subscriptionsResult.data ?? []) {
      const endDate = sub.end_date ? new Date(sub.end_date) : null
      if (!endDate || endDate > now) {
        subscriptionByAthleteId[sub.athlete_id] = sub as CoachSubscriptionRow
      }
    }
    const workoutsRows = workoutsResult.data
    const goalsRows = goalsResult.data

    const todayStr =
      now.getFullYear() +
      '-' +
      String(now.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(now.getDate()).padStart(2, '0')
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const tomorrowStr =
      tomorrow.getFullYear() +
      '-' +
      String(tomorrow.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(tomorrow.getDate()).padStart(2, '0')

    const plannedUntilByAthlete: Record<string, string> = {}
    for (const w of workoutsRows ?? []) {
      const cur = plannedUntilByAthlete[w.athlete_id]
      if (!cur || w.date > cur) plannedUntilByAthlete[w.athlete_id] = w.date
    }
    const nextGoalByAthlete: Record<string, { date: string; race_name: string }> = {}
    for (const g of goalsRows ?? []) {
      if (g.date < todayStr) continue
      if (!nextGoalByAthlete[g.athlete_id]) {
        nextGoalByAthlete[g.athlete_id] = { date: g.date, race_name: g.race_name }
      }
    }

    for (const id of coachAthleteIds) {
      const plannedUntil = plannedUntilByAthlete[id] ?? null
      coachAthleteData[id] = {
        plannedUntil,
        nextGoal: nextGoalByAthlete[id] ?? null,
        isUpToDate: plannedUntil ? plannedUntil > tomorrowStr : false,
      }
    }
  }

  const athleteTiles =
    visibleProfiles.length > 0
      ? visibleProfiles.map((p) => {
          const displayName = getDisplayName(p, p.email ?? '')
          const athleteHref = `/dashboard/athletes/${p.user_id}`
          const data = coachAthleteData[p.user_id]
          const plannedUntil = data?.plannedUntil ?? null
          const nextGoal = data?.nextGoal ?? null
          const isUpToDate = data?.isUpToDate ?? false
          const practicedSports = p.practiced_sports ?? []
          const subscription = subscriptionByAthleteId[p.user_id] ?? null
          const subscriptionTitle = subscription ? getFrozenTitleForLocale(subscription, locale) : null
          return {
            displayName,
            athlete: {
              displayName,
              avatarUrl: p.avatar_url ? `${p.avatar_url}?t=${p.updated_at}` : null,
            },
            subscription: subscription as CoachSubscriptionRow | null,
            subscriptionTitle,
            locale,
            currentUserId: current.id,
            athleteHref,
            practicedSports,
            nextGoal: nextGoal ? { date: formatShortDate(nextGoal.date), raceName: nextGoal.race_name } : null,
            plannedUntil: plannedUntil ? formatShortDate(plannedUntil) : undefined,
            plannedUntilRaw: plannedUntil ?? null,
            isUpToDate,
            labels: {
              nextGoal: t('athleteCard.nextGoal'),
              noGoal: t('athleteCard.noGoal'),
              plannedUntil: t('athleteCard.plannedUntil'),
              upToDate: t('athleteCard.upToDate'),
              late: t('athleteCard.late'),
            },
            viewPlanningLabel: t('athleteCard.viewPlanning'),
          }
        })
      : []

  return (
    <DashboardPageShell>
      {!isCoachProfileComplete && (
        <div className="rounded-xl border border-palette-olive/40 bg-section p-6 mb-8">
          <p className="text-stone-800 font-medium mb-1">
            {t('completeProfilePrompt.title')}
          </p>
          <p className="text-sm text-stone-600 mb-4">
            {t('completeProfilePrompt.description')}
          </p>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center rounded-lg bg-palette-forest-dark px-4 py-2.5 text-sm font-medium text-white hover:bg-palette-olive transition-colors focus:outline-none focus:ring-2 focus:ring-palette-olive focus:ring-offset-2"
          >
            {t('completeProfilePrompt.button')}
          </Link>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="text-base font-semibold text-stone-900 mb-2">
            {t('pendingRequests.titleWithCount', { count: pendingRequests.length })}
          </h2>
          <p className="text-sm text-stone-600 mb-4">
            {t('pendingRequests.description')}
          </p>
          <ul className="space-y-3">
            {pendingRequests.map((req) => (
              <PendingRequestTile key={req.id} request={req} />
            ))}
          </ul>
        </section>
      )}

      <section>
        {visibleProfiles.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-section border-dashed p-12 text-center">
            <p className="text-stone-600 font-medium">
              {t('noAthletes.title')}
            </p>
            <p className="text-sm text-stone-500 mt-2">
              {t('noAthletes.description')}
            </p>
          </div>
        ) : (
          <CoachAthletesListWithFilter
            athletes={athleteTiles}
            showDivider={pendingRequests.length > 0}
          />
        )}
      </section>
    </DashboardPageShell>
  )
}

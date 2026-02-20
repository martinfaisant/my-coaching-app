import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { AvatarImage } from '@/components/AvatarImage'
import { CoachAthleteTileWithModal } from '@/app/[locale]/dashboard/CoachAthleteTileWithModal'
import type { CoachSubscriptionRow } from '@/app/[locale]/dashboard/CoachSubscriptionDetailModal'
import { Badge } from '@/components/Badge'
import { getFrozenTitleForLocale } from '@/lib/frozenOfferI18n'
import { FindCoachSection } from '@/app/[locale]/dashboard/FindCoachSection'
import { RespondToRequestButtons } from '@/app/[locale]/dashboard/RespondToRequestButtons'
import {
  getMyCoachRequests,
  getPendingCoachRequests,
} from '@/app/[locale]/dashboard/actions'
import type { Profile } from '@/types/database'
import { formatShortDate } from '@/lib/dateUtils'
import { getDisplayName } from '@/lib/displayName'
import { getInitials } from '@/lib/stringUtils'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('dashboardTitle'),
    description: t('dashboardDescription')
  }
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const current = await getCurrentUserWithProfile()
  const supabase = await createClient()
  
  const t = await getTranslations({ locale, namespace: 'athletes' })
  const tFindCoach = await getTranslations({ locale, namespace: 'findCoach' })

  const ROLE_LABELS: Record<Profile['role'], string> = {
    athlete: t('roles.athlete'),
    coach: t('roles.coach'),
    admin: t('roles.admin'),
  }

  // Athlète avec coach : rediriger vers le calendrier
  if (current.profile.role === 'athlete' && current.profile.coach_id) {
    redirect('/dashboard/calendar')
  }

  // Athlète sans coach : page "Trouver un coach"
  if (current.profile.role === 'athlete' && !current.profile.coach_id) {
    const [coachesResult, myRequests, ratingStats, offersResult] = await Promise.all([
      supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, coached_sports, languages, presentation_fr, presentation_en, avatar_url')
        .eq('role', 'coach')
        .order('email'),
      getMyCoachRequests(),
      supabase.rpc('get_coach_rating_stats'),
      supabase
        .from('coach_offers')
        .select('id, coach_id, title, description, title_fr, title_en, description_fr, description_en, price, price_type, is_featured, display_order')
        .eq('status', 'published')
        .order('display_order')
        .range(0, 999),
    ])
    const coaches = coachesResult.data
    const allOffers = offersResult.data ?? []

    const statusByCoach: Record<string, 'pending' | 'declined'> = {}
    const requestIdByCoach: Record<string, string> = {}
    for (const r of myRequests) {
      if (statusByCoach[r.coach_id] === undefined) statusByCoach[r.coach_id] = r.status as 'pending' | 'declined'
      if (r.status === 'pending') requestIdByCoach[r.coach_id] = r.id
    }

    const ratingsByCoach: Record<string, { averageRating: number; reviewCount: number }> = {}
    for (const row of ratingStats.data ?? []) {
      ratingsByCoach[row.coach_id] = {
        averageRating: Number(row.avg_rating),
        reviewCount: Number(row.review_count ?? 0),
      }
    }

    // Organiser les offres par coach_id (title/description FR-EN pour affichage selon locale)
    const offersByCoach: Record<string, Array<{ id: string; title: string; description: string | null; title_fr?: string | null; title_en?: string | null; description_fr?: string | null; description_en?: string | null; price: number; price_type: string; is_featured: boolean; display_order: number }>> = {}
    for (const offer of allOffers) {
      if (!offersByCoach[offer.coach_id]) {
        offersByCoach[offer.coach_id] = []
      }
      offersByCoach[offer.coach_id].push({
        id: offer.id,
        title: offer.title,
        description: offer.description ?? null,
        title_fr: offer.title_fr ?? null,
        title_en: offer.title_en ?? null,
        description_fr: offer.description_fr ?? null,
        description_en: offer.description_en ?? null,
        price: offer.price,
        price_type: offer.price_type,
        is_featured: offer.is_featured,
        display_order: offer.display_order,
      })
    }

    const coachesForList = (coaches ?? [])
      .filter((c) => {
        const first = (c.first_name ?? '').trim()
        const last = (c.last_name ?? '').trim()
        const hasName = [first, last].filter(Boolean).join(' ').trim() !== ''
        const hasSports = (c.coached_sports ?? []).length > 0
        const hasLanguages = (c.languages ?? []).length > 0
        const hasPresentation =
          ((c.presentation_fr ?? '').trim() !== '' || (c.presentation_en ?? '').trim() !== '')
        return hasName && hasSports && hasLanguages && hasPresentation
      })
      .map((c) => ({
        user_id: c.user_id,
        email: c.email,
        first_name: c.first_name ?? null,
        last_name: c.last_name ?? null,
        coached_sports: c.coached_sports ?? null,
        languages: c.languages ?? null,
        presentation_fr: c.presentation_fr ?? null,
        presentation_en: c.presentation_en ?? null,
        avatar_url: c.avatar_url ?? null,
      }))

    return (
      <DashboardPageShell title={tFindCoach('pageTitle')}>
        {(coachesForList.length === 0) ? (
          <p className="text-sm text-stone-600">
            {tFindCoach('noCoaches')}
          </p>
        ) : (
          <FindCoachSection coaches={coachesForList} statusByCoach={statusByCoach} requestIdByCoach={requestIdByCoach} initialPracticedSports={current.profile.practiced_sports ?? []} ratingsByCoach={ratingsByCoach} offersByCoach={offersByCoach} />
        )}
      </DashboardPageShell>
    )
  }

  // Coach / Admin : tableau de bord avec liste des membres
  let visibleProfiles: Profile[] = []
  let pendingRequests: Awaited<ReturnType<typeof getPendingCoachRequests>> = []
  let coachAthleteIds: string[] = []

  const isCoachProfileComplete =
    current.profile.role === 'coach' &&
    ([(current.profile.first_name ?? '').trim(), (current.profile.last_name ?? '').trim()].filter(Boolean).join(' ').trim() !== '') &&
    (current.profile.coached_sports ?? []).length > 0 &&
    (current.profile.languages ?? []).length > 0 &&
    (((current.profile.presentation_fr ?? '').trim() !== '' || (current.profile.presentation_en ?? '').trim() !== ''))

  if (current.profile.role === 'admin') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    visibleProfiles = (data ?? []) as Profile[]
  } else if (current.profile.role === 'coach') {
    const [pendingResult, athletesResult] = await Promise.all([
      getPendingCoachRequests(locale),
      supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name, role, coach_id, created_at, updated_at, practiced_sports, avatar_url')
        .eq('coach_id', current.id)
        .order('email'),
    ])
    pendingRequests = pendingResult
    visibleProfiles = (athletesResult.data ?? []) as Profile[]
    coachAthleteIds = visibleProfiles.map((p) => p.user_id)
  } else {
    visibleProfiles = [current.profile as Profile]
  }

  // Coach : chargement workouts + goals en parallèle pour "Planifié jusqu'au" et "Prochain objectif"
  type CoachAthleteData = {
    plannedUntil: string | null
    nextGoal: { date: string; race_name: string } | null
    isUpToDate: boolean
  }
  let coachAthleteData: Record<string, CoachAthleteData> = {}
  let subscriptionByAthleteId: Record<string, CoachSubscriptionRow> = {}
  if (current.profile.role === 'coach' && coachAthleteIds.length > 0) {
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

  const athleteCount = current.profile.role === 'coach' ? visibleProfiles.length : 0
  const pageTitle = current.profile.role === 'admin'
    ? t('allMembers')
    : current.profile.role === 'coach'
      ? t('pageTitle', { count: athleteCount })
      : t('dashboard')

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      {/* HEADER */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white border-b border-stone-100">
        <div>
          <h1 className="text-xl font-bold text-stone-800">{pageTitle}</h1>
        </div>
      </header>

      {/* ZONE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-10">
        {current.profile.role === 'admin' && (
          <div className="mb-8">
            <Link
              href="/admin/members"
              className="inline-flex items-center rounded-lg bg-palette-forest-dark px-4 py-2 text-sm font-medium text-white border-2 border-palette-olive hover:bg-palette-olive transition-colors"
            >
              {t('manageMembers')}
            </Link>
          </div>
        )}

        {current.profile.role === 'coach' && !isCoachProfileComplete && (
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

        {current.profile.role === 'coach' && pendingRequests.length > 0 && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-stone-900 mb-2">
              {t('pendingRequests.title')}
            </h2>
            <p className="text-sm text-stone-600 mb-4">
              {t('pendingRequests.description')}
            </p>
            <ul className="space-y-3">
              {pendingRequests.map((req) => {
                const name = req.athlete_name || req.athlete_email || '—'
                const sportValues = (req.sport_practiced || '')
                  .split(',')
                  .map((v) => v.trim())
                  .filter(Boolean)
                return (
                  <li
                    key={req.id}
                    className="rounded-xl border border-stone-200 border-l-4 border-l-amber-400 bg-section overflow-hidden flex flex-wrap items-center justify-between gap-4 p-4"
                  >
                    <div className="flex gap-4 min-w-0 flex-1">
                      <AvatarImage
                        src={req.athlete_avatar_url}
                        initials={getInitials(name)}
                        className="w-12 h-12 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-stone-900">{name}</p>
                        {req.athlete_email && name !== req.athlete_email && (
                          <p className="text-sm text-stone-600 mt-0.5">{req.athlete_email}</p>
                        )}
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {sportValues.map((v) => (
                            <Badge key={v} sport={v as Parameters<typeof Badge>[0]['sport']} />
                          ))}
                        </div>
                        {req.offer_title && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs font-medium text-stone-500">{t('pendingRequests.offerChosen')}</span>
                            <span className="text-xs font-semibold text-stone-900">{req.offer_title}</span>
                            {req.offer_price !== null && (
                              <span className="text-xs text-stone-600">
                                {req.offer_price_type === 'free' ? t('pendingRequests.free') : req.offer_price_type === 'monthly' ? `${req.offer_price}€${t('pendingRequests.perMonth')}` : `${req.offer_price}€`}
                              </span>
                            )}
                          </div>
                        )}
                        <p className="text-sm text-stone-600 mt-2 italic">&quot;{req.coaching_need}&quot;</p>
                      </div>
                    </div>
                    <RespondToRequestButtons requestId={req.id} />
                  </li>
                )
              })}
            </ul>
          </section>
        )}

        <section>
          {current.profile.role === 'coach' ? (
            visibleProfiles.length === 0 ? (
              <div className="rounded-2xl border border-stone-200 bg-section border-dashed p-12 text-center">
                <p className="text-stone-600 font-medium">
                  {t('noAthletes.title')}
                </p>
                <p className="text-sm text-stone-500 mt-2">
                  {t('noAthletes.description')}
                </p>
              </div>
            ) : (
            <>
              {pendingRequests.length > 0 && (
                <>
                  <div className="border-t border-stone-200 my-8"></div>
                  <h2 className="text-base font-semibold text-stone-900 mb-4">
                    {t('myAthletes')}
                  </h2>
                </>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProfiles.map((p) => {
                const displayName = getDisplayName(p, p.email ?? '')
                const athleteHref = `/dashboard/athletes/${p.user_id}`
                const data = coachAthleteData[p.user_id]
                const plannedUntil = data?.plannedUntil ?? null
                const nextGoal = data?.nextGoal ?? null
                const isUpToDate = data?.isUpToDate ?? false
                const practicedSports = p.practiced_sports ?? []
                const subscription = subscriptionByAthleteId[p.user_id] ?? null
                const subscriptionTitle = subscription ? getFrozenTitleForLocale(subscription, locale) : null

                return (
                  <CoachAthleteTileWithModal
                    key={p.user_id}
                    athlete={{
                      displayName,
                      avatarUrl: p.avatar_url ? `${p.avatar_url}?t=${p.updated_at}` : null,
                    }}
                    subscription={subscription}
                    subscriptionTitle={subscriptionTitle}
                    locale={locale}
                    currentUserId={current.id}
                    athleteHref={athleteHref}
                    practicedSports={practicedSports}
                    nextGoal={nextGoal ? { date: formatShortDate(nextGoal.date), raceName: nextGoal.race_name } : null}
                    plannedUntil={plannedUntil ? formatShortDate(plannedUntil) : undefined}
                    isUpToDate={isUpToDate}
                    labels={{
                      nextGoal: t('athleteCard.nextGoal'),
                      noGoal: t('athleteCard.noGoal'),
                      plannedUntil: t('athleteCard.plannedUntil'),
                      upToDate: t('athleteCard.upToDate'),
                      late: t('athleteCard.late'),
                    }}
                    viewPlanningLabel={t('athleteCard.viewPlanning')}
                  />
                )
              })}
              </div>
            </>
            )
          ) : (
            <ul className="space-y-2.5">
              {visibleProfiles.map((p) => {
                const displayName = getDisplayName(p, p.email ?? '')
                const isAthleteOfMine = current.profile.role === 'coach' && p.coach_id === current.id
                const athleteHref = `/dashboard/athletes/${p.user_id}`

                if (isAthleteOfMine) {
                  return (
                    <li key={p.user_id}>
                      <Link
                        href={athleteHref}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-section p-4 hover:bg-stone-50 hover:border-stone-300 transition-colors group"
                      >
                        <div>
                          <p className="font-medium text-stone-900">{displayName}</p>
                          <p className="text-sm text-stone-600 mt-0.5">
                            {ROLE_LABELS[p.role]}
                            {p.coach_id && ' (athlète)'}
                          </p>
                        </div>
                        <svg
                          className="h-5 w-5 text-stone-400 group-hover:text-stone-600 flex-shrink-0 transition-colors"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </Link>
                    </li>
                  )
                }

                return (
                  <li
                    key={p.user_id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-200 bg-section p-4"
                  >
                    <div>
                      <p className="font-medium text-stone-900">{p.email}</p>
                      <p className="text-sm text-stone-600 mt-0.5">
                        {ROLE_LABELS[p.role]}
                        {p.coach_id && ' (athlète)'}
                      </p>
                    </div>
                    {p.user_id === current.id && (
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">
                        {t('you')}
                      </span>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

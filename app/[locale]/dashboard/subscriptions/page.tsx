import type { Metadata } from 'next'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/utils/supabase/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { getDisplayName } from '@/lib/displayName'
import { CoachSubscriptionsContent } from '@/app/[locale]/dashboard/subscriptions/CoachSubscriptionsContent'
import type { CoachSubscriptionRow } from '@/app/[locale]/dashboard/CoachSubscriptionDetailModal'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'coachSubscriptions' })
  return { title: t('title') }
}

export default async function CoachSubscriptionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'coach') {
    redirect('/dashboard')
  }

  const t = await getTranslations({ locale, namespace: 'coachSubscriptions' })
  const supabase = await createClient()

  const [activeAndScheduledResult, historyResult] = await Promise.all([
    supabase
      .from('subscriptions')
      .select('id, athlete_id, frozen_title, frozen_title_fr, frozen_title_en, frozen_description, frozen_description_fr, frozen_description_en, frozen_price, frozen_price_type, start_date, end_date, status, cancellation_requested_by_user_id')
      .eq('coach_id', current.id)
      .in('status', ['active', 'cancellation_scheduled'])
      .order('start_date', { ascending: false }),
    supabase
      .from('subscriptions')
      .select('id, athlete_id, frozen_title, frozen_title_fr, frozen_title_en, frozen_description, frozen_description_fr, frozen_description_en, frozen_price, frozen_price_type, start_date, end_date')
      .eq('coach_id', current.id)
      .eq('status', 'cancelled')
      .order('end_date', { ascending: false }),
  ])

  const now = new Date()
  const allActiveAndScheduled = activeAndScheduledResult.data ?? []
  const activeRows = allActiveAndScheduled.filter((s) => s.status === 'active')
  const cancellationScheduledRows = allActiveAndScheduled.filter((s) => s.status === 'cancellation_scheduled')
  const historyRows = historyResult.data ?? []

  const athleteIds = [...new Set([
    ...activeRows.map((s) => s.athlete_id),
    ...cancellationScheduledRows.map((s) => s.athlete_id),
    ...historyRows.map((s) => s.athlete_id),
  ])]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email, avatar_url')
    .in('user_id', athleteIds)

  const profileById = new Map(profiles?.map((p) => [p.user_id, p]) ?? [])

  const activeSubscriptions = activeRows.map((sub) => {
    const p = profileById.get(sub.athlete_id)
    const displayName = p ? getDisplayName(p) : '—'
    const avatarUrl = p?.avatar_url ?? null
    return {
      subscription: sub as CoachSubscriptionRow,
      athlete: { displayName, avatarUrl },
    }
  })

  const cancellationScheduledSubscriptions = cancellationScheduledRows.map((sub) => {
    const p = profileById.get(sub.athlete_id)
    const displayName = p ? getDisplayName(p) : '—'
    const avatarUrl = p?.avatar_url ?? null
    return {
      subscription: sub as CoachSubscriptionRow,
      athlete: { displayName, avatarUrl },
    }
  })

  const historySubscriptions = historyRows.map((sub) => {
    const p = profileById.get(sub.athlete_id)
    const displayName = p ? getDisplayName(p) : '—'
    return {
      subscription: sub as CoachSubscriptionRow,
      athlete: { displayName },
    }
  })

  return (
    <DashboardPageShell>
      <CoachSubscriptionsContent
        activeSubscriptions={activeSubscriptions}
        cancellationScheduledSubscriptions={cancellationScheduledSubscriptions}
        historySubscriptions={historySubscriptions}
        locale={locale}
        currentUserId={current.id}
      />
    </DashboardPageShell>
  )
}

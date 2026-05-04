import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { getCurrentUserWithProfile } from '@/utils/auth'
import {
  defaultSportFromProfile,
  buildWeeklyVolumeSeries,
  normalizeYears,
  type AthleteStatsGranularity,
  type AthleteStatsMetric,
} from '@/lib/athleteStatsVolume'
import type { SportType } from '@/types/database'
import { getEffectiveWeeklyTotalsFait } from '@/app/[locale]/dashboard/workouts/actions'
import { AthleteStatsPageClient } from './AthleteStatsPageClient'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('statsTitle'),
  }
}

export default async function AthleteStatsPage() {
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'athlete') {
    redirect('/dashboard')
  }

  const defaultSport = defaultSportFromProfile(current.profile.practiced_sports)
  const y = new Date().getFullYear()
  const initialYears = normalizeYears([y, y - 1])
  const granularity: AthleteStatsGranularity = 'week'
  const metric: AthleteStatsMetric = 'time'

  const startDate = `${Math.min(...initialYears)}-01-01`
  const endDate = `${Math.max(...initialYears)}-12-31`

  const { weeklyTotals, error: faitError } = await getEffectiveWeeklyTotalsFait(current.id, startDate, endDate)

  let initialPayload = null
  if (!faitError && weeklyTotals) {
    initialPayload = {
      series: buildWeeklyVolumeSeries(weeklyTotals, initialYears, defaultSport as SportType, metric),
      years: initialYears,
      granularity,
      metric,
    }
  }

  return (
    <AthleteStatsPageClient
      initialPayload={initialPayload}
      initialError={faitError ?? null}
      defaultSport={defaultSport as SportType}
    />
  )
}

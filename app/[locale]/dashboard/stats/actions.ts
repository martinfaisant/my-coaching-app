'use server'

import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import { requireUser, getProfile } from '@/lib/authHelpers'
import { getEffectiveWeeklyTotalsFait } from '@/app/[locale]/dashboard/workouts/actions'
import type { SportType } from '@/types/database'
import { createError, createSuccess, type ApiResult } from '@/lib/errors'
import {
  type AthleteStatsGranularity,
  type AthleteStatsMetric,
  ATHLETE_STATS_SPORT_OPTIONS,
  buildMonthlyVolumeSeries,
  buildWeeklyVolumeSeries,
  normalizeYears,
  type VolumeChartSeries,
} from '@/lib/athleteStatsVolume'
import { logger } from '@/lib/logger'

export type AthleteVolumeChartPayload = {
  series: VolumeChartSeries[]
  years: number[]
  granularity: AthleteStatsGranularity
  metric: AthleteStatsMetric
}

function isSportTypeStats(value: string): value is SportType {
  return (ATHLETE_STATS_SPORT_OPTIONS as readonly string[]).includes(value)
}

/**
 * Données pour le graphique volume réalisé (US-STATS-01).
 * Périmètre : années civiles, max 3, une métrique, un sport.
 */
export async function loadAthleteVolumeChartData(input: {
  years: number[]
  sport: string
  granularity: AthleteStatsGranularity
  metric: AthleteStatsMetric
  locale: string
}): Promise<ApiResult<AthleteVolumeChartPayload>> {
  const { granularity, metric, locale } = input
  const supabase = await createClient()
  const [tAuth, tStats] = await Promise.all([
    getTranslations({ locale, namespace: 'auth.errors' }),
    getTranslations({ locale, namespace: 'athleteStats' }),
  ])

  const authResult = await requireUser(supabase)
  if ('error' in authResult) {
    return createError(tAuth('notAuthenticated'))
  }

  const profile = await getProfile(supabase, authResult.user.id, 'role')
  if (!profile?.role) {
    return createError(tAuth('profileNotFound'))
  }
  if (profile.role !== 'athlete') {
    return createError(tStats('errors.athleteOnly'))
  }

  const years = normalizeYears(input.years.map(Number))
  if (years.length === 0) {
    return createError(tStats('errors.yearsRequired'), 'VALIDATION_ERROR')
  }

  if (!isSportTypeStats(input.sport)) {
    return createError(tStats('errors.invalidSport'), 'VALIDATION_ERROR')
  }
  const sport: SportType = input.sport

  const minY = Math.min(...years)
  const maxY = Math.max(...years)
  const startDate = `${minY}-01-01`
  const endDate = `${maxY}-12-31`

  try {
    const { error, weeklyTotals } = await getEffectiveWeeklyTotalsFait(authResult.user.id, startDate, endDate)
    if (error) {
      logger.error('loadAthleteVolumeChartData getEffectiveWeeklyTotalsFait', new Error(error))
      return createError(tStats('errors.loadFailed'))
    }

    const series =
      granularity === 'week'
        ? buildWeeklyVolumeSeries(weeklyTotals, years, sport, metric)
        : buildMonthlyVolumeSeries(weeklyTotals, years, sport, metric)

    return createSuccess({
      series,
      years,
      granularity,
      metric,
    })
  } catch (e) {
    logger.error('loadAthleteVolumeChartData', e instanceof Error ? e : new Error(String(e)))
    return createError(tStats('errors.loadFailed'))
  }
}

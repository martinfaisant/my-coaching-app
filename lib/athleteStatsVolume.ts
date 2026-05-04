/**
 * Agrégation volume réalisé (« fait ») pour la page statistiques athlète.
 */
import type { ImportedActivityWeeklyTotal } from '@/types/database'
import type { SportType } from '@/types/database'
import { getWeekMonday, toDateStr } from '@/lib/dateUtils'

export type AthleteStatsMetric = 'time' | 'distance' | 'elevation'
export type AthleteStatsGranularity = 'week' | 'month'

/** Lundi de chaque semaine dont la date tombe dans l’année civile [year]. */
export function listMondayWeekStartsInCivilYear(year: number): string[] {
  const result: string[] = []
  let d = getWeekMonday(`${year}-01-01T12:00:00`)
  if (d.getFullYear() < year) {
    const next = new Date(d)
    next.setDate(next.getDate() + 7)
    d = next
  }
  const end = new Date(year, 11, 31, 23, 59, 59)
  while (d <= end && d.getFullYear() === year) {
    result.push(toDateStr(d))
    const n = new Date(d)
    n.setDate(n.getDate() + 7)
    d = n
  }
  return result
}

function metricValue(
  row: Pick<ImportedActivityWeeklyTotal, 'total_moving_time_seconds' | 'total_distance_m' | 'total_elevation_m'>,
  metric: AthleteStatsMetric,
  sport: SportType,
): number {
  switch (metric) {
    case 'time':
      return (row.total_moving_time_seconds ?? 0) / 3600
    case 'distance': {
      const m = row.total_distance_m ?? 0
      return sport === 'natation' ? m : m / 1000
    }
    case 'elevation':
      return row.total_elevation_m ?? 0
    default:
      return 0
  }
}

export type VolumeChartDatum = {
  x: number
  y: number
  weekStart?: string
  weekIndex?: number
  monthIndex?: number
}

export type VolumeChartSeries = {
  id: string
  data: VolumeChartDatum[]
}

function rowsForSport(
  totals: ImportedActivityWeeklyTotal[],
  sport: SportType,
  year: number,
): ImportedActivityWeeklyTotal[] {
  const yStr = String(year)
  return totals.filter(
    (r) =>
      r.sport_type === sport &&
      r.week_start >= `${yStr}-01-01` &&
      r.week_start <= `${yStr}-12-31`,
  )
}

/** Séries par semaine : index 1..n aligné sur les lundis de l’année civile. */
export function buildWeeklyVolumeSeries(
  totals: ImportedActivityWeeklyTotal[],
  years: readonly number[],
  sport: SportType,
  metric: AthleteStatsMetric,
): VolumeChartSeries[] {
  return years.map((year) => {
    const mondays = listMondayWeekStartsInCivilYear(year)
    const byWeekStart = new Map<string, ImportedActivityWeeklyTotal>()
    for (const r of rowsForSport(totals, sport, year)) {
      byWeekStart.set(r.week_start, r)
    }

    const data: VolumeChartDatum[] = mondays.map((weekStart, i) => {
      const row = byWeekStart.get(weekStart)
      const y = row ? metricValue(row, metric, sport) : 0
      return {
        x: i + 1,
        y,
        weekStart,
        weekIndex: i + 1,
      }
    })

    return { id: String(year), data }
  })
}

/** Séries par mois civil : x = 1..12. */
export function buildMonthlyVolumeSeries(
  totals: ImportedActivityWeeklyTotal[],
  years: readonly number[],
  sport: SportType,
  metric: AthleteStatsMetric,
): VolumeChartSeries[] {
  return years.map((year) => {
    const rows = rowsForSport(totals, sport, year)
    const sumByMonth = Array.from({ length: 12 }, () => 0)

    for (const r of rows) {
      const m = parseInt(r.week_start.slice(5, 7), 10) - 1
      if (m < 0 || m > 11) continue
      sumByMonth[m] += metricValue(r, metric, sport)
    }

    const data: VolumeChartDatum[] = sumByMonth.map((sum, i) => ({
      x: i + 1,
      y: sum,
      monthIndex: i + 1,
    }))

    return { id: String(year), data }
  })
}

/** Max 3 années, tri décroissant, uniques. */
export function normalizeYears(years: number[]): number[] {
  const u = [...new Set(years)].filter((y) => Number.isFinite(y)).sort((a, b) => b - a)
  return u.slice(0, 3)
}

export const ATHLETE_STATS_SPORT_OPTIONS: readonly SportType[] = [
  'course',
  'velo',
  'natation',
  'musculation',
  'nordic_ski',
  'backcountry_ski',
  'ice_skating',
] as const

export function defaultSportFromProfile(practicedSports: string[] | null | undefined): SportType {
  const list = practicedSports ?? []
  const mapTrail: Record<string, SportType> = { trail: 'course' }
  for (const key of ATHLETE_STATS_SPORT_OPTIONS) {
    if (list.includes(key)) return key
  }
  for (const [alias, target] of Object.entries(mapTrail)) {
    if (list.includes(alias)) return target
  }
  return 'course'
}

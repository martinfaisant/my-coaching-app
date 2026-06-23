import { ATHLETE_STATS_LINE_COLORS } from '@/lib/athleteStatsColors'
import type { VolumeChartSeries } from '@/lib/athleteStatsVolume'

/** Opacité du dégradé area sous l'année la plus récente (courbe A1). */
export const ATHLETE_STATS_AREA_OPACITY = 0.2

const ANNUAL_BAR_COLOR_CLASSES = [
  'bg-palette-forest-dark/70',
  'bg-palette-olive/70',
  'bg-palette-sage/70',
] as const

export type AnnualVolumeRow = {
  year: string
  total: number
  color: string
  barPercent: number
  barColorClass: (typeof ANNUAL_BAR_COLOR_CLASSES)[number]
}

export function getMostRecentChartYearId(series: readonly VolumeChartSeries[]): string | null {
  if (series.length === 0) return null
  let max = -Infinity
  let id: string | null = null
  for (const s of series) {
    const y = Number(s.id)
    if (Number.isFinite(y) && y > max) {
      max = y
      id = s.id
    }
  }
  return id
}

export function buildAnnualVolumeRows(series: readonly VolumeChartSeries[]): AnnualVolumeRow[] {
  const rows = series.map((s, idx) => ({
    year: s.id,
    total: s.data.reduce((acc, d) => acc + d.y, 0),
    color: ATHLETE_STATS_LINE_COLORS[idx % ATHLETE_STATS_LINE_COLORS.length],
    barColorClass: ANNUAL_BAR_COLOR_CLASSES[idx % ANNUAL_BAR_COLOR_CLASSES.length],
    barPercent: 0,
  }))
  const max = Math.max(...rows.map((r) => r.total), 0)
  return rows.map((r) => ({
    ...r,
    barPercent: max > 0 ? (r.total / max) * 100 : 0,
  }))
}

export function getSeriesLineStrokeWidth(seriesIndex: number): number {
  return seriesIndex === 0 ? 2.5 : 2
}

export function getSeriesLineStrokeDasharray(
  seriesIndex: number,
  seriesCount: number,
): string | undefined {
  return seriesCount >= 3 && seriesIndex === 2 ? '6 4' : undefined
}

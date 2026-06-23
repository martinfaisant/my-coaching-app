'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ResponsiveLine } from '@nivo/line'
import type { LineSeries, SliceData } from '@nivo/line'
import { ATHLETE_STATS_LINE_COLORS } from '@/lib/athleteStatsColors'
import {
  buildAnnualVolumeRows,
  getMostRecentChartYearId,
} from '@/lib/athleteStatsChartUi'
import {
  ActiveSlicePointsLayer,
  createRecentYearAreaLayer,
  StyledLinesLayer,
} from '@/lib/athleteStatsNivoLayers'
import {
  type AthleteStatsGranularity,
  type AthleteStatsMetric,
  type VolumeChartSeries,
} from '@/lib/athleteStatsVolume'
import type { SportType } from '@/types/database'
import { formatAthleteStatsMetricValue } from '@/lib/athleteStatsFormat'
import { ATHLETE_STATS_NIVO_THEME } from '@/lib/athleteStatsNivoTheme'
import { AthleteStatsChartPlotSkeleton } from '@/components/athlete/AthleteStatsChartSkeleton'
import { AthleteStatsAnnualSummary } from '@/components/athlete/AthleteStatsAnnualSummary'
import { AthleteStatsChartHeader } from '@/components/athlete/AthleteStatsChartHeader'
import { AthleteStatsSliceTooltip } from '@/components/athlete/AthleteStatsSliceTooltip'

type ChartSeries = LineSeries & { data: { x: number; y: number }[] }

const CHART_LAYERS = [
  'grid',
  'markers',
  'axes',
  'recentYearArea',
  'crosshair',
  'styledLines',
  'slices',
  'activeSlicePoints',
  'mesh',
  'legends',
] as const

function toNivoSeries(raw: VolumeChartSeries[]): ChartSeries[] {
  return raw.map((s) => ({
    id: s.id,
    data: s.data.map((d) => ({ x: d.x, y: d.y })),
  }))
}

export type AthleteStatsVolumeChartProps = {
  series: VolumeChartSeries[]
  granularity: AthleteStatsGranularity
  metric: AthleteStatsMetric
  sport: SportType
}

/**
 * Courbe volume réalisé (Nivo A1) + encart volumes annuels (A2).
 */
export function AthleteStatsVolumeChart({
  series,
  granularity,
  metric,
  sport,
}: AthleteStatsVolumeChartProps) {
  const t = useTranslations('athleteStats.chart')
  const tSlice = useTranslations('athleteStats.sliceDetail')
  const tUnits = useTranslations('athleteStats.units')
  const locale = useLocale()

  const [chartReady, setChartReady] = useState(false)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setChartReady(true)
    })
    return () => cancelAnimationFrame(id)
  }, [])

  const nivoData = useMemo(() => toNivoSeries(series), [series])
  const mostRecentYearId = useMemo(() => getMostRecentChartYearId(series), [series])
  const annualRows = useMemo(() => buildAnnualVolumeRows(series), [series])

  const recentYearAreaLayer = useMemo(
    () => createRecentYearAreaLayer(mostRecentYearId),
    [mostRecentYearId],
  )

  const layers = useMemo(
    () =>
      CHART_LAYERS.map((id) => {
        if (id === 'recentYearArea') return recentYearAreaLayer
        if (id === 'styledLines') return StyledLinesLayer
        if (id === 'activeSlicePoints') return ActiveSlicePointsLayer
        return id
      }),
    [recentYearAreaLayer],
  )

  const formatWeekOrMonthLabel = useCallback(
    (v: number) => {
      if (granularity === 'month') {
        return new Intl.DateTimeFormat(locale, { month: 'short' }).format(new Date(2024, v - 1, 1))
      }
      return `S${v}`
    },
    [granularity, locale],
  )

  const formatAxisX = useCallback(
    (v: unknown) => {
      const n = typeof v === 'number' ? v : Number(v)
      if (!Number.isFinite(n)) return ''
      return formatWeekOrMonthLabel(n)
    },
    [formatWeekOrMonthLabel],
  )

  const yAxisLegend = useMemo(() => {
    if (metric === 'time') return t('yAxisLegendTime')
    if (metric === 'distance')
      return sport === 'natation' ? t('yAxisLegendDistanceM') : t('yAxisLegendDistanceKm')
    return t('yAxisLegendElevation')
  }, [metric, sport, t])

  const formatYTick = useCallback(
    (v: number) => formatAthleteStatsMetricValue(v, metric, sport, locale),
    [locale, metric, sport],
  )

  const formatYTickSafe = useCallback(
    (v: unknown) => {
      const n = typeof v === 'number' ? v : Number(v)
      if (!Number.isFinite(n)) return ''
      return formatYTick(n)
    },
    [formatYTick],
  )

  const formatTooltipValue = useCallback(
    (v: number) => {
      const num = formatAthleteStatsMetricValue(v, metric, sport, locale)
      if (metric === 'time') return `${num} ${tUnits('hours')}`
      if (metric === 'distance')
        return sport === 'natation' ? `${num} ${tUnits('meters')}` : `${num} ${tUnits('km')}`
      return `${num} ${tUnits('metersElevation')}`
    },
    [locale, metric, sport, tUnits],
  )

  const sliceTooltip = useCallback(
    ({ slice }: { slice: SliceData<LineSeries> }) => {
      const idx = slice.points[0]?.data.x as number
      const periodLabel =
        granularity === 'month'
          ? new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, idx - 1, 1))
          : tSlice('weekTooltip', { n: idx })

      return (
        <AthleteStatsSliceTooltip
          slice={slice}
          mostRecentYearId={mostRecentYearId}
          periodLabel={periodLabel}
          formatTooltipValue={formatTooltipValue}
        />
      )
    },
    [formatTooltipValue, granularity, locale, mostRecentYearId, tSlice],
  )

  if (series.length === 0 || series.every((s) => s.data.length === 0)) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-12 text-center text-sm text-stone-600">
        {t('empty')}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <AthleteStatsChartHeader series={series} />

      <div className="relative h-[min(400px,50vh)] w-full min-h-[280px] overflow-hidden rounded-xl border border-stone-100 bg-gradient-to-b from-stone-50/80 to-white">
        {chartReady ? (
          <ResponsiveLine
            data={nivoData}
            defaultWidth={800}
            defaultHeight={360}
            theme={ATHLETE_STATS_NIVO_THEME}
            colors={(d) => {
              const i = series.findIndex((s) => s.id === d.id)
              return ATHLETE_STATS_LINE_COLORS[i % ATHLETE_STATS_LINE_COLORS.length]
            }}
            margin={{ top: 20, right: 16, bottom: 64, left: 72 }}
            curve="monotoneX"
            xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
            yFormat={formatYTickSafe}
            layers={layers}
            enableArea={false}
            enableGridX={false}
            enableGridY={true}
            legends={[]}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 0,
              tickPadding: 8,
              tickRotation: granularity === 'month' ? -35 : 0,
              legend: granularity === 'week' ? t('xWeeks') : t('xMonths'),
              legendOffset: 40,
              legendPosition: 'middle',
              format: formatAxisX,
            }}
            axisLeft={{
              tickSize: 0,
              tickPadding: 8,
              legend: yAxisLegend,
              legendOffset: -52,
              legendPosition: 'middle',
              format: formatYTickSafe,
            }}
            enablePoints={false}
            pointSize={0}
            enableTouchCrosshair
            useMesh={false}
            enableSlices="x"
            sliceTooltip={sliceTooltip}
            motionConfig="gentle"
            role="img"
            ariaLabel={t('aria')}
          />
        ) : (
          <AthleteStatsChartPlotSkeleton aria-label={t('loading')} />
        )}
      </div>

      <AthleteStatsAnnualSummary rows={annualRows} formatValue={formatTooltipValue} />
    </div>
  )
}

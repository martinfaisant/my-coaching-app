'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ResponsiveLine } from '@nivo/line'
import type { LineSeries, SliceData } from '@nivo/line'
import { ATHLETE_STATS_LINE_COLORS } from '@/lib/athleteStatsColors'
import {
  type AthleteStatsGranularity,
  type AthleteStatsMetric,
  type VolumeChartSeries,
} from '@/lib/athleteStatsVolume'
import type { SportType } from '@/types/database'
import { formatAthleteStatsMetricValue } from '@/lib/athleteStatsFormat'
import { ATHLETE_STATS_NIVO_THEME } from '@/lib/athleteStatsNivoTheme'
import { AthleteStatsChartPlotSkeleton } from '@/components/athlete/AthleteStatsChartSkeleton'

type ChartSeries = LineSeries & { data: { x: number; y: number }[] }

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
 * Courbe volume réalisé (Nivo) + encart sous le graphe : volume total par année civile sélectionnée.
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
      const idxLabel =
        granularity === 'month'
          ? new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2000, idx - 1, 1))
          : tSlice('weekTooltip', { n: idx })

      return (
        <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-lg">
          <div className="font-semibold text-stone-800">{idxLabel}</div>
          <ul className="mt-1 space-y-0.5">
            {slice.points.map((p) => (
              <li key={p.seriesId} className="flex items-center gap-2 text-stone-700">
                <span className="h-2 w-2 rounded-full" style={{ background: p.seriesColor }} />
                <span>{p.seriesId}</span>
                <span className="font-medium">{formatTooltipValue(Number(p.data.y))}</span>
              </li>
            ))}
          </ul>
        </div>
      )
    },
    [formatTooltipValue, granularity, locale, tSlice],
  )

  const annualRows = useMemo(
    () =>
      series.map((s, idx) => ({
        year: s.id,
        total: s.data.reduce((acc, d) => acc + d.y, 0),
        color: ATHLETE_STATS_LINE_COLORS[idx % ATHLETE_STATS_LINE_COLORS.length],
      })),
    [series],
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
      <div className="relative h-[min(400px,50vh)] w-full min-h-[280px]">
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
            xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
            yScale={{ type: 'linear', min: 0, max: 'auto', stacked: false }}
            yFormat={formatYTickSafe}
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
            pointSize={10}
            pointColor={{ from: 'series.color' }}
            pointBorderWidth={2}
            pointBorderColor={{ from: 'series.color', modifiers: [['darker', 0.3]] }}
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

      <div
        className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
        role="region"
        aria-label={tSlice('panelAria')}
      >
        <p className="font-semibold text-stone-800">{tSlice('annualVolumeTitle')}</p>
        <ul className="mt-2 space-y-1.5">
          {annualRows.map((row) => (
            <li
              key={row.year}
              className="flex items-center justify-between gap-3 border-b border-stone-200/80 pb-1.5 last:border-0"
            >
              <span className="flex items-center gap-2 text-stone-700">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: row.color }} />
                {tSlice('yearValue', { year: row.year })}
              </span>
              <span className="font-medium text-stone-900 tabular-nums">
                {formatTooltipValue(row.total)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

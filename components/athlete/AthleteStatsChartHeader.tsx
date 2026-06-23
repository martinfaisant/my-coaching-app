'use client'

import { useTranslations } from 'next-intl'
import { ATHLETE_STATS_LINE_COLORS } from '@/lib/athleteStatsColors'
import type { VolumeChartSeries } from '@/lib/athleteStatsVolume'
import { getSeriesLineStrokeDasharray } from '@/lib/athleteStatsChartUi'

type AthleteStatsChartHeaderProps = {
  series: VolumeChartSeries[]
}

export function AthleteStatsChartHeader({ series }: AthleteStatsChartHeaderProps) {
  const t = useTranslations('athleteStats.chart')

  return (
    <header className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-base font-bold text-stone-800">{t('sectionTitle')}</h2>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-600">
        {series.map((s, idx) => {
          const color = ATHLETE_STATS_LINE_COLORS[idx % ATHLETE_STATS_LINE_COLORS.length]
          const dashed = getSeriesLineStrokeDasharray(idx, series.length)
          return (
            <span key={s.id} className="flex items-center gap-1.5">
              {dashed ? (
                <span
                  className="inline-block h-0 w-3 shrink-0 border-t-2 border-dashed"
                  style={{ borderColor: color }}
                  aria-hidden
                />
              ) : (
                <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
              )}
              {s.id}
            </span>
          )
        })}
      </div>
    </header>
  )
}

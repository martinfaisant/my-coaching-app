'use client'

import { useTranslations } from 'next-intl'
import type { AnnualVolumeRow } from '@/lib/athleteStatsChartUi'

type AthleteStatsAnnualSummaryProps = {
  rows: AnnualVolumeRow[]
  formatValue: (total: number) => string
}

export function AthleteStatsAnnualSummary({ rows, formatValue }: AthleteStatsAnnualSummaryProps) {
  const tSlice = useTranslations('athleteStats.sliceDetail')

  return (
    <div
      className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm"
      role="region"
      aria-label={tSlice('panelAria')}
    >
      <p className="font-semibold text-stone-800">{tSlice('annualVolumeTitle')}</p>
      <ul className="mt-3 space-y-2.5">
        {rows.map((row) => (
          <li key={row.year} className="flex items-center gap-3">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: row.color }}
              aria-hidden
            />
            <span className="w-10 shrink-0 text-xs text-stone-700">{row.year}</span>
            <div className="h-1.5 min-w-0 flex-1 rounded-full bg-stone-100">
              <div
                className={`h-full rounded-full ${row.barColorClass}`}
                style={{ width: `${row.barPercent}%` }}
              />
            </div>
            <span className="w-14 shrink-0 text-right text-xs font-medium tabular-nums text-stone-900">
              {formatValue(row.total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

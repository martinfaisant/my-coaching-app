'use client'

import type { LineSeries, SliceData } from '@nivo/line'

type AthleteStatsSliceTooltipProps = {
  slice: SliceData<LineSeries>
  mostRecentYearId: string | null
  periodLabel: string
  formatTooltipValue: (v: number) => string
}

export function AthleteStatsSliceTooltip({
  slice,
  mostRecentYearId,
  periodLabel,
  formatTooltipValue,
}: AthleteStatsSliceTooltipProps) {
  const primaryPoint = mostRecentYearId
    ? slice.points.find((p) => String(p.seriesId) === mostRecentYearId)
    : slice.points[0]

  const primaryValue = primaryPoint ? formatTooltipValue(Number(primaryPoint.data.y)) : null

  return (
    <div className="flex flex-col items-center gap-1.5">
      {primaryValue && primaryPoint && (
        <div className="relative rounded-full bg-palette-forest-dark px-3 py-1 text-xs font-semibold text-white shadow-md">
          {primaryValue}
        </div>
      )}
      <div className="min-w-[140px] rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs shadow-lg">
        <div className="font-semibold text-stone-800">{periodLabel}</div>
        <ul className="mt-1 space-y-0.5">
          {slice.points.map((p) => {
            const isPrimary = mostRecentYearId && String(p.seriesId) === mostRecentYearId
            return (
              <li
                key={p.seriesId}
                className={`flex items-center gap-2 ${isPrimary ? 'font-medium text-stone-800' : 'text-stone-500'}`}
              >
                <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.seriesColor }} />
                <span>{p.seriesId}</span>
                <span className={isPrimary ? 'font-semibold' : ''}>
                  {formatTooltipValue(Number(p.data.y))}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

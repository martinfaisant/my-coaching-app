'use client'

import type { LineCustomSvgLayer, LineCustomSvgLayerProps, LineSeries } from '@nivo/line'
import {
  ATHLETE_STATS_AREA_OPACITY,
  getSeriesLineStrokeDasharray,
  getSeriesLineStrokeWidth,
} from '@/lib/athleteStatsChartUi'

function RecentYearAreaLayerInner({
  areaGenerator,
  series,
  mostRecentYearId,
}: LineCustomSvgLayerProps<LineSeries> & { mostRecentYearId: string | null }) {
  if (!mostRecentYearId) return null
  const target = series.find((s) => String(s.id) === mostRecentYearId)
  if (!target) return null
  const path = areaGenerator(target.data.map((d) => d.position))
  if (!path) return null
  return (
    <path
      d={path}
      fill={target.color}
      fillOpacity={ATHLETE_STATS_AREA_OPACITY}
      strokeWidth={0}
    />
  )
}

/** Nivo appelle les layers custom via `layer(props)` — doit être une function, pas memo(). */
export function createRecentYearAreaLayer(
  mostRecentYearId: string | null,
): LineCustomSvgLayer<LineSeries> {
  function RecentYearAreaLayer(props: LineCustomSvgLayerProps<LineSeries>) {
    return <RecentYearAreaLayerInner {...props} mostRecentYearId={mostRecentYearId} />
  }
  return RecentYearAreaLayer
}

export const StyledLinesLayer: LineCustomSvgLayer<LineSeries> = function StyledLinesLayer({
  series,
  lineGenerator,
}) {
  const count = series.length
  return (
    <g>
      {series
        .slice(0)
        .reverse()
        .map((s) => {
          const seriesIndex = series.findIndex((x) => x.id === s.id)
          const path = lineGenerator(s.data.map((d) => d.position))
          if (!path) return null
          return (
            <path
              key={String(s.id)}
              d={path}
              fill="none"
              stroke={s.color}
              strokeWidth={getSeriesLineStrokeWidth(seriesIndex)}
              strokeDasharray={getSeriesLineStrokeDasharray(seriesIndex, count)}
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          )
        })}
    </g>
  )
}

export const ActiveSlicePointsLayer: LineCustomSvgLayer<LineSeries> = function ActiveSlicePointsLayer({
  currentSlice,
}) {
  if (!currentSlice) return null
  return (
    <g>
      {currentSlice.points.map((p) => (
        <circle
          key={p.id}
          cx={p.x}
          cy={p.y}
          r={p.seriesIndex === 0 ? 5 : 4}
          fill="var(--chart-tooltip-bg, #ffffff)"
          stroke={p.seriesColor}
          strokeWidth={p.seriesIndex === 0 ? 2.5 : 2}
        />
      ))}
    </g>
  )
}

'use client'

import { createElement, useCallback, type MouseEvent, type TouchEvent } from 'react'
import type { LineCustomSvgLayer, LineCustomSvgLayerProps, LineSeries, SliceData } from '@nivo/line'
import { useTooltip } from '@nivo/tooltip'
import type { TooltipAnchor } from '@nivo/tooltip'
import {
  ATHLETE_STATS_AREA_OPACITY,
  getSeriesLineStrokeDasharray,
  getSeriesLineStrokeWidth,
} from '@/lib/athleteStatsChartUi'

export function getSliceTooltipAnchor(sliceX: number, innerWidth: number): TooltipAnchor {
  if (innerWidth <= 0) return 'center'
  const ratio = sliceX / innerWidth
  if (ratio < 0.28) return 'right'
  if (ratio > 0.72) return 'left'
  return 'center'
}

export function getSliceTooltipPosition(
  slice: SliceData<LineSeries>,
  margin: { top?: number; left?: number },
): [number, number] {
  const avgY =
    slice.points.length > 0
      ? slice.points.reduce((sum, p) => sum + p.y, 0) / slice.points.length
      : slice.y
  return [slice.x + (margin.left ?? 0), avgY + (margin.top ?? 0)]
}

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

/** Slices avec ancrage tooltip adaptatif (évite le clipping à gauche / droite). */
export const AdaptiveSlicesLayer: LineCustomSvgLayer<LineSeries> = function AdaptiveSlicesLayer(props) {
  const {
    slices,
    setCurrentSlice,
    sliceTooltip,
    enableSlices,
    margin,
    innerWidth,
    debugSlices,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
    onTouchStart,
    onTouchEnd,
  } = props

  const { showTooltipAt, hideTooltip } = useTooltip()
  const axis = enableSlices === 'y' ? 'y' : 'x'

  const presentTooltip = useCallback(
    (slice: SliceData<LineSeries>) => {
      showTooltipAt(
        createElement(sliceTooltip, { slice, axis }),
        getSliceTooltipPosition(slice, margin),
        getSliceTooltipAnchor(slice.x, innerWidth),
      )
    },
    [axis, innerWidth, margin, showTooltipAt, sliceTooltip],
  )

  const handleEnter = useCallback(
    (slice: SliceData<LineSeries>) => (event: MouseEvent) => {
      setCurrentSlice(slice)
      presentTooltip(slice)
      onMouseEnter?.(slice, event)
    },
    [onMouseEnter, presentTooltip, setCurrentSlice],
  )

  const handleMove = useCallback(
    (slice: SliceData<LineSeries>) => (event: MouseEvent) => {
      presentTooltip(slice)
      onMouseMove?.(slice, event)
    },
    [onMouseMove, presentTooltip],
  )

  const handleLeave = useCallback(
    (slice: SliceData<LineSeries>) => (event: MouseEvent) => {
      hideTooltip()
      setCurrentSlice(null)
      onMouseLeave?.(slice, event)
    },
    [hideTooltip, onMouseLeave, setCurrentSlice],
  )

  const handleTouchStart = useCallback(
    (slice: SliceData<LineSeries>) => (event: TouchEvent) => {
      setCurrentSlice(slice)
      presentTooltip(slice)
      onTouchStart?.(slice, event)
    },
    [onTouchStart, presentTooltip, setCurrentSlice],
  )

  const handleTouchEnd = useCallback(
    (slice: SliceData<LineSeries>) => (event: TouchEvent) => {
      hideTooltip()
      setCurrentSlice(null)
      onTouchEnd?.(slice, event)
    },
    [hideTooltip, onTouchEnd, setCurrentSlice],
  )

  if (!enableSlices) return null

  return (
    <g>
      {slices.map((slice) => (
        <rect
          key={slice.id}
          x={slice.x0}
          y={slice.y0}
          width={slice.width}
          height={slice.height}
          fill="transparent"
          stroke={debugSlices ? 'red' : 'transparent'}
          strokeWidth={debugSlices ? 1 : 0}
          strokeOpacity={debugSlices ? 0.75 : 0}
          onMouseEnter={handleEnter(slice)}
          onMouseMove={handleMove(slice)}
          onMouseLeave={handleLeave(slice)}
          onTouchStart={handleTouchStart(slice)}
          onTouchEnd={handleTouchEnd(slice)}
        />
      ))}
    </g>
  )
}

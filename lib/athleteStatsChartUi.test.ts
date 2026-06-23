import { describe, expect, it } from 'vitest'
import { getSliceTooltipAnchor } from '@/lib/athleteStatsNivoLayers'
import {
  buildAnnualVolumeRows,
  getMostRecentChartYearId,
  getSeriesLineStrokeDasharray,
} from '@/lib/athleteStatsChartUi'
import type { VolumeChartSeries } from '@/lib/athleteStatsVolume'

function series(id: string, values: number[]): VolumeChartSeries {
  return {
    id,
    data: values.map((y, i) => ({ x: i + 1, y })),
  }
}

describe('getMostRecentChartYearId', () => {
  it('returns the highest numeric year id', () => {
    expect(getMostRecentChartYearId([series('2024', [1]), series('2026', [2]), series('2025', [3])])).toBe(
      '2026',
    )
  })

  it('returns null for empty series', () => {
    expect(getMostRecentChartYearId([])).toBeNull()
  })
})

describe('buildAnnualVolumeRows', () => {
  it('computes bar percent relative to max total', () => {
    const rows = buildAnnualVolumeRows([series('2026', [10, 20]), series('2025', [5, 5])])
    expect(rows[0]?.total).toBe(30)
    expect(rows[0]?.barPercent).toBe(100)
    expect(rows[1]?.total).toBe(10)
    expect(rows[1]?.barPercent).toBeCloseTo(33.333, 2)
  })

  it('uses zero percent when all totals are zero', () => {
    const rows = buildAnnualVolumeRows([series('2026', [0, 0])])
    expect(rows[0]?.barPercent).toBe(0)
  })
})

describe('getSeriesLineStrokeDasharray', () => {
  it('dashes only the third series when three years are shown', () => {
    expect(getSeriesLineStrokeDasharray(2, 3)).toBe('6 4')
    expect(getSeriesLineStrokeDasharray(1, 3)).toBeUndefined()
    expect(getSeriesLineStrokeDasharray(2, 2)).toBeUndefined()
  })
})

describe('getSliceTooltipAnchor', () => {
  it('anchors right on the left edge and left on the right edge', () => {
    expect(getSliceTooltipAnchor(50, 400)).toBe('right')
    expect(getSliceTooltipAnchor(350, 400)).toBe('left')
    expect(getSliceTooltipAnchor(200, 400)).toBe('center')
  })
})

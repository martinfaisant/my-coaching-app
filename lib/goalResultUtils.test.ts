import { describe, expect, it } from 'vitest'

import type { Goal } from '@/types/database'
import { formatGoalResultPlaceOrdinal, formatGoalResultTime, hasGoalResult } from '@/lib/goalResultUtils'

function mkGoal(overrides: Partial<Goal>): Goal {
  return {
    id: 'g1',
    athlete_id: 'a1',
    date: '2026-01-01',
    race_name: 'Race',
    distance: '10k',
    is_primary: true,
    created_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('goalResultUtils', () => {
  it('hasGoalResult: false when one component is missing', () => {
    const goal = mkGoal({
      result_time_hours: 1,
      result_time_minutes: 2,
      result_time_seconds: null,
    })
    expect(hasGoalResult(goal)).toBe(false)
  })

  it('formatGoalResultTime: omits 0s seconds and formats minutes correctly', () => {
    const goal = mkGoal({
      result_time_hours: 1,
      result_time_minutes: 5,
      result_time_seconds: 0,
    })
    // h>0 => "1h", m>0 => s=0 => "5min", s=0 => seconds omitted
    expect(formatGoalResultTime(goal)).toBe('1h 5min')
  })

  it('formatGoalResultTime: pads minutes and seconds when seconds > 0', () => {
    const goal = mkGoal({
      result_time_hours: 0,
      result_time_minutes: 5,
      result_time_seconds: 7,
    })
    expect(formatGoalResultTime(goal)).toBe('05min 07s')
  })

  it('formatGoalResultTime: returns empty string when no full result exists', () => {
    const goal = mkGoal({
      result_time_hours: 1,
      result_time_minutes: 2,
      result_time_seconds: null,
    })
    expect(formatGoalResultTime(goal)).toBe('')
  })

  it('formatGoalResultPlaceOrdinal: French ordinal', () => {
    expect(formatGoalResultPlaceOrdinal(24, 'fr')).toBe('24e')
  })

  it('formatGoalResultPlaceOrdinal: English ordinals', () => {
    expect(formatGoalResultPlaceOrdinal(1, 'en')).toBe('1st')
    expect(formatGoalResultPlaceOrdinal(2, 'en')).toBe('2nd')
    expect(formatGoalResultPlaceOrdinal(3, 'en')).toBe('3rd')
    expect(formatGoalResultPlaceOrdinal(4, 'en')).toBe('4th')
    expect(formatGoalResultPlaceOrdinal(11, 'en')).toBe('11th')
    expect(formatGoalResultPlaceOrdinal(12, 'en')).toBe('12th')
    expect(formatGoalResultPlaceOrdinal(13, 'en')).toBe('13th')
    expect(formatGoalResultPlaceOrdinal(21, 'en')).toBe('21st')
    expect(formatGoalResultPlaceOrdinal(22, 'en')).toBe('22nd')
    expect(formatGoalResultPlaceOrdinal(23, 'en')).toBe('23rd')
  })
})


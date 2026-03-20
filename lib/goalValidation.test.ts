import { describe, expect, it } from 'vitest'
import {
  parseTargetTime,
  validateGoalFields,
  parseResultFields,
  RESULT_NOTE_MAX_LENGTH,
} from '@/lib/goalValidation'

const t = (key: string, _values?: Record<string, string | number | Date>) => key

function mkFormData(entries: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) {
    fd.set(k, v)
  }
  return fd
}

describe('parseTargetTime', () => {
  it('returns null when all fields are empty', () => {
    const fd = mkFormData({})
    expect(parseTargetTime(fd, t)).toBeNull()
  })

  it('returns null when all fields are blank strings', () => {
    const fd = mkFormData({
      target_time_hours: '',
      target_time_minutes: '',
      target_time_seconds: '',
    })
    expect(parseTargetTime(fd, t)).toBeNull()
  })

  it('parses valid time with all fields', () => {
    const fd = mkFormData({
      target_time_hours: '1',
      target_time_minutes: '30',
      target_time_seconds: '45',
    })
    expect(parseTargetTime(fd, t)).toEqual({ hours: 1, minutes: 30, seconds: 45 })
  })

  it('treats empty fields as 0 when at least one is set', () => {
    const fd = mkFormData({ target_time_minutes: '55' })
    expect(parseTargetTime(fd, t)).toEqual({ hours: 0, minutes: 55, seconds: 0 })
  })

  it('returns error for hours > 99', () => {
    const fd = mkFormData({ target_time_hours: '100' })
    const result = parseTargetTime(fd, t)
    expect(result).toEqual({ error: 'invalidTimeRange' })
  })

  it('returns error for minutes > 59', () => {
    const fd = mkFormData({ target_time_minutes: '60' })
    const result = parseTargetTime(fd, t)
    expect(result).toEqual({ error: 'invalidTimeRange' })
  })

  it('returns error for seconds > 59', () => {
    const fd = mkFormData({ target_time_seconds: '60' })
    const result = parseTargetTime(fd, t)
    expect(result).toEqual({ error: 'invalidTimeRange' })
  })

  it('returns error for negative values', () => {
    const fd = mkFormData({ target_time_hours: '-1' })
    const result = parseTargetTime(fd, t)
    expect(result).toEqual({ error: 'invalidTimeRange' })
  })

  it('returns error for non-numeric values', () => {
    const fd = mkFormData({ target_time_hours: 'abc' })
    const result = parseTargetTime(fd, t)
    expect(result).toEqual({ error: 'invalidTimeRange' })
  })
})

describe('validateGoalFields', () => {
  it('returns error when date is missing', () => {
    const fd = mkFormData({ race_name: 'Marathon', distance: '42k' })
    const result = validateGoalFields(fd, t)
    expect(result).toEqual({ error: 'allFieldsRequired' })
  })

  it('returns error when race_name is missing', () => {
    const fd = mkFormData({ date: '2026-06-01', distance: '42k' })
    const result = validateGoalFields(fd, t)
    expect(result).toEqual({ error: 'allFieldsRequired' })
  })

  it('returns error when distance is missing', () => {
    const fd = mkFormData({ date: '2026-06-01', race_name: 'Marathon' })
    const result = validateGoalFields(fd, t)
    expect(result).toEqual({ error: 'allFieldsRequired' })
  })

  it('parses valid fields', () => {
    const fd = mkFormData({
      date: '2026-06-01',
      race_name: 'Marathon de Paris',
      distance: '42.195km',
      is_primary: 'primary',
    })
    const result = validateGoalFields(fd, t)
    expect(result).toEqual({
      data: {
        date: '2026-06-01',
        raceName: 'Marathon de Paris',
        distance: '42.195km',
        isPrimary: true,
      },
    })
  })

  it('isPrimary is false when not "primary"', () => {
    const fd = mkFormData({
      date: '2026-06-01',
      race_name: 'Trail',
      distance: '30k',
      is_primary: 'secondary',
    })
    const result = validateGoalFields(fd, t)
    expect('data' in result && result.data.isPrimary).toBe(false)
  })

  it('trims whitespace from fields', () => {
    const fd = mkFormData({
      date: '  2026-06-01  ',
      race_name: '  Marathon  ',
      distance: '  10k  ',
    })
    const result = validateGoalFields(fd, t)
    expect('data' in result && result.data).toEqual({
      date: '2026-06-01',
      raceName: 'Marathon',
      distance: '10k',
      isPrimary: false,
    })
  })
})

describe('parseResultFields', () => {
  it('returns none when all time fields are empty', () => {
    const fd = mkFormData({})
    expect(parseResultFields(fd, t)).toEqual({ kind: 'none' })
  })

  it('returns none when time fields are blank strings', () => {
    const fd = mkFormData({
      result_time_hours: '',
      result_time_minutes: '',
      result_time_seconds: '',
    })
    expect(parseResultFields(fd, t)).toEqual({ kind: 'none' })
  })

  it('parses valid result with all fields', () => {
    const fd = mkFormData({
      result_time_hours: '3',
      result_time_minutes: '45',
      result_time_seconds: '12',
      result_place: '42',
      result_note: 'Good race',
    })
    const result = parseResultFields(fd, t)
    expect(result).toEqual({
      kind: 'parsed',
      data: {
        resultTimeHours: 3,
        resultTimeMinutes: 45,
        resultTimeSeconds: 12,
        resultPlace: 42,
        resultNote: 'Good race',
      },
    })
  })

  it('treats empty time fields as 0 when at least one is set', () => {
    const fd = mkFormData({ result_time_minutes: '55' })
    const result = parseResultFields(fd, t)
    expect(result).toEqual({
      kind: 'parsed',
      data: {
        resultTimeHours: 0,
        resultTimeMinutes: 55,
        resultTimeSeconds: 0,
        resultPlace: null,
        resultNote: null,
      },
    })
  })

  it('returns error for hours > 99', () => {
    const fd = mkFormData({ result_time_hours: '100' })
    expect(parseResultFields(fd, t)).toEqual({ kind: 'error', error: 'invalidTimeRange' })
  })

  it('returns error for minutes > 59', () => {
    const fd = mkFormData({ result_time_minutes: '60' })
    expect(parseResultFields(fd, t)).toEqual({ kind: 'error', error: 'invalidTimeRange' })
  })

  it('returns error for seconds > 59', () => {
    const fd = mkFormData({ result_time_seconds: '60' })
    expect(parseResultFields(fd, t)).toEqual({ kind: 'error', error: 'invalidTimeRange' })
  })

  it('returns error for note exceeding max length', () => {
    const fd = mkFormData({
      result_time_hours: '1',
      result_note: 'x'.repeat(RESULT_NOTE_MAX_LENGTH + 1),
    })
    expect(parseResultFields(fd, t)).toEqual({ kind: 'error', error: 'noteMaxLength' })
  })

  it('accepts note at exact max length', () => {
    const fd = mkFormData({
      result_time_hours: '1',
      result_note: 'x'.repeat(RESULT_NOTE_MAX_LENGTH),
    })
    const result = parseResultFields(fd, t)
    expect(result.kind).toBe('parsed')
  })

  it('returns null place when place is empty', () => {
    const fd = mkFormData({
      result_time_hours: '1',
      result_place: '',
    })
    const result = parseResultFields(fd, t)
    expect(result.kind === 'parsed' && result.data.resultPlace).toBeNull()
  })

  it('clamps place to minimum 1', () => {
    const fd = mkFormData({
      result_time_hours: '1',
      result_place: '0',
    })
    const result = parseResultFields(fd, t)
    expect(result.kind === 'parsed' && result.data.resultPlace).toBe(1)
  })

  it('returns null note when note is empty', () => {
    const fd = mkFormData({
      result_time_hours: '1',
      result_note: '',
    })
    const result = parseResultFields(fd, t)
    expect(result.kind === 'parsed' && result.data.resultNote).toBeNull()
  })
})

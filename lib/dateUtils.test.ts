import { describe, expect, it } from 'vitest'

import { getExtendedCalendarMonthGridBounds, getWeekMonday, toDateStr } from '@/lib/dateUtils'

describe('getExtendedCalendarMonthGridBounds', () => {
  it('aligne rangeStart sur le lundi de la semaine du 1er du mois', () => {
    const { rangeStart, weekStartDates } = getExtendedCalendarMonthGridBounds(2026, 1)
    const firstOfMonth = new Date(2026, 1, 1)
    firstOfMonth.setHours(12, 0, 0, 0)
    expect(rangeStart).toBe(toDateStr(getWeekMonday(firstOfMonth)))
    expect(weekStartDates[0]).toBe(rangeStart)
  })

  it('aligne rangeEnd sur le dimanche de la semaine du dernier jour du mois', () => {
    const { rangeEnd, weekStartDates } = getExtendedCalendarMonthGridBounds(2026, 1)
    const lastOfMonth = new Date(2026, 2, 0)
    lastOfMonth.setHours(12, 0, 0, 0)
    const lastMonday = getWeekMonday(lastOfMonth)
    const endSunday = new Date(lastMonday)
    endSunday.setDate(endSunday.getDate() + 6)
    expect(rangeEnd).toBe(toDateStr(endSunday))
    const lastWeekStart = weekStartDates[weekStartDates.length - 1]!
    const lastWeekEnd = new Date(lastWeekStart + 'T12:00:00')
    lastWeekEnd.setDate(lastWeekEnd.getDate() + 6)
    expect(toDateStr(lastWeekEnd)).toBe(rangeEnd)
  })

  it('chaque lundi de weekStartDates est un lundi (getDay === 1)', () => {
    const { weekStartDates } = getExtendedCalendarMonthGridBounds(2026, 3)
    for (const d of weekStartDates) {
      expect(new Date(d + 'T12:00:00').getDay()).toBe(1)
    }
  })

  it('février 2026 : plage et nombre de semaines ISO (régression)', () => {
    const { rangeStart, rangeEnd, weekStartDates } = getExtendedCalendarMonthGridBounds(2026, 1)
    expect(rangeStart).toBe('2026-01-26')
    expect(rangeEnd).toBe('2026-03-01')
    expect(weekStartDates).toEqual([
      '2026-01-26',
      '2026-02-02',
      '2026-02-09',
      '2026-02-16',
      '2026-02-23',
    ])
  })

  it('janvier 2026 : 5 semaines, premier lundi avant le 1er si besoin', () => {
    const { rangeStart, rangeEnd, weekStartDates } = getExtendedCalendarMonthGridBounds(2026, 0)
    expect(rangeStart).toBe('2025-12-29')
    expect(rangeEnd).toBe('2026-02-01')
    expect(weekStartDates).toHaveLength(5)
    expect(weekStartDates[0]).toBe('2025-12-29')
  })

  it('février 2024 (bissextile) : dernier jour inclus dans la plage', () => {
    const { rangeStart, rangeEnd } = getExtendedCalendarMonthGridBounds(2024, 1)
    expect(rangeStart <= '2024-02-01').toBe(true)
    expect(rangeEnd >= '2024-02-29').toBe(true)
  })
})

import { describe, expect, it } from 'vitest'

import { CALENDAR_VIEW_DAY_MIN_HEIGHT_CLASS } from '@/lib/calendarViewDayHeights'

function pxFromMinHeightClass(c: string): number | null {
  const m = /^min-h-\[(\d+)px\]$/.exec(c)
  return m ? Number(m[1]) : null
}

describe('calendarViewDayHeights', () => {
  it('classes px : moitié des baselines historiques (202px / 126px)', () => {
    expect(pxFromMinHeightClass(CALENDAR_VIEW_DAY_MIN_HEIGHT_CLASS.desktopDetailedDayBody)).toBe(101)
    expect(pxFromMinHeightClass(CALENDAR_VIEW_DAY_MIN_HEIGHT_CLASS.desktopDetailedEmptyAddZone)).toBe(63)
    expect(pxFromMinHeightClass(CALENDAR_VIEW_DAY_MIN_HEIGHT_CLASS.desktopDetailedDayBody)).toBe(202 / 2)
    expect(pxFromMinHeightClass(CALENDAR_VIEW_DAY_MIN_HEIGHT_CLASS.desktopDetailedEmptyAddZone)).toBe(126 / 2)
  })

  it('classes Tailwind scale : moitié des anciennes min-h-20 / min-h-24 (80px / 96px à racine 16px)', () => {
    expect(CALENDAR_VIEW_DAY_MIN_HEIGHT_CLASS.mobileCondensedDayBody).toBe('min-h-10')
    expect(CALENDAR_VIEW_DAY_MIN_HEIGHT_CLASS.desktopCondensedDayCell).toBe('min-h-12')
  })
})

import { describe, expect, it } from 'vitest'
import { getDashboardEntryPath } from '@/lib/dashboardEntryPath'

describe('getDashboardEntryPath', () => {
  it('coach → athletes', () => {
    expect(getDashboardEntryPath({ role: 'coach', coach_id: null })).toBe('/dashboard/athletes')
  })

  it('athlete with coach → calendar', () => {
    expect(getDashboardEntryPath({ role: 'athlete', coach_id: 'c1' })).toBe('/dashboard/calendar')
  })

  it('athlete without coach → find-coach', () => {
    expect(getDashboardEntryPath({ role: 'athlete', coach_id: null })).toBe('/dashboard/find-coach')
  })

  it('admin → admin members', () => {
    expect(getDashboardEntryPath({ role: 'admin', coach_id: null })).toBe('/dashboard/admin/members')
  })
})

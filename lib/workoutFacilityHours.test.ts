import { describe, expect, it } from 'vitest'

import { getDefaultFacilityWeekOpening } from '@/lib/facilityHoursUtils'
import {
  dateStrToFacilityDayKey,
  getWorkoutFacilityDisplayLines,
  workoutSportToFacilityTypes,
} from '@/lib/workoutFacilityHours'
import type { AthleteFacility } from '@/types/database'

function makeFacility(
  overrides: Partial<AthleteFacility> & Pick<AthleteFacility, 'facility_name' | 'facility_type'>
): AthleteFacility {
  const opening_hours = overrides.opening_hours ?? getDefaultFacilityWeekOpening()
  return {
    id: overrides.id ?? 'id',
    athlete_id: overrides.athlete_id ?? 'athlete',
    facility_name: overrides.facility_name,
    facility_type: overrides.facility_type,
    address: overrides.address ?? '',
    address_postal_code: overrides.address_postal_code ?? '',
    address_city: overrides.address_city ?? '',
    address_country: overrides.address_country ?? '',
    address_complement: overrides.address_complement ?? null,
    opening_hours,
    created_at: overrides.created_at ?? '',
    updated_at: overrides.updated_at ?? '',
  }
}

describe('workoutFacilityHours', () => {
  it('dateStrToFacilityDayKey: local Tuesday', () => {
    expect(dateStrToFacilityDayKey('2026-03-17')).toBe('tuesday')
  })

  it('workoutSportToFacilityTypes: vélo → null', () => {
    expect(workoutSportToFacilityTypes('velo')).toBeNull()
  })

  it('getWorkoutFacilityDisplayLines: tri alphabétique, natation', () => {
    const week = getDefaultFacilityWeekOpening()
    week.tuesday = { open: true, slots: [{ start: '09:00', end: '12:00' }] }
    const facilities = [
      makeFacility({ id: '1', facility_name: 'Piscine Z', facility_type: 'piscine', opening_hours: week }),
      makeFacility({ id: '2', facility_name: 'Piscine A', facility_type: 'piscine', opening_hours: week }),
    ]
    const lines = getWorkoutFacilityDisplayLines('natation', '2026-03-17', facilities, 'fr')
    expect(lines).toHaveLength(2)
    expect(lines[0].facilityName).toBe('Piscine A')
    expect(lines[0].facilityType).toBe('piscine')
    expect(lines[0].kind).toBe('slots')
    expect(lines[1].facilityName).toBe('Piscine Z')
    expect(lines[1].facilityType).toBe('piscine')
  })

  it('getWorkoutFacilityDisplayLines: jour fermé', () => {
    const week = getDefaultFacilityWeekOpening()
    week.tuesday = { open: false, slots: [] }
    const facilities = [
      makeFacility({ facility_name: 'Stade', facility_type: 'stade', opening_hours: week }),
    ]
    const lines = getWorkoutFacilityDisplayLines('course', '2026-03-17', facilities, 'fr')
    expect(lines).toEqual([{ facilityName: 'Stade', facilityType: 'stade', kind: 'closed' }])
  })
})

import type {
  AthleteFacility,
  FacilityDayKey,
  FacilityOpeningSlot,
  FacilityType,
  SportType,
} from '@/types/database'
import { formatFacilitySlotTime } from '@/lib/facilityHoursUtils'

const JS_DAY_TO_FACILITY_KEY: FacilityDayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

/**
 * Jour de la semaine (clé horaires facility) pour une date calendaire locale YYYY-MM-DD.
 */
export function dateStrToFacilityDayKey(dateStr: string): FacilityDayKey {
  const parts = dateStr.split('-').map((p) => Number(p))
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) {
    return 'monday'
  }
  const [y, m, d] = parts
  const dt = new Date(y, m - 1, d)
  return JS_DAY_TO_FACILITY_KEY[dt.getDay()]
}

export function workoutSportToFacilityTypes(sport: SportType): FacilityType[] | null {
  switch (sport) {
    case 'natation':
      return ['piscine']
    case 'musculation':
      return ['salle']
    case 'course':
      return ['stade']
    case 'velo':
      return null
    default:
      return null
  }
}

function formatFacilitySlotsLabel(slots: FacilityOpeningSlot[]): string {
  return slots
    .map((s) => `${formatFacilitySlotTime(s.start)} - ${formatFacilitySlotTime(s.end)}`)
    .join(' · ')
}

export type WorkoutFacilityDisplayLine = {
  facilityName: string
  facilityType: FacilityType
  kind: 'closed' | 'slots'
  slotsLabel?: string
}

/**
 * Lignes à afficher dans la modale workout (coach) : facilities filtrées par sport,
 * tri alphabétique du nom, horaires pour le jour donné.
 */
export function getWorkoutFacilityDisplayLines(
  sportType: SportType,
  dateStr: string,
  facilities: AthleteFacility[],
  locale: string
): WorkoutFacilityDisplayLine[] {
  const types = workoutSportToFacilityTypes(sportType)
  if (!types) return []

  const dayKey = dateStrToFacilityDayKey(dateStr)
  const filtered = facilities.filter((f) => types.includes(f.facility_type))
  const sorted = [...filtered].sort((a, b) =>
    a.facility_name.localeCompare(b.facility_name, locale, { sensitivity: 'base' })
  )

  return sorted.map((f) => {
    const week = f.opening_hours
    if (!week || typeof week !== 'object') {
      return {
        facilityName: f.facility_name,
        facilityType: f.facility_type,
        kind: 'closed' as const,
      }
    }
    const day = week[dayKey]
    if (!day || !day.open || !day.slots?.length) {
      return {
        facilityName: f.facility_name,
        facilityType: f.facility_type,
        kind: 'closed' as const,
      }
    }
    return {
      facilityName: f.facility_name,
      facilityType: f.facility_type,
      kind: 'slots' as const,
      slotsLabel: formatFacilitySlotsLabel(day.slots),
    }
  })
}

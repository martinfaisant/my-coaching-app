import type { SportType } from '@/types/database'

/**
 * Sports dont `sport_type` est contraint en BDD (workouts, activités importées, agrégats).
 * Ordre = affichage dans la modale de programmation des séances.
 */
export const PERSISTED_WORKOUT_SPORT_TYPES = [
  'course',
  'trail',
  'velo',
  'natation',
  'musculation',
  'nordic_ski',
  'backcountry_ski',
  'ice_skating',
  'randonnee',
  'triathlon',
] as const satisfies readonly SportType[]

export type PersistedWorkoutSportType = (typeof PERSISTED_WORKOUT_SPORT_TYPES)[number]

export function isPersistedWorkoutSportType(s: string): s is SportType {
  return (PERSISTED_WORKOUT_SPORT_TYPES as readonly string[]).includes(s)
}

/** Séance : objectifs temps / distance + allure (hors musculation / triathlon = temps seul). */
export function workoutHasTimeDistanceTargets(sportType: SportType): boolean {
  return sportType !== 'musculation' && sportType !== 'triathlon'
}

/** Champ D+ facultatif (course, vélo, glace, skis). */
export function workoutHasElevationField(sportType: SportType): boolean {
  return (
    sportType === 'course' ||
    sportType === 'trail' ||
    sportType === 'velo' ||
    sportType === 'ice_skating' ||
    sportType === 'nordic_ski' ||
    sportType === 'backcountry_ski' ||
    sportType === 'randonnee'
  )
}

/** Allure affichée et calculée comme course à pied (min/km). */
export function workoutPaceIsRunningStyle(sportType: SportType): boolean {
  return (
    sportType === 'course' ||
    sportType === 'trail' ||
    sportType === 'ice_skating' ||
    sportType === 'nordic_ski' ||
    sportType === 'backcountry_ski' ||
    sportType === 'randonnee'
  )
}

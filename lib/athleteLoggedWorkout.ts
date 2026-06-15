import type { Workout } from '@/types/database'

/** Activité saisie par l'athlète (non planifiée par le coach). */
export function isAthleteLoggedWorkout(workout: Pick<Workout, 'planned_by'>): boolean {
  return workout.planned_by === 'athlete'
}

/** Pill badge tuile calendrier — même pattern que statuts planifié / réalisé / non réalisé. */
export const ATHLETE_LOGGED_TILE_BADGE_CLASSNAME =
  'rounded-full bg-palette-amber/15 text-palette-amber font-semibold'

/** Pill badge en-tête modale activité athlète. */
export const ATHLETE_LOGGED_MODAL_BADGE_CLASSNAME =
  'px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-palette-amber/15 text-palette-amber'

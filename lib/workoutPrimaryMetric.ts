import type { WorkoutPrimaryMetric, WorkoutPrimaryMetricBySport } from '@/types/database'

const REQUIRED_KEYS = [
  'course',
  'trail',
  'velo',
  'natation',
  'nordic_ski',
  'backcountry_ski',
  'ice_skating',
  'randonnee',
] as const

/** True si toutes les préférences obligatoires sont renseignées (time ou distance). */
export function isCoachWorkoutPrimaryMetricsComplete(
  p: WorkoutPrimaryMetricBySport | null | undefined
): boolean {
  if (!p) return false
  for (const k of REQUIRED_KEYS) {
    const v = p[k]
    if (v !== 'time' && v !== 'distance') return false
  }
  return true
}

/** Parse JSONB / inconnu → objet typé ou null si invalide. */
export function parseWorkoutPrimaryMetricBySport(raw: unknown): WorkoutPrimaryMetricBySport | null {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) return null
  const o = raw as Record<string, unknown>
  const out: WorkoutPrimaryMetricBySport = {}
  for (const k of REQUIRED_KEYS) {
    const v = o[k]
    if (v === 'time' || v === 'distance') {
      out[k] = v
    }
  }
  return out
}

/** Métrique effective pour le sport (musculation / hors C-V-N → time par défaut pour le form). */
export function getWorkoutPrimaryMetricForSport(
  sportType: string,
  prefs: WorkoutPrimaryMetricBySport | null | undefined
): WorkoutPrimaryMetric {
  if (sportType === 'musculation') return 'time'
  if (
    sportType === 'course' ||
    sportType === 'trail' ||
    sportType === 'velo' ||
    sportType === 'natation' ||
    sportType === 'nordic_ski' ||
    sportType === 'backcountry_ski' ||
    sportType === 'ice_skating' ||
    sportType === 'randonnee'
  ) {
    const m = prefs?.[sportType]
    if (m === 'distance' || m === 'time') return m
  }
  return 'time'
}

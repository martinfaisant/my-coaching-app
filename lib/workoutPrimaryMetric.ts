import type { WorkoutPrimaryMetric, WorkoutPrimaryMetricBySport } from '@/types/database'

const CVN_KEYS = ['course', 'velo', 'natation'] as const

/** True si course, vélo et natation ont chacune une métrique time ou distance. */
export function isCoachWorkoutPrimaryMetricsComplete(
  p: WorkoutPrimaryMetricBySport | null | undefined
): boolean {
  if (!p) return false
  for (const k of CVN_KEYS) {
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
  for (const k of CVN_KEYS) {
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
  if (sportType === 'course' || sportType === 'velo' || sportType === 'natation') {
    const m = prefs?.[sportType]
    if (m === 'distance' || m === 'time') return m
  }
  return 'time'
}

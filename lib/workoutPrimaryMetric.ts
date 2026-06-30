import type { WorkoutPrimaryMetric, WorkoutPrimaryMetricBySport } from '@/types/database'

export const WORKOUT_PRIMARY_METRIC_SPORT_KEYS = [
  'course',
  'trail',
  'velo',
  'natation',
  'nordic_ski',
  'backcountry_ski',
  'ice_skating',
  'randonnee',
  'triathlon',
  'canot',
] as const

export type WorkoutPrimaryMetricSportKey = (typeof WORKOUT_PRIMARY_METRIC_SPORT_KEYS)[number]

const REQUIRED_KEYS = WORKOUT_PRIMARY_METRIC_SPORT_KEYS

export const WORKOUT_PRIMARY_METRIC_FORM_FIELD_NAMES: Record<WorkoutPrimaryMetricSportKey, string> = {
  course: 'workout_primary_metric_course',
  trail: 'workout_primary_metric_trail',
  velo: 'workout_primary_metric_velo',
  natation: 'workout_primary_metric_natation',
  nordic_ski: 'workout_primary_metric_nordic_ski',
  backcountry_ski: 'workout_primary_metric_backcountry_ski',
  ice_skating: 'workout_primary_metric_ice_skating',
  randonnee: 'workout_primary_metric_randonnee',
  triathlon: 'workout_primary_metric_triathlon',
  canot: 'workout_primary_metric_canot',
}

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

/** Valeur initiale affichée pour un sport (défaut distance si non configuré). */
export function getDefaultWorkoutPrimaryMetric(
  prefs: WorkoutPrimaryMetricBySport | null | undefined,
  key: WorkoutPrimaryMetricSportKey
): WorkoutPrimaryMetric {
  const v = prefs?.[key]
  return v === 'time' || v === 'distance' ? v : 'distance'
}

export function parseWorkoutPrimaryMetricsFromFormData(
  formData: FormData
): { ok: true; data: WorkoutPrimaryMetricBySport } | { ok: false } {
  const data = {} as WorkoutPrimaryMetricBySport

  for (const key of REQUIRED_KEYS) {
    const fieldName = WORKOUT_PRIMARY_METRIC_FORM_FIELD_NAMES[key]
    const raw = (formData.get(fieldName) as string)?.trim()
    if (raw !== 'time' && raw !== 'distance') {
      return { ok: false }
    }
    data[key] = raw
  }

  if (!isCoachWorkoutPrimaryMetricsComplete(data)) {
    return { ok: false }
  }

  return { ok: true, data }
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
    sportType === 'randonnee' ||
    sportType === 'triathlon' ||
    sportType === 'canot'
  ) {
    const m = prefs?.[sportType]
    if (m === 'distance' || m === 'time') return m
  }
  return 'time'
}

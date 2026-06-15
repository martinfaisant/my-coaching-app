import type { SportType, WorkoutTimeOfDay } from '@/types/database'
import { workoutIsTimeOnlySport } from '@/lib/sportsRegistry'
import {
  WORKOUT_VALIDATION_ERROR_CODES,
  type WorkoutFormValidationError,
  type WorkoutValidationMessageKey,
  parseWorkoutTargetParams,
} from '@/lib/workoutValidation'

const VALID_TIME_OF_DAY: WorkoutTimeOfDay[] = ['morning', 'noon', 'evening']

const PACE_REQUIRED_SPORTS: SportType[] = [
  'course',
  'trail',
  'velo',
  'natation',
  'ice_skating',
  'nordic_ski',
  'backcountry_ski',
  'randonnee',
]

export const ATHLETE_LOGGED_ACTIVITY_EXTRA_ERROR_CODES = {
  TITLE_REQUIRED: 'titleRequired',
} as const

export type AthleteLoggedActivityValidationMessageKey =
  | WorkoutValidationMessageKey
  | (typeof ATHLETE_LOGGED_ACTIVITY_EXTRA_ERROR_CODES)[keyof typeof ATHLETE_LOGGED_ACTIVITY_EXTRA_ERROR_CODES]

export type AthleteLoggedActivityFormValidationError = {
  error: string
  errorCode: AthleteLoggedActivityValidationMessageKey
}

export type AthleteLoggedActivityValidatedData = {
  date: string
  sportType: SportType
  title: string
  description: string
  time_of_day: WorkoutTimeOfDay | null
  actual_duration_minutes: number | null
  actual_distance_km: number | null
  actual_elevation_m: number | null
  target_pace: number | null
  perceived_feeling: number | null
  perceived_intensity: number | null
  perceived_pleasure: number | null
  athlete_comment: string | null
}

export type AthleteLoggedActivityFormFields = {
  sportType: SportType | null
  title: string
  targetDurationMinutes: string
  targetDistanceKm: string
  targetElevationM: string
  targetPace: string
}

function parseOptionalInt1to5(raw: string | null): number | null {
  const trimmed = (raw ?? '').trim()
  if (trimmed === '') return null
  const n = parseInt(trimmed, 10)
  if (!Number.isFinite(n) || n < 1 || n > 5) return null
  return n
}

function parseOptionalInt1to10(raw: string | null): number | null {
  const trimmed = (raw ?? '').trim()
  if (trimmed === '') return null
  const n = parseInt(trimmed, 10)
  if (!Number.isFinite(n) || n < 1 || n > 10) return null
  return n
}

function getAthleteLoggedActivityMetricsValidationError(
  sportType: SportType,
  durationRaw: string,
  distanceRaw: string,
  elevationRaw: string,
  paceRaw: string
): AthleteLoggedActivityFormValidationError | null {
  const target_pace = paceRaw.trim() !== '' && Number(paceRaw) > 0 ? Number(paceRaw) : null
  const parsed = parseWorkoutTargetParams(sportType, durationRaw, distanceRaw, elevationRaw)

  if (workoutIsTimeOnlySport(sportType) && !(parsed.target_duration_minutes != null && parsed.target_duration_minutes > 0)) {
    return {
      error: 'Durée obligatoire.',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.DURATION_REQUIRED_FOR_SPORT,
    }
  }

  if (!workoutIsTimeOnlySport(sportType)) {
    if (parsed.target_duration_minutes === undefined && parsed.target_distance_km === undefined) {
      return {
        error: 'Indiquez au moins une métrique.',
        errorCode: WORKOUT_VALIDATION_ERROR_CODES.TARGET_REQUIRED,
      }
    }

    if (PACE_REQUIRED_SPORTS.includes(sportType) && (target_pace == null || target_pace <= 0)) {
      const hasDur =
        parsed.target_duration_minutes != null &&
        parsed.target_duration_minutes !== undefined &&
        parsed.target_duration_minutes > 0
      const hasDist =
        parsed.target_distance_km != null && parsed.target_distance_km !== undefined && parsed.target_distance_km > 0
      if (!(hasDur && hasDist)) {
        return {
          error: 'Allure/vitesse obligatoire.',
          errorCode: WORKOUT_VALIDATION_ERROR_CODES.PACE_REQUIRED,
        }
      }
    }
  }

  return null
}

/** Validation client : titre + métriques obligatoires selon le sport (aligné serveur). */
export function isAthleteLoggedActivityFormValid(fields: AthleteLoggedActivityFormFields): boolean {
  if (fields.sportType == null || fields.title.trim() === '') return false
  return (
    getAthleteLoggedActivityMetricsValidationError(
      fields.sportType,
      fields.targetDurationMinutes.trim(),
      fields.targetDistanceKm.trim(),
      fields.targetElevationM.trim(),
      fields.targetPace.trim()
    ) === null
  )
}

/**
 * Valide le formulaire activité athlète (layout coach, stockage actual_*).
 */
export function validateAthleteLoggedActivityFormData(
  formData: FormData
): AthleteLoggedActivityFormValidationError | { data: AthleteLoggedActivityValidatedData } {
  const date = formData.get('date') as string
  const sportType = formData.get('sport_type') as SportType
  const titleRaw = (formData.get('title') as string)?.trim() ?? ''
  const description = (formData.get('description') as string)?.trim() ?? ''
  const durationRaw = (formData.get('target_duration_minutes') as string)?.trim() ?? ''
  const distanceRaw = (formData.get('target_distance_km') as string)?.trim() ?? ''
  const elevationRaw = (formData.get('target_elevation_m') as string)?.trim() ?? ''
  const paceRaw = (formData.get('target_pace') as string)?.trim() ?? ''

  if (!date || !sportType) {
    return {
      error: 'Champs obligatoires manquants.',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.ALL_FIELDS_REQUIRED,
    }
  }

  if (titleRaw === '') {
    return {
      error: 'Titre obligatoire.',
      errorCode: ATHLETE_LOGGED_ACTIVITY_EXTRA_ERROR_CODES.TITLE_REQUIRED,
    }
  }

  const metricsError = getAthleteLoggedActivityMetricsValidationError(
    sportType,
    durationRaw,
    distanceRaw,
    elevationRaw,
    paceRaw
  )
  if (metricsError) return metricsError

  const target_pace = paceRaw !== '' && Number(paceRaw) > 0 ? Number(paceRaw) : null
  const parsed = parseWorkoutTargetParams(sportType, durationRaw, distanceRaw, elevationRaw)

  const timeOfDayRaw = (formData.get('time_of_day') as string)?.trim() ?? ''
  const time_of_day: WorkoutTimeOfDay | null =
    timeOfDayRaw && VALID_TIME_OF_DAY.includes(timeOfDayRaw as WorkoutTimeOfDay)
      ? (timeOfDayRaw as WorkoutTimeOfDay)
      : null

  const commentRaw = (formData.get('athlete_comment') as string)?.trim() ?? ''

  return {
    data: {
      date,
      sportType,
      title: titleRaw,
      description,
      time_of_day,
      actual_duration_minutes:
        parsed.target_duration_minutes != null && parsed.target_duration_minutes > 0
          ? parsed.target_duration_minutes
          : null,
      actual_distance_km:
        parsed.target_distance_km != null && parsed.target_distance_km > 0 ? parsed.target_distance_km : null,
      actual_elevation_m:
        parsed.target_elevation_m != null && parsed.target_elevation_m >= 0 ? parsed.target_elevation_m : null,
      target_pace,
      perceived_feeling: parseOptionalInt1to5(formData.get('perceived_feeling') as string | null),
      perceived_intensity: parseOptionalInt1to10(formData.get('perceived_intensity') as string | null),
      perceived_pleasure: parseOptionalInt1to5(formData.get('perceived_pleasure') as string | null),
      athlete_comment: commentRaw !== '' ? commentRaw : null,
    },
  }
}

export function translateAthleteLoggedActivityValidationError(
  err: AthleteLoggedActivityFormValidationError,
  translate: (key: string) => string
): string {
  return translate(err.errorCode)
}

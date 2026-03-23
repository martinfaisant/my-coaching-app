import type { SportType, WorkoutTimeOfDay, WorkoutPrimaryMetric, WorkoutPrimaryMetricBySport } from '@/types/database'
import { computeDistanceKmFromDurationPace, computeDurationMinutesFromDistancePace } from '@/lib/workoutTargetMath'
import { getWorkoutPrimaryMetricForSport, isCoachWorkoutPrimaryMetricsComplete } from '@/lib/workoutPrimaryMetric'

const VALID_TIME_OF_DAY: WorkoutTimeOfDay[] = ['morning', 'noon', 'evening']

/**
 * Error codes for workout validation.
 * Map to translation keys: workouts.validation.{code}
 */
export const WORKOUT_VALIDATION_ERROR_CODES = {
  ALL_FIELDS_REQUIRED: 'allFieldsRequired',
  INVALID_SPORT: 'invalidSport',
  TARGET_REQUIRED: 'targetRequired',
  PACE_REQUIRED: 'paceRequired',
  PRIMARY_METRIC_REQUIRED: 'primaryMetricRequired',
  WORKOUT_UNITS_NOT_CONFIGURED: 'workoutUnitsNotConfigured',
} as const

export type ValidateWorkoutFormOptions = {
  /** Préférences coach ; si C/V/N et défini, applique la métrique obligatoire + résolution allure. */
  primaryMetricBySport?: WorkoutPrimaryMetricBySport | null
}

/**
 * Valide les données d'un formulaire de workout (création ou mise à jour).
 * Retourne soit les données validées, soit une erreur.
 */
export function validateWorkoutFormData(
  formData: FormData,
  options?: ValidateWorkoutFormOptions
):
  | { error: string; errorCode?: string }
  | {
      data: {
        date: string
        sportType: SportType
        title: string
        description: string
        time_of_day: WorkoutTimeOfDay | null
        target_duration_minutes: number | null | undefined
        target_distance_km: number | null | undefined
        target_elevation_m: number | null | undefined
        target_pace: number | null
      }
    } {
  const date = formData.get('date') as string
  const sportType = formData.get('sport_type') as SportType
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim() ?? ''
  const durationRaw = (formData.get('target_duration_minutes') as string)?.trim()
  const distanceRaw = (formData.get('target_distance_km') as string)?.trim()
  const elevationRaw = (formData.get('target_elevation_m') as string)?.trim()
  const paceRaw = (formData.get('target_pace') as string)?.trim()

  if (!date || !sportType || !title) {
    return {
      error: 'Tous les champs sont obligatoires.',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.ALL_FIELDS_REQUIRED,
    }
  }

  const validSports: SportType[] = [
    'course',
    'velo',
    'natation',
    'musculation',
    'nordic_ski',
    'backcountry_ski',
    'ice_skating',
  ]
  if (!validSports.includes(sportType)) {
    return {
      error: 'Type de sport invalide.',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.INVALID_SPORT,
    }
  }

  const target_pace = paceRaw && paceRaw !== '' && Number(paceRaw) > 0 ? Number(paceRaw) : null

  const prefs = options?.primaryMetricBySport
  const useCoachPrimary =
    prefs != null &&
    (sportType === 'course' || sportType === 'velo' || sportType === 'natation')

  if (useCoachPrimary) {
    if (!isCoachWorkoutPrimaryMetricsComplete(prefs)) {
      return {
        error: 'Configurez les unités des séances dans votre profil.',
        errorCode: WORKOUT_VALIDATION_ERROR_CODES.WORKOUT_UNITS_NOT_CONFIGURED,
      }
    }
    const primary = getWorkoutPrimaryMetricForSport(sportType, prefs) as WorkoutPrimaryMetric
    const resolved = resolveCvNTargetsWithCoachPrimary(
      sportType,
      primary,
      durationRaw,
      distanceRaw,
      elevationRaw,
      target_pace
    )
    if ('error' in resolved) {
      return resolved
    }
    const timeOfDayRaw = (formData.get('time_of_day') as string)?.trim() ?? ''
    const time_of_day: WorkoutTimeOfDay | null =
      timeOfDayRaw && VALID_TIME_OF_DAY.includes(timeOfDayRaw as WorkoutTimeOfDay)
        ? (timeOfDayRaw as WorkoutTimeOfDay)
        : null

    return {
      data: {
        date,
        sportType,
        title,
        description,
        time_of_day,
        target_duration_minutes: resolved.target_duration_minutes,
        target_distance_km: resolved.target_distance_km,
        target_elevation_m: resolved.target_elevation_m,
        target_pace,
      },
    }
  }

  const { target_duration_minutes, target_distance_km, target_elevation_m } = parseWorkoutTargetParams(
    sportType,
    durationRaw,
    distanceRaw,
    elevationRaw
  )

  if (target_duration_minutes === undefined && target_distance_km === undefined) {
    return {
      error: 'Indiquez un objectif (temps ou distance selon le sport).',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.TARGET_REQUIRED,
    }
  }

  if (['course', 'velo', 'natation'].includes(sportType) && (target_pace == null || target_pace <= 0)) {
    const hasDur =
      target_duration_minutes != null &&
      target_duration_minutes !== undefined &&
      target_duration_minutes > 0
    const hasDist =
      target_distance_km != null && target_distance_km !== undefined && target_distance_km > 0
    if (!(hasDur && hasDist)) {
      return {
        error: 'La vitesse (allure ou km/h) est obligatoire pour ce sport.',
        errorCode: WORKOUT_VALIDATION_ERROR_CODES.PACE_REQUIRED,
      }
    }
  }

  const timeOfDayRaw = (formData.get('time_of_day') as string)?.trim() ?? ''
  const time_of_day: WorkoutTimeOfDay | null =
    timeOfDayRaw && VALID_TIME_OF_DAY.includes(timeOfDayRaw as WorkoutTimeOfDay)
      ? (timeOfDayRaw as WorkoutTimeOfDay)
      : null

  return {
    data: {
      date,
      sportType,
      title,
      description,
      time_of_day,
      target_duration_minutes,
      target_distance_km,
      target_elevation_m,
      target_pace,
    },
  }
}

function resolveCvNTargetsWithCoachPrimary(
  sportType: 'course' | 'velo' | 'natation',
  primary: WorkoutPrimaryMetric,
  durationRaw: string,
  distanceRaw: string,
  elevationRaw: string,
  pace: number | null
):
  | { error: string; errorCode: string }
  | {
      target_duration_minutes: number | null | undefined
      target_distance_km: number | null | undefined
      target_elevation_m: number | null | undefined
    } {
  const duration = durationRaw ? parseInt(durationRaw, 10) : undefined
  const distance = distanceRaw ? parseFloat(distanceRaw) : undefined
  const elevation = elevationRaw ? parseInt(elevationRaw, 10) : undefined
  const validDuration = duration != null && !Number.isNaN(duration) && duration > 0
  const validDistance = distance != null && !Number.isNaN(distance) && distance > 0
  const validElevation = elevation != null && !Number.isNaN(elevation) && elevation >= 0

  let dMin: number | null = validDuration ? duration : null
  let dKm: number | null = validDistance ? distance : null

  const p = pace != null && pace > 0 ? pace : null

  if (primary === 'distance') {
    if (dKm == null && dMin != null && p != null) {
      dKm = computeDistanceKmFromDurationPace(sportType, dMin, p)
    }
  } else {
    if (dMin == null && dKm != null && p != null) {
      dMin = computeDurationMinutesFromDistancePace(sportType, dKm, p)
    }
  }

  if (primary === 'distance' && (dKm == null || dKm <= 0)) {
    return {
      error: 'Indiquez une distance ou des éléments permettant de la calculer.',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.PRIMARY_METRIC_REQUIRED,
    }
  }
  if (primary === 'time' && (dMin == null || dMin <= 0)) {
    return {
      error: 'Indiquez une durée ou des éléments permettant de la calculer.',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.PRIMARY_METRIC_REQUIRED,
    }
  }

  const hasPace = p != null
  const hasBoth = dMin != null && dMin > 0 && dKm != null && dKm > 0
  if (!hasPace && !hasBoth) {
    return {
      error: 'La vitesse (allure ou km/h) est obligatoire pour ce sport.',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.PACE_REQUIRED,
    }
  }

  return {
    target_duration_minutes: dMin ?? undefined,
    target_distance_km: dKm ?? undefined,
    target_elevation_m: sportType === 'course' || sportType === 'velo' ? (validElevation ? elevation : null) : null,
  }
}

function parseWorkoutTargetParams(
  sportType: SportType,
  durationRaw: string,
  distanceRaw: string,
  elevationRaw: string
): {
  target_duration_minutes: number | null | undefined
  target_distance_km: number | null | undefined
  target_elevation_m: number | null | undefined
} {
  const duration = durationRaw ? parseInt(durationRaw, 10) : undefined
  const distance = distanceRaw ? parseFloat(distanceRaw) : undefined
  const elevation = elevationRaw ? parseInt(elevationRaw, 10) : undefined
  const validDuration = duration != null && !Number.isNaN(duration) && duration > 0
  const validDistance = distance != null && !Number.isNaN(distance) && distance > 0
  const validElevation = elevation != null && !Number.isNaN(elevation) && elevation >= 0

  if (sportType === 'musculation') {
    return {
      target_duration_minutes: validDuration ? duration : null,
      target_distance_km: null,
      target_elevation_m: null,
    }
  }

  if (sportType === 'natation') {
    return {
      target_duration_minutes: validDuration ? duration : validDistance ? null : undefined,
      target_distance_km: validDistance ? distance : validDuration ? null : undefined,
      target_elevation_m: null,
    }
  }

  if (sportType === 'course' || sportType === 'velo') {
    const hasDuration = validDuration
    const hasDistance = validDistance
    return {
      target_duration_minutes: hasDuration ? duration : hasDistance ? null : undefined,
      target_distance_km: hasDistance ? distance : hasDuration ? null : undefined,
      target_elevation_m: validElevation ? elevation : null,
    }
  }

  return {
    target_duration_minutes: validDuration ? duration : null,
    target_distance_km: validDistance ? distance : null,
    target_elevation_m: validElevation ? elevation : null,
  }
}

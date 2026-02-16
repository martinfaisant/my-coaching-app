import type { SportType } from '@/types/database'

/**
 * Error codes for workout validation.
 * Map to translation keys: workouts.validation.{code}
 */
export const WORKOUT_VALIDATION_ERROR_CODES = {
  ALL_FIELDS_REQUIRED: 'allFieldsRequired',
  INVALID_SPORT: 'invalidSport',
  TARGET_REQUIRED: 'targetRequired',
  PACE_REQUIRED: 'paceRequired',
} as const

/**
 * Valide les données d'un formulaire de workout (création ou mise à jour).
 * Retourne soit les données validées, soit une erreur.
 */
export function validateWorkoutFormData(formData: FormData): 
  | { error: string; errorCode?: string }
  | {
      data: {
        date: string
        sportType: SportType
        title: string
        description: string
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

  // Validation des champs obligatoires
  if (!date || !sportType || !title) {
    return { 
      error: 'Tous les champs sont obligatoires.',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.ALL_FIELDS_REQUIRED
    }
  }

  // Validation du type de sport
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
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.INVALID_SPORT
    }
  }

  // Parse et validation des targets
  const { target_duration_minutes, target_distance_km, target_elevation_m } = parseWorkoutTargetParams(
    sportType,
    durationRaw,
    distanceRaw,
    elevationRaw
  )

  if (target_duration_minutes === undefined && target_distance_km === undefined) {
    return { 
      error: 'Indiquez un objectif (temps ou distance selon le sport).',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.TARGET_REQUIRED
    }
  }

  // Validation de la vitesse/allure
  const target_pace = paceRaw && paceRaw !== '' && Number(paceRaw) > 0 ? Number(paceRaw) : null
  if (['course', 'velo', 'natation'].includes(sportType) && (target_pace == null || target_pace <= 0)) {
    return { 
      error: 'La vitesse (allure ou km/h) est obligatoire pour ce sport.',
      errorCode: WORKOUT_VALIDATION_ERROR_CODES.PACE_REQUIRED
    }
  }

  return {
    data: {
      date,
      sportType,
      title,
      description,
      target_duration_minutes,
      target_distance_km,
      target_elevation_m,
      target_pace,
    },
  }
}

/**
 * Parse et valide les paramètres de target (durée, distance, dénivelé) selon le sport.
 * Retourne des valeurs null pour les champs non applicables au sport.
 */
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
    // Permettre d'avoir les deux valeurs si elles sont toutes les deux valides (cas où l'une est calculée)
    return {
      target_duration_minutes: validDuration ? duration : validDistance ? null : undefined,
      target_distance_km: validDistance ? distance : validDuration ? null : undefined,
      target_elevation_m: null,
    }
  }

  if (sportType === 'course' || sportType === 'velo') {
    // Permettre d'avoir les deux valeurs si elles sont toutes les deux valides (cas où l'une est calculée)
    // Si les deux sont valides, on les garde toutes les deux pour les totaux
    const hasDuration = validDuration
    const hasDistance = validDistance
    return {
      target_duration_minutes: hasDuration ? duration : hasDistance ? null : undefined,
      target_distance_km: hasDistance ? distance : hasDuration ? null : undefined,
      target_elevation_m: validElevation ? elevation : null,
    }
  }

  // Pour les autres sports (nordic_ski, backcountry_ski, ice_skating)
  return {
    target_duration_minutes: validDuration ? duration : null,
    target_distance_km: validDistance ? distance : null,
    target_elevation_m: validElevation ? elevation : null,
  }
}

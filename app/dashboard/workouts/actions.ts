'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SportType, Workout } from '@/types/database'
import { requireCoachOrAthleteAccess, requireRole } from '@/lib/authHelpers'

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
      target_duration_minutes: validDuration ? duration : (validDistance ? null : undefined),
      target_distance_km: validDistance ? distance : (validDuration ? null : undefined),
      target_elevation_m: null,
    }
  }
  if (sportType === 'course' || sportType === 'velo') {
    // Permettre d'avoir les deux valeurs si elles sont toutes les deux valides (cas où l'une est calculée)
    // Si les deux sont valides, on les garde toutes les deux pour les totaux
    const hasDuration = validDuration
    const hasDistance = validDistance
    return {
      target_duration_minutes: hasDuration ? duration : (hasDistance ? null : undefined),
      target_distance_km: hasDistance ? distance : (hasDuration ? null : undefined),
      target_elevation_m: validElevation ? elevation : null,
    }
  }
  return {
    target_duration_minutes: null,
    target_distance_km: null,
    target_elevation_m: null,
  }
}

export type WorkoutFormState = {
  error?: string
  success?: boolean
  /** Workout créé ou mis à jour (pour mise à jour optimiste côté client). */
  workout?: Workout
}

export async function createWorkout(
  athleteId: string,
  pathToRevalidate: string,
  _prevState: WorkoutFormState,
  formData: FormData
): Promise<WorkoutFormState> {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  if ('error' in accessResult) return { error: accessResult.error }

  const { isCoach, isAthlete } = accessResult
  if (isAthlete) return { error: 'Seul le coach peut créer un entraînement.' }
  if (!isCoach) return { error: 'Non autorisé.' }

  const date = formData.get('date') as string
  const sportType = formData.get('sport_type') as SportType
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const durationRaw = (formData.get('target_duration_minutes') as string)?.trim()
  const distanceRaw = (formData.get('target_distance_km') as string)?.trim()
  const elevationRaw = (formData.get('target_elevation_m') as string)?.trim()
  const paceRaw = (formData.get('target_pace') as string)?.trim()

  if (!date || !sportType || !title) {
    return { error: 'Tous les champs sont obligatoires.' }
  }
  if (!['course', 'musculation', 'natation', 'velo'].includes(sportType)) {
    return { error: 'Type de sport invalide.' }
  }

  const { target_duration_minutes, target_distance_km, target_elevation_m } = parseWorkoutTargetParams(
    sportType,
    durationRaw,
    distanceRaw,
    elevationRaw
  )
  if (target_duration_minutes === undefined && target_distance_km === undefined) {
    return { error: 'Indiquez un objectif (temps ou distance selon le sport).' }
  }

  const target_pace = paceRaw && paceRaw !== '' && Number(paceRaw) > 0 ? Number(paceRaw) : null
  if (['course', 'velo', 'natation'].includes(sportType) && (target_pace == null || target_pace <= 0)) {
    return { error: 'La vitesse (allure ou km/h) est obligatoire pour ce sport.' }
  }

  const { data: created, error } = await supabase
    .from('workouts')
    .insert({
      athlete_id: athleteId,
      date,
      sport_type: sportType,
      title,
      description: description ?? '',
      target_duration_minutes: target_duration_minutes ?? null,
      target_distance_km: target_distance_km ?? null,
      target_elevation_m: target_elevation_m ?? null,
      target_pace,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(pathToRevalidate)
  return { success: true, workout: created as Workout }
}

export async function updateWorkout(
  workoutId: string,
  athleteId: string,
  pathToRevalidate: string,
  _prevState: WorkoutFormState,
  formData: FormData
): Promise<WorkoutFormState> {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  if ('error' in accessResult) return { error: accessResult.error }

  const { isCoach } = accessResult
  if (!isCoach) return { error: 'Seul le coach peut modifier un entraînement.' }

  const date = formData.get('date') as string
  const sportType = formData.get('sport_type') as SportType
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()
  const durationRaw = (formData.get('target_duration_minutes') as string)?.trim()
  const distanceRaw = (formData.get('target_distance_km') as string)?.trim()
  const elevationRaw = (formData.get('target_elevation_m') as string)?.trim()
  const paceRaw = (formData.get('target_pace') as string)?.trim()

  if (!date || !sportType || !title) {
    return { error: 'Tous les champs sont obligatoires.' }
  }
  if (!['course', 'musculation', 'natation', 'velo'].includes(sportType)) {
    return { error: 'Type de sport invalide.' }
  }

  const { target_duration_minutes, target_distance_km, target_elevation_m } = parseWorkoutTargetParams(
    sportType,
    durationRaw,
    distanceRaw,
    elevationRaw
  )
  if (target_duration_minutes === undefined && target_distance_km === undefined) {
    return { error: 'Indiquez un objectif (temps ou distance selon le sport).' }
  }

  const target_pace = paceRaw && paceRaw !== '' && Number(paceRaw) > 0 ? Number(paceRaw) : null
  if (['course', 'velo', 'natation'].includes(sportType) && (target_pace == null || target_pace <= 0)) {
    return { error: 'La vitesse (allure ou km/h) est obligatoire pour ce sport.' }
  }

  const { data: updated, error } = await supabase
    .from('workouts')
    .update({
      date,
      sport_type: sportType,
      title,
      description: description ?? '',
      target_duration_minutes: target_duration_minutes ?? null,
      target_distance_km: target_distance_km ?? null,
      target_elevation_m: target_elevation_m ?? null,
      target_pace,
      updated_at: new Date().toISOString(),
    })
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(pathToRevalidate)
  return { success: true, workout: updated as Workout }
}

export async function deleteWorkout(
  workoutId: string,
  athleteId: string,
  pathToRevalidate: string
): Promise<WorkoutFormState> {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  if ('error' in accessResult) return { error: accessResult.error }

  const { isCoach } = accessResult
  if (!isCoach) return { error: 'Seul le coach peut supprimer un entraînement.' }

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)

  if (error) return { error: error.message }
  revalidatePath(pathToRevalidate)
  return { success: true }
}

export type CommentFormState = {
  error?: string
  success?: boolean
}

export async function getWorkoutsForDateRange(
  athleteId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  if ('error' in accessResult) return { error: accessResult.error, workouts: [] }

  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('athlete_id', athleteId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('created_at')

  if (error) return { error: error.message, workouts: [] }
  return { workouts: workouts ?? [] }
}

export async function getImportedActivitiesForDateRange(
  athleteId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.', importedActivities: [] }

  // Les activités importées (Strava, etc.) sont réservées à l'athlète : le coach ne peut pas y accéder.
  if (user.id !== athleteId) {
    return { importedActivities: [] }
  }

  const { data: importedActivities, error } = await supabase
    .from('imported_activities')
    .select('*')
    .eq('athlete_id', athleteId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('created_at')

  if (error) return { error: error.message, importedActivities: [] }
  return { importedActivities: importedActivities ?? [] }
}

/** Totaux hebdomadaires (activités importées) par sport. Le coach peut les voir pour ses athlètes sans accéder aux activités Strava. */
export async function getImportedActivityWeeklyTotals(
  athleteId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  if ('error' in accessResult) return { error: accessResult.error, weeklyTotals: [] }

  const { isCoach } = accessResult

  const { data: weeklyTotals, error } = await supabase
    .from('imported_activity_weekly_totals')
    .select('*')
    .eq('athlete_id', athleteId)
    .gte('week_start', startDate)
    .lte('week_start', endDate)
    .order('week_start')
    .order('sport_type')

  if (error) return { error: error.message, weeklyTotals: [] }
  return { weeklyTotals: weeklyTotals ?? [] }
}

/** Totaux hebdomadaires précalculés (entraînements prévus) par sport. Précalculés pour accélérer l'affichage. */
export async function getWorkoutWeeklyTotals(
  athleteId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  if ('error' in accessResult) return { error: accessResult.error, workoutTotals: [] }

  const { data: workoutTotals, error } = await supabase
    .from('workout_weekly_totals')
    .select('*')
    .eq('athlete_id', athleteId)
    .gte('week_start', startDate)
    .lte('week_start', endDate)
    .order('week_start')
    .order('sport_type')

  if (error) return { error: error.message, workoutTotals: [] }
  return { workoutTotals: workoutTotals ?? [] }
}

export async function saveWorkoutComment(
  workoutId: string,
  athleteId: string,
  pathToRevalidate: string,
  _prevState: CommentFormState,
  formData: FormData
): Promise<CommentFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }
  if (user.id !== athleteId) return { error: 'Non autorisé.' }

  const comment = (formData.get('comment') as string)?.trim() ?? ''

  // Log pour diagnostic
  console.log('[saveWorkoutComment] Tentative de sauvegarde:', {
    workoutId,
    athleteId,
    userId: user.id,
    commentLength: comment.length,
    hasComment: !!comment,
  })

  const { data, error, status, statusText } = await supabase
    .from('workouts')
    .update({
      athlete_comment: comment || null,
      athlete_comment_at: comment ? new Date().toISOString() : null,
    })
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)
    .select()

  // Log détaillé du résultat
  console.log('[saveWorkoutComment] Résultat:', {
    success: !error,
    error: error?.message,
    status,
    statusText,
    dataReturned: !!data,
    dataLength: data?.length,
  })

  if (error) {
    console.error('[saveWorkoutComment] Erreur Supabase:', error)
    return { error: error.message }
  }

  if (!data || data.length === 0) {
    console.error('[saveWorkoutComment] UPDATE réussi mais aucune ligne retournée (RLS?)')
    return { error: 'Impossible de sauvegarder le commentaire. Vérifiez vos permissions.' }
  }

  revalidatePath(pathToRevalidate)
  return { success: true }
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Workout } from '@/types/database'
import { requireCoachOrAthleteAccess } from '@/lib/authHelpers'
import { validateWorkoutFormData } from '@/lib/workoutValidation'
import { logger } from '@/lib/logger'

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

  // Validation des données du formulaire
  const validation = validateWorkoutFormData(formData)
  if ('error' in validation) return validation

  const {
    date,
    sportType,
    title,
    description,
    target_duration_minutes,
    target_distance_km,
    target_elevation_m,
    target_pace,
  } = validation.data

  const { data: created, error } = await supabase
    .from('workouts')
    .insert({
      athlete_id: athleteId,
      date,
      sport_type: sportType,
      title,
      description,
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

  // Validation des données du formulaire
  const validation = validateWorkoutFormData(formData)
  if ('error' in validation) return validation

  const {
    date,
    sportType,
    title,
    description,
    target_duration_minutes,
    target_distance_km,
    target_elevation_m,
    target_pace,
  } = validation.data

  const { data: updated, error } = await supabase
    .from('workouts')
    .update({
      date,
      sport_type: sportType,
      title,
      description,
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

  const { data, error } = await supabase
    .from('workouts')
    .update({
      athlete_comment: comment || null,
      athlete_comment_at: comment ? new Date().toISOString() : null,
    })
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)
    .select()

  if (error) {
    logger.error('[saveWorkoutComment] Erreur', error)
    return { error: error.message }
  }

  if (!data || data.length === 0) {
    logger.error('[saveWorkoutComment] Aucune ligne mise à jour (RLS?)', undefined, {
      workoutId,
      athleteId,
    })
    return { error: 'Impossible de sauvegarder le commentaire.' }
  }

  revalidatePath(pathToRevalidate)
  return { success: true }
}

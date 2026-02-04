'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SportType } from '@/types/database'

export type WorkoutFormState = {
  error?: string
  success?: string
}

export async function createWorkout(
  athleteId: string,
  pathToRevalidate: string,
  _prevState: WorkoutFormState,
  formData: FormData
): Promise<WorkoutFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role, user_id')
    .eq('user_id', user.id)
    .single()

  const isCoach = myProfile?.role === 'coach'
  const isAthlete = myProfile?.role === 'athlete' && user.id === athleteId
  if (!isCoach && !isAthlete) return { error: 'Non autorisé.' }
  if (isAthlete) return { error: 'Seul le coach peut créer un entraînement.' }

  const { data: athleteProfile } = await supabase
    .from('profiles')
    .select('coach_id')
    .eq('user_id', athleteId)
    .single()
  if (athleteProfile?.coach_id !== user.id) return { error: 'Cet athlète n\'est pas sous votre responsabilité.' }

  const date = formData.get('date') as string
  const sportType = formData.get('sport_type') as SportType
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!date || !sportType || !title || !description) {
    return { error: 'Tous les champs sont obligatoires.' }
  }
  if (!['course', 'musculation', 'natation', 'velo'].includes(sportType)) {
    return { error: 'Type de sport invalide.' }
  }

  const { error } = await supabase.from('workouts').insert({
    athlete_id: athleteId,
    date,
    sport_type: sportType,
    title,
    description,
  })

  if (error) return { error: error.message }
  revalidatePath(pathToRevalidate)
  return { success: 'Entraînement enregistré.' }
}

export async function updateWorkout(
  workoutId: string,
  athleteId: string,
  pathToRevalidate: string,
  _prevState: WorkoutFormState,
  formData: FormData
): Promise<WorkoutFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (myProfile?.role !== 'coach') return { error: 'Seul le coach peut modifier un entraînement.' }

  const { data: athleteProfile } = await supabase
    .from('profiles')
    .select('coach_id')
    .eq('user_id', athleteId)
    .single()
  if (athleteProfile?.coach_id !== user.id) return { error: 'Non autorisé.' }

  const sportType = formData.get('sport_type') as SportType
  const title = (formData.get('title') as string)?.trim()
  const description = (formData.get('description') as string)?.trim()

  if (!sportType || !title || !description) {
    return { error: 'Tous les champs sont obligatoires.' }
  }
  if (!['course', 'musculation', 'natation', 'velo'].includes(sportType)) {
    return { error: 'Type de sport invalide.' }
  }

  const { error } = await supabase
    .from('workouts')
    .update({ sport_type: sportType, title, description })
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)

  if (error) return { error: error.message }
  revalidatePath(pathToRevalidate)
  return { success: 'Entraînement mis à jour.' }
}

export async function deleteWorkout(
  workoutId: string,
  athleteId: string,
  pathToRevalidate: string
): Promise<WorkoutFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()
  if (myProfile?.role !== 'coach') return { error: 'Seul le coach peut supprimer un entraînement.' }

  const { data: athleteProfile } = await supabase
    .from('profiles')
    .select('coach_id')
    .eq('user_id', athleteId)
    .single()
  if (athleteProfile?.coach_id !== user.id) return { error: 'Non autorisé.' }

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)

  if (error) return { error: error.message }
  revalidatePath(pathToRevalidate)
  return { success: 'Entraînement supprimé.' }
}

export type CommentFormState = {
  error?: string
  success?: string
}

export async function getWorkoutsForDateRange(
  athleteId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.', workouts: [] }

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role, user_id')
    .eq('user_id', user.id)
    .single()

  const isCoach = myProfile?.role === 'coach'
  const isAthlete = myProfile?.role === 'athlete' && user.id === athleteId
  if (!isCoach && !isAthlete) return { error: 'Non autorisé.', workouts: [] }

  if (isCoach) {
    const { data: athleteProfile } = await supabase
      .from('profiles')
      .select('coach_id')
      .eq('user_id', athleteId)
      .single()
    if (athleteProfile?.coach_id !== user.id) {
      return { error: 'Non autorisé.', workouts: [] }
    }
  }

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

  const { error } = await supabase
    .from('workouts')
    .update({
      athlete_comment: comment || null,
      athlete_comment_at: comment ? new Date().toISOString() : null,
    })
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)

  if (error) return { error: error.message }
  revalidatePath(pathToRevalidate)
  return { success: 'Commentaire enregistré.' }
}

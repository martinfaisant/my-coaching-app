'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getLocale, getTranslations } from 'next-intl/server'
import type { Workout } from '@/types/database'
import { requireUser } from '@/lib/authHelpers'
import { logger } from '@/lib/logger'
import {
  translateAthleteLoggedActivityValidationError,
  validateAthleteLoggedActivityFormData,
  type AthleteLoggedActivityValidatedData,
} from '@/lib/athleteLoggedActivityValidation'

export type AthleteLoggedActivityFormState = {
  error?: string
  success?: boolean
  workout?: Workout
}

async function requireAthleteOwner(athleteId: string) {
  const supabase = await createClient()
  const locale = await getLocale()
  const [userResult, tAuth] = await Promise.all([
    requireUser(supabase),
    getTranslations({ locale, namespace: 'auth.errors' }),
  ])
  if ('error' in userResult) {
    return { error: tAuth(userResult.errorCode ?? 'notAuthenticated') } as const
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userResult.user.id)
    .single()

  if (profile?.role !== 'athlete' || userResult.user.id !== athleteId) {
    return { error: tAuth('accessDenied') } as const
  }

  return { supabase, userId: userResult.user.id } as const
}

function buildRowPayload(data: AthleteLoggedActivityValidatedData, title: string) {
  const now = new Date().toISOString()
  return {
    date: data.date,
    sport_type: data.sportType,
    title,
    description: data.description,
    planned_by: 'athlete' as const,
    status: 'completed' as const,
    time_of_day: data.time_of_day,
    target_duration_minutes: null,
    target_distance_km: null,
    target_elevation_m: null,
    target_pace: data.target_pace,
    actual_duration_minutes: data.actual_duration_minutes,
    actual_distance_km: data.actual_distance_km,
    actual_elevation_m: data.actual_elevation_m,
    perceived_feeling: data.perceived_feeling,
    perceived_intensity: data.perceived_intensity,
    perceived_pleasure: data.perceived_pleasure,
    athlete_comment: data.athlete_comment,
    athlete_comment_at: data.athlete_comment ? now : null,
  }
}

export async function createAthleteLoggedActivity(
  athleteId: string,
  pathToRevalidate: string,
  _prevState: AthleteLoggedActivityFormState,
  formData: FormData
): Promise<AthleteLoggedActivityFormState> {
  const locale = (formData.get('_locale') as string) || (await getLocale())
  const [tValidation, tErrors] = await Promise.all([
    getTranslations({ locale, namespace: 'athleteLoggedActivity.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
  ])

  const access = await requireAthleteOwner(athleteId)
  if ('error' in access) return { error: access.error }

  const validation = validateAthleteLoggedActivityFormData(formData)
  if ('error' in validation) {
    return { error: translateAthleteLoggedActivityValidationError(validation, tValidation) }
  }

  const title = validation.data.title.trim()

  const { supabase } = access
  const { data: created, error } = await supabase
    .from('workouts')
    .insert({ athlete_id: athleteId, ...buildRowPayload(validation.data, title) })
    .select()
    .single()

  if (error) {
    logger.error('createAthleteLoggedActivity', error, { athleteId })
    return { error: tErrors('supabaseGeneric') }
  }

  revalidatePath(pathToRevalidate)
  return { success: true, workout: created as Workout }
}

export async function updateAthleteLoggedActivity(
  workoutId: string,
  athleteId: string,
  pathToRevalidate: string,
  _prevState: AthleteLoggedActivityFormState,
  formData: FormData
): Promise<AthleteLoggedActivityFormState> {
  const locale = (formData.get('_locale') as string) || (await getLocale())
  const [tValidation, tErrors] = await Promise.all([
    getTranslations({ locale, namespace: 'athleteLoggedActivity.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
  ])

  const access = await requireAthleteOwner(athleteId)
  if ('error' in access) return { error: access.error }

  const validation = validateAthleteLoggedActivityFormData(formData)
  if ('error' in validation) {
    return { error: translateAthleteLoggedActivityValidationError(validation, tValidation) }
  }

  const title = validation.data.title.trim()

  const { supabase } = access
  const { data: updated, error } = await supabase
    .from('workouts')
    .update(buildRowPayload(validation.data, title))
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)
    .eq('planned_by', 'athlete')
    .select()
    .single()

  if (error) {
    logger.error('updateAthleteLoggedActivity', error, { workoutId, athleteId })
    return { error: tErrors('supabaseGeneric') }
  }

  revalidatePath(pathToRevalidate)
  return { success: true, workout: updated as Workout }
}

export async function deleteAthleteLoggedActivity(
  workoutId: string,
  athleteId: string,
  pathToRevalidate: string
): Promise<{ error?: string; success?: boolean }> {
  const locale = await getLocale()
  const tErrors = await getTranslations({ locale, namespace: 'errors' })

  const access = await requireAthleteOwner(athleteId)
  if ('error' in access) return { error: access.error }

  const { supabase } = access
  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)
    .eq('planned_by', 'athlete')

  if (error) {
    logger.error('deleteAthleteLoggedActivity', error, { workoutId, athleteId })
    return { error: tErrors('supabaseGeneric') }
  }

  revalidatePath(pathToRevalidate)
  return { success: true }
}

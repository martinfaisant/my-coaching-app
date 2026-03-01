'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Workout, ImportedActivityWeeklyTotal, SportType } from '@/types/database'
import { requireCoachOrAthleteAccess } from '@/lib/authHelpers'
import { getWeekMonday, toDateStr } from '@/lib/dateUtils'
import { validateWorkoutFormData } from '@/lib/workoutValidation'
import { logger } from '@/lib/logger'
import { getTranslations, getLocale } from 'next-intl/server'

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
  const locale = await getLocale()
  const [t, tErrors, tAuth] = await Promise.all([
    getTranslations({ locale, namespace: 'workouts.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
    getTranslations({ locale, namespace: 'auth.errors' }),
  ])
  if ('error' in accessResult) return { error: tAuth(accessResult.errorCode ?? 'notAuthenticated') }

  const { isCoach, isAthlete } = accessResult
  if (isAthlete) return { error: t('onlyCoachCanCreate') }
  if (!isCoach) return { error: t('unauthorized') }

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
      status: 'planned',
      target_duration_minutes: target_duration_minutes ?? null,
      target_distance_km: target_distance_km ?? null,
      target_elevation_m: target_elevation_m ?? null,
      target_pace,
    })
    .select()
    .single()

  if (error) return { error: tErrors('supabaseGeneric') }
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
  const locale = await getLocale()
  const [t, tErrors, tAuth] = await Promise.all([
    getTranslations({ locale, namespace: 'workouts.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
    getTranslations({ locale, namespace: 'auth.errors' }),
  ])
  if ('error' in accessResult) return { error: tAuth(accessResult.errorCode ?? 'notAuthenticated') }

  const { isCoach } = accessResult
  if (!isCoach) return { error: t('onlyCoachCanEdit') }

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

  // Coach ne modifie jamais le statut (lecture seule) : ne pas inclure status dans l'update.
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

  if (error) return { error: tErrors('supabaseGeneric') }
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
  const locale = await getLocale()
  const [t, tErrors, tAuth] = await Promise.all([
    getTranslations({ locale, namespace: 'workouts.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
    getTranslations({ locale, namespace: 'auth.errors' }),
  ])
  if ('error' in accessResult) return { error: tAuth(accessResult.errorCode ?? 'notAuthenticated') }

  const { isCoach } = accessResult
  if (!isCoach) return { error: t('onlyCoachCanDelete') }

  const { error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)

  if (error) return { error: tErrors('supabaseGeneric') }
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
  const locale = await getLocale()
  const [tAuth, tErrors] = await Promise.all([
    getTranslations({ locale, namespace: 'auth.errors' }),
    getTranslations({ locale, namespace: 'errors' }),
  ])
  if ('error' in accessResult) return { error: tAuth(accessResult.errorCode ?? 'notAuthenticated'), workouts: [] }

  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('athlete_id', athleteId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date')
    .order('created_at')

  if (error) return { error: tErrors('supabaseGeneric'), workouts: [] }
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
  const locale = await getLocale()
  const [t, tErrors] = await Promise.all([
    getTranslations({ locale, namespace: 'workouts.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
  ])
  if (!user) return { error: t('notAuthenticated'), importedActivities: [] }

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

  if (error) return { error: tErrors('supabaseGeneric'), importedActivities: [] }
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
  const locale = await getLocale()
  const [tAuth, tErrors] = await Promise.all([
    getTranslations({ locale, namespace: 'auth.errors' }),
    getTranslations({ locale, namespace: 'errors' }),
  ])
  if ('error' in accessResult) return { error: tAuth(accessResult.errorCode ?? 'notAuthenticated'), weeklyTotals: [] }

  const { data: weeklyTotals, error } = await supabase
    .from('imported_activity_weekly_totals')
    .select('*')
    .eq('athlete_id', athleteId)
    .gte('week_start', startDate)
    .lte('week_start', endDate)
    .order('week_start')
    .order('sport_type')

  if (error) return { error: tErrors('supabaseGeneric'), weeklyTotals: [] }
  return { weeklyTotals: weeklyTotals ?? [] }
}

/** US6 : Totaux « fait » combinés = imported_activity_weekly_totals + séances réalisées, moins double comptage (même jour + même type). */
export async function getEffectiveWeeklyTotalsFait(
  athleteId: string,
  startDate: string,
  endDate: string
): Promise<{ error?: string; weeklyTotals: ImportedActivityWeeklyTotal[] }> {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  const locale = await getLocale()
  const [tAuth, tErrors] = await Promise.all([
    getTranslations({ locale, namespace: 'auth.errors' }),
    getTranslations({ locale, namespace: 'errors' }),
  ])
  if ('error' in accessResult) return { error: tAuth(accessResult.errorCode ?? 'notAuthenticated'), weeklyTotals: [] }

  const endDateLastSunday = (() => {
    const d = new Date(endDate + 'T12:00:00')
    d.setDate(d.getDate() + 6)
    return d.toISOString().slice(0, 10)
  })()

  const [{ data: importedTotals }, { data: completedWorkouts }, { data: importedActivities }] = await Promise.all([
    supabase
      .from('imported_activity_weekly_totals')
      .select('*')
      .eq('athlete_id', athleteId)
      .gte('week_start', startDate)
      .lte('week_start', endDate)
      .order('week_start')
      .order('sport_type'),
    supabase
      .from('workouts')
      .select('id, date, sport_type, target_duration_minutes, target_distance_km, target_elevation_m')
      .eq('athlete_id', athleteId)
      .eq('status', 'completed')
      .gte('date', startDate)
      .lte('date', endDateLastSunday),
    supabase
      .from('imported_activities')
      .select('id, date, sport_type')
      .eq('athlete_id', athleteId)
      .gte('date', startDate)
      .lte('date', endDateLastSunday),
  ])

  const nowIso = new Date().toISOString()
  const byKey = new Map<string, { time: number; distance: number; elevation: number }>()
  const key = (weekStart: string, sport: SportType) => `${weekStart}:${sport}`

  for (const row of importedTotals ?? []) {
    byKey.set(key(row.week_start, row.sport_type), {
      time: row.total_moving_time_seconds ?? 0,
      distance: row.total_distance_m ?? 0,
      elevation: row.total_elevation_m ?? 0,
    })
  }

  const importedByDateAndSport = new Set<string>()
  for (const a of importedActivities ?? []) {
    importedByDateAndSport.add(`${a.date}:${a.sport_type}`)
  }

  for (const w of completedWorkouts ?? []) {
    if (importedByDateAndSport.has(`${w.date}:${w.sport_type}`)) continue
    const weekStart = toDateStr(getWeekMonday(w.date))
    if (weekStart < startDate || weekStart > endDate) continue
    const durationSec = Math.round((Number(w.target_duration_minutes) || 0) * 60)
    const distanceM = Math.round((Number(w.target_distance_km) || 0) * 1000)
    const elevationM = Math.round(Number(w.target_elevation_m) || 0)
    const k = key(weekStart, w.sport_type)
    const cur = byKey.get(k) ?? { time: 0, distance: 0, elevation: 0 }
    byKey.set(k, {
      time: cur.time + durationSec,
      distance: cur.distance + distanceM,
      elevation: cur.elevation + elevationM,
    })
  }

  const weeklyTotals: ImportedActivityWeeklyTotal[] = []
  for (const [k, v] of byKey.entries()) {
    const [week_start, sport_type] = k.split(':') as [string, SportType]
    weeklyTotals.push({
      athlete_id: athleteId,
      week_start,
      sport_type,
      total_moving_time_seconds: v.time,
      total_distance_m: v.distance,
      total_elevation_m: v.elevation,
      updated_at: nowIso,
    })
  }
  weeklyTotals.sort((a, b) => a.week_start.localeCompare(b.week_start) || a.sport_type.localeCompare(b.sport_type))
  return { weeklyTotals }
}

/** Totaux hebdomadaires précalculés (entraînements prévus) par sport. Précalculés pour accélérer l'affichage. */
export async function getWorkoutWeeklyTotals(
  athleteId: string,
  startDate: string,
  endDate: string
) {
  const supabase = await createClient()
  const accessResult = await requireCoachOrAthleteAccess(supabase, athleteId)
  const locale = await getLocale()
  const [tAuth, tErrors] = await Promise.all([
    getTranslations({ locale, namespace: 'auth.errors' }),
    getTranslations({ locale, namespace: 'errors' }),
  ])
  if ('error' in accessResult) return { error: tAuth(accessResult.errorCode ?? 'notAuthenticated'), workoutTotals: [] }

  const { data: workoutTotals, error } = await supabase
    .from('workout_weekly_totals')
    .select('*')
    .eq('athlete_id', athleteId)
    .gte('week_start', startDate)
    .lte('week_start', endDate)
    .order('week_start')
    .order('sport_type')

  if (error) return { error: tErrors('supabaseGeneric'), workoutTotals: [] }
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
  const locale = await getLocale()
  const [t, tErrors] = await Promise.all([
    getTranslations({ locale, namespace: 'workouts.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
  ])
  if (!user) return { error: t('notAuthenticated') }
  if (user.id !== athleteId) return { error: t('unauthorized') }

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
    return { error: tErrors('supabaseGeneric') }
  }

  if (!data || data.length === 0) {
    logger.error('[saveWorkoutComment] Aucune ligne mise à jour (RLS?)', undefined, {
      workoutId,
      athleteId,
    })
    return { error: t('commentSaveFailed') }
  }

  revalidatePath(pathToRevalidate)
  return { success: true }
}

const WORKOUT_STATUS_VALUES = ['planned', 'completed', 'not_completed'] as const

export type StatusCommentFormState = CommentFormState & { workout?: Workout }

/** Mise à jour statut + commentaire par l'athlète uniquement (US1). */
export async function saveWorkoutStatusAndComment(
  workoutId: string,
  athleteId: string,
  pathToRevalidate: string,
  _prevState: CommentFormState,
  formData: FormData
): Promise<StatusCommentFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const locale = await getLocale()
  const [t, tErrors] = await Promise.all([
    getTranslations({ locale, namespace: 'workouts.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
  ])
  if (!user) return { error: t('notAuthenticated') }
  if (user.id !== athleteId) return { error: t('unauthorized') }

  const statusRaw = (formData.get('status') as string)?.trim() ?? ''
  const status = WORKOUT_STATUS_VALUES.includes(statusRaw as (typeof WORKOUT_STATUS_VALUES)[number])
    ? (statusRaw as (typeof WORKOUT_STATUS_VALUES)[number])
    : 'planned'
  const comment = (formData.get('comment') as string)?.trim() ?? ''

  const { data, error } = await supabase
    .from('workouts')
    .update({
      status,
      athlete_comment: comment || null,
      athlete_comment_at: comment ? new Date().toISOString() : null,
    })
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)
    .select()
    .single()

  if (error) {
    logger.error('[saveWorkoutStatusAndComment] Erreur', error)
    return { error: tErrors('supabaseGeneric') }
  }

  if (!data) {
    logger.error('[saveWorkoutStatusAndComment] Aucune ligne mise à jour (RLS?)', undefined, {
      workoutId,
      athleteId,
    })
    return { error: t('commentSaveFailed') }
  }

  revalidatePath(pathToRevalidate)
  return { success: true, workout: data as Workout }
}

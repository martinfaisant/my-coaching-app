'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  Workout,
  ImportedActivity,
  ImportedActivityWeeklyTotal,
  SportType,
  WorkoutPrimaryMetricBySport,
  WorkoutWeeklyTotal,
  AthleteAvailabilitySlot,
} from '@/types/database'
import { requireCoachOrAthleteAccess } from '@/lib/authHelpers'
import { getWeekMonday, toDateStr } from '@/lib/dateUtils'
import { translateWorkoutFormValidationError, validateWorkoutFormData } from '@/lib/workoutValidation'
import { parseWorkoutPrimaryMetricBySport, isCoachWorkoutPrimaryMetricsComplete } from '@/lib/workoutPrimaryMetric'
import { logger } from '@/lib/logger'
import { getTranslations, getLocale } from 'next-intl/server'
import { getAvailabilityForDateRange } from '@/app/[locale]/dashboard/availability/actions'

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

  const { isCoach, isAthlete, user } = accessResult
  if (isAthlete) return { error: t('onlyCoachCanCreate') }
  if (!isCoach) return { error: t('unauthorized') }

  const { data: coachProf } = await supabase
    .from('profiles')
    .select('workout_primary_metric_by_sport')
    .eq('user_id', user.id)
    .single()

  const prefsCoach = parseWorkoutPrimaryMetricBySport(coachProf?.workout_primary_metric_by_sport) as WorkoutPrimaryMetricBySport | null
  if (!isCoachWorkoutPrimaryMetricsComplete(prefsCoach)) {
    return { error: t('workoutUnitsNotConfigured') }
  }

  const validation = validateWorkoutFormData(formData, { primaryMetricBySport: prefsCoach })
  if ('error' in validation) {
    return { error: translateWorkoutFormValidationError(validation, t) }
  }

  const {
    date,
    sportType,
    title,
    description,
    time_of_day,
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
      time_of_day: time_of_day ?? null,
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

  const { isCoach, user } = accessResult
  if (!isCoach) return { error: t('onlyCoachCanEdit') }

  const { data: coachProf } = await supabase
    .from('profiles')
    .select('workout_primary_metric_by_sport')
    .eq('user_id', user.id)
    .single()

  const prefsCoach = parseWorkoutPrimaryMetricBySport(coachProf?.workout_primary_metric_by_sport) as WorkoutPrimaryMetricBySport | null
  if (!isCoachWorkoutPrimaryMetricsComplete(prefsCoach)) {
    return { error: t('workoutUnitsNotConfigured') }
  }

  const validation = validateWorkoutFormData(formData, { primaryMetricBySport: prefsCoach })
  if ('error' in validation) {
    return { error: translateWorkoutFormValidationError(validation, t) }
  }

  const {
    date,
    sportType,
    title,
    description,
    time_of_day,
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
      time_of_day: time_of_day ?? null,
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
      .select(
        'id, date, sport_type, target_duration_minutes, target_distance_km, target_elevation_m, actual_duration_minutes, actual_distance_km, actual_elevation_m'
      )
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
    // "Fait" : préférer les valeurs réellement réalisées, fallback historique sur `target_*`.
    const durationMin =
      w.actual_duration_minutes != null ? Number(w.actual_duration_minutes) : Number(w.target_duration_minutes)
    const distanceKm =
      w.actual_distance_km != null ? Number(w.actual_distance_km) : Number(w.target_distance_km)
    const elevationMRaw =
      w.actual_elevation_m != null ? Number(w.actual_elevation_m) : Number(w.target_elevation_m)

    const durationSec = Math.round((Number.isFinite(durationMin) ? durationMin : 0) * 60)
    const distanceM = Math.round((Number.isFinite(distanceKm) ? distanceKm : 0) * 1000)
    const elevationM = Math.round(Number.isFinite(elevationMRaw) ? elevationMRaw : 0)
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

/** Bundle calendrier (workouts, Strava, totaux, dispos) pour une plage [startDate, endDate] inclusive. */
export async function fetchCalendarDataBundle(
  athleteId: string,
  rangeStart: string,
  rangeEnd: string
): Promise<{
  error?: string
  workouts: Workout[]
  importedActivities: ImportedActivity[]
  weeklyTotals: ImportedActivityWeeklyTotal[]
  workoutTotals: WorkoutWeeklyTotal[]
  availabilities: AthleteAvailabilitySlot[]
}> {
  const empty = (): {
    workouts: Workout[]
    importedActivities: ImportedActivity[]
    weeklyTotals: ImportedActivityWeeklyTotal[]
    workoutTotals: WorkoutWeeklyTotal[]
    availabilities: AthleteAvailabilitySlot[]
  } => ({
    workouts: [],
    importedActivities: [],
    weeklyTotals: [],
    workoutTotals: [],
    availabilities: [],
  })

  const startMonday = toDateStr(getWeekMonday(rangeStart))
  const endMonday = toDateStr(getWeekMonday(rangeEnd))

  const [workoutsResult, importedResult, workoutTotalsResult, totalsResult, availabilitiesResult] = await Promise.all([
    getWorkoutsForDateRange(athleteId, rangeStart, rangeEnd),
    getImportedActivitiesForDateRange(athleteId, rangeStart, rangeEnd),
    getWorkoutWeeklyTotals(athleteId, startMonday, endMonday),
    getEffectiveWeeklyTotalsFait(athleteId, startMonday, endMonday),
    getAvailabilityForDateRange(athleteId, rangeStart, rangeEnd),
  ])

  const err =
    workoutsResult.error ??
    importedResult.error ??
    workoutTotalsResult.error ??
    totalsResult.error
  if (err) {
    return { error: err, ...empty() }
  }

  return {
    workouts: (workoutsResult.workouts ?? []) as Workout[],
    importedActivities: (importedResult.importedActivities ?? []) as ImportedActivity[],
    weeklyTotals: totalsResult.weeklyTotals ?? [],
    workoutTotals: (workoutTotalsResult.workoutTotals ?? []) as WorkoutWeeklyTotal[],
    availabilities: Array.isArray(availabilitiesResult) ? availabilitiesResult : [],
  }
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

function parseOptionalInt(
  value: FormDataEntryValue | null,
  min: number,
  max: number
): number | null {
  if (value == null || value === '') return null
  const s = String(value).trim()
  if (s === '') return null
  const n = Number(s)
  if (!Number.isInteger(n) || n < min || n > max) return null
  return n
}

function parseOptionalNonNegativeInt(value: FormDataEntryValue | null): number | null {
  if (value == null || value === '') return null
  const s = String(value).trim()
  if (s === '') return null
  const n = Number(s)
  if (!Number.isInteger(n) || n < 0) return null
  return n
}

function parseOptionalNonNegativeNumber(value: FormDataEntryValue | null): number | null {
  if (value == null || value === '') return null
  const s = String(value).trim()
  if (s === '') return null
  const n = Number(s)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

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

  const rawFeeling = formData.get('perceived_feeling')
  const rawIntensity = formData.get('perceived_intensity')
  const rawPleasure = formData.get('perceived_pleasure')
  const perceivedFeeling = parseOptionalInt(rawFeeling, 1, 5)
  const perceivedIntensity = parseOptionalInt(rawIntensity, 1, 10)
  const perceivedPleasure = parseOptionalInt(rawPleasure, 1, 5)

  // Métriques "réalisé" : visibles/obligatoires selon objectifs coach (target_* non NULL).
  // On lit les target_* via un SELECT RLS (athlète sur sa séance).
  const { data: existingWorkout, error: existingError } = await supabase
    .from('workouts')
    .select(
      'id, athlete_id, target_duration_minutes, target_distance_km, target_elevation_m, actual_duration_minutes, actual_distance_km, actual_elevation_m'
    )
    .eq('id', workoutId)
    .eq('athlete_id', athleteId)
    .single()

  if (existingError || !existingWorkout) {
    logger.error('[saveWorkoutStatusAndComment] Impossible de lire workout (RLS?)', existingError ?? undefined, {
      workoutId,
      athleteId,
    })
    return { error: tErrors('supabaseGeneric') }
  }

  const targetDuration = existingWorkout.target_duration_minutes as number | null | undefined
  const targetDistanceKm = existingWorkout.target_distance_km as number | null | undefined
  const targetElevationM = existingWorkout.target_elevation_m as number | null | undefined

  // Appliquer la règle produit :
  // - si target_* est NULL => actual_* forcé à NULL (athlète ne peut pas renseigner).
  // - si target_* non NULL et status=completed => actual_* requis (non NULL + valide).
  // - si status=not_completed => effacer (NULL).
  // - si status=planned => conserver tel quel (ne pas modifier).
  const durationAllowed = targetDuration !== null && targetDuration !== undefined
  const distanceAllowed = targetDistanceKm !== null && targetDistanceKm !== undefined
  const elevationAllowed = targetElevationM !== null && targetElevationM !== undefined

  const shouldClearActuals = status === 'not_completed'
  const shouldRequireActuals = status === 'completed'

  const existingActualDuration = existingWorkout.actual_duration_minutes as number | null | undefined
  const existingActualDistanceKm = existingWorkout.actual_distance_km as number | null | undefined
  const existingActualElevationM = existingWorkout.actual_elevation_m as number | null | undefined

  const durationRaw = formData.get('actual_duration_minutes')
  const distanceKmRaw = formData.get('actual_distance_km')
  const elevationRaw = formData.get('actual_elevation_m')

  // Valeurs brutes (null si vide ou invalide).
  const parsedActualDuration = parseOptionalNonNegativeInt(durationRaw)
  const parsedActualDistanceKm = parseOptionalNonNegativeNumber(distanceKmRaw)
  const parsedActualElevation = parseOptionalNonNegativeInt(elevationRaw)

  const actual_duration_minutes = status === 'planned'
    ? (existingActualDuration ?? null)
    : shouldClearActuals || !durationAllowed
      ? null
      : parsedActualDuration
  const actual_distance_km = status === 'planned'
    ? (existingActualDistanceKm ?? null)
    : shouldClearActuals || !distanceAllowed
      ? null
      : parsedActualDistanceKm
  const actual_elevation_m = status === 'planned'
    ? (existingActualElevationM ?? null)
    : shouldClearActuals || !elevationAllowed
      ? null
      : parsedActualElevation

  if (shouldRequireActuals) {
    if (durationAllowed && actual_duration_minutes == null) return { error: t('actualDurationRequired') }
    if (distanceAllowed && actual_distance_km == null) return { error: t('actualDistanceRequired') }
    if (elevationAllowed && actual_elevation_m == null) return { error: t('actualElevationRequired') }
  }

  const { data, error } = await supabase
    .from('workouts')
    .update({
      status,
      athlete_comment: comment || null,
      athlete_comment_at: comment ? new Date().toISOString() : null,
      perceived_feeling: perceivedFeeling ?? null,
      perceived_intensity: perceivedIntensity ?? null,
      perceived_pleasure: perceivedPleasure ?? null,
      actual_duration_minutes,
      actual_distance_km,
      actual_elevation_m,
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

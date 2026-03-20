'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireRole, requireUser } from '@/lib/authHelpers'
import { getTranslations } from 'next-intl/server'
import {
  parseTargetTime,
  validateGoalFields,
  parseResultFields,
} from '@/lib/goalValidation'
import type { GoalFormState } from '@/lib/goalValidation'

export type { GoalFormState } from '@/lib/goalValidation'

export async function addGoal(
  _prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const locale = (formData.get('locale') as string) || 'fr'
  const t = await getTranslations({ locale, namespace: 'goals.validation' })

  const supabase = await createClient()
  const result = await requireRole(supabase, 'athlete')
  if ('error' in result) return { error: result.error }

  const { user } = result

  const fieldsResult = validateGoalFields(formData, t)
  if ('error' in fieldsResult) return { error: fieldsResult.error }
  const { date, raceName, distance, isPrimary } = fieldsResult.data

  const targetTime = parseTargetTime(formData, t)
  if (targetTime && 'error' in targetTime) return { error: targetTime.error }

  const insertPayload: {
    athlete_id: string
    date: string
    race_name: string
    distance: string
    is_primary: boolean
    target_time_hours?: number
    target_time_minutes?: number
    target_time_seconds?: number
    result_time_hours?: number
    result_time_minutes?: number
    result_time_seconds?: number
    result_place?: number | null
    result_note?: string | null
  } = {
    athlete_id: user.id,
    date,
    race_name: raceName,
    distance,
    is_primary: isPrimary,
  }

  if (targetTime) {
    insertPayload.target_time_hours = targetTime.hours
    insertPayload.target_time_minutes = targetTime.minutes
    insertPayload.target_time_seconds = targetTime.seconds
  }

  const today = new Date().toISOString().slice(0, 10)
  if (date < today) {
    const resultFields = parseResultFields(formData, t)
    if (resultFields.kind === 'error') return { error: resultFields.error }
    if (resultFields.kind === 'parsed') {
      const { data: d } = resultFields
      insertPayload.result_time_hours = d.resultTimeHours
      insertPayload.result_time_minutes = d.resultTimeMinutes
      insertPayload.result_time_seconds = d.resultTimeSeconds
      insertPayload.result_place = d.resultPlace
      insertPayload.result_note = d.resultNote
    }
  }

  const { error } = await supabase.from('goals').insert(insertPayload)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/objectifs')
  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/find-coach')
  return { success: t('goalAdded') }
}

export async function updateGoal(
  _prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const locale = (formData.get('locale') as string) || 'fr'
  const t = await getTranslations({ locale, namespace: 'goals.validation' })

  const supabase = await createClient()
  const result = await requireRole(supabase, 'athlete')
  if ('error' in result) return { error: result.error }

  const { user } = result

  const goalId = (formData.get('goal_id') as string)?.trim()
  if (!goalId) return { error: t('goalNotFound') }

  const { data: goal } = await supabase
    .from('goals')
    .select('id, athlete_id')
    .eq('id', goalId)
    .eq('athlete_id', user.id)
    .single()

  if (!goal) return { error: t('goalNotFound') }

  const fieldsResult = validateGoalFields(formData, t)
  if ('error' in fieldsResult) return { error: fieldsResult.error }
  const { date, raceName, distance, isPrimary } = fieldsResult.data

  const targetTime = parseTargetTime(formData, t)
  if (targetTime && 'error' in targetTime) return { error: targetTime.error }

  const { error } = await supabase
    .from('goals')
    .update({
      date,
      race_name: raceName,
      distance,
      is_primary: isPrimary,
      target_time_hours: targetTime ? targetTime.hours : null,
      target_time_minutes: targetTime ? targetTime.minutes : null,
      target_time_seconds: targetTime ? targetTime.seconds : null,
    })
    .eq('id', goalId)
    .eq('athlete_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/objectifs')
  revalidatePath('/dashboard/calendar')
  return { success: t('goalUpdated') }
}

export async function deleteGoal(goalId: string, locale?: string): Promise<GoalFormState> {
  const currentLocale = locale || 'fr'
  const t = await getTranslations({ locale: currentLocale, namespace: 'goals.validation' })

  const supabase = await createClient()
  const result = await requireUser(supabase)
  if ('error' in result) return { error: result.error }

  const { user } = result

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', goalId)
    .eq('athlete_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/objectifs')
  return { success: t('goalDeleted') }
}

export async function saveGoalResult(
  _prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const locale = (formData.get('_locale') as string) || 'fr'
  const t = await getTranslations({ locale, namespace: 'goals.validation' })

  const goalId = (formData.get('goal_id') as string)?.trim()
  if (!goalId) {
    return { error: t('missingGoalId') }
  }

  const supabase = await createClient()
  const result = await requireRole(supabase, 'athlete')
  if ('error' in result) return { error: result.error }

  const { user } = result

  const { data: goal } = await supabase
    .from('goals')
    .select('id, date, athlete_id')
    .eq('id', goalId)
    .eq('athlete_id', user.id)
    .single()

  if (!goal) {
    return { error: t('goalNotFound') }
  }

  const today = new Date().toISOString().slice(0, 10)
  if (goal.date > today) {
    return { error: t('resultOnlyForPastGoal') }
  }

  const resultFields = parseResultFields(formData, t)
  if (resultFields.kind === 'error') return { error: resultFields.error }

  if (resultFields.kind === 'none') {
    const { error: updateError } = await supabase
      .from('goals')
      .update({
        result_time_hours: null,
        result_time_minutes: null,
        result_time_seconds: null,
        result_place: null,
        result_note: null,
      })
      .eq('id', goalId)
      .eq('athlete_id', user.id)

    if (updateError) return { error: updateError.message }
    revalidatePath('/dashboard/objectifs')
    revalidatePath('/dashboard/calendar')
    revalidatePath('/dashboard/find-coach')
    return { success: t('resultSaved') }
  }

  const { data: d } = resultFields
  const { error: updateError } = await supabase
    .from('goals')
    .update({
      result_time_hours: d.resultTimeHours,
      result_time_minutes: d.resultTimeMinutes,
      result_time_seconds: d.resultTimeSeconds,
      result_place: d.resultPlace,
      result_note: d.resultNote,
    })
    .eq('id', goalId)
    .eq('athlete_id', user.id)

  if (updateError) return { error: updateError.message }
  revalidatePath('/dashboard/objectifs')
  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/find-coach')
  return { success: t('resultSaved') }
}

export async function saveGoalFull(
  _prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const locale =
    ((formData.get('locale') as string) || (formData.get('_locale') as string) || 'fr') as string
  const t = await getTranslations({ locale, namespace: 'goals.validation' })

  const supabase = await createClient()
  const result = await requireRole(supabase, 'athlete')
  if ('error' in result) return { error: result.error }

  const { user } = result

  const goalId = (formData.get('goal_id') as string)?.trim()
  if (!goalId) return { error: t('goalNotFound') }

  const { data: goal } = await supabase
    .from('goals')
    .select(
      'id, athlete_id, date, result_time_hours, result_time_minutes, result_time_seconds, result_place, result_note'
    )
    .eq('id', goalId)
    .eq('athlete_id', user.id)
    .single()

  if (!goal) return { error: t('goalNotFound') }

  const fieldsResult = validateGoalFields(formData, t)
  if ('error' in fieldsResult) return { error: fieldsResult.error }
  const { date, raceName, distance, isPrimary } = fieldsResult.data

  const targetTime = parseTargetTime(formData, t)
  if (targetTime && 'error' in targetTime) return { error: targetTime.error }

  type GoalFullUpdatePayload = {
    date: string
    race_name: string
    distance: string
    is_primary: boolean
    target_time_hours: number | null
    target_time_minutes: number | null
    target_time_seconds: number | null
    result_time_hours?: number | null
    result_time_minutes?: number | null
    result_time_seconds?: number | null
    result_place?: number | null
    result_note?: string | null
  }

  const updatePayload: GoalFullUpdatePayload = {
    date,
    race_name: raceName,
    distance,
    is_primary: isPrimary,
    target_time_hours: targetTime ? targetTime.hours : null,
    target_time_minutes: targetTime ? targetTime.minutes : null,
    target_time_seconds: targetTime ? targetTime.seconds : null,
  }

  const today = new Date().toISOString().slice(0, 10)
  const canHaveResult = date <= today

  if (canHaveResult) {
    const resultFields = parseResultFields(formData, t)
    if (resultFields.kind === 'error') return { error: resultFields.error }
    if (resultFields.kind === 'parsed') {
      const { data: d } = resultFields
      updatePayload.result_time_hours = d.resultTimeHours
      updatePayload.result_time_minutes = d.resultTimeMinutes
      updatePayload.result_time_seconds = d.resultTimeSeconds
      updatePayload.result_place = d.resultPlace
      updatePayload.result_note = d.resultNote
    } else {
      updatePayload.result_time_hours = null
      updatePayload.result_time_minutes = null
      updatePayload.result_time_seconds = null
      updatePayload.result_place = null
      updatePayload.result_note = null
    }
  } else {
    updatePayload.result_time_hours = null
    updatePayload.result_time_minutes = null
    updatePayload.result_time_seconds = null
    updatePayload.result_place = null
    updatePayload.result_note = null
  }

  const { error } = await supabase
    .from('goals')
    .update(updatePayload)
    .eq('id', goalId)
    .eq('athlete_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/objectifs')
  revalidatePath('/dashboard/calendar')
  revalidatePath('/dashboard/find-coach')

  return { success: t('goalUpdated') }
}

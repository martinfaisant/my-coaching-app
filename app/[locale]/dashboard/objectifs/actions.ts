'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireRole, requireUser } from '@/lib/authHelpers'
import { getTranslations } from 'next-intl/server'

export type GoalFormState = {
  error?: string
  success?: string
}

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

  const date = formData.get('date') as string
  const raceName = (formData.get('race_name') as string)?.trim()
  const distance = (formData.get('distance') as string)?.trim()
  const isPrimary = formData.get('is_primary') === 'primary'

  if (!date || !raceName || !distance) {
    return { error: t('allFieldsRequired') }
  }

  const { error } = await supabase.from('goals').insert({
    athlete_id: user.id,
    date,
    race_name: raceName,
    distance,
    is_primary: isPrimary,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/objectifs')
  return { success: t('goalAdded') }
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

const RESULT_NOTE_MAX_LENGTH = 500

export async function saveGoalResult(
  _prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const goalId = (formData.get('goal_id') as string)?.trim()
  if (!goalId) {
    return { error: 'Missing goal.' }
  }

  const locale = (formData.get('_locale') as string) || 'fr'
  const t = await getTranslations({ locale, namespace: 'goals.validation' })

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
  if (goal.date >= today) {
    return { error: t('resultOnlyForPastGoal') }
  }

  const hoursStr = formData.get('result_time_hours') as string
  const minutesStr = formData.get('result_time_minutes') as string
  const secondsStr = formData.get('result_time_seconds') as string
  const placeStr = (formData.get('result_place') as string)?.trim()
  const note = (formData.get('result_note') as string)?.trim() ?? ''

  if (hoursStr === '' || minutesStr === '' || secondsStr === '') {
    return { error: t('timeRequired') }
  }

  const hours = parseInt(hoursStr, 10)
  const minutes = parseInt(minutesStr, 10)
  const seconds = parseInt(secondsStr, 10)

  if (Number.isNaN(hours) || hours < 0 || hours > 99) {
    return { error: t('invalidTimeRange') }
  }
  if (Number.isNaN(minutes) || minutes < 0 || minutes > 59) {
    return { error: t('invalidTimeRange') }
  }
  if (Number.isNaN(seconds) || seconds < 0 || seconds > 59) {
    return { error: t('invalidTimeRange') }
  }

  if (note.length > RESULT_NOTE_MAX_LENGTH) {
    return { error: t('noteMaxLength', { max: RESULT_NOTE_MAX_LENGTH }) }
  }

  const resultPlace = placeStr === '' ? null : Math.max(1, parseInt(placeStr, 10))

  const { error: updateError } = await supabase
    .from('goals')
    .update({
      result_time_hours: hours,
      result_time_minutes: minutes,
      result_time_seconds: seconds,
      result_place: resultPlace,
      result_note: note || null,
    })
    .eq('id', goalId)
    .eq('athlete_id', user.id)

  if (updateError) return { error: updateError.message }
  revalidatePath('/dashboard/objectifs')
  revalidatePath('/dashboard/calendar')
  return { success: t('resultSaved') }
}

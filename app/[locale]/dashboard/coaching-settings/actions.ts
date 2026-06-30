'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { requireUserWithProfile } from '@/lib/authHelpers'
import { parseWorkoutPrimaryMetricsFromFormData } from '@/lib/workoutPrimaryMetric'
import { COACH_COACHING_SETTINGS_PATH } from '@/lib/dashboardNavConfig'

export type CoachSessionUnitsFormState = {
  error?: string
  success?: string
}

/** Enregistrement des unités obligatoires (page paramètres coaching + modale première séance). Coach uniquement. */
export async function saveCoachWorkoutPrimaryMetrics(
  _prevState: CoachSessionUnitsFormState,
  formData: FormData
): Promise<CoachSessionUnitsFormState> {
  const locale = (formData.get('locale') as string) || 'fr'
  const tValidation = await getTranslations({ locale, namespace: 'coachCoachingSettings.validation' })
  const t = await getTranslations({ locale, namespace: 'coachCoachingSettings' })

  const supabase = await createClient()
  const result = await requireUserWithProfile(supabase, 'role, user_id')
  if ('error' in result) return { error: result.error }
  if (result.profile.role !== 'coach') {
    return { error: tValidation('invalidSelection') }
  }

  const parsed = parseWorkoutPrimaryMetricsFromFormData(formData)
  if (!parsed.ok) {
    return { error: tValidation('invalidSelection') }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ workout_primary_metric_by_sport: parsed.data })
    .eq('user_id', result.user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  revalidatePath(COACH_COACHING_SETTINGS_PATH)
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/coach')
  revalidatePath('/dashboard/athletes')
  revalidatePath('/dashboard/calendar')

  return { success: t('saved') }
}

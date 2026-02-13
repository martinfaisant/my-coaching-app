'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireRole, requireUser } from '@/lib/authHelpers'

export type GoalFormState = {
  error?: string
  success?: string
}

export async function addGoal(
  _prevState: GoalFormState,
  formData: FormData
): Promise<GoalFormState> {
  const supabase = await createClient()
  const result = await requireRole(supabase, 'athlete')
  if ('error' in result) return { error: result.error }

  const { user } = result

  const date = formData.get('date') as string
  const raceName = (formData.get('race_name') as string)?.trim()
  const distance = (formData.get('distance') as string)?.trim()
  const isPrimary = formData.get('is_primary') === 'primary'

  if (!date || !raceName || !distance) {
    return { error: 'Date, nom de la course et distance sont obligatoires.' }
  }

  const today = new Date().toISOString().slice(0, 10)
  if (date < today) {
    return { error: 'Un objectif ne peut pas être défini dans le passé.' }
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
  return { success: 'Objectif ajouté.' }
}

export async function deleteGoal(goalId: string): Promise<GoalFormState> {
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
  return { success: 'Objectif supprimé.' }
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const COACHED_SPORTS_VALUES = ['course_route', 'trail', 'triathlon', 'velo'] as const

export type ProfileFormState = {
  error?: string
  success?: string
}

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const firstName = (formData.get('first_name') as string)?.trim() ?? ''
  const lastName = (formData.get('last_name') as string)?.trim() ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const payload: { full_name: string | null; coached_sports?: string[]; languages?: string[]; presentation?: string | null } = {
    full_name: fullName,
  }

  if (profile?.role === 'coach') {
    const coachedSportsRaw = formData.getAll('coached_sports') as string[]
    const coachedSports = coachedSportsRaw.filter((s) => COACHED_SPORTS_VALUES.includes(s as (typeof COACHED_SPORTS_VALUES)[number]))
    const languagesRaw = formData.getAll('languages') as string[]
    const languages = languagesRaw.filter(Boolean).map((l) => l.trim()).filter(Boolean)
    const presentation = (formData.get('presentation') as string)?.trim() || null
    payload.coached_sports = coachedSports
    payload.languages = languages
    payload.presentation = presentation
  }

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  return { success: 'Informations enregistrées.' }
}

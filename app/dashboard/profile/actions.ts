'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
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

  const payload: { full_name: string | null; coached_sports?: string[]; languages?: string[]; presentation?: string | null; avatar_url?: string | null } = {
    full_name: fullName,
  }

  if (profile?.role === 'coach') {
    const coachedSportsRaw = formData.getAll('coached_sports') as string[]
    const coachedSports = coachedSportsRaw.filter((s) => COACHED_SPORTS_VALUES.includes(s as (typeof COACHED_SPORTS_VALUES)[number]))
    const languagesRaw = formData.getAll('languages') as string[]
    const languages = languagesRaw.filter(Boolean).map((l) => l.trim()).filter(Boolean)
    const presentation = (formData.get('presentation') as string)?.trim() || null
    const avatarUrl = (formData.get('avatar_url') as string)?.trim() || null
    payload.coached_sports = coachedSports
    payload.languages = languages
    payload.presentation = presentation
    payload.avatar_url = avatarUrl
  }

  const { error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/coach')
  return { success: 'Informations enregistrées.' }
}

export type CheckDeleteAccountResult = { canDelete: boolean; error?: string }

/** Vérifie si l'utilisateur peut supprimer son compte. Le coach ne peut pas s'il a des athlètes associés. */
export async function checkCanDeleteAccount(): Promise<CheckDeleteAccountResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { canDelete: false, error: 'Non connecté.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role === 'coach') {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', user.id)
    if (count != null && count > 0) {
      return {
        canDelete: false,
        error:
          'La suppression n\'est pas possible. Vous devez d\'abord mettre un terme à votre contrat avec vos athlètes.',
      }
    }
  }

  return { canDelete: true }
}

export type DeleteAccountResult = { error?: string }

/** Supprime le compte de l'utilisateur connecté et toutes ses données. À appeler après checkCanDeleteAccount. */
export async function deleteMyAccount(): Promise<DeleteAccountResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const check = await checkCanDeleteAccount()
  if (!check.canDelete) return { error: check.error ?? 'Suppression impossible.' }

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) return { error: error.message }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur lors de la suppression.'
    return { error: message }
  }

  revalidatePath('/', 'layout')
  return {}
}

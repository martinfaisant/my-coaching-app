'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

const COACHED_SPORTS_VALUES = ['course_route', 'trail', 'triathlon', 'velo'] as const
const PRACTICED_SPORTS_VALUES = ['course', 'velo', 'natation', 'musculation', 'trail', 'triathlon'] as const

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

  const payload: { full_name: string | null; coached_sports?: string[]; practiced_sports?: string[]; languages?: string[]; presentation?: string | null; avatar_url?: string | null; postal_code?: string | null } = {
    full_name: fullName,
  }

  const avatarUrlRaw = (formData.get('avatar_url') as string)?.trim()
  const postalCode = (formData.get('postal_code') as string)?.trim() || null
  if (avatarUrlRaw !== undefined && avatarUrlRaw !== '') {
    payload.avatar_url = avatarUrlRaw
  }
  payload.postal_code = postalCode

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

  if (profile?.role === 'athlete') {
    const practicedSportsRaw = formData.getAll('practiced_sports') as string[]
    const practicedSports = practicedSportsRaw
      .map((s) => (s ?? '').trim())
      .filter((s): s is (typeof PRACTICED_SPORTS_VALUES)[number] =>
        PRACTICED_SPORTS_VALUES.includes(s as (typeof PRACTICED_SPORTS_VALUES)[number])
      )
    payload.practiced_sports = practicedSports
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

export type UpdateAvatarResult = { error?: string }

/** Enregistre immédiatement l'URL de l'avatar en base (appelé après upload du fichier). */
export async function updateAvatarUrl(avatarUrl: string | null): Promise<UpdateAvatarResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const url = (avatarUrl ?? '').trim() || null

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: url })
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  revalidatePath('/dashboard/coach')
  return {}
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

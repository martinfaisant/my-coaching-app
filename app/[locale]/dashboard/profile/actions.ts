'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { COACHED_SPORTS_VALUES, PRACTICED_SPORTS_VALUES } from '@/lib/sportsOptions'
import { requireUserWithProfile, requireUser } from '@/lib/authHelpers'

export type ProfileFormState = {
  error?: string
  success?: string
}

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const locale = (formData.get('locale') as string) || 'fr'
  const t = await getTranslations({ locale, namespace: 'profile.validation' })
  
  const supabase = await createClient()
  const result = await requireUserWithProfile(supabase, 'role, user_id')
  if ('error' in result) return { error: result.error }

  const { user, profile } = result

  const firstName = (formData.get('first_name') as string)?.trim() ?? ''
  const lastName = (formData.get('last_name') as string)?.trim() ?? ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || null

  const payload: { full_name: string | null; coached_sports?: string[]; practiced_sports?: string[]; languages?: string[]; presentation_fr?: string | null; presentation_en?: string | null; avatar_url?: string | null; postal_code?: string | null } = {
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
    const presentationFr = (formData.get('presentation_fr') as string)?.trim() || null
    const presentationEn = (formData.get('presentation_en') as string)?.trim() || null
    payload.coached_sports = coachedSports
    payload.languages = languages
    payload.presentation_fr = presentationFr
    payload.presentation_en = presentationEn
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
  return { success: t('saved') }
}

export type CheckDeleteAccountResult = { canDelete: boolean; error?: string }

/** Vérifie si l'utilisateur peut supprimer son compte. Le coach ne peut pas s'il a des athlètes associés. */
export async function checkCanDeleteAccount(locale?: string): Promise<CheckDeleteAccountResult> {
  const currentLocale = locale || 'fr'
  const t = await getTranslations({ locale: currentLocale, namespace: 'profile.validation' })
  
  const supabase = await createClient()
  const result = await requireUserWithProfile(supabase, 'role')
  if ('error' in result) return { canDelete: false, error: result.error }

  const { user, profile } = result

  if (profile.role === 'coach') {
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('coach_id', user.id)
    if (count != null && count > 0) {
      return {
        canDelete: false,
        error: t('cannotDelete'),
      }
    }
  }

  return { canDelete: true }
}

export type DeleteAccountResult = { error?: string }

/** Supprime le compte de l'utilisateur connecté et toutes ses données. À appeler après checkCanDeleteAccount. */
export async function deleteMyAccount(locale?: string): Promise<DeleteAccountResult> {
  const currentLocale = locale || 'fr'
  const t = await getTranslations({ locale: currentLocale, namespace: 'profile.validation' })
  
  const supabase = await createClient()
  const result = await requireUser(supabase)
  if ('error' in result) return { error: result.error }

  const { user } = result

  const check = await checkCanDeleteAccount(currentLocale)
  if (!check.canDelete) return { error: check.error ?? t('deletionFailed') }

  try {
    const admin = createAdminClient()
    const { error } = await admin.auth.admin.deleteUser(user.id)
    if (error) return { error: error.message }
  } catch (e) {
    const message = e instanceof Error ? e.message : t('deletionError')
    return { error: message }
  }

  revalidatePath('/', 'layout')
  return {}
}

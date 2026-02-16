'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { getTranslations, getLocale } from 'next-intl/server'

export type UpdatePasswordState = {
  error?: string
  success?: string
}

/** Mettre à jour le mot de passe après réinitialisation. */
export async function updatePassword(
  _prevState: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  const locale = await getLocale()
  const [t, tErrors] = await Promise.all([
    getTranslations({ locale, namespace: 'auth.errors' }),
    getTranslations({ locale, namespace: 'errors' }),
  ])

  if (!password || !confirmPassword) {
    return { error: t('bothFieldsRequired') }
  }

  if (password !== confirmPassword) {
    return { error: t('passwordMismatch') }
  }

  if (password.length < 6) {
    return { error: t('passwordMinLength') }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: t('sessionExpiredReset') }
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: tErrors('supabaseGeneric') }
  }

  return { success: t('passwordUpdatedSuccess') }
}

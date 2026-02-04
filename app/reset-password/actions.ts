'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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

  if (!password || !confirmPassword) {
    return { error: 'Les deux champs sont obligatoires.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Les deux mots de passe doivent être identiques.' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Session expirée. Veuillez recommencer la procédure de réinitialisation.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Mot de passe mis à jour avec succès.' }
}

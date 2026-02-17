'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { handleSignupError, handleResetPasswordError } from '@/lib/authErrors'
import { getTranslations, getLocale } from 'next-intl/server'

export type LoginState = {
  error?: string
}

export async function login(_prevState: LoginState, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'auth.errors' })

  if (!email?.trim() || !password) {
    return { error: t('emailRequired') }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Récupérer l'URL de redirection depuis les headers si présente
  const headersList = await headers()
  const referer = headersList.get('referer')
  let redirectPath = '/dashboard'
  
  if (referer) {
    try {
      const url = new URL(referer)
      const redirectParam = url.searchParams.get('redirect')
      if (redirectParam && redirectParam.startsWith('/dashboard')) {
        redirectPath = redirectParam
      }
    } catch {
      // Ignorer les erreurs de parsing d'URL
    }
  }

  redirect(redirectPath)
}

export type SignupState = {
  error?: string
  success?: string
  userExists?: boolean
  existingEmail?: string
}

export async function signup(_prevState: SignupState, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const roleRaw = formData.get('role') as string

  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'auth.errors' })

  if (!email?.trim() || !password) {
    return { error: t('emailRequired') }
  }

  if (password.length < 6) {
    return { error: t('passwordMinLength') }
  }

  const role = roleRaw === 'coach' ? 'coach' : 'athlete'

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    const handled = handleSignupError(error, email)
    if (handled.errorCode) return { error: t(handled.errorCode), userExists: handled.userExists, existingEmail: handled.existingEmail }
    return { error: t('signupGenericError') }
  }

  if (data?.user) {
    // Créer le profil avec le client admin : en prod, la confirmation d'email peut être
    // activée donc il n'y a pas encore de session (auth.uid() = null), et la RLS
    // "profiles_insert_own" (authenticated only) bloquerait l'insert.
    const admin = createAdminClient()
    const { error: profileError } = await admin.from('profiles').insert({
      user_id: data.user.id,
      email: data.user.email ?? email,
      role,
    })

    if (profileError) {
      return { error: t('profileCreationError') }
    }

    // Vérifier si une session a été créée (si l'email ne nécessite pas de confirmation)
    // Attendre un peu pour que la session soit disponible
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Session créée, revalider les chemins et rediriger vers le dashboard
      revalidatePath('/dashboard')
      redirect('/dashboard')
    } else {
      // Pas de session (email doit être confirmé), afficher un message
      return {
        success: t('accountCreatedSuccess'),
      }
    }
  }

  return {
    error: t('signupGenericError'),
  }
}

export type ResetPasswordState = {
  error?: string
  success?: string
}

/** Envoyer un email de réinitialisation de mot de passe. */
export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const email = formData.get('email') as string

  const locale = await getLocale()
  const t = await getTranslations({ locale, namespace: 'auth.errors' })

  if (!email?.trim()) {
    return { error: t('emailRequiredOnly') }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  })

  if (error) {
    const handled = handleResetPasswordError(error)
    if (handled.errorCode) return { error: t(handled.errorCode) }
    const tErrors = await getTranslations({ locale, namespace: 'errors' })
    return { error: tErrors('supabaseGeneric') }
  }

  return {
    success: t('resetLinkSentLong'),
  }
}

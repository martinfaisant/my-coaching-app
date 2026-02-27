'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { handleSignupError, handleResetPasswordError, handleLoginError } from '@/lib/authErrors'
import { getExistingAuthUserConfirmationStatus } from '@/lib/authHelpers'
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
    const handled = handleLoginError(error)
    if (handled.errorCode) return { error: t(handled.errorCode) }
    return { error: error.message }
  }

  const localePrefix = locale === 'en' ? '/en' : ''
  const defaultDashboardPath =
    locale === 'en' ? '/en/dashboard' : '/dashboard'

  const headersList = await headers()
  const referer = headersList.get('referer')
  let redirectPath = defaultDashboardPath

  if (referer) {
    try {
      const url = new URL(referer)
      const redirectParam = url.searchParams.get('redirect')
      if (redirectParam && redirectParam.startsWith('/dashboard')) {
        redirectPath = redirectParam.startsWith('/en')
          ? redirectParam
          : `${localePrefix}/dashboard`
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
  successType?: 'accountCreated' | 'emailResent'
  email?: string
  userExists?: boolean
  existingEmail?: string
}

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
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

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3000'
  const redirectTo = `${siteUrl}/auth/callback`

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: { locale: locale === 'en' ? 'en' : 'fr' },
    },
  })

  if (error) {
    const handled = handleSignupError(error, email)
    if (handled.errorCode) return { error: t(handled.errorCode), userExists: handled.userExists, existingEmail: handled.existingEmail }
    return { error: t('signupGenericError') }
  }

  if (data?.user) {
    // Compte existant : Supabase renvoie succès avec identities vide. Différencier non confirmé vs déjà confirmé.
    const isExistingUser = !data.user.identities?.length
    if (isExistingUser) {
      const admin = createAdminClient()
      const status = await getExistingAuthUserConfirmationStatus(admin, email)
      // Déjà confirmé → inviter à se connecter (ou réinitialiser le mot de passe)
      if (status?.emailConfirmed) {
        return {
          error: t('userExists'),
          userExists: true,
          existingEmail: email,
        }
      }
      // Non confirmé ou non trouvé (ex. >100 users) → message "email de confirmation renvoyé"
      return {
        success: t('confirmationEmailResent', { email }),
        successType: 'emailResent',
        email,
      }
    }

    // Nouveau compte : créer le profil (admin car pas de session si confirmation email activée)
    const admin = createAdminClient()
    const preferredLocale = locale === 'en' || locale === 'fr' ? locale : null
    const { error: profileError } = await admin.from('profiles').insert({
      user_id: data.user.id,
      email: data.user.email ?? email,
      role,
      preferred_locale: preferredLocale,
    })

    if (profileError) {
      // Profil déjà existant (compte créé mais non confirmé, Supabase a parfois identities non vide) → traiter comme email renvoyé
      const isDuplicateProfile =
        profileError.code === '23505' ||
        (profileError.message && /unique|duplicate|already exists/i.test(profileError.message))
      if (isDuplicateProfile) {
        return {
          success: t('confirmationEmailResent', { email }),
          successType: 'emailResent',
          email,
        }
      }
      return { error: t('profileCreationError') }
    }

    // Vérifier si une session a été créée (si l'email ne nécessite pas de confirmation)
    await new Promise((resolve) => setTimeout(resolve, 100))
    const { data: { session } } = await supabase.auth.getSession()

    if (session) {
      const localePrefix = preferredLocale === 'en' ? '/en' : ''
      revalidatePath('/dashboard')
      redirect(`${localePrefix}/dashboard`)
    }

    return {
      success: t('accountCreatedSuccess'),
      successType: 'accountCreated',
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

  const headersList = await headers()
  const host = headersList.get('x-forwarded-host') ?? headersList.get('host')
  const proto = headersList.get('x-forwarded-proto') ?? 'https'
  const siteUrl =
    (host ? `${proto}://${host}` : null) ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ??
    'http://localhost:3000'

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/${locale}/reset-password`,
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

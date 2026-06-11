'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { getTranslations, getLocale } from 'next-intl/server'
import { handleLoginError } from '@/lib/authErrors'
import { getDashboardEntryPath } from '@/lib/dashboardEntryPath'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { getProfile } from '@/lib/authHelpers'
import type { Profile } from '@/types/database'
import { logger } from '@/lib/logger'
import { extractGoogleProfileFieldsFromUser } from '@/lib/googleUserMetadata'
import {
  AUTH_OAUTH_INTENT_COOKIE,
  AUTH_OAUTH_LOCALE_COOKIE,
  getLocaleFromUser,
  hasGoogleIdentity,
  isOAuthSignupPending,
  normalizeAppLocale,
  resolveOAuthCallbackUrl,
  type AppLocale,
  type OAuthIntent,
} from '@/lib/authOAuth'

const OAUTH_COOKIE_MAX_AGE = 60 * 10

function readOAuthIntent(value: FormDataEntryValue | null): OAuthIntent {
  return value === 'signup' ? 'signup' : 'login'
}

function readLocale(value: FormDataEntryValue | null, fallback: AppLocale): AppLocale {
  return value === 'en' ? 'en' : value === 'fr' ? 'fr' : fallback
}

async function setOAuthCookies(intent: OAuthIntent, locale: AppLocale): Promise<void> {
  const cookieStore = await cookies()
  const options = { httpOnly: true, sameSite: 'lax' as const, maxAge: OAUTH_COOKIE_MAX_AGE, path: '/' }
  cookieStore.set(AUTH_OAUTH_LOCALE_COOKIE, locale, options)
  cookieStore.set(AUTH_OAUTH_INTENT_COOKIE, intent, options)
}

export async function startGoogleOAuth(formData: FormData): Promise<void> {
  const fallbackLocale = normalizeAppLocale(await getLocale())
  const intent = readOAuthIntent(formData.get('intent'))
  const locale = readLocale(formData.get('locale'), fallbackLocale)

  await setOAuthCookies(intent, locale)

  const requestHeaders = await headers()
  const redirectTo = resolveOAuthCallbackUrl(requestHeaders)

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  })

  if (error || !data.url) {
    logger.error('Google OAuth start failed', error, { intent, locale, redirectTo })
    redirect(pathWithLocale(locale, '/login?error=oauth_failed'))
  }

  redirect(data.url)
}

export type OAuthCompleteSignupState = {
  error?: string
}

export async function completeOAuthSignup(
  _prevState: OAuthCompleteSignupState,
  formData: FormData
): Promise<OAuthCompleteSignupState> {
  const locale = normalizeAppLocale((formData.get('_locale') as string) || (await getLocale()))
  const t = await getTranslations({ locale, namespace: 'auth.errors' })
  const roleRaw = formData.get('role') as string
  const termsAcceptedRaw = formData.get('termsAccepted') as string | null

  if (roleRaw !== 'athlete' && roleRaw !== 'coach') {
    return { error: t('roleRequired') }
  }

  if (termsAcceptedRaw !== 'true') {
    return { error: t('termsRequired') }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { error: t('notAuthenticated') }
  }

  if (!isOAuthSignupPending(user) && !hasGoogleIdentity(user)) {
    return { error: t('accessDenied') }
  }

  const existingProfile = await getProfile(supabase, user.id, 'user_id')
  if (existingProfile) {
    const dashboardPath = getDashboardEntryPath({
      role: roleRaw,
      coach_id: null,
    })
    redirect(pathWithLocale(locale, dashboardPath))
  }

  const preferredLocale = locale === 'en' || locale === 'fr' ? locale : null
  const googleProfile = extractGoogleProfileFieldsFromUser(user)
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id: user.id,
    email: user.email,
    role: roleRaw,
    preferred_locale: preferredLocale,
    first_name: googleProfile.first_name,
    last_name: googleProfile.last_name,
    avatar_url: googleProfile.avatar_url,
  })

  if (profileError) {
    if (profileError.code === '23505') {
      const profile = await getProfile(supabase, user.id, 'role, coach_id, preferred_locale')
      if (profile?.role === 'athlete' || profile?.role === 'coach' || profile?.role === 'admin') {
        redirect(
          pathWithLocale(
            locale,
            getDashboardEntryPath(profile as Pick<Profile, 'role' | 'coach_id'>)
          )
        )
      }
    }
    logger.error('OAuth complete signup: profile insert failed', profileError, { userId: user.id })
    return { error: t('profileCreationError') }
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      oauth_signup_pending: null,
      terms_accepted_at: new Date().toISOString(),
      locale: preferredLocale ?? locale,
    },
  })

  if (metadataError) {
    logger.error('OAuth complete signup: metadata update failed', metadataError, { userId: user.id })
  }

  revalidatePath('/dashboard')
  redirect(pathWithLocale(locale, getDashboardEntryPath({ role: roleRaw, coach_id: null })))
}

export type OAuthLinkAccountState = {
  error?: string
}

export async function linkGoogleAccount(
  _prevState: OAuthLinkAccountState,
  formData: FormData
): Promise<OAuthLinkAccountState> {
  const locale = normalizeAppLocale((formData.get('_locale') as string) || (await getLocale()))
  const t = await getTranslations({ locale, namespace: 'auth.errors' })
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: t('emailRequired') }
  }

  const supabase = await createClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    const handled = handleLoginError(signInError)
    if (handled.errorCode) return { error: t(handled.errorCode) }
    return { error: t('invalidCredentials') }
  }

  await setOAuthCookies('login', locale)

  const redirectTo = resolveOAuthCallbackUrl(await headers())

  const { data, error: linkError } = await supabase.auth.linkIdentity({
    provider: 'google',
    options: {
      redirectTo,
    },
  })

  if (linkError || !data.url) {
    logger.error('Google linkIdentity failed', linkError, { email })
    return { error: t('oauthLinkFailed') }
  }

  redirect(data.url)
}

export async function requireOAuthCompleteSignupUser(): Promise<{
  email: string
  locale: AppLocale
} | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return null

  const profile = await getProfile(supabase, user.id, 'user_id')
  if (profile) return null

  if (!isOAuthSignupPending(user) && !hasGoogleIdentity(user)) return null

  return {
    email: user.email,
    locale: getLocaleFromUser(user),
  }
}

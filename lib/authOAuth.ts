import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { getDashboardEntryPath } from '@/lib/dashboardEntryPath'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { getProfile } from '@/lib/authHelpers'
import { extractGoogleProfileFieldsFromUser } from '@/lib/googleUserMetadata'

export const AUTH_OAUTH_LOCALE_COOKIE = 'auth_oauth_locale'
export const AUTH_OAUTH_INTENT_COOKIE = 'auth_oauth_intent'

export type OAuthIntent = 'login' | 'signup'
export type AppLocale = 'fr' | 'en'

export type PostOAuthRedirect =
  | { kind: 'dashboard'; path: string }
  | { kind: 'complete_signup'; path: string }
  | { kind: 'link_account'; path: string; email?: string }
  | { kind: 'login_error'; path: string; error: string }

export function getAuthSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3000'
  )
}

export function normalizeAppLocale(value: string | null | undefined): AppLocale {
  return value === 'en' ? 'en' : 'fr'
}

export function getLocaleFromUser(user: User | null | undefined): AppLocale {
  const meta = user?.user_metadata?.locale
  return meta === 'en' ? 'en' : 'fr'
}

export function isOAuthSignupPending(user: User | null | undefined): boolean {
  return user?.user_metadata?.oauth_signup_pending === true
}

export function hasGoogleIdentity(user: User | null | undefined): boolean {
  return (
    user?.identities?.some((identity) => identity.provider === 'google') ?? false
  )
}

export function oauthCallbackPath(): string {
  return `${getAuthSiteUrl()}/auth/callback`
}

export function authPagePath(locale: AppLocale, page: 'complete-signup' | 'link-account'): string {
  return pathWithLocale(locale, `/auth/${page}`)
}

export function loginPathWithError(locale: AppLocale, error: string): string {
  const base = pathWithLocale(locale, '/login')
  return `${base}?error=${encodeURIComponent(error)}`
}

export function linkAccountPath(locale: AppLocale, email?: string): string {
  const base = authPagePath(locale, 'link-account')
  if (!email?.trim()) return base
  return `${base}?email=${encodeURIComponent(email.trim())}`
}

export function shouldOfferAccountLink(errorCode: string | null, errorDescription: string | null): boolean {
  const combined = `${errorCode ?? ''} ${errorDescription ?? ''}`.toLowerCase()
  return (
    combined.includes('already') ||
    combined.includes('exists') ||
    combined.includes('identity') ||
    combined.includes('link') ||
    combined.includes('registered')
  )
}

export function extractEmailFromOAuthError(errorDescription: string | null): string | undefined {
  if (!errorDescription) return undefined
  const match = errorDescription.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)
  return match?.[0]
}

/**
 * Détermine la redirection après un OAuth Google réussi (session établie).
 */
async function backfillGoogleProfileNamesIfEmpty(
  supabase: SupabaseClient,
  user: User,
  profile: Pick<Profile, 'first_name' | 'last_name'>
): Promise<void> {
  if (!hasGoogleIdentity(user)) return

  const hasFirstName = Boolean(profile.first_name?.trim())
  const hasLastName = Boolean(profile.last_name?.trim())
  if (hasFirstName && hasLastName) return

  const googleProfile = extractGoogleProfileFieldsFromUser(user)
  const updates: Partial<Pick<Profile, 'first_name' | 'last_name'>> = {}

  if (!hasFirstName && googleProfile.first_name) {
    updates.first_name = googleProfile.first_name
  }
  if (!hasLastName && googleProfile.last_name) {
    updates.last_name = googleProfile.last_name
  }

  if (Object.keys(updates).length === 0) return

  await supabase.from('profiles').update(updates).eq('user_id', user.id)
}

export async function resolvePostOAuthRedirect(
  supabase: SupabaseClient,
  user: User,
  locale: AppLocale
): Promise<PostOAuthRedirect> {
  const profile = (await getProfile(
    supabase,
    user.id,
    'role, coach_id, preferred_locale, first_name, last_name'
  )) as Pick<Profile, 'role' | 'coach_id' | 'preferred_locale' | 'first_name' | 'last_name'> | null

  if (profile?.role) {
    await backfillGoogleProfileNamesIfEmpty(supabase, user, profile)
    const profileLocale = normalizeAppLocale(profile.preferred_locale ?? locale)
    const dashboardPath = getDashboardEntryPath(profile)
    return { kind: 'dashboard', path: pathWithLocale(profileLocale, dashboardPath) }
  }

  if (hasGoogleIdentity(user) || isOAuthSignupPending(user)) {
    return { kind: 'complete_signup', path: authPagePath(locale, 'complete-signup') }
  }

  return { kind: 'login_error', path: loginPathWithError(locale, 'oauth_failed'), error: 'oauth_failed' }
}

export async function markOAuthSignupPendingFromCallback(
  supabase: SupabaseClient,
  user: User,
  locale: AppLocale
): Promise<void> {
  if (isOAuthSignupPending(user)) return
  await supabase.auth.updateUser({
    data: {
      oauth_signup_pending: true,
      locale: locale === 'en' ? 'en' : 'fr',
    },
  })
}

export function resolveOAuthCallbackFailure(
  locale: AppLocale,
  errorCode: string | null,
  errorDescription: string | null
): PostOAuthRedirect {
  if (errorCode === 'access_denied') {
    return { kind: 'login_error', path: loginPathWithError(locale, 'oauth_cancelled'), error: 'oauth_cancelled' }
  }

  if (shouldOfferAccountLink(errorCode, errorDescription)) {
    const email = extractEmailFromOAuthError(errorDescription)
    return { kind: 'link_account', path: linkAccountPath(locale, email), email }
  }

  return { kind: 'login_error', path: loginPathWithError(locale, 'oauth_failed'), error: 'oauth_failed' }
}

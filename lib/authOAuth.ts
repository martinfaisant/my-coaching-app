import type { SupabaseClient, User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { getDashboardEntryPath } from '@/lib/dashboardEntryPath'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { getProfile } from '@/lib/authHelpers'
import { extractGoogleProfileFieldsFromUser } from '@/lib/googleUserMetadata'
import { consumePostAuthRedirectCookie } from '@/lib/postAuthRedirect.server'

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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  return (
    siteUrl ||
    appUrl ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
    'http://localhost:3000'
  )
}

/**
 * URL de callback OAuth alignée sur l'hôte de la requête courante (évite les échecs PKCE www vs apex).
 */
export function resolveOAuthCallbackUrl(requestHeaders: Headers): string {
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host')
  const proto = requestHeaders.get('x-forwarded-proto') ?? 'https'

  if (host) {
    const requestOrigin = `${proto}://${host}`
    const configured = getAuthSiteUrl()

    try {
      const configuredHost = new URL(configured).host
      const normalize = (value: string) => value.replace(/^www\./, '')
      if (normalize(configuredHost) === normalize(host)) {
        return `${requestOrigin}/auth/callback`
      }
    } catch {
      // ignore invalid configured URL
    }

    if (host === 'localhost:3000' || host.endsWith('.vercel.app')) {
      return `${requestOrigin}/auth/callback`
    }
  }

  return oauthCallbackPath()
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
  if (!user) return false

  if (user.identities?.some((identity) => identity.provider === 'google')) {
    return true
  }

  const providers = user.app_metadata?.providers
  if (Array.isArray(providers) && providers.includes('google')) {
    return true
  }

  return user.app_metadata?.provider === 'google'
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
async function backfillGoogleProfileFieldsIfEmpty(
  supabase: SupabaseClient,
  user: User,
  profile: Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'>
): Promise<void> {
  if (!hasGoogleIdentity(user)) return

  const hasFirstName = Boolean(profile.first_name?.trim())
  const hasLastName = Boolean(profile.last_name?.trim())
  const hasAvatar = Boolean(profile.avatar_url?.trim())
  if (hasFirstName && hasLastName && hasAvatar) return

  const googleProfile = extractGoogleProfileFieldsFromUser(user)
  const updates: Partial<Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'>> = {}

  if (!hasFirstName && googleProfile.first_name) {
    updates.first_name = googleProfile.first_name
  }
  if (!hasLastName && googleProfile.last_name) {
    updates.last_name = googleProfile.last_name
  }
  if (!hasAvatar && googleProfile.avatar_url) {
    updates.avatar_url = googleProfile.avatar_url
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
    'role, coach_id, preferred_locale, first_name, last_name, avatar_url'
  )) as Pick<
    Profile,
    'role' | 'coach_id' | 'preferred_locale' | 'first_name' | 'last_name' | 'avatar_url'
  > | null

  if (profile?.role) {
    await backfillGoogleProfileFieldsIfEmpty(supabase, user, profile)
    const postAuthRedirect = await consumePostAuthRedirectCookie()
    if (postAuthRedirect) {
      return { kind: 'dashboard', path: postAuthRedirect }
    }
    const profileLocale = normalizeAppLocale(profile.preferred_locale ?? locale)
    const dashboardPath = getDashboardEntryPath(profile)
    return { kind: 'dashboard', path: pathWithLocale(profileLocale, dashboardPath) }
  }

  if (hasGoogleIdentity(user) || isOAuthSignupPending(user)) {
    return { kind: 'complete_signup', path: authPagePath(locale, 'complete-signup') }
  }

  // Session établie sans profil après OAuth : finaliser l'inscription (identities parfois absentes au callback).
  if (user.email) {
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

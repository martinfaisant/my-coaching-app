import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  AUTH_OAUTH_LOCALE_COOKIE,
  getLocaleFromUser,
  hasGoogleIdentity,
  markOAuthSignupPendingFromCallback,
  normalizeAppLocale,
  resolveOAuthCallbackFailure,
  resolvePostOAuthRedirect,
  type PostOAuthRedirect,
} from '@/lib/authOAuth'
import { getProfile } from '@/lib/authHelpers'
import { logger } from '@/lib/logger'

function getLocaleFromAcceptLanguage(request: Request): 'en' | 'fr' {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  return acceptLanguage.toLowerCase().includes('en') ? 'en' : 'fr'
}

type OtpType = 'email' | 'recovery' | 'invite' | 'email_change'

function redirectToHomeWithConfirmed(origin: string, locale: 'en' | 'fr') {
  const homePath =
    locale === 'en' ? '/en?emailConfirmed=1' : '/?emailConfirmed=1'
  return NextResponse.redirect(new URL(homePath, origin))
}

function redirectToLoginFailed(origin: string, request: Request) {
  const locale = getLocaleFromAcceptLanguage(request)
  const loginPath = locale === 'en' ? '/en/login' : '/login'
  return NextResponse.redirect(
    new URL(`${loginPath}?error=confirmation_failed`, origin)
  )
}

async function readOAuthLocaleFromCookie(): Promise<'en' | 'fr'> {
  const cookieStore = await cookies()
  const value = cookieStore.get(AUTH_OAUTH_LOCALE_COOKIE)?.value
  return normalizeAppLocale(value)
}

function redirectFromPostOAuth(origin: string, result: PostOAuthRedirect) {
  return NextResponse.redirect(new URL(result.path, origin))
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next')
  const tokenHash = requestUrl.searchParams.get('token_hash')
  const oauthError = requestUrl.searchParams.get('error')
  const oauthErrorDescription = requestUrl.searchParams.get('error_description')

  const cookieLocale = await readOAuthLocaleFromCookie()

  if (oauthError && !code) {
    const failure = resolveOAuthCallbackFailure(
      cookieLocale,
      oauthError,
      oauthErrorDescription
    )
    return redirectFromPostOAuth(origin, failure)
  }

  const supabase = await createClient()

  // 1) PKCE flow : code présent (Supabase envoie ?code= après vérification si PKCE activé)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.user) {
      const {
        data: { user: refreshedUser },
      } = await supabase.auth.getUser()
      const user = refreshedUser ?? data.user

      const userLocale = getLocaleFromUser(user)
      const locale = userLocale === 'en' ? 'en' : cookieLocale

      if ((type === 'signup' || type === 'email' || type === 'invite') && !next) {
        return redirectToHomeWithConfirmed(origin, locale)
      }

      if (next?.startsWith('/')) {
        const path =
          next.startsWith('/en') || locale === 'fr'
            ? next
            : `/en${next}`
        return NextResponse.redirect(new URL(path, origin))
      }

      const profile = await getProfile(supabase, user.id, 'user_id')
      if (!profile && (hasGoogleIdentity(user) || user.email)) {
        await markOAuthSignupPendingFromCallback(supabase, user, locale)
      }

      const oauthResult = await resolvePostOAuthRedirect(supabase, user, locale)

      if (oauthResult.kind === 'login_error') {
        logger.error('OAuth callback post-redirect failed', undefined, {
          userId: user.id,
          email: user.email,
          hasGoogleIdentity: hasGoogleIdentity(user),
          providers: user.app_metadata?.providers,
          error: oauthResult.error,
        })
      }

      return NextResponse.redirect(new URL(oauthResult.path, origin))
    }

    if (error) {
      logger.error('OAuth exchangeCodeForSession failed', error, {
        codePresent: Boolean(code),
        origin,
      })
      const failure = resolveOAuthCallbackFailure(
        cookieLocale,
        error.name ?? 'oauth_failed',
        error.message
      )
      return redirectFromPostOAuth(origin, failure)
    }
  }

  // 2) Lien personnalisé (template email avec token_hash)
  if (tokenHash && type) {
    const otpType = type as OtpType
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    })
    if (!error) {
      const locale =
        (data?.user?.user_metadata?.locale as string) === 'en' ? 'en' : 'fr'
      return redirectToHomeWithConfirmed(origin, locale)
    }
  }

  return redirectToLoginFailed(origin, request)
}

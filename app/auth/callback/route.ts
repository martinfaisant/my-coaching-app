import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next')
  const tokenHash = requestUrl.searchParams.get('token_hash')

  const supabase = await createClient()

  // 1) PKCE flow : code présent (Supabase envoie ?code= après vérification si PKCE activé)
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const locale =
        (data?.user?.user_metadata?.locale as string) === 'en' ? 'en' : 'fr'
      if (type === 'signup' || !next) {
        return redirectToHomeWithConfirmed(origin, locale)
      }
      const pathPrefix = locale === 'en' ? '/en' : ''
      return NextResponse.redirect(
        new URL(
          next?.startsWith('/') ? next : `${pathPrefix}/dashboard`,
          origin
        )
      )
    }
  }

  // 2) Lien personnalisé (template email avec token_hash) : le clic va directement sur notre callback
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

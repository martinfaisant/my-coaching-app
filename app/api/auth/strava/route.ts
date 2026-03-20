import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const SCOPES = 'activity:read_all'

function getLocaleFromAcceptLanguage(request: NextRequest): 'en' | 'fr' {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  return acceptLanguage.toLowerCase().includes('en') ? 'en' : 'fr'
}

function getHomePathForLocale(locale: 'en' | 'fr'): string {
  // Routing next-intl : `fr` sans prefixe, `en` avec prefixe.
  return locale === 'en' ? '/en' : '/'
}

function getOrigin(request: NextRequest): string {
  // Priorité à une URL explicite (doit correspondre au "Authorization Callback Domain" dans Strava)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.SITE_URL
  if (appUrl) {
    const base = appUrl.replace(/\/$/, '')
    return base.startsWith('http') ? base : `https://${base}`
  }
  const origin = request.nextUrl.origin
  if (origin && origin !== 'null') return origin
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  if (host) return `${proto}://${host}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return ''
}

export async function GET(request: NextRequest) {
  try {
    const origin = getOrigin(request) || 'https://localhost:3000'

    const clientId = process.env.STRAVA_CLIENT_ID
    if (!clientId) {
      return NextResponse.redirect(new URL('/dashboard/devices?error=strava_config', origin))
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const locale = getLocaleFromAcceptLanguage(request)
      return NextResponse.redirect(new URL(getHomePathForLocale(locale), origin))
    }

    const redirectUri = `${origin}/api/auth/strava/callback`
    // Lier explicitement le state à l'utilisateur pour que le callback associe le token au bon user (multi-utilisateurs)
    const state = `${user.id}:${crypto.randomUUID()}`
    const cookieStore = await cookies()
    cookieStore.set('strava_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: SCOPES,
      state,
      approval_prompt: 'force',
    })

    return NextResponse.redirect(`${STRAVA_AUTH_URL}?${params.toString()}`)
  } catch (err) {
    logger.error('Strava OAuth redirect error', err)
    const origin = getOrigin(request) || 'https://localhost:3000'
    return NextResponse.redirect(new URL('/dashboard/devices?error=strava_config', origin))
  }
}

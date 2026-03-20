import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'

function getLocaleFromAcceptLanguage(request: NextRequest): 'en' | 'fr' {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  return acceptLanguage.toLowerCase().includes('en') ? 'en' : 'fr'
}

function getHomePathForLocale(locale: 'en' | 'fr'): string {
  // Routing next-intl : `fr` sans prefixe, `en` avec prefixe.
  return locale === 'en' ? '/en' : '/'
}

function getOrigin(request: NextRequest): string {
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
  const origin = getOrigin(request) || 'https://localhost:3000'
  const redirectToDevices = (query?: string) =>
    NextResponse.redirect(new URL(query ? `/dashboard/devices?${query}` : '/dashboard/devices', origin))

  try {
    const code = request.nextUrl.searchParams.get('code')
    const state = request.nextUrl.searchParams.get('state')
    const errorParam = request.nextUrl.searchParams.get('error')

    if (errorParam) {
      return redirectToDevices()
    }

    const cookieStore = await cookies()
    const savedState = cookieStore.get('strava_oauth_state')?.value
    cookieStore.delete('strava_oauth_state')

    if (!savedState || state !== savedState || !code) {
      return redirectToDevices('error=strava_invalid')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const locale = getLocaleFromAcceptLanguage(request)
      return NextResponse.redirect(new URL(getHomePathForLocale(locale), origin))
    }

    // Vérifier que le state correspond à l'utilisateur connecté (1 token par utilisateur, pas de mélange)
    const stateUserId = savedState.includes(':') ? savedState.slice(0, savedState.indexOf(':')) : ''
    if (stateUserId !== user.id) {
      return redirectToDevices('error=strava_invalid')
    }

    const clientId = process.env.STRAVA_CLIENT_ID
    const clientSecret = process.env.STRAVA_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return redirectToDevices('error=strava_config')
    }

    const redirectUri = `${origin}/api/auth/strava/callback`

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    })

    const tokenRes = await fetch(STRAVA_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })

    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      logger.error('Strava token exchange failed', err)
      return redirectToDevices('error=strava_token')
    }

    const data = (await tokenRes.json()) as {
      access_token: string
      refresh_token: string
      expires_at: number
      athlete?: { id: number }
    }

    const expiresAt = new Date(data.expires_at * 1000).toISOString()
    const stravaAthleteId = data.athlete?.id ?? null

    // 1 utilisateur = 1 ligne (user_id + provider). Plusieurs utilisateurs = plusieurs lignes.
    const { error } = await supabase
      .from('athlete_connected_services')
      .upsert(
        {
          user_id: user.id,
          provider: 'strava',
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          expires_at: expiresAt,
          strava_athlete_id: stravaAthleteId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,provider' }
      )

    if (error) {
      logger.error('Failed to save Strava connection', error)
      return redirectToDevices('error=strava_save')
    }

    return redirectToDevices('strava=connected')
  } catch (err) {
    logger.error('Strava callback error', err)
    return redirectToDevices('error=strava_config')
  }
}

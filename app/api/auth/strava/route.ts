import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/authorize'
const SCOPES = 'activity:read_all'

function getOrigin(request: NextRequest): string {
  const origin = request.nextUrl.origin
  if (origin && origin !== 'null') return origin
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  return host ? `${proto}://${host}` : ''
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
      return NextResponse.redirect(new URL('/login', origin))
    }

    const redirectUri = `${origin}/api/auth/strava/callback`
    const state = crypto.randomUUID()
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
    console.error('Strava OAuth redirect error:', err)
    const origin = getOrigin(request) || 'https://localhost:3000'
    return NextResponse.redirect(new URL('/dashboard/devices?error=strava_config', origin))
  }
}

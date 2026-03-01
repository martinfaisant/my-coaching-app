'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireUser } from '@/lib/authHelpers'
import { mapStravaTypeToSportType } from '@/lib/stravaMapping'
import { logger } from '@/lib/logger'
import { getTranslations } from 'next-intl/server'

const STRAVA_TOKEN_URL = 'https://www.strava.com/oauth/token'
const STRAVA_ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities'

/** Récupère un access_token valide (refresh si nécessaire). */
async function getValidStravaToken(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  locale: string = 'fr'
): Promise<{ accessToken: string } | { error: string }> {
  const t = await getTranslations({ locale, namespace: 'devices.validation' })
  
  const { data: row, error } = await supabase
    .from('athlete_connected_services')
    .select('access_token, refresh_token, expires_at')
    .eq('user_id', userId)
    .eq('provider', 'strava')
    .single()

  if (error || !row) return { error: t('stravaNotConnected') }

  const expiresAt = new Date(row.expires_at)
  const now = new Date()
  const bufferMs = 5 * 60 * 1000
  if (expiresAt.getTime() - bufferMs > now.getTime()) {
    return { accessToken: row.access_token }
  }

  const clientId = process.env.STRAVA_CLIENT_ID
  const clientSecret = process.env.STRAVA_CLIENT_SECRET
  if (!clientId || !clientSecret) return { error: t('missingConfig') }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: row.refresh_token,
    grant_type: 'refresh_token',
  })

  const res = await fetch(STRAVA_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const err = await res.text()
    logger.error('Strava refresh token failed', err, { userId })
    return { error: t('cannotRefresh') }
  }

  const data = (await res.json()) as {
    access_token: string
    refresh_token: string
    expires_at: number
  }

  await supabase
    .from('athlete_connected_services')
    .update({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: new Date(data.expires_at * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('provider', 'strava')

  return { accessToken: data.access_token }
}

export async function getStravaConnection(userId: string, locale: string = 'fr') {
  const supabase = await createClient()
  const result = await requireUser(supabase)
  if ('error' in result || result.user.id !== userId) {
    const t = await getTranslations({ locale, namespace: 'devices.validation' })
    return { connected: false, error: t('unauthorized') }
  }

  const { data, error } = await supabase
    .from('athlete_connected_services')
    .select('id, provider, strava_athlete_id, created_at')
    .eq('user_id', userId)
    .eq('provider', 'strava')
    .maybeSingle()

  if (error) return { connected: false, error: error.message }
  return { connected: !!data, connection: data }
}

export async function syncStravaLastWeek(userId: string, locale: string = 'fr'): Promise<{ error?: string; imported?: number }> {
  const supabase = await createClient()
  const result = await requireUser(supabase)
  const t = await getTranslations({ locale, namespace: 'devices.validation' })
  
  if ('error' in result || result.user.id !== userId) return { error: t('unauthorized') }

  const tokenResult = await getValidStravaToken(supabase, userId, locale)
  if ('error' in tokenResult) return { error: tokenResult.error }

  const now = Math.floor(Date.now() / 1000)
  const threeWeeksAgo = now - 3 * 7 * 24 * 60 * 60
  const url = `${STRAVA_ACTIVITIES_URL}?after=${threeWeeksAgo}&before=${now}&per_page=100`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
  })

  if (!res.ok) {
    const err = await res.text()
    logger.error('Strava activities fetch failed', err, { userId })
    return { error: t('cannotFetchActivities') }
  }

  const activities = (await res.json()) as Array<{
    id: number
    name: string
    type: string
    sport_type: string
    start_date_local: string
    distance?: number
    moving_time?: number
    total_elevation_gain?: number
    description?: string | null
  }>

  const defaultTitle = t('activityTitleDefault')
  const untitled = t('activityTitleUntitled')

  let imported = 0
  for (const a of activities) {
    const startDate = a.start_date_local.slice(0, 10)
    const sportType = mapStravaTypeToSportType(a.sport_type || a.type)
    const title = (a.name || defaultTitle).trim() || untitled
    // Pas de description synthétique : distance / temps / dénivelé sont dans raw_data et affichés en champs dédiés
    const description = (a.description && String(a.description).trim()) || ''

    const { error: upsertErr } = await supabase
      .from('imported_activities')
      .upsert(
        {
          athlete_id: userId,
          source: 'strava',
          external_id: String(a.id),
          date: startDate,
          sport_type: sportType,
          title,
          description,
          activity_type: (a.type && String(a.type).trim()) || null,
          raw_data: {
            type: a.type,
            sport_type: a.sport_type,
            distance: a.distance,
            moving_time: a.moving_time,
            total_elevation_gain: a.total_elevation_gain,
          },
        },
        { onConflict: 'athlete_id,source,external_id' }
      )
    if (!upsertErr) imported++
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/devices')
  return { imported }
}

export async function disconnectStrava(userId: string, locale: string = 'fr'): Promise<{ error?: string }> {
  const supabase = await createClient()
  const result = await requireUser(supabase)
  if ('error' in result || result.user.id !== userId) {
    const t = await getTranslations({ locale, namespace: 'devices.validation' })
    return { error: t('unauthorized') }
  }

  await supabase
    .from('athlete_connected_services')
    .delete()
    .eq('user_id', userId)
    .eq('provider', 'strava')

  await supabase
    .from('imported_activities')
    .delete()
    .eq('athlete_id', userId)
    .eq('source', 'strava')

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/devices')
  return {}
}

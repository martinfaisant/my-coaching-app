'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireUserWithProfile, requireUser } from '@/lib/authHelpers'
import { logger } from '@/lib/logger'
import { getTranslations, getLocale } from 'next-intl/server'

export type SetCoachResult = { error?: string }
export type CoachRequestResult = { error?: string }

/** Athlète : envoyer une demande de coaching au coach. */
export async function createCoachRequest(
  coachId: string,
  sportsPracticed: string[],
  coachingNeed: string,
  offerId?: string | null,
  locale: string = 'fr'
): Promise<CoachRequestResult> {
  const supabase = await createClient()
  const result = await requireUserWithProfile(supabase, 'role, coach_id')
  const [t, tErrors, tAuth] = await Promise.all([
    getTranslations({ locale, namespace: 'coachRequests.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
    getTranslations({ locale, namespace: 'auth.errors' }),
  ])
  if ('error' in result) return { error: tAuth(result.errorCode ?? 'notAuthenticated') }

  const { user, profile } = result
  if (profile.role !== 'athlete') return { error: t('athletesOnly') }
  if (profile.coach_id) return { error: t('alreadyHasCoach') }

  const sports = (sportsPracticed ?? []).map((s) => s.trim()).filter(Boolean)
  const need = (coachingNeed ?? '').trim()
  if (sports.length === 0 || !need) return { error: t('requireSportAndNeed') }

  const { data: coach } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', coachId)
    .eq('role', 'coach')
    .single()

  if (!coach) return { error: t('coachNotFound') }

  const sportPracticedValue = sports.join(',')

  // Vérifier que l'offre appartient bien au coach si offerId est fourni
  if (offerId) {
    const { data: offer } = await supabase
      .from('coach_offers')
      .select('coach_id')
      .eq('id', offerId)
      .eq('coach_id', coachId)
      .single()
    if (!offer) {
      return { error: t('offerNotFound') }
    }
  }

  const { error } = await supabase.from('coach_requests').insert({
    athlete_id: user.id,
    coach_id: coachId,
    sport_practiced: sportPracticedValue,
    coaching_need: need,
    offer_id: offerId || null,
    status: 'pending',
  })

  if (error) return { error: tErrors('supabaseGeneric') }

  // Mettre à jour le profil athlète avec les sports choisis (aligné avec "Sports pratiqués")
  const { error: updateError } = await supabase
    .from('profiles')
    .update({ practiced_sports: sports })
    .eq('user_id', user.id)

  if (updateError) {
    // Ne pas faire échouer la demande si la mise à jour du profil échoue
    logger.error('Mise à jour practiced_sports', updateError)
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/profile')
  return {}
}

/** Athlète : liste des demandes envoyées (pour afficher "Demande envoyée" par coach). */
export async function getMyCoachRequests(): Promise<{ id: string; coach_id: string; status: string }[]> {
  const supabase = await createClient()
  const result = await requireUser(supabase)
  if ('error' in result) return []

  const { user } = result

  const { data } = await supabase
    .from('coach_requests')
    .select('id, coach_id, status')
    .eq('athlete_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []).map((r) => ({ id: r.id, coach_id: r.coach_id, status: r.status }))
}

/** Athlète : annuler une demande en attente. */
export async function cancelCoachRequest(requestId: string): Promise<CoachRequestResult> {
  const supabase = await createClient()
  const result = await requireUser(supabase)
  const locale = await getLocale()
  const [t, tErrors, tAuth] = await Promise.all([
    getTranslations({ locale, namespace: 'coachRequests.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
    getTranslations({ locale, namespace: 'auth.errors' }),
  ])
  if ('error' in result) return { error: tAuth(result.errorCode ?? 'notAuthenticated') }

  const { user } = result

  const { data: req } = await supabase
    .from('coach_requests')
    .select('id, athlete_id, status')
    .eq('id', requestId)
    .single()

  if (!req || req.athlete_id !== user.id) return { error: t('requestNotFound') }
  if (req.status !== 'pending') return { error: t('requestCannotBeCancelled') }

  const { error } = await supabase.from('coach_requests').delete().eq('id', requestId)

  if (error) return { error: tErrors('supabaseGeneric') }
  revalidatePath('/dashboard')
  return {}
}

export type PendingRequestWithAthlete = {
  id: string
  athlete_id: string
  athlete_name: string
  athlete_email: string
  athlete_avatar_url: string | null
  sport_practiced: string
  coaching_need: string
  offer_id: string | null
  offer_title: string | null
  offer_price: number | null
  offer_price_type: string | null
  created_at: string
}

/** Coach : demandes en attente. locale utilisé pour le titre de l'offre (FR/EN). */
export async function getPendingCoachRequests(locale: string = 'fr'): Promise<PendingRequestWithAthlete[]> {
  const supabase = await createClient()
  const result = await requireUser(supabase)
  if ('error' in result) return []

  const { user } = result

  const { data: rows } = await supabase
    .from('coach_requests')
    .select('id, athlete_id, sport_practiced, coaching_need, offer_id, created_at')
    .eq('coach_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (!rows?.length) return []

  const athleteIds = [...new Set(rows.map((r) => r.athlete_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, full_name, email, avatar_url')
    .in('user_id', athleteIds)

  const nameByUserId = new Map<string, string>()
  const emailByUserId = new Map<string, string>()
  const avatarByUserId = new Map<string, string | null>()
  for (const p of profiles ?? []) {
    nameByUserId.set(p.user_id, p.full_name?.trim() || p.email)
    emailByUserId.set(p.user_id, p.email)
    avatarByUserId.set(p.user_id, p.avatar_url ?? null)
  }

  const offerIds = rows.filter(r => r.offer_id).map(r => r.offer_id!)
  const offersByOfferId = new Map<string, { title: string; price: number; price_type: string }>()
  if (offerIds.length > 0) {
    const { data: offers } = await supabase
      .from('coach_offers')
      .select('id, title, title_fr, title_en, price, price_type')
      .in('id', offerIds)
    for (const offer of offers ?? []) {
      const titleFr = (offer.title_fr ?? '').trim()
      const titleEn = (offer.title_en ?? '').trim()
      const legacy = (offer.title ?? '').trim()
      const title = locale === 'fr'
        ? (titleFr || titleEn || legacy)
        : (titleEn || titleFr || legacy)
      offersByOfferId.set(offer.id, {
        title,
        price: offer.price,
        price_type: offer.price_type,
      })
    }
  }

  return rows.map((r) => {
    const offer = r.offer_id ? offersByOfferId.get(r.offer_id) : null
    return {
      id: r.id,
      athlete_id: r.athlete_id,
      athlete_name: nameByUserId.get(r.athlete_id) ?? emailByUserId.get(r.athlete_id) ?? '—',
      athlete_email: emailByUserId.get(r.athlete_id) ?? '',
      athlete_avatar_url: avatarByUserId.get(r.athlete_id) ?? null,
      sport_practiced: r.sport_practiced,
      coaching_need: r.coaching_need,
      offer_id: r.offer_id ?? null,
      offer_title: offer?.title ?? null,
      offer_price: offer?.price ?? null,
      offer_price_type: offer?.price_type ?? null,
      created_at: r.created_at,
    }
  })
}

/** Coach : accepter ou refuser une demande. */
export async function respondToCoachRequest(
  requestId: string,
  accept: boolean,
  locale: string = 'fr'
): Promise<CoachRequestResult> {
  const supabase = await createClient()
  const result = await requireUser(supabase)
  const [t, tErrors, tAuth] = await Promise.all([
    getTranslations({ locale, namespace: 'coachRequests.validation' }),
    getTranslations({ locale, namespace: 'errors' }),
    getTranslations({ locale, namespace: 'auth.errors' }),
  ])
  if ('error' in result) return { error: tAuth(result.errorCode ?? 'notAuthenticated') }

  const { user } = result

  const { data: req } = await supabase
    .from('coach_requests')
    .select('id, coach_id, athlete_id, status')
    .eq('id', requestId)
    .single()

  if (!req || req.coach_id !== user.id) return { error: t('requestNotFound') }
  if (req.status !== 'pending') return { error: t('requestNotFound') }

  if (accept) {
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ coach_id: user.id })
      .eq('user_id', req.athlete_id)

    if (updateProfileError) return { error: tErrors('supabaseGeneric') }
  }

  const { error } = await supabase
    .from('coach_requests')
    .update({
      status: accept ? 'accepted' : 'declined',
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) return { error: tErrors('supabaseGeneric') }
  revalidatePath('/dashboard')
  return {}
}

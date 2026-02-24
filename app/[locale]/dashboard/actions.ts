'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireUserWithProfile, requireUser } from '@/lib/authHelpers'
import { logger } from '@/lib/logger'
import { getTranslations, getLocale } from 'next-intl/server'
import { getFrozenTitleForLocale } from '@/lib/frozenOfferI18n'
import { getDisplayName } from '@/lib/displayName'

export type SetCoachResult = { error?: string }
export type CoachRequestResult = { error?: string }

/** Athlète : envoyer une demande de coaching au coach. Si firstName/lastName sont fournis, met à jour le profil puis crée la demande. */
export async function createCoachRequest(
  coachId: string,
  sportsPracticed: string[],
  coachingNeed: string,
  offerId?: string | null,
  locale: string = 'fr',
  firstName?: string,
  lastName?: string
): Promise<CoachRequestResult> {
  const supabase = await createClient()
  let t: Awaited<ReturnType<typeof getTranslations>>
  let tErrors: Awaited<ReturnType<typeof getTranslations>>
  let tAuth: Awaited<ReturnType<typeof getTranslations>>
  try {
    const result = await requireUserWithProfile(supabase, 'role, coach_id, first_name, last_name')
    const translations = await Promise.all([
      getTranslations({ locale, namespace: 'coachRequests.validation' }),
      getTranslations({ locale, namespace: 'errors' }),
      getTranslations({ locale, namespace: 'auth.errors' }),
    ])
    ;[t, tErrors, tAuth] = translations
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

    // Mettre à jour le profil athlète si prénom/nom fournis (profil incomplet)
    const firstTrim = (firstName ?? '').trim()
    const lastTrim = (lastName ?? '').trim()
    if (firstTrim && lastTrim) {
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ first_name: firstTrim, last_name: lastTrim })
        .eq('user_id', user.id)
      if (updateErr) {
        logger.error('createCoachRequest profile update failed', updateErr)
        return { error: tErrors('supabaseGeneric') }
      }
    }

    // Vérifier que le profil a bien un nom (obligatoire pour la demande)
    const { data: profileCheck } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', user.id)
      .single()
    const hasName = profileCheck
      && (profileCheck.first_name ?? '').trim() !== ''
      && (profileCheck.last_name ?? '').trim() !== ''
    if (!hasName) return { error: t('requireFirstNameLastName') }

    const sportPracticedValue = sports.join(',')

    let insertPayload: {
      athlete_id: string
      coach_id: string
      sport_practiced: string
      coaching_need: string
      status: string
      offer_id?: string | null
      frozen_price?: number | null
      frozen_price_type?: string | null
      frozen_title?: string | null
      frozen_description?: string | null
      frozen_title_fr?: string | null
      frozen_title_en?: string | null
      frozen_description_fr?: string | null
      frozen_description_en?: string | null
    } = {
      athlete_id: user.id,
      coach_id: coachId,
      sport_practiced: sportPracticedValue,
      coaching_need: need,
      status: 'pending',
    }

    if (offerId) {
      const { data: offer } = await supabase
        .from('coach_offers')
        .select('id, coach_id, status, title, description, title_fr, title_en, description_fr, description_en, price, price_type')
        .eq('id', offerId)
        .eq('coach_id', coachId)
        .single()
      if (!offer) return { error: t('offerNotFound') }
      if (offer.status !== 'published') return { error: t('offerNotPublished') }

      const frozen_title =
        locale === 'en' && offer.title_en?.trim()
          ? offer.title_en.trim()
          : (offer.title_fr?.trim() ?? offer.title?.trim() ?? '')
      const frozen_description =
        locale === 'en' && offer.description_en?.trim()
          ? offer.description_en.trim()
          : (offer.description_fr?.trim() ?? offer.description?.trim() ?? '')

      const frozen_title_fr = (offer.title_fr ?? '').trim() || null
      const frozen_title_en = (offer.title_en ?? '').trim() || null
      const frozen_description_fr = (offer.description_fr ?? '').trim() || null
      const frozen_description_en = (offer.description_en ?? '').trim() || null

      const frozen_price_type = (offer.price_type ?? '').trim() || null

      insertPayload = {
        ...insertPayload,
        offer_id: offerId,
        frozen_price: offer.price ?? null,
        frozen_price_type: frozen_price_type && ['free', 'one_time', 'monthly'].includes(frozen_price_type) ? frozen_price_type : null,
        frozen_title: frozen_title || null,
        frozen_description: frozen_description || null,
        frozen_title_fr,
        frozen_title_en,
        frozen_description_fr,
        frozen_description_en,
      }
    }

    const { error } = await supabase.from('coach_requests').insert(insertPayload)

    if (error) {
      logger.error('createCoachRequest insert failed', error, { coachId, offerId: offerId ?? null })
      return { error: tErrors('supabaseGeneric') }
    }

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
    revalidatePath('/dashboard/find-coach')
    revalidatePath('/dashboard/profile')
    return {}
  } catch (err) {
    logger.error('createCoachRequest', err)
    const fallbackT = await getTranslations({ locale, namespace: 'errors' })
    return { error: fallbackT('supabaseGeneric') }
  }
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

/** Détail d'une demande pour affichage dans la modale (athlète). */
export type CoachRequestDetail = {
  id: string
  coach_id: string
  status: string
  sport_practiced: string
  coaching_need: string
  created_at: string
  frozen_title_fr: string | null
  frozen_title_en: string | null
  frozen_title: string | null
  frozen_description_fr: string | null
  frozen_description_en: string | null
  frozen_description: string | null
  frozen_price: number | null
  frozen_price_type: string | null
}

/** Athlète : détail d'une demande envoyée (pour la modale). Retourne notFound si introuvable ou non autorisé. */
export async function getCoachRequestDetail(
  requestId: string
): Promise<{ error?: string; notFound?: boolean } | CoachRequestDetail> {
  const supabase = await createClient()
  const result = await requireUser(supabase)
  if ('error' in result) return { error: 'auth', notFound: false }

  const { user } = result

  const { data, error } = await supabase
    .from('coach_requests')
    .select(
      'id, coach_id, status, sport_practiced, coaching_need, created_at, frozen_title_fr, frozen_title_en, frozen_title, frozen_description_fr, frozen_description_en, frozen_description, frozen_price, frozen_price_type'
    )
    .eq('id', requestId)
    .eq('athlete_id', user.id)
    .single()

  if (error || !data) return { notFound: true }
  return data as CoachRequestDetail
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
  revalidatePath('/dashboard/find-coach')
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
    .select('id, athlete_id, sport_practiced, coaching_need, created_at, offer_id, frozen_title, frozen_title_fr, frozen_title_en, frozen_price, frozen_price_type, frozen_description, frozen_description_fr, frozen_description_en')
    .eq('coach_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (!rows?.length) return []

  const athleteIds = [...new Set(rows.map((r) => r.athlete_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email, avatar_url')
    .in('user_id', athleteIds)

  const nameByUserId = new Map<string, string>()
  const emailByUserId = new Map<string, string>()
  const avatarByUserId = new Map<string, string | null>()
  for (const p of profiles ?? []) {
    nameByUserId.set(p.user_id, getDisplayName(p, p.email))
    emailByUserId.set(p.user_id, p.email)
    avatarByUserId.set(p.user_id, p.avatar_url ?? null)
  }

  return rows.map((r) => ({
    id: r.id,
    athlete_id: r.athlete_id,
    athlete_name: nameByUserId.get(r.athlete_id) ?? emailByUserId.get(r.athlete_id) ?? '—',
    athlete_email: emailByUserId.get(r.athlete_id) ?? '',
    athlete_avatar_url: avatarByUserId.get(r.athlete_id) ?? null,
    sport_practiced: r.sport_practiced,
    coaching_need: r.coaching_need,
    offer_id: r.offer_id ?? null,
    offer_title: getFrozenTitleForLocale(r, locale) ?? null,
    offer_price: r.frozen_price ?? null,
    offer_price_type: r.frozen_price_type ?? null,
    created_at: r.created_at,
  }))
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
    .select('id, coach_id, athlete_id, status, frozen_price, frozen_price_type, frozen_title, frozen_description, frozen_title_fr, frozen_title_en, frozen_description_fr, frozen_description_en')
    .eq('id', requestId)
    .single()

  if (!req || req.coach_id !== user.id) return { error: t('requestNotFound') }
  if (req.status !== 'pending') return { error: t('requestNotFound') }

  const now = new Date().toISOString()

  if (accept) {
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ coach_id: user.id })
      .eq('user_id', req.athlete_id)

    if (updateProfileError) return { error: tErrors('supabaseGeneric') }

    const { error: updateRequestError } = await supabase
      .from('coach_requests')
      .update({ status: 'accepted', responded_at: now })
      .eq('id', requestId)

    if (updateRequestError) return { error: tErrors('supabaseGeneric') }

    const { error: insertSubError } = await supabase.from('subscriptions').insert({
      athlete_id: req.athlete_id,
      coach_id: req.coach_id,
      request_id: req.id,
      frozen_price: req.frozen_price ?? null,
      frozen_price_type: req.frozen_price_type ?? null,
      frozen_title: req.frozen_title ?? null,
      frozen_description: req.frozen_description ?? null,
      frozen_title_fr: req.frozen_title_fr ?? null,
      frozen_title_en: req.frozen_title_en ?? null,
      frozen_description_fr: req.frozen_description_fr ?? null,
      frozen_description_en: req.frozen_description_en ?? null,
      status: 'active',
      start_date: now,
    })

    if (insertSubError) return { error: tErrors('supabaseGeneric') }
  } else {
    const { error } = await supabase
      .from('coach_requests')
      .update({ status: 'declined', responded_at: now })
      .eq('id', requestId)

    if (error) return { error: tErrors('supabaseGeneric') }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/athletes')
  return {}
}

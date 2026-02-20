'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CoachRating } from '@/types/database'
import { requireUserWithProfile } from '@/lib/authHelpers'
import { getTranslations } from 'next-intl/server'
import { createError, createSuccess, type ApiResult } from '@/lib/errors'
import { getNextMonthlyCycleEndDate } from '@/lib/dateUtils'
import { logger } from '@/lib/logger'

export type CoachRatingResult = { error?: string }

/** Athlète : récupérer sa note pour son coach (Mon coach). */
export async function getMyCoachRating(coachId: string): Promise<CoachRating | null> {
  const supabase = await createClient()
  const result = await requireUserWithProfile(supabase, 'role, coach_id')
  if ('error' in result) return null

  const { user, profile } = result
  if (profile.role !== 'athlete' || profile.coach_id !== coachId) return null

  const { data } = await supabase
    .from('coach_ratings')
    .select('id, athlete_id, coach_id, rating, comment, created_at, updated_at')
    .eq('athlete_id', user.id)
    .eq('coach_id', coachId)
    .maybeSingle()

  return data as CoachRating | null
}

/** Athlète : enregistrer ou modifier sa note pour son coach (une seule note par coach). */
export async function upsertCoachRating(
  coachId: string,
  rating: number,
  comment: string,
  locale: string = 'fr'
): Promise<CoachRatingResult> {
  const supabase = await createClient()
  const result = await requireUserWithProfile(supabase, 'role, coach_id')
  if ('error' in result) return { error: result.error }

  const t = await getTranslations({ locale, namespace: 'myCoach.validation' })

  const { user, profile } = result
  if (profile.role !== 'athlete' || profile.coach_id !== coachId) {
    return { error: t('onlyYourCoach') }
  }

  const ratingNum = Math.min(5, Math.max(1, Math.round(rating)))
  const commentTrimmed = (comment ?? '').trim()

  const { error } = await supabase.from('coach_ratings').upsert(
    {
      athlete_id: user.id,
      coach_id: coachId,
      rating: ratingNum,
      comment: commentTrimmed || null,
    },
    {
      onConflict: 'athlete_id,coach_id',
      ignoreDuplicates: false,
    }
  )

  if (error) return { error: t('saveFailed') }

  revalidatePath('/dashboard/coach')
  return {}
}

/** Résultat de endSubscription : fin immédiate (redirect) ou fin au cycle (afficher date) */
export type EndSubscriptionResult = { immediate: boolean; endDate?: string }

/**
 * Athlète ou coach : mettre fin à une souscription.
 * Free/one_time → fin immédiate (status cancelled, coach_id = null).
 * Monthly → end_date = prochain anniversaire, pas de coach_id null avant cette date.
 */
export async function endSubscription(
  subscriptionId: string,
  locale: string
): Promise<ApiResult<EndSubscriptionResult>> {
  if (!subscriptionId?.trim()) {
    const t = await getTranslations({ locale, namespace: 'myCoach.subscriptionEnd' })
    return createError(t('errors.notFound'), 'NOT_FOUND')
  }

  const supabase = await createClient()
  const result = await requireUserWithProfile(supabase, 'role')
  if ('error' in result) return createError(result.error, 'AUTH_REQUIRED')

  const t = await getTranslations({ locale, namespace: 'myCoach.subscriptionEnd' })

  const { data: sub, error: fetchError } = await supabase
    .from('subscriptions')
    .select('id, athlete_id, coach_id, frozen_price_type, start_date, end_date, status')
    .eq('id', subscriptionId)
    .single()

  if (fetchError || !sub) return createError(t('errors.notFound'), 'NOT_FOUND')

  const uid = result.user.id
  const isAthlete = sub.athlete_id === uid
  const isCoach = sub.coach_id === uid
  if (!isAthlete && !isCoach) return createError(t('errors.forbidden'), 'FORBIDDEN')

  const priceType = (sub.frozen_price_type ?? 'one_time') as 'free' | 'one_time' | 'monthly'

  if (priceType === 'monthly') {
    if (sub.end_date) {
      return createError(t('errors.alreadyScheduled'), 'VALIDATION_ERROR')
    }
    const nextEnd = getNextMonthlyCycleEndDate(sub.start_date)
    const endDateIso = nextEnd.toISOString()
    const { data: updatedMonthly, error: updateError } = await supabase
      .from('subscriptions')
      .update({
        end_date: endDateIso,
        status: 'cancellation_scheduled',
        cancellation_requested_by_user_id: uid,
      })
      .eq('id', subscriptionId)
      .select('id')
      .maybeSingle()

    if (updateError || !updatedMonthly) {
      const msg = updateError?.message ?? t('errors.server')
      return createError(msg, 'SERVER_ERROR')
    }
    revalidatePath(`/${locale}/dashboard/coach`)
    revalidatePath(`/${locale}/dashboard`)
    revalidatePath(`/${locale}/dashboard/subscriptions`)
    return createSuccess({ immediate: false, endDate: endDateIso })
  }

  const now = new Date().toISOString()
  const { data: updatedSub, error: updateSubError } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled', end_date: now })
    .eq('id', subscriptionId)
    .select('id')
    .maybeSingle()

  if (updateSubError || !updatedSub) {
    if (!updatedSub && !updateSubError) {
      logger.warn('endSubscription: subscription update affected 0 rows (RLS?). subscriptionId=%s', subscriptionId)
    }
    const msg = updateSubError?.message ?? t('errors.server')
    return createError(msg, 'SERVER_ERROR')
  }

  const { data: updatedProfile, error: updateProfileError } = await supabase
    .from('profiles')
    .update({ coach_id: null })
    .eq('user_id', sub.athlete_id)
    .select('user_id')
    .maybeSingle()

  if (updateProfileError || !updatedProfile) {
    if (!updatedProfile && !updateProfileError) {
      logger.warn('endSubscription: profile update affected 0 rows (RLS?). athlete_id=%s', sub.athlete_id)
      return createError(t('errors.profileUpdateFailed'), 'SERVER_ERROR')
    }
    const msg = updateProfileError?.message ?? t('errors.server')
    return createError(msg, 'SERVER_ERROR')
  }

  revalidatePath(`/${locale}/dashboard/coach`)
  revalidatePath(`/${locale}/dashboard`)
  revalidatePath(`/${locale}/dashboard/subscriptions`)
  return createSuccess({ immediate: true })
}

/**
 * Athlète ou coach : annuler une résiliation programmée (remet status = active, end_date = null).
 */
export async function cancelSubscriptionCancellation(
  subscriptionId: string,
  locale: string
): Promise<ApiResult<null>> {
  const supabase = await createClient()
  const result = await requireUserWithProfile(supabase, 'role')
  if ('error' in result) return createError(result.error, 'AUTH_REQUIRED')

  const t = await getTranslations({ locale, namespace: 'myCoach.cancelCancellation' })

  const { data: sub, error: fetchError } = await supabase
    .from('subscriptions')
    .select('id, athlete_id, coach_id, status, cancellation_requested_by_user_id')
    .eq('id', subscriptionId)
    .single()

  if (fetchError || !sub) return createError(t('errors.notFound'), 'NOT_FOUND')

  const uid = result.user.id
  if (sub.status !== 'cancellation_scheduled') {
    return createError(t('errors.notFound'), 'VALIDATION_ERROR')
  }

  const requestedBy = sub.cancellation_requested_by_user_id ?? null
  if (requestedBy !== uid) {
    return createError(t('errors.onlyRequesterCanCancel'), 'FORBIDDEN')
  }

  const { error: updateError } = await supabase
    .from('subscriptions')
    .update({ status: 'active', end_date: null, cancellation_requested_by_user_id: null })
    .eq('id', subscriptionId)

  if (updateError) {
    const msg = updateError.message ?? t('errors.server')
    return createError(msg, 'SERVER_ERROR')
  }

  revalidatePath(`/${locale}/dashboard/coach`)
  revalidatePath(`/${locale}/dashboard`)
  revalidatePath(`/${locale}/dashboard/subscriptions`)
  return createSuccess(null)
}

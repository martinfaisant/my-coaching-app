'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CoachRating } from '@/types/database'
import { requireUser, requireUserWithProfile } from '@/lib/authHelpers'
import { getTranslations } from 'next-intl/server'

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

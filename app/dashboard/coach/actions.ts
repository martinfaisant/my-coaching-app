'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CoachRating } from '@/types/database'

export type CoachRatingResult = { error?: string }

/** Athlète : récupérer sa note pour son coach (Mon coach). */
export async function getMyCoachRating(coachId: string): Promise<CoachRating | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, coach_id')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'athlete' || profile?.coach_id !== coachId) return null

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
  comment: string
): Promise<CoachRatingResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, coach_id')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'athlete' || profile?.coach_id !== coachId) {
    return { error: 'Vous ne pouvez noter que votre coach actuel.' }
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

  if (error) return { error: error.message }

  revalidatePath('/dashboard/coach')
  return {}
}

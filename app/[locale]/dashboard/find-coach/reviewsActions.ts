'use server'

import { createClient } from '@/utils/supabase/server'
import { logger } from '@/lib/logger'

export type CoachPublicReview = {
  id: string
  rating: number
  comment: string | null
  created_at: string
}

export async function getCoachPublicReviews(
  coachId: string
): Promise<{ ok: true; reviews: CoachPublicReview[] } | { ok: false; error: 'rpc_failed' }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_coach_public_reviews', {
      p_coach_id: coachId,
    })
    if (error) {
      logger.error('getCoachPublicReviews rpc failed', error, { coachId })
      return { ok: false, error: 'rpc_failed' }
    }
    return { ok: true, reviews: (data ?? []) as CoachPublicReview[] }
  } catch (e) {
    logger.error('getCoachPublicReviews', e, { coachId })
    return { ok: false, error: 'rpc_failed' }
  }
}

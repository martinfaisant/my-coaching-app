import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/** True si le coach a accès plateforme (RPC : statuts active / trialing uniquement). */
export async function fetchCoachPlatformAccessGranted(
  supabase: SupabaseClient,
  coachId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('coach_platform_access_granted', { p_coach_id: coachId })
  if (error) {
    logger.error('coach_platform_access_granted RPC failed', error, { coachId })
    return false
  }
  return data === true
}

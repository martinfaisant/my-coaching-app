import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { coachIdFromStripeSubscription } from '@/lib/coachPlatformTrialEligibility'
import { logger } from '@/lib/logger'

export type CoachPlatformSubscriptionRowUpsert = {
  coach_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string
  status: string
  current_period_end: string | null
  cancel_at_period_end: boolean
  cancel_at: string | null
  updated_at: string
}

export function coachPlatformRowFromStripeSubscription(
  sub: Stripe.Subscription
): CoachPlatformSubscriptionRowUpsert | null {
  const coachId = coachIdFromStripeSubscription(sub)
  if (!coachId) return null

  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null
  const currentPeriodEnd =
    typeof sub.current_period_end === 'number'
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null
  const cancelAt =
    typeof sub.cancel_at === 'number' ? new Date(sub.cancel_at * 1000).toISOString() : null

  return {
    coach_id: coachId,
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    status: sub.status,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: sub.cancel_at_period_end === true,
    cancel_at: cancelAt,
    updated_at: new Date().toISOString(),
  }
}

export async function upsertCoachPlatformSubscriptionFromStripe(
  admin: SupabaseClient,
  sub: Stripe.Subscription
): Promise<void> {
  const row = coachPlatformRowFromStripeSubscription(sub)
  if (!row) {
    logger.warn('coachPlatformSubscriptionSync: subscription sans metadata coach_id', {
      subscriptionId: sub.id,
    })
    return
  }

  const { error } = await admin.from('coach_platform_subscriptions').upsert(row, { onConflict: 'coach_id' })
  if (error) {
    logger.error('coachPlatformSubscriptionSync: upsert failed', error, {
      coachId: row.coach_id,
      subscriptionId: sub.id,
    })
  }
}

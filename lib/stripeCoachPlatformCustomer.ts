import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import { logger } from '@/lib/logger'

/**
 * Renvoie un `cus_…` réutilisable pour Checkout si la ligne coach en base pointe encore
 * vers un Customer Stripe valide. Sinon `null` (Checkout avec email → nouveau Customer).
 */
export async function resolveExistingCoachPlatformStripeCustomerId(
  stripe: Stripe,
  supabase: SupabaseClient,
  coachId: string
): Promise<string | null> {
  const { data: row, error } = await supabase
    .from('coach_platform_subscriptions')
    .select('stripe_customer_id')
    .eq('coach_id', coachId)
    .maybeSingle()

  if (error) {
    logger.error('resolveExistingCoachPlatformStripeCustomerId: select failed', error, { coachId })
    return null
  }

  const raw = row?.stripe_customer_id
  const customerId = typeof raw === 'string' ? raw.trim() : ''
  if (!customerId || !customerId.startsWith('cus_')) {
    return null
  }

  try {
    await stripe.customers.retrieve(customerId)
    return customerId
  } catch (e) {
    logger.warn(
      'Stripe customer from coach_platform_subscriptions invalid; checkout will use customer_email',
      {
        coachId,
        stripeCustomerId: customerId,
        cause: e instanceof Error ? e.message : String(e),
      }
    )
    return null
  }
}

import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import type { CoachPlatformSubscription } from '@/types/database'
import { logger } from '@/lib/logger'
import {
  COACH_PLATFORM_TRIAL_CAMPAIGN_ID_FALLBACK,
  getCoachPlatformSubscriptionTrialCampaignId,
  getCoachPlatformSubscriptionTrialDays,
} from '@/lib/coachPlatformSubscriptionTrial'

/** Souscription Stripe ayant (ou ayant eu) une période d’essai plateforme. */
export function subscriptionHadPlatformTrial(sub: Pick<Stripe.Subscription, 'status' | 'trial_end'>): boolean {
  if (sub.status === 'trialing') return true
  return typeof sub.trial_end === 'number' && sub.trial_end > 0
}

export function coachIdFromStripeSubscription(sub: Stripe.Subscription): string | null {
  const m = sub.metadata?.coach_id
  if (m && typeof m === 'string' && m.length > 0) return m
  return null
}

export function resolveTrialCampaignIdFromStripeSubscription(sub: Stripe.Subscription): string {
  const campaignFromMeta =
    typeof sub.metadata?.trial_campaign_id === 'string' ? sub.metadata.trial_campaign_id.trim() : ''
  return (
    campaignFromMeta ||
    getCoachPlatformSubscriptionTrialCampaignId() ||
    COACH_PLATFORM_TRIAL_CAMPAIGN_ID_FALLBACK
  )
}

/**
 * Enregistre la consommation d’essai à partir d’une souscription Stripe (idempotent).
 * À appeler depuis webhook et depuis la vérification post-Checkout (repli si webhook absent, ex. local).
 */
export async function syncCoachPlatformTrialConsumptionFromStripeSubscription(
  admin: SupabaseClient,
  sub: Stripe.Subscription
): Promise<void> {
  if (!subscriptionHadPlatformTrial(sub)) return
  const coachId = coachIdFromStripeSubscription(sub)
  if (!coachId) return
  await recordCoachPlatformTrialConsumption(admin, {
    coachId,
    trialCampaignId: resolveTrialCampaignIdFromStripeSubscription(sub),
    stripeSubscriptionId: sub.id,
  })
}

export type CoachPlatformTrialPresentation = {
  subscriptionTrialDays: number
  trialCampaignId: string | null
  trialEligible: boolean
}

export async function hasCoachConsumedPlatformTrialCampaign(
  supabase: SupabaseClient,
  coachId: string,
  trialCampaignId: string
): Promise<boolean | null> {
  const { data, error } = await supabase
    .from('coach_platform_trial_consumptions')
    .select('coach_id')
    .eq('coach_id', coachId)
    .eq('trial_campaign_id', trialCampaignId)
    .maybeSingle()

  if (error) {
    logger.error('hasCoachConsumedPlatformTrialCampaign failed', error, { coachId, trialCampaignId })
    return null
  }
  return data != null
}

export async function resolveCoachPlatformTrialPresentationForCoach(
  supabase: SupabaseClient,
  coachId: string,
  platformSub: CoachPlatformSubscription | null
): Promise<CoachPlatformTrialPresentation> {
  const subscriptionTrialDays = getCoachPlatformSubscriptionTrialDays()
  const trialCampaignId = getCoachPlatformSubscriptionTrialCampaignId()

  if (subscriptionTrialDays <= 0 || !trialCampaignId) {
    return { subscriptionTrialDays, trialCampaignId, trialEligible: false }
  }

  if (platformSub?.status === 'trialing') {
    return { subscriptionTrialDays, trialCampaignId, trialEligible: false }
  }

  const consumed = await hasCoachConsumedPlatformTrialCampaign(supabase, coachId, trialCampaignId)
  if (consumed === null) {
    return { subscriptionTrialDays, trialCampaignId, trialEligible: false }
  }

  return {
    subscriptionTrialDays,
    trialCampaignId,
    trialEligible: !consumed,
  }
}

export type RecordCoachPlatformTrialConsumptionParams = {
  coachId: string
  trialCampaignId: string
  stripeSubscriptionId: string | null
}

/** Enregistre une consommation d’essai (service role / webhook). Idempotent. */
export async function recordCoachPlatformTrialConsumption(
  admin: SupabaseClient,
  params: RecordCoachPlatformTrialConsumptionParams
): Promise<void> {
  const { coachId, trialCampaignId, stripeSubscriptionId } = params
  const { error } = await admin.from('coach_platform_trial_consumptions').upsert(
    {
      coach_id: coachId,
      trial_campaign_id: trialCampaignId,
      stripe_subscription_id: stripeSubscriptionId,
      consumed_at: new Date().toISOString(),
    },
    { onConflict: 'coach_id,trial_campaign_id', ignoreDuplicates: true }
  )
  if (error) {
    logger.error('recordCoachPlatformTrialConsumption failed', error, {
      coachId,
      trialCampaignId,
      stripeSubscriptionId,
    })
  }
}

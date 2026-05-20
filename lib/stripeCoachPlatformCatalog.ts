import type Stripe from 'stripe'
import { getCoachPlatformSubscriptionTrialDays } from '@/lib/coachPlatformSubscriptionTrial'
import { logger } from '@/lib/logger'
import { getStripeServer } from '@/lib/stripeServer'
import { getCoachPlatformAllowedPriceIds } from '@/lib/stripeCoachPlatformPriceIds'

export type CoachPlatformCatalogOffer = {
  priceId: string
  productName: string
  description: string | null
  /** Montant unitaire récurrent ou one-shot, en unité majeure (ex. euros) */
  unitAmountMajor: number | null
  currency: string
  interval: 'day' | 'week' | 'month' | 'year' | null
  intervalCount: number | null
}

function productNameFromPrice(price: Stripe.Price): string {
  const product = price.product
  if (product && typeof product === 'object' && !('deleted' in product && product.deleted)) {
    return product.name ?? price.nickname ?? price.id
  }
  return price.nickname ?? price.id
}

function productDescriptionFromPrice(price: Stripe.Price): string | null {
  const product = price.product
  if (product && typeof product === 'object' && 'description' in product && product.description) {
    return product.description
  }
  return null
}

export async function fetchCoachPlatformCatalogOffers(
  allowedPriceIds: string[]
): Promise<{ offers: CoachPlatformCatalogOffer[]; error: string | null }> {
  const stripe = getStripeServer()
  if (!stripe) {
    return { offers: [], error: 'stripe_unavailable' }
  }
  if (allowedPriceIds.length === 0) {
    return { offers: [], error: null }
  }

  const offers: CoachPlatformCatalogOffer[] = []

  for (const priceId of allowedPriceIds) {
    try {
      const price = await stripe.prices.retrieve(priceId, { expand: ['product'] })
      if (!price.active) {
        logger.warn('stripeCoachPlatformCatalog: price inactive skipped', { priceId })
        continue
      }
      const recurring = price.recurring
      offers.push({
        priceId: price.id,
        productName: productNameFromPrice(price),
        description: productDescriptionFromPrice(price),
        unitAmountMajor: price.unit_amount != null ? price.unit_amount / 100 : null,
        currency: (price.currency ?? 'eur').toUpperCase(),
        interval: recurring?.interval ?? null,
        intervalCount: recurring?.interval_count ?? null,
      })
    } catch (e) {
      logger.error(
        'stripeCoachPlatformCatalog: retrieve price failed',
        e instanceof Error ? e : undefined,
        { priceId }
      )
    }
  }

  return { offers, error: offers.length === 0 && allowedPriceIds.length > 0 ? 'catalog_load_failed' : null }
}

export async function loadCoachPlatformCatalogForEnv(): Promise<{
  offers: CoachPlatformCatalogOffer[]
  error: string | null
  /** Jours d’essai Checkout si > 0 (variable d’environnement). */
  subscriptionTrialDays: number
}> {
  const ids = getCoachPlatformAllowedPriceIds()
  const { offers, error } = await fetchCoachPlatformCatalogOffers(ids)
  return { offers, error, subscriptionTrialDays: getCoachPlatformSubscriptionTrialDays() }
}

/** Détails affichage carte « Mon abonnement » (un appel Stripe retrieve). */
export type CoachPlatformSubscriptionCardDetails = {
  planLabel: string | null
  unitAmountMajor: number | null
  currency: string
  interval: CoachPlatformCatalogOffer['interval']
  intervalCount: number | null
  /** Fin de période courante (ISO), aligné Stripe `current_period_end` — repli si BDD incomplète */
  currentPeriodEndIso: string | null
  /** Fin d’essai (ISO), depuis Stripe `trial_end` si présent */
  trialEndIso: string | null
}

export function coachPlatformPriceIntervalTranslationKey(
  interval: CoachPlatformCatalogOffer['interval'],
  intervalCount: number | null
): 'priceIntervalPerMonth' | 'priceIntervalEveryNMonths' | 'priceIntervalPerYear' | 'priceIntervalEveryNYears' | null {
  if (!interval) return null
  const count = intervalCount ?? 1
  if (interval === 'month') {
    return count === 1 ? 'priceIntervalPerMonth' : 'priceIntervalEveryNMonths'
  }
  if (interval === 'year') {
    return count === 1 ? 'priceIntervalPerYear' : 'priceIntervalEveryNYears'
  }
  return null
}

export async function fetchCoachPlatformSubscriptionCardDetails(
  subscriptionId: string | null | undefined
): Promise<CoachPlatformSubscriptionCardDetails | null> {
  if (!subscriptionId?.trim()) return null
  const stripe = getStripeServer()
  if (!stripe) return null
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    })
    const currentPeriodEndIso =
      typeof sub.current_period_end === 'number'
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null
    const trialEndIso =
      typeof sub.trial_end === 'number' ? new Date(sub.trial_end * 1000).toISOString() : null
    const items = sub.items?.data ?? []
    if (items.length > 1) {
      logger.warn('fetchCoachPlatformSubscriptionCardDetails: multiple line items, using first', {
        subscriptionId,
        count: items.length,
      })
    }
    const price = items[0]?.price
    if (!price) {
      return {
        planLabel: null,
        unitAmountMajor: null,
        currency: 'EUR',
        interval: null,
        intervalCount: null,
        currentPeriodEndIso,
        trialEndIso,
      }
    }
    const recurring = price.recurring
    const product = price.product
    let planLabel: string | null = null
    if (product && typeof product === 'object' && !('deleted' in product && product.deleted)) {
      planLabel = product.name ?? price.nickname ?? null
    } else {
      planLabel = price.nickname ?? null
    }
    return {
      planLabel,
      unitAmountMajor: price.unit_amount != null ? price.unit_amount / 100 : null,
      currency: (price.currency ?? 'eur').toUpperCase(),
      interval: recurring?.interval ?? null,
      intervalCount: recurring?.interval_count ?? null,
      currentPeriodEndIso,
      trialEndIso,
    }
  } catch (e) {
    logger.error(
      'fetchCoachPlatformSubscriptionCardDetails failed',
      e instanceof Error ? e : undefined,
      { subscriptionId }
    )
    return null
  }
}

export async function fetchCoachPlatformSubscriptionPlanLabel(
  subscriptionId: string | null | undefined
): Promise<string | null> {
  const details = await fetchCoachPlatformSubscriptionCardDetails(subscriptionId)
  return details?.planLabel ?? null
}

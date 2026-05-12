import type Stripe from 'stripe'
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
}> {
  const ids = getCoachPlatformAllowedPriceIds()
  return fetchCoachPlatformCatalogOffers(ids)
}

export async function fetchCoachPlatformSubscriptionPlanLabel(
  subscriptionId: string | null | undefined
): Promise<string | null> {
  if (!subscriptionId?.trim()) return null
  const stripe = getStripeServer()
  if (!stripe) return null
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ['items.data.price.product'],
    })
    const item = sub.items?.data?.[0]
    const price = item?.price
    if (!price) return null
    const product = price.product
    if (product && typeof product === 'object' && !('deleted' in product && product.deleted)) {
      return product.name ?? price.nickname ?? null
    }
    return price.nickname ?? null
  } catch (e) {
    logger.error(
      'fetchCoachPlatformSubscriptionPlanLabel failed',
      e instanceof Error ? e : undefined,
      { subscriptionId }
    )
    return null
  }
}

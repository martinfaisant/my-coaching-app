import type { CoachPlatformSubscription } from '@/types/database'
import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'

export type CoachPlatformBillingPeriod = 'monthly' | 'annual' | 'other'

export function resolveCoachPlatformBillingPeriod(
  interval: CoachPlatformCatalogOffer['interval'],
  intervalCount: number | null
): CoachPlatformBillingPeriod {
  if (interval === 'month') return 'monthly'
  if (interval === 'year') return 'annual'
  return 'other'
}

/** Abonnement géré : actif ou essai (y compris fin programmée). */
export function isCoachPlatformSubscriptionManaged(row: CoachPlatformSubscription | null): boolean {
  if (!row) return false
  return row.status === 'active' || row.status === 'trialing'
}

export function isCoachPlatformSubscriptionUnpaid(row: CoachPlatformSubscription | null): boolean {
  if (!row) return false
  return row.status === 'past_due' || row.status === 'unpaid'
}

/** Grille catalogue : visible seulement sans abo géré et sans impayé bloquant. */
export function shouldShowCoachPlatformOfferGrid(row: CoachPlatformSubscription | null): boolean {
  if (!row) return true
  if (isCoachPlatformSubscriptionUnpaid(row)) return false
  if (isCoachPlatformSubscriptionManaged(row)) return false
  return true
}

export function isCoachPlatformScheduledEnd(row: CoachPlatformSubscription | null): boolean {
  if (!row) return false
  return row.cancel_at_period_end === true && isCoachPlatformSubscriptionManaged(row)
}

/** Date de fin affichée (fin programmée ou fin de période / essai). */
export function resolveCoachPlatformAccessEndIso(
  row: CoachPlatformSubscription | null,
  fallbackPeriodEndIso: string | null
): string | null {
  if (row?.cancel_at) return row.cancel_at
  if (row?.cancel_at_period_end && fallbackPeriodEndIso) return fallbackPeriodEndIso
  return fallbackPeriodEndIso
}

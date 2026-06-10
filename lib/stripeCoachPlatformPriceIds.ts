/**
 * Liste des Price Stripe autorisés pour l’abonnement plateforme coach (whitelist env).
 */

export function getCoachPlatformAllowedPriceIds(): string[] {
  const raw = process.env.STRIPE_COACH_PLATFORM_PRICE_IDS?.trim()
  if (raw) {
    const ids = raw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
    if (ids.length > 0) return ids
  }
  const single = process.env.STRIPE_COACH_PLATFORM_PRICE_ID?.trim()
  return single ? [single] : []
}

import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'

export type CoachMsaOfferOverride = {
  title?: string
  description?: string | null
}

export type CoachMsaOfferDisplay = CoachPlatformCatalogOffer & {
  displayTitle: string
  displayDescription: string | null
}

function normalizeOverrides(raw: unknown): Record<string, CoachMsaOfferOverride> {
  if (!raw || typeof raw !== 'object') return {}
  const byPriceId = (raw as { byPriceId?: unknown }).byPriceId
  if (!byPriceId || typeof byPriceId !== 'object') return {}
  const out: Record<string, CoachMsaOfferOverride> = {}
  for (const [priceId, value] of Object.entries(byPriceId)) {
    if (!priceId.trim()) continue
    if (!value || typeof value !== 'object') continue
    const v = value as { title?: unknown; description?: unknown }
    const title = typeof v.title === 'string' ? v.title : undefined
    const description =
      v.description === null || v.description === undefined
        ? undefined
        : typeof v.description === 'string'
          ? v.description
          : undefined
    out[priceId] = { title, description }
  }
  return out
}

/** Lit les surcharges FR/EN depuis les messages (namespace coachMsaOffers.byPriceId). */
export function getCoachMsaOfferOverridesFromMessages(messages: unknown): Record<string, CoachMsaOfferOverride> {
  const root = messages as { coachMsaOffers?: { byPriceId?: unknown } } | null
  return normalizeOverrides(root?.coachMsaOffers)
}

export function enrichCoachPlatformOffersForDisplay(
  offers: CoachPlatformCatalogOffer[],
  overrides: Record<string, CoachMsaOfferOverride>
): CoachMsaOfferDisplay[] {
  return offers.map((offer) => {
    const o = overrides[offer.priceId]
    const displayTitle = o?.title?.trim() ? o.title.trim() : offer.productName
    let displayDescription: string | null = offer.description
    if (o && 'description' in o) {
      const d = o.description
      displayDescription = d != null && String(d).trim() ? String(d).trim() : null
    }
    return { ...offer, displayTitle, displayDescription }
  })
}

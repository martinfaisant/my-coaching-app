import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'

export type CoachMsaOfferOverride = {
  title?: string
  description?: string | null
  /** Sous-titre court sous le bloc prix (tuile offre) ; si absent, repli sur `description`. */
  tagline?: string | null
  /** Puces marketing (tuile offre), optionnel. */
  features?: string[]
}

export type CoachMsaOfferDisplay = CoachPlatformCatalogOffer & {
  displayTitle: string
  displayDescription: string | null
  displayTagline: string | null
  displayFeatures: string[]
}

function parseFeatures(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const out = raw.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((s) => s.trim())
  return out.length > 0 ? out : undefined
}

function normalizeOverrides(raw: unknown): Record<string, CoachMsaOfferOverride> {
  if (!raw || typeof raw !== 'object') return {}
  const byPriceId = (raw as { byPriceId?: unknown }).byPriceId
  if (!byPriceId || typeof byPriceId !== 'object') return {}
  const out: Record<string, CoachMsaOfferOverride> = {}
  for (const [priceId, value] of Object.entries(byPriceId)) {
    if (!priceId.trim()) continue
    if (!value || typeof value !== 'object') continue
    const v = value as { title?: unknown; description?: unknown; tagline?: unknown; features?: unknown }
    const title = typeof v.title === 'string' ? v.title : undefined
    const description =
      v.description === null || v.description === undefined
        ? undefined
        : typeof v.description === 'string'
          ? v.description
          : undefined
    const taglineParsed =
      v.tagline === null || v.tagline === undefined
        ? undefined
        : typeof v.tagline === 'string' && v.tagline.trim()
          ? v.tagline.trim()
          : undefined
    const features = parseFeatures(v.features)
    const entry: CoachMsaOfferOverride = { title, description }
    if (taglineParsed !== undefined) entry.tagline = taglineParsed
    if (features) entry.features = features
    out[priceId] = entry
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
    const displayTagline = o?.tagline?.trim() ? o.tagline.trim() : null
    const displayFeatures = o?.features && o.features.length > 0 ? [...o.features] : []
    return { ...offer, displayTitle, displayDescription, displayTagline, displayFeatures }
  })
}

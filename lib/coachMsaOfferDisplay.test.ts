import { describe, expect, it } from 'vitest'
import {
  enrichCoachPlatformOffersForDisplay,
  getCoachMsaOfferOverridesFromMessages,
} from '@/lib/coachMsaOfferDisplay'
import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'

const baseOffer = (overrides: Partial<CoachPlatformCatalogOffer> = {}): CoachPlatformCatalogOffer => ({
  priceId: 'price_test123',
  productName: 'Stripe Name',
  description: 'Stripe desc',
  unitAmountMajor: 10,
  currency: 'EUR',
  interval: 'month',
  intervalCount: 1,
  ...overrides,
})

describe('coachMsaOfferDisplay', () => {
  it('getCoachMsaOfferOverridesFromMessages reads nested byPriceId', () => {
    const messages = {
      coachMsaOffers: {
        byPriceId: {
          price_test123: { title: 'Titre FR', description: 'Desc FR' },
        },
      },
    }
    expect(getCoachMsaOfferOverridesFromMessages(messages)).toEqual({
      price_test123: { title: 'Titre FR', description: 'Desc FR' },
    })
  })

  it('enrichCoachPlatformOffersForDisplay prefers override title and description', () => {
    const offers = [baseOffer()]
    const overrides = { price_test123: { title: 'Custom', description: 'D' } }
    const [row] = enrichCoachPlatformOffersForDisplay(offers, overrides)
    expect(row.displayTitle).toBe('Custom')
    expect(row.displayDescription).toBe('D')
    expect(row.displayTagline).toBeNull()
    expect(row.displayFeatures).toEqual([])
  })

  it('enrich applies tagline and features overrides', () => {
    const offers = [baseOffer()]
    const overrides = {
      price_test123: {
        tagline: 'Tag court',
        features: ['Point A', 'Point B'],
      },
    }
    const [row] = enrichCoachPlatformOffersForDisplay(offers, overrides)
    expect(row.displayTagline).toBe('Tag court')
    expect(row.displayFeatures).toEqual(['Point A', 'Point B'])
  })

  it('enrich falls back to Stripe product name and description', () => {
    const offers = [baseOffer({ productName: 'P', description: 'S' })]
    const [row] = enrichCoachPlatformOffersForDisplay(offers, {})
    expect(row.displayTitle).toBe('P')
    expect(row.displayDescription).toBe('S')
    expect(row.displayTagline).toBeNull()
    expect(row.displayFeatures).toEqual([])
  })

  it('enrich clears description when override is empty string', () => {
    const offers = [baseOffer({ description: 'Stripe' })]
    const overrides = { price_test123: { title: 'T', description: '' } }
    const [row] = enrichCoachPlatformOffersForDisplay(offers, overrides)
    expect(row.displayDescription).toBeNull()
    expect(row.displayTagline).toBeNull()
    expect(row.displayFeatures).toEqual([])
  })
})

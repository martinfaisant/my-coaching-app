import { describe, expect, it } from 'vitest'
import { getPublicHeaderPageTitleI18n } from './publicHeaderPageTitle'

describe('getPublicHeaderPageTitleI18n', () => {
  it('maps known public routes', () => {
    expect(getPublicHeaderPageTitleI18n('/')).toEqual({
      namespace: 'coachPricingPublic',
      key: 'navHome',
    })
    expect(getPublicHeaderPageTitleI18n('/pricing')).toEqual({
      namespace: 'coachPricingPublic',
      key: 'navPricing',
    })
    expect(getPublicHeaderPageTitleI18n('/coaches')).toEqual({
      namespace: 'coachPricingPublic',
      key: 'navFindCoach',
    })
    expect(getPublicHeaderPageTitleI18n('/contact')).toEqual({
      namespace: 'metadata',
      key: 'contactTitle',
    })
    expect(getPublicHeaderPageTitleI18n('/terms')).toEqual({
      namespace: 'metadata',
      key: 'termsTitle',
    })
    expect(getPublicHeaderPageTitleI18n('/privacy')).toEqual({
      namespace: 'metadata',
      key: 'privacyTitle',
    })
    expect(getPublicHeaderPageTitleI18n('/faq/athlete')).toEqual({
      namespace: 'metadata',
      key: 'faqAthleteTitle',
    })
    expect(getPublicHeaderPageTitleI18n('/faq/coach')).toEqual({
      namespace: 'metadata',
      key: 'faqCoachTitle',
    })
    expect(getPublicHeaderPageTitleI18n('/reset-password')).toEqual({
      namespace: 'auth',
      key: 'resetPassword',
    })
  })

  it('falls back to home for unknown paths', () => {
    expect(getPublicHeaderPageTitleI18n('/unknown')).toEqual({
      namespace: 'coachPricingPublic',
      key: 'navHome',
    })
  })
})

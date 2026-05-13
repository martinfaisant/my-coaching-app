import { describe, expect, it } from 'vitest'
import {
  appLocaleToStripeCheckoutLocale,
  appLocaleToStripePreferredLocales,
  formatCoachPlatformStripeCustomerName,
} from './stripeCoachPlatformCustomer'

describe('appLocaleToStripePreferredLocales', () => {
  it('maps fr variants to fr', () => {
    expect(appLocaleToStripePreferredLocales('fr')).toEqual(['fr'])
    expect(appLocaleToStripePreferredLocales('FR')).toEqual(['fr'])
    expect(appLocaleToStripePreferredLocales(' fr ')).toEqual(['fr'])
  })

  it('defaults unknown locales to en', () => {
    expect(appLocaleToStripePreferredLocales('en')).toEqual(['en'])
    expect(appLocaleToStripePreferredLocales('de')).toEqual(['en'])
  })
})

describe('appLocaleToStripeCheckoutLocale', () => {
  it('maps fr to fr', () => {
    expect(appLocaleToStripeCheckoutLocale('fr')).toBe('fr')
  })

  it('maps other locales to en', () => {
    expect(appLocaleToStripeCheckoutLocale('en')).toBe('en')
    expect(appLocaleToStripeCheckoutLocale('es')).toBe('en')
  })
})

describe('formatCoachPlatformStripeCustomerName', () => {
  it('joins first and last with a space', () => {
    expect(formatCoachPlatformStripeCustomerName('Jean', 'Dupont')).toBe('Jean Dupont')
  })

  it('trims segments and drops empties', () => {
    expect(formatCoachPlatformStripeCustomerName('  Marie  ', null)).toBe('Marie')
    expect(formatCoachPlatformStripeCustomerName(undefined, '  Martin ')).toBe('Martin')
  })

  it('returns empty when both missing', () => {
    expect(formatCoachPlatformStripeCustomerName(null, '')).toBe('')
  })
})

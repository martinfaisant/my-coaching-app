import { describe, expect, it } from 'vitest'
import {
  appLocaleToStripeCheckoutLocale,
  appLocaleToStripePreferredLocales,
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

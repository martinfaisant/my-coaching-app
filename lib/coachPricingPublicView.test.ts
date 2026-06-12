import { describe, expect, it } from 'vitest'
import {
  resolveCoachPricingPublicView,
  shouldShowCoachPricingPublicFinalSignupCta,
  shouldShowCoachPricingPublicManageBanner,
  shouldShowCoachPricingPublicOfferGrid,
} from '@/lib/coachPricingPublicView'
import type { CoachPlatformSubscription } from '@/types/database'

const base: CoachPlatformSubscription = {
  coach_id: 'c1',
  stripe_customer_id: 'cus',
  stripe_subscription_id: 'sub',
  status: 'active',
  current_period_end: null,
  cancel_at_period_end: false,
  cancel_at: null,
  updated_at: new Date().toISOString(),
}

describe('coachPricingPublicView', () => {
  it('resolves visitor when no profile', () => {
    expect(resolveCoachPricingPublicView(null, null)).toBe('visitor')
    expect(resolveCoachPricingPublicView(undefined, null)).toBe('visitor')
  })

  it('resolves coach without managed or unpaid subscription', () => {
    expect(resolveCoachPricingPublicView({ role: 'coach' }, null)).toBe('coach_no_sub')
    expect(resolveCoachPricingPublicView({ role: 'coach' }, { ...base, status: 'canceled' })).toBe(
      'coach_no_sub'
    )
  })

  it('resolves coach with managed subscription', () => {
    expect(resolveCoachPricingPublicView({ role: 'coach' }, { ...base, status: 'active' })).toBe(
      'coach_has_subscription'
    )
    expect(resolveCoachPricingPublicView({ role: 'coach' }, { ...base, status: 'trialing' })).toBe(
      'coach_has_subscription'
    )
  })

  it('resolves coach with unpaid subscription as has_subscription', () => {
    expect(resolveCoachPricingPublicView({ role: 'coach' }, { ...base, status: 'past_due' })).toBe(
      'coach_has_subscription'
    )
    expect(resolveCoachPricingPublicView({ role: 'coach' }, { ...base, status: 'unpaid' })).toBe(
      'coach_has_subscription'
    )
  })

  it('resolves athlete and admin as other_authenticated', () => {
    expect(resolveCoachPricingPublicView({ role: 'athlete' }, null)).toBe('other_authenticated')
    expect(resolveCoachPricingPublicView({ role: 'admin' }, null)).toBe('other_authenticated')
  })

  it('controls offer grid visibility', () => {
    expect(shouldShowCoachPricingPublicOfferGrid('visitor')).toBe(true)
    expect(shouldShowCoachPricingPublicOfferGrid('coach_no_sub')).toBe(true)
    expect(shouldShowCoachPricingPublicOfferGrid('other_authenticated')).toBe(true)
    expect(shouldShowCoachPricingPublicOfferGrid('coach_has_subscription')).toBe(false)
  })

  it('controls manage banner and final signup CTA', () => {
    expect(shouldShowCoachPricingPublicManageBanner('coach_has_subscription')).toBe(true)
    expect(shouldShowCoachPricingPublicManageBanner('visitor')).toBe(false)
    expect(shouldShowCoachPricingPublicFinalSignupCta('visitor')).toBe(true)
    expect(shouldShowCoachPricingPublicFinalSignupCta('coach_no_sub')).toBe(false)
  })
})

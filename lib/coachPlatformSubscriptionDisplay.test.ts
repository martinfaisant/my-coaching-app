import { describe, expect, it } from 'vitest'
import {
  isCoachPlatformScheduledEnd,
  isCoachPlatformSubscriptionManaged,
  isCoachPlatformSubscriptionUnpaid,
  shouldShowCoachPlatformOfferGrid,
} from '@/lib/coachPlatformSubscriptionDisplay'
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

describe('coachPlatformSubscriptionDisplay', () => {
  it('hides offer grid when subscription is managed', () => {
    expect(shouldShowCoachPlatformOfferGrid({ ...base, status: 'active' })).toBe(false)
    expect(shouldShowCoachPlatformOfferGrid({ ...base, status: 'trialing' })).toBe(false)
  })

  it('hides offer grid when unpaid', () => {
    expect(shouldShowCoachPlatformOfferGrid({ ...base, status: 'past_due' })).toBe(false)
  })

  it('shows offer grid when canceled', () => {
    expect(shouldShowCoachPlatformOfferGrid({ ...base, status: 'canceled' })).toBe(true)
  })

  it('detects scheduled end', () => {
    expect(
      isCoachPlatformScheduledEnd({ ...base, cancel_at_period_end: true, status: 'active' })
    ).toBe(true)
    expect(isCoachPlatformScheduledEnd({ ...base, cancel_at_period_end: false })).toBe(false)
  })

  it('classifies unpaid and managed', () => {
    expect(isCoachPlatformSubscriptionUnpaid({ ...base, status: 'unpaid' })).toBe(true)
    expect(isCoachPlatformSubscriptionManaged({ ...base, status: 'active' })).toBe(true)
    expect(isCoachPlatformSubscriptionManaged({ ...base, status: 'canceled' })).toBe(false)
  })
})

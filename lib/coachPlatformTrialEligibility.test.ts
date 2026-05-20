import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import type { CoachPlatformSubscription } from '@/types/database'
import {
  resolveCoachPlatformTrialPresentationForCoach,
  subscriptionHadPlatformTrial,
} from '@/lib/coachPlatformTrialEligibility'

vi.mock('@/lib/coachPlatformSubscriptionTrial', () => ({
  getCoachPlatformSubscriptionTrialDays: vi.fn(),
  getCoachPlatformSubscriptionTrialCampaignId: vi.fn(),
}))

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}))

import {
  getCoachPlatformSubscriptionTrialCampaignId,
  getCoachPlatformSubscriptionTrialDays,
} from '@/lib/coachPlatformSubscriptionTrial'

function mockSupabase(consumed: boolean | null) {
  const maybeSingle = vi.fn().mockResolvedValue(
    consumed === null
      ? { data: null, error: { message: 'db error' } }
      : { data: consumed ? { coach_id: 'c1' } : null, error: null }
  )
  const eqSecond = vi.fn().mockReturnValue({ maybeSingle })
  const eqFirst = vi.fn().mockReturnValue({ eq: eqSecond })
  const select = vi.fn().mockReturnValue({ eq: eqFirst })
  return { from: vi.fn().mockReturnValue({ select }) } as unknown as Parameters<
    typeof resolveCoachPlatformTrialPresentationForCoach
  >[0]
}

describe('subscriptionHadPlatformTrial', () => {
  it('returns true when status is trialing', () => {
    expect(subscriptionHadPlatformTrial({ status: 'trialing', trial_end: null })).toBe(true)
  })

  it('returns true when trial_end is set even if canceled', () => {
    expect(
      subscriptionHadPlatformTrial({ status: 'canceled', trial_end: Math.floor(Date.now() / 1000) })
    ).toBe(true)
  })

  it('returns false when no trial', () => {
    expect(subscriptionHadPlatformTrial({ status: 'active', trial_end: null })).toBe(false)
  })
})

describe('resolveCoachPlatformTrialPresentationForCoach', () => {
  beforeEach(() => {
    vi.mocked(getCoachPlatformSubscriptionTrialDays).mockReturnValue(90)
    vi.mocked(getCoachPlatformSubscriptionTrialCampaignId).mockReturnValue('launch-2026-v1')
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns not eligible when trial days is 0', async () => {
    vi.mocked(getCoachPlatformSubscriptionTrialDays).mockReturnValue(0)
    vi.mocked(getCoachPlatformSubscriptionTrialCampaignId).mockReturnValue(null)

    const result = await resolveCoachPlatformTrialPresentationForCoach(
      mockSupabase(false),
      'c1',
      null
    )

    expect(result.trialEligible).toBe(false)
    expect(result.subscriptionTrialDays).toBe(0)
  })

  it('returns not eligible when coach is currently trialing', async () => {
    const sub: CoachPlatformSubscription = {
      coach_id: 'c1',
      stripe_customer_id: 'cus_1',
      stripe_subscription_id: 'sub_1',
      status: 'trialing',
      current_period_end: null,
      updated_at: new Date().toISOString(),
    }

    const result = await resolveCoachPlatformTrialPresentationForCoach(mockSupabase(false), 'c1', sub)

    expect(result.trialEligible).toBe(false)
  })

  it('returns eligible when campaign active and no consumption row', async () => {
    const result = await resolveCoachPlatformTrialPresentationForCoach(
      mockSupabase(false),
      'c1',
      null
    )

    expect(result.trialEligible).toBe(true)
    expect(result.trialCampaignId).toBe('launch-2026-v1')
    expect(result.subscriptionTrialDays).toBe(90)
  })

  it('returns not eligible when consumption exists', async () => {
    const result = await resolveCoachPlatformTrialPresentationForCoach(
      mockSupabase(true),
      'c1',
      null
    )

    expect(result.trialEligible).toBe(false)
  })

  it('returns not eligible on db error (prudent fallback)', async () => {
    const result = await resolveCoachPlatformTrialPresentationForCoach(
      mockSupabase(null),
      'c1',
      null
    )

    expect(result.trialEligible).toBe(false)
  })
})

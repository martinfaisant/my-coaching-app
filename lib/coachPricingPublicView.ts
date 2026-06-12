import {
  isCoachPlatformSubscriptionManaged,
  isCoachPlatformSubscriptionUnpaid,
} from '@/lib/coachPlatformSubscriptionDisplay'
import type { CoachPlatformSubscription, Profile } from '@/types/database'

export type CoachPricingPublicViewMode =
  | 'visitor'
  | 'coach_no_sub'
  | 'coach_has_subscription'
  | 'other_authenticated'

export function resolveCoachPricingPublicView(
  profile: Pick<Profile, 'role'> | null | undefined,
  platformRow: CoachPlatformSubscription | null
): CoachPricingPublicViewMode {
  if (!profile) return 'visitor'

  if (profile.role === 'coach') {
    if (
      isCoachPlatformSubscriptionManaged(platformRow) ||
      isCoachPlatformSubscriptionUnpaid(platformRow)
    ) {
      return 'coach_has_subscription'
    }
    return 'coach_no_sub'
  }

  return 'other_authenticated'
}

export function shouldShowCoachPricingPublicOfferGrid(mode: CoachPricingPublicViewMode): boolean {
  return mode === 'visitor' || mode === 'coach_no_sub' || mode === 'other_authenticated'
}

export function shouldShowCoachPricingPublicFinalSignupCta(mode: CoachPricingPublicViewMode): boolean {
  return mode === 'visitor'
}

export function shouldShowCoachPricingPublicManageBanner(mode: CoachPricingPublicViewMode): boolean {
  return mode === 'coach_has_subscription'
}

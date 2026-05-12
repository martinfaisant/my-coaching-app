import { describe, expect, it } from 'vitest'
import {
  COACH_PLATFORM_SUBSCRIPTION_PATH,
  resolveCoachPlatformCheckoutReturnPath,
  sanitizeCoachPlatformCheckoutReturnPath,
} from '@/lib/coachPlatformCheckoutReturnPath'

describe('coachPlatformCheckoutReturnPath', () => {
  it('accepts athletes list', () => {
    expect(sanitizeCoachPlatformCheckoutReturnPath('/dashboard/athletes')).toBe('/dashboard/athletes')
  })

  it('accepts coach platform subscription path', () => {
    expect(sanitizeCoachPlatformCheckoutReturnPath(COACH_PLATFORM_SUBSCRIPTION_PATH)).toBe(
      COACH_PLATFORM_SUBSCRIPTION_PATH
    )
  })

  it('accepts athlete detail uuid', () => {
    expect(
      sanitizeCoachPlatformCheckoutReturnPath(
        '/dashboard/athletes/11111111-1111-4111-8111-111111111111'
      )
    ).toBe('/dashboard/athletes/11111111-1111-4111-8111-111111111111')
  })

  it('rejects nested paths and invalid uuid', () => {
    expect(sanitizeCoachPlatformCheckoutReturnPath('/dashboard/athletes/x/y')).toBeNull()
    expect(sanitizeCoachPlatformCheckoutReturnPath('/dashboard/athletes/not-a-uuid')).toBeNull()
    expect(sanitizeCoachPlatformCheckoutReturnPath('https://evil.com')).toBeNull()
  })

  it('resolve falls back to athletes', () => {
    expect(resolveCoachPlatformCheckoutReturnPath(null)).toBe('/dashboard/athletes')
    expect(resolveCoachPlatformCheckoutReturnPath('/dashboard/profile')).toBe('/dashboard/athletes')
  })
})

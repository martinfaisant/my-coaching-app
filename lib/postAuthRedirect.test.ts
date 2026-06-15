import { describe, expect, it } from 'vitest'
import { buildFindCoachDeepLink, isFindCoachDeepLinkRedirect, validatePostAuthRedirect } from '@/lib/postAuthRedirect'

describe('postAuthRedirect', () => {
  it('accepts dashboard paths only', () => {
    expect(validatePostAuthRedirect('/dashboard/find-coach?coach=a&offer=b')).toBe(
      '/dashboard/find-coach?coach=a&offer=b'
    )
    expect(validatePostAuthRedirect('/en/dashboard/find-coach?coach=a')).toBe(
      '/en/dashboard/find-coach?coach=a'
    )
    expect(validatePostAuthRedirect('https://evil.com/dashboard')).toBeNull()
    expect(validatePostAuthRedirect('/login')).toBeNull()
  })

  it('builds localized find-coach deep link', () => {
    expect(buildFindCoachDeepLink('fr', 'coach-1', 'offer-1')).toBe(
      '/dashboard/find-coach?coach=coach-1&offer=offer-1'
    )
    expect(buildFindCoachDeepLink('en', 'coach-1', 'offer-1')).toBe(
      '/en/dashboard/find-coach?coach=coach-1&offer=offer-1'
    )
  })

  it('detects find-coach deep link redirects', () => {
    expect(isFindCoachDeepLinkRedirect('/dashboard/find-coach?coach=a&offer=b')).toBe(true)
    expect(isFindCoachDeepLinkRedirect('/en/dashboard/find-coach?coach=a')).toBe(true)
    expect(isFindCoachDeepLinkRedirect('/dashboard/calendar')).toBe(false)
    expect(isFindCoachDeepLinkRedirect('/login')).toBe(false)
    expect(isFindCoachDeepLinkRedirect(null)).toBe(false)
  })
})

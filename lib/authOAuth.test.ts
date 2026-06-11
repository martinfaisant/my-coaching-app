import { describe, expect, it } from 'vitest'
import type { User } from '@supabase/supabase-js'
import {
  extractEmailFromOAuthError,
  hasGoogleIdentity,
  normalizeAppLocale,
  resolveOAuthCallbackFailure,
  resolveOAuthCallbackUrl,
  shouldOfferAccountLink,
} from '@/lib/authOAuth'

describe('authOAuth helpers', () => {
  it('normalizeAppLocale returns en only for en', () => {
    expect(normalizeAppLocale('en')).toBe('en')
    expect(normalizeAppLocale('fr')).toBe('fr')
    expect(normalizeAppLocale(undefined)).toBe('fr')
  })

  it('shouldOfferAccountLink detects duplicate account errors', () => {
    expect(shouldOfferAccountLink('user_already_exists', null)).toBe(true)
    expect(shouldOfferAccountLink(null, 'User already registered')).toBe(true)
    expect(shouldOfferAccountLink('access_denied', null)).toBe(false)
  })

  it('extractEmailFromOAuthError parses email when present', () => {
    expect(
      extractEmailFromOAuthError('Account exists for user@example.com already')
    ).toBe('user@example.com')
    expect(extractEmailFromOAuthError('no email here')).toBeUndefined()
  })

  it('resolveOAuthCallbackFailure maps cancellation to login error', () => {
    const result = resolveOAuthCallbackFailure('fr', 'access_denied', null)
    expect(result.kind).toBe('login_error')
    expect(result.path).toContain('oauth_cancelled')
  })

  it('hasGoogleIdentity detects google via app_metadata when identities are empty', () => {
    const user = {
      identities: [],
      app_metadata: { provider: 'google', providers: ['google'] },
    } as unknown as User

    expect(hasGoogleIdentity(user)).toBe(true)
  })

  it('resolveOAuthCallbackUrl uses request host for mysportally apex vs www', () => {
    const headers = new Headers({
      host: 'www.mysportally.com',
      'x-forwarded-proto': 'https',
    })

    process.env.NEXT_PUBLIC_SITE_URL = 'https://mysportally.com'

    expect(resolveOAuthCallbackUrl(headers)).toBe('https://www.mysportally.com/auth/callback')
  })

  it('resolveOAuthCallbackFailure maps duplicate to link account', () => {
    const result = resolveOAuthCallbackFailure(
      'en',
      'user_already_exists',
      'Email user@example.com already registered'
    )
    expect(result.kind).toBe('link_account')
    if (result.kind === 'link_account') {
      expect(result.path).toContain('/en/auth/link-account')
      expect(result.email).toBe('user@example.com')
    }
  })
})

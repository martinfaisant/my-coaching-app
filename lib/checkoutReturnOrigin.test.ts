import { describe, expect, it, afterEach } from 'vitest'
import { resolveStripeCheckoutReturnBaseUrl } from './checkoutReturnOrigin'

describe('resolveStripeCheckoutReturnBaseUrl', () => {
  const originalSite = process.env.NEXT_PUBLIC_SITE_URL
  const originalApp = process.env.NEXT_PUBLIC_APP_URL

  afterEach(() => {
    if (originalSite === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = originalSite
    if (originalApp === undefined) delete process.env.NEXT_PUBLIC_APP_URL
    else process.env.NEXT_PUBLIC_APP_URL = originalApp
  })

  it('uses request host for *.vercel.app when env is production', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://prod.example.com'
    const h = new Headers({
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'my-app-git-preview-abc.vercel.app',
    })
    expect(resolveStripeCheckoutReturnBaseUrl(h, 'https://prod.example.com')).toBe(
      'https://my-app-git-preview-abc.vercel.app'
    )
  })

  it('falls back to env when host is not allowed', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://prod.example.com'
    const h = new Headers({
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'evil.example.net',
    })
    expect(resolveStripeCheckoutReturnBaseUrl(h, 'https://prod.example.com')).toBe('https://prod.example.com')
  })

  it('allows localhost with port', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://prod.example.com'
    const h = new Headers({
      'x-forwarded-proto': 'http',
      host: 'localhost:3000',
    })
    expect(resolveStripeCheckoutReturnBaseUrl(h, 'https://prod.example.com')).toBe('http://localhost:3000')
  })

  it('allows host matching configured SITE_URL hostname', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mysite.com'
    const h = new Headers({
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'mysite.com',
    })
    expect(resolveStripeCheckoutReturnBaseUrl(h, 'https://mysite.com')).toBe('https://mysite.com')
  })

  it('allows www vs apex when env has apex', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mysite.com'
    const h = new Headers({
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'www.mysite.com',
    })
    expect(resolveStripeCheckoutReturnBaseUrl(h, 'https://mysite.com')).toBe('https://www.mysite.com')
  })
})

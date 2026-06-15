import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { buildPublicSitemapEntries, SEO_PUBLIC_PATHS } from '@/lib/seoPublicRoutes'

describe('seoPublicRoutes', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mysportally.com'
  })

  afterEach(() => {
    if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  })

  it('lists all public paths in FR and EN', () => {
    const entries = buildPublicSitemapEntries(new Date('2026-06-14'))
    expect(entries).toHaveLength(SEO_PUBLIC_PATHS.length * 2)
  })

  it('uses apex domain and hreflang alternates', () => {
    const entries = buildPublicSitemapEntries()
    const homeFr = entries.find((e) => e.url === 'https://mysportally.com/')
    const homeEn = entries.find((e) => e.url === 'https://mysportally.com/en')

    expect(homeFr?.alternates?.languages).toEqual({
      fr: 'https://mysportally.com/',
      en: 'https://mysportally.com/en',
      'x-default': 'https://mysportally.com/',
    })
    expect(homeEn?.alternates?.languages?.en).toBe('https://mysportally.com/en')
    expect(homeFr?.priority).toBe(1)
    expect(entries.find((e) => e.url === 'https://mysportally.com/pricing')?.priority).toBe(0.8)
    expect(entries.find((e) => e.url === 'https://mysportally.com/coaches')?.priority).toBe(0.9)
    expect(entries.find((e) => e.url === 'https://mysportally.com/en/coaches')?.priority).toBe(0.9)
  })
})

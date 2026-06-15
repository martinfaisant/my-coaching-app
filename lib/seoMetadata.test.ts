import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import {
  buildPublicPageAlternates,
  buildPublicPageMetadata,
  getCanonicalPublicPageUrl,
} from '@/lib/seoMetadata'

describe('seoMetadata', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mysportally.com'
  })

  afterEach(() => {
    if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  })

  it('builds canonical and hreflang for FR home', () => {
    expect(buildPublicPageAlternates('fr', '/')).toEqual({
      canonical: 'https://mysportally.com/',
      languages: {
        fr: 'https://mysportally.com/',
        en: 'https://mysportally.com/en',
        'x-default': 'https://mysportally.com/',
      },
    })
  })

  it('builds canonical for EN pricing', () => {
    expect(getCanonicalPublicPageUrl('en', '/pricing')).toBe(
      'https://mysportally.com/en/pricing'
    )
  })

  it('buildPublicPageMetadata includes title, description and alternates', () => {
    const metadata = buildPublicPageMetadata({
      locale: 'fr',
      path: '/contact',
      title: 'Contact',
      description: 'Contactez-nous',
    })

    expect(metadata.title).toBe('Contact')
    expect(metadata.description).toBe('Contactez-nous')
    expect(metadata.alternates?.canonical).toBe('https://mysportally.com/contact')
    expect(metadata.openGraph?.url).toBe('https://mysportally.com/contact')
  })
})

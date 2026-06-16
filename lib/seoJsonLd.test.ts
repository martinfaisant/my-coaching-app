import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { buildHomeJsonLdGraph } from '@/lib/seoJsonLd'

describe('seoJsonLd', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mysportally.com'
  })

  afterEach(() => {
    if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  })

  it('builds Organization + WebSite graph for home', () => {
    const json = buildHomeJsonLdGraph()
    const parsed = JSON.parse(json) as {
      '@graph': Array<{ '@type': string; name?: string; url?: string; logo?: string; inLanguage?: string[] }>
    }

    expect(parsed['@graph']).toHaveLength(2)

    const organization = parsed['@graph'].find((node) => node['@type'] === 'Organization')
    const website = parsed['@graph'].find((node) => node['@type'] === 'WebSite')

    expect(organization).toMatchObject({
      name: 'My Sport Ally',
      url: 'https://mysportally.com',
      logo: 'https://mysportally.com/logo.png',
      sameAs: [
        'https://www.linkedin.com/company/mysportally',
        'https://www.facebook.com/people/My-Sport-Ally/61591055243808/',
      ],
    })

    expect(website).toMatchObject({
      name: 'My Sport Ally',
      url: 'https://mysportally.com',
      inLanguage: ['fr', 'en'],
    })
  })
})

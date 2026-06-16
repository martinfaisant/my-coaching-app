import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { buildLlmsTxtContent } from '@/lib/llmsTxt'
import { SEO_PUBLIC_PATHS } from '@/lib/seoPublicRoutes'

describe('llmsTxt', () => {
  const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mysportally.com'
  })

  afterEach(() => {
    if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  })

  it('lists all SEO_PUBLIC_PATHS in FR and EN sections', () => {
    const content = buildLlmsTxtContent()

    for (const path of SEO_PUBLIC_PATHS) {
      if (path === '/') {
        expect(content).toContain('- https://mysportally.com/')
        expect(content).toContain('- https://mysportally.com/en')
      } else {
        expect(content).toContain(`- https://mysportally.com${path}`)
        expect(content).toContain(`- https://mysportally.com/en${path}`)
      }
    }

    expect(content).toContain('Sitemap: https://mysportally.com/sitemap.xml')
    expect(content).toContain('## Social')
    expect(content).toContain('- LinkedIn: https://www.linkedin.com/company/mysportally')
    expect(content).toContain('- Facebook: https://www.facebook.com/people/My-Sport-Ally/61591055243808/')
  })
})

import { describe, expect, it } from 'vitest'
import {
  FAQ_ATHLETE_ITEM_KEYS,
  FAQ_COACH_ITEM_KEYS,
  FAQ_PUBLIC_SPORT_COUNT,
  buildFaqPageJsonLd,
  getCrossFaqPath,
  getFaqSeoPath,
} from './faqPublicConfig'

describe('faqPublicConfig', () => {
  it('exposes sport count from persisted registry', () => {
    expect(FAQ_PUBLIC_SPORT_COUNT).toBe(16)
  })

  it('maps audience to seo paths', () => {
    expect(getFaqSeoPath('athlete')).toBe('/faq/athlete')
    expect(getFaqSeoPath('coach')).toBe('/faq/coach')
  })

  it('maps cross faq paths', () => {
    expect(getCrossFaqPath('athlete')).toBe('/faq/coach')
    expect(getCrossFaqPath('coach')).toBe('/faq/athlete')
  })

  it('defines non-empty faq key lists', () => {
    expect(FAQ_ATHLETE_ITEM_KEYS.length).toBeGreaterThan(0)
    expect(FAQ_COACH_ITEM_KEYS.length).toBeGreaterThan(0)
  })

  it('builds FAQPage JSON-LD', () => {
    const originalSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
    process.env.NEXT_PUBLIC_SITE_URL = 'https://mysportally.com'

    const json = buildFaqPageJsonLd({
      locale: 'fr',
      path: '/faq/athlete',
      items: [
        { question: 'Q1', answer: 'A1' },
        { question: 'Q2', answer: 'A2' },
      ],
    })

    const parsed = JSON.parse(json) as {
      '@type': string
      mainEntity: Array<{ name: string; acceptedAnswer: { text: string } }>
      url: string
    }

    expect(parsed['@type']).toBe('FAQPage')
    expect(parsed.mainEntity).toHaveLength(2)
    expect(parsed.mainEntity[0]?.name).toBe('Q1')
    expect(parsed.url).toBe('https://mysportally.com/faq/athlete')

    if (originalSiteUrl === undefined) delete process.env.NEXT_PUBLIC_SITE_URL
    else process.env.NEXT_PUBLIC_SITE_URL = originalSiteUrl
  })
})

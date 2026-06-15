import type { SeoPublicPath } from '@/lib/seoPublicRoutes'
import { PERSISTED_WORKOUT_SPORT_TYPES } from '@/lib/sportsRegistry'
import { getCanonicalPublicPageUrl } from '@/lib/seoMetadata'

export const FAQ_ATHLETE_ITEM_KEYS = [
  'platformFree',
  'availableSports',
  'whyCoach',
  'injuryPrevention',
  'withoutCoach',
  'features',
  'findCoach',
  'bilingual',
] as const

export const FAQ_COACH_ITEM_KEYS = [
  'payOnSignup',
  'vsCoachOffers',
  'includedFeatures',
  'coachableSports',
  'whyPlatform',
  'athleteDiscovery',
  'unlimitedAthletes',
] as const

export type FaqAthleteItemKey = (typeof FAQ_ATHLETE_ITEM_KEYS)[number]
export type FaqCoachItemKey = (typeof FAQ_COACH_ITEM_KEYS)[number]

export const FAQ_SPORTS_ITEM_KEYS = new Set<FaqAthleteItemKey | FaqCoachItemKey>([
  'availableSports',
  'coachableSports',
])

export const FAQ_PUBLIC_SPORT_COUNT = PERSISTED_WORKOUT_SPORT_TYPES.length

export type FaqAudience = 'athlete' | 'coach'

export function getFaqSeoPath(audience: FaqAudience): SeoPublicPath {
  return audience === 'athlete' ? '/faq/athlete' : '/faq/coach'
}

export function getCrossFaqPath(audience: FaqAudience): '/faq/athlete' | '/faq/coach' {
  return audience === 'athlete' ? '/faq/coach' : '/faq/athlete'
}

export type FaqJsonLdItem = {
  question: string
  answer: string
}

type BuildFaqPageJsonLdInput = {
  locale: string
  path: SeoPublicPath
  items: FaqJsonLdItem[]
}

/** Schéma FAQPage pour le référencement (texte brut uniquement). */
export function buildFaqPageJsonLd({ locale, path, items }: BuildFaqPageJsonLdInput): string {
  const pageUrl = getCanonicalPublicPageUrl(locale, path)

  const payload = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    url: pageUrl,
  }

  return JSON.stringify(payload)
}

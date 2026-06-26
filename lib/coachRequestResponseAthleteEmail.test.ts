import { describe, expect, it, vi } from 'vitest'
import fr from '@/messages/fr.json'
import en from '@/messages/en.json'

function getNested(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

function createTranslator(locale: 'fr' | 'en', namespace: string) {
  const messages = locale === 'en' ? en : fr
  const nsMessages = getNested(messages as Record<string, unknown>, namespace) as Record<
    string,
    string
  >
  return (key: string, values?: Record<string, string>) => {
    let text = nsMessages[key] ?? key
    if (values) {
      for (const [k, v] of Object.entries(values)) {
        text = text.replaceAll(`{${k}}`, v)
      }
    }
    return text
  }
}

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async ({ locale, namespace }: { locale: string; namespace: string }) => {
    return createTranslator(locale === 'en' ? 'en' : 'fr', namespace)
  }),
}))

import {
  buildCoachRequestResponseAthleteEmailHtml,
  type CoachRequestResponseAthleteEmailInput,
} from '@/lib/coachRequestResponseAthleteEmail'

const baseInput: CoachRequestResponseAthleteEmailInput = {
  outcome: 'accepted',
  athleteEmail: 'athlete@example.com',
  athleteFirstName: 'Thomas',
  athletePreferredLocale: 'fr',
  coachDisplayName: 'Marie Dupont',
  sportPracticed: 'course,velo',
  frozenOffer: {
    frozen_title: 'Suivi mensuel',
    frozen_title_fr: 'Suivi mensuel',
    frozen_title_en: 'Monthly coaching',
  },
  respondedAt: new Date('2026-06-25T12:00:00.000Z'),
}

describe('buildCoachRequestResponseAthleteEmailHtml', () => {
  it('accepted: includes sports summary and coach CTA path', async () => {
    const { html, subject, locale } = await buildCoachRequestResponseAthleteEmailHtml(baseInput)
    expect(locale).toBe('fr')
    expect(subject).toContain('Marie Dupont')
    expect(html).toContain('Demande acceptée')
    expect(html).toContain('/logo.png')
    expect(html).toContain('Sports')
    expect(html).toContain('/dashboard/coach')
    expect(html).not.toContain("Parcourez l'annuaire")
  })

  it('declined: encouragement after summary block, find-coach CTA', async () => {
    const { html, subject } = await buildCoachRequestResponseAthleteEmailHtml({
      ...baseInput,
      outcome: 'declined',
    })
    expect(subject).toContain('Marie Dupont')
    expect(html).toContain('Demande refusée')
    expect(html).toContain("Parcourez l'annuaire")
    expect(html).toContain('/dashboard/find-coach')
    const offerIdx = html.indexOf('Suivi mensuel')
    const encouragementIdx = html.indexOf("Parcourez l'annuaire")
    const ctaIdx = html.indexOf('/dashboard/find-coach')
    expect(offerIdx).toBeGreaterThan(-1)
    expect(encouragementIdx).toBeGreaterThan(offerIdx)
    expect(ctaIdx).toBeGreaterThan(encouragementIdx)
    expect(html).not.toContain('>Sports<')
  })

  it('uses EN locale when preferred_locale is en', async () => {
    const { html, locale } = await buildCoachRequestResponseAthleteEmailHtml({
      ...baseInput,
      athletePreferredLocale: 'en',
    })
    expect(locale).toBe('en')
    expect(html).toContain('Request accepted')
  })
})

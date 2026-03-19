import { describe, expect, it } from 'vitest'

import { getFrozenDescriptionForLocale, getFrozenTitleForLocale } from '@/lib/frozenOfferI18n'

describe('frozenOfferI18n', () => {
  it('getFrozenTitleForLocale: prefers requested locale', () => {
    const row = {
      frozen_title_fr: 'Bonjour',
      frozen_title_en: 'Hello',
      frozen_title: 'Fallback',
    }
    expect(getFrozenTitleForLocale(row, 'fr')).toBe('Bonjour')
    expect(getFrozenTitleForLocale(row, 'en')).toBe('Hello')
  })

  it('getFrozenTitleForLocale: falls back when requested locale is empty', () => {
    const row = {
      frozen_title_fr: '   ',
      frozen_title_en: ' Hello  ',
      frozen_title: 'Fallback',
    }
    expect(getFrozenTitleForLocale(row, 'fr')).toBe('Hello')
    expect(getFrozenTitleForLocale(row, 'en')).toBe('Hello')
  })

  it('getFrozenTitleForLocale: returns null when everything is empty', () => {
    const row = {
      frozen_title_fr: '   ',
      frozen_title_en: null,
      frozen_title: null,
    }
    expect(getFrozenTitleForLocale(row, 'fr')).toBeNull()
  })

  it('getFrozenDescriptionForLocale: trims and selects fallback properly', () => {
    const row = {
      frozen_description_fr: '',
      frozen_description_en: '  World ',
      frozen_description: 'Fallback',
    }
    expect(getFrozenDescriptionForLocale(row, 'fr')).toBe('World')
  })
})


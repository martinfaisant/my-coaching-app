import { describe, expect, it } from 'vitest'
import { mapCoachRow, mapOfferRow } from '@/lib/publicCoachesData'

describe('publicCoachesData mappers', () => {
  it('mapCoachRow normalizes null arrays and preserves profile fields', () => {
    const mapped = mapCoachRow({
      user_id: 'coach-1',
      first_name: 'Marie',
      last_name: 'Dupont',
      coached_sports: null,
      languages: null,
      presentation_fr: 'Bonjour',
      presentation_en: 'Hello',
      avatar_url: 'https://example.com/a.jpg',
    })

    expect(mapped).toEqual({
      user_id: 'coach-1',
      first_name: 'Marie',
      last_name: 'Dupont',
      coached_sports: [],
      languages: [],
      presentation_fr: 'Bonjour',
      presentation_en: 'Hello',
      avatar_url: 'https://example.com/a.jpg',
    })
  })

  it('mapOfferRow coerces price and defaults price_type', () => {
    const mapped = mapOfferRow({
      id: 'offer-1',
      coach_id: 'coach-1',
      title: 'Legacy title',
      description: null,
      title_fr: 'Titre FR',
      title_en: null,
      description_fr: null,
      description_en: null,
      price: null,
      price_type: null,
      is_featured: true,
      display_order: 0,
    })

    expect(mapped).toEqual({
      id: 'offer-1',
      coach_id: 'coach-1',
      title: 'Legacy title',
      description: null,
      title_fr: 'Titre FR',
      title_en: null,
      description_fr: null,
      description_en: null,
      price: 0,
      price_type: 'monthly',
      is_featured: true,
      display_order: 0,
    })
  })
})

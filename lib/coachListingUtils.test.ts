import { describe, expect, it } from 'vitest'
import {
  filterCoachesForDisplay,
  getDisplayPresentation,
  getOfferDisplayTitle,
  isCoachPubliclyListable,
  matchesCoachName,
} from '@/lib/coachListingUtils'

const baseCoach = {
  user_id: 'c1',
  first_name: 'Marie',
  last_name: 'Lambert',
  coached_sports: ['course'],
  languages: ['fr'],
  presentation_fr: 'Bio FR',
  presentation_en: 'Bio EN',
}

describe('coachListingUtils', () => {
  it('detects publicly listable coach profile', () => {
    expect(isCoachPubliclyListable(baseCoach)).toBe(true)
    expect(isCoachPubliclyListable({ ...baseCoach, presentation_fr: '', presentation_en: '' })).toBe(
      false
    )
  })

  it('filters by name sport and language', () => {
    const coaches = [
      baseCoach,
      {
        ...baseCoach,
        user_id: 'c2',
        first_name: 'Paul',
        coached_sports: ['velo'],
        languages: ['en'],
      },
    ]

    const filtered = filterCoachesForDisplay(coaches, {
      searchName: 'marie',
      selectedSports: ['course'],
      selectedLanguages: ['fr'],
    })

    expect(filtered).toHaveLength(1)
    expect(filtered[0].user_id).toBe('c1')
  })

  it('matches reversed full name', () => {
    expect(matchesCoachName(baseCoach, 'lambert marie')).toBe(true)
  })

  it('picks presentation by locale with fallback', () => {
    expect(getDisplayPresentation(baseCoach, 'fr')).toBe('Bio FR')
    expect(getDisplayPresentation({ ...baseCoach, presentation_fr: '' }, 'fr')).toBe('Bio EN')
    expect(
      getOfferDisplayTitle(
        {
          id: '1',
          coach_id: 'c1',
          title: 'Legacy',
          title_fr: 'FR',
          title_en: 'EN',
          price: 0,
          price_type: 'monthly',
          is_featured: false,
          display_order: 0,
        },
        'en'
      )
    ).toBe('EN')
  })
})

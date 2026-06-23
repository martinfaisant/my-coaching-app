import { describe, expect, it } from 'vitest'

import type { Profile } from '@/types/database'
import { isCoachProfileComplete } from '@/lib/coachProfileCompletion'

function mkProfile(overrides: Partial<Profile> = {}): Profile {
  return {
    user_id: 'coach-1',
    email: 'coach@example.com',
    role: 'coach',
    coach_id: null,
    first_name: 'Jean',
    last_name: 'Dupont',
    coached_sports: ['course'],
    languages: ['fr'],
    presentation_fr: 'Coach course',
    presentation_en: '',
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('isCoachProfileComplete', () => {
  it('returns true when all required fields are present', () => {
    expect(isCoachProfileComplete(mkProfile())).toBe(true)
  })

  it('returns true with presentation_en only', () => {
    expect(
      isCoachProfileComplete(
        mkProfile({
          presentation_fr: '',
          presentation_en: 'Running coach',
        }),
      ),
    ).toBe(true)
  })

  it('returns false when name is missing', () => {
    expect(
      isCoachProfileComplete(
        mkProfile({
          first_name: '',
          last_name: '',
        }),
      ),
    ).toBe(false)
  })

  it('returns false when coached_sports is empty', () => {
    expect(isCoachProfileComplete(mkProfile({ coached_sports: [] }))).toBe(false)
  })

  it('returns false when languages is empty', () => {
    expect(isCoachProfileComplete(mkProfile({ languages: [] }))).toBe(false)
  })

  it('returns false when both presentations are empty', () => {
    expect(
      isCoachProfileComplete(
        mkProfile({
          presentation_fr: '',
          presentation_en: '   ',
        }),
      ),
    ).toBe(false)
  })
})

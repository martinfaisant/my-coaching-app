import { describe, expect, it } from 'vitest'
import {
  extractGoogleProfileFields,
  extractGoogleProfileFieldsFromUser,
} from '@/lib/googleUserMetadata'

describe('extractGoogleProfileFields', () => {
  it('maps given_name and family_name when present', () => {
    expect(
      extractGoogleProfileFields({
        given_name: 'Martin',
        family_name: 'Faisant',
      })
    ).toEqual({
      first_name: 'Martin',
      last_name: 'Faisant',
    })
  })

  it('parses full_name when given_name and family_name are absent (Supabase Google default)', () => {
    expect(
      extractGoogleProfileFields({
        full_name: 'Martin Faisant',
      })
    ).toEqual({
      first_name: 'Martin',
      last_name: 'Faisant',
    })
  })

  it('falls back to name from identity_data', () => {
    expect(
      extractGoogleProfileFields(
        {},
        [
          {
            provider: 'google',
            identity_id: 'google-id',
            id: 'google-id',
            user_id: 'user-id',
            identity_data: {
              name: 'Jane Doe',
            },
            created_at: '2026-01-01T00:00:00Z',
            last_sign_in_at: '2026-01-01T00:00:00Z',
            updated_at: '2026-01-01T00:00:00Z',
          },
        ]
      )
    ).toEqual({
      first_name: 'Jane',
      last_name: 'Doe',
    })
  })

  it('returns nulls for missing or invalid values', () => {
    expect(extractGoogleProfileFields({})).toEqual({
      first_name: null,
      last_name: null,
    })
    expect(
      extractGoogleProfileFields({
        full_name: '  ',
      })
    ).toEqual({
      first_name: null,
      last_name: null,
    })
  })

  it('extracts from full user object', () => {
    expect(
      extractGoogleProfileFieldsFromUser({
        user_metadata: { full_name: 'Alex Smith' },
        identities: [],
      })
    ).toEqual({
      first_name: 'Alex',
      last_name: 'Smith',
    })
  })
})

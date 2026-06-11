import { describe, expect, it } from 'vitest'
import {
  extractGoogleProfileFields,
  extractGoogleProfileFieldsFromUser,
} from '@/lib/googleUserMetadata'

describe('extractGoogleProfileFields', () => {
  it('maps given_name, family_name and avatar_url', () => {
    expect(
      extractGoogleProfileFields({
        given_name: 'Martin',
        family_name: 'Faisant',
        avatar_url: 'https://lh3.googleusercontent.com/a/photo',
      })
    ).toEqual({
      first_name: 'Martin',
      last_name: 'Faisant',
      avatar_url: 'https://lh3.googleusercontent.com/a/photo',
    })
  })

  it('parses full_name and falls back to picture', () => {
    expect(
      extractGoogleProfileFields({
        full_name: 'Martin Faisant',
        picture: 'https://lh3.googleusercontent.com/a/picture',
      })
    ).toEqual({
      first_name: 'Martin',
      last_name: 'Faisant',
      avatar_url: 'https://lh3.googleusercontent.com/a/picture',
    })
  })

  it('falls back to name and picture from identity_data', () => {
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
              picture: 'https://lh3.googleusercontent.com/a/picture',
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
      avatar_url: 'https://lh3.googleusercontent.com/a/picture',
    })
  })

  it('returns nulls for missing or invalid values', () => {
    expect(extractGoogleProfileFields({})).toEqual({
      first_name: null,
      last_name: null,
      avatar_url: null,
    })
    expect(
      extractGoogleProfileFields({
        full_name: '  ',
        avatar_url: 'http://insecure.example/photo.jpg',
      })
    ).toEqual({
      first_name: null,
      last_name: null,
      avatar_url: null,
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
      avatar_url: null,
    })
  })
})

import type { User } from '@supabase/supabase-js'

export type GoogleProfileFields = {
  first_name: string | null
  last_name: string | null
  avatar_url: string | null
}

function trimString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeAvatarUrl(value: unknown): string | null {
  const url = trimString(value)
  if (!url) return null
  if (!url.startsWith('https://')) return null
  return url
}

function splitFullName(fullName: string): Pick<GoogleProfileFields, 'first_name' | 'last_name'> {
  const trimmed = fullName.trim()
  if (!trimmed) {
    return { first_name: null, last_name: null }
  }

  const spaceIndex = trimmed.indexOf(' ')
  if (spaceIndex === -1) {
    return { first_name: trimmed, last_name: null }
  }

  const firstName = trimmed.slice(0, spaceIndex).trim()
  const lastName = trimmed.slice(spaceIndex + 1).trim()

  return {
    first_name: firstName.length > 0 ? firstName : null,
    last_name: lastName.length > 0 ? lastName : null,
  }
}

function pickStringField(
  sources: Array<Record<string, unknown>>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    for (const source of sources) {
      const value = trimString(source[key])
      if (value) return value
    }
  }
  return null
}

function collectGoogleMetadataSources(
  metadata: User['user_metadata'] | null | undefined,
  identities: User['identities'] | undefined
): Record<string, unknown>[] {
  const sources: Record<string, unknown>[] = []

  const googleIdentity = identities?.find((identity) => identity.provider === 'google')
  const identityData = googleIdentity?.identity_data
  if (identityData && typeof identityData === 'object') {
    sources.push(identityData as Record<string, unknown>)
  }

  if (metadata && typeof metadata === 'object') {
    sources.push(metadata as Record<string, unknown>)
  }

  return sources
}

function extractAvatarUrl(sources: Array<Record<string, unknown>>): string | null {
  return (
    normalizeAvatarUrl(pickStringField(sources, 'avatar_url')) ??
    normalizeAvatarUrl(pickStringField(sources, 'picture'))
  )
}

/**
 * Extrait prénom, nom et photo depuis les métadonnées Supabase (provider Google).
 * Supabase expose surtout full_name / name et avatar_url / picture.
 */
export function extractGoogleProfileFields(
  metadata: User['user_metadata'] | null | undefined,
  identities?: User['identities']
): GoogleProfileFields {
  const sources = collectGoogleMetadataSources(metadata, identities)
  const avatar_url = extractAvatarUrl(sources)

  const givenName = pickStringField(sources, 'given_name')
  const familyName = pickStringField(sources, 'family_name')

  if (givenName || familyName) {
    return { first_name: givenName, last_name: familyName, avatar_url }
  }

  const names = splitFullName(pickStringField(sources, 'full_name', 'name') ?? '')
  return { ...names, avatar_url }
}

export function extractGoogleProfileFieldsFromUser(
  user: Pick<User, 'user_metadata' | 'identities'>
): GoogleProfileFields {
  return extractGoogleProfileFields(user.user_metadata, user.identities)
}

import type { User } from '@supabase/supabase-js'

export type GoogleProfileFields = {
  first_name: string | null
  last_name: string | null
}

function trimString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function splitFullName(fullName: string): GoogleProfileFields {
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

/**
 * Extrait prénom et nom depuis les métadonnées Supabase (provider Google).
 * Supabase expose surtout full_name / name (pas given_name / family_name).
 */
export function extractGoogleProfileFields(
  metadata: User['user_metadata'] | null | undefined,
  identities?: User['identities']
): GoogleProfileFields {
  const sources = collectGoogleMetadataSources(metadata, identities)

  const givenName = pickStringField(sources, 'given_name')
  const familyName = pickStringField(sources, 'family_name')

  if (givenName || familyName) {
    return { first_name: givenName, last_name: familyName }
  }

  return splitFullName(pickStringField(sources, 'full_name', 'name') ?? '')
}

export function extractGoogleProfileFieldsFromUser(
  user: Pick<User, 'user_metadata' | 'identities'>
): GoogleProfileFields {
  return extractGoogleProfileFields(user.user_metadata, user.identities)
}

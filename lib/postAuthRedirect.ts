import { pathWithLocale } from '@/lib/pathWithLocale'

export const POST_AUTH_REDIRECT_COOKIE = 'post_auth_redirect'

/**
 * Valide un chemin de redirection post-auth (dashboard uniquement, pas d'URL absolue).
 */
export function validatePostAuthRedirect(path: string | null | undefined): string | null {
  if (!path?.trim()) return null
  const trimmed = path.trim()
  if (trimmed.includes('://') || trimmed.startsWith('//')) return null
  if (!trimmed.startsWith('/dashboard') && !trimmed.startsWith('/en/dashboard')) return null
  return trimmed
}

export function buildFindCoachDeepLink(
  locale: string,
  coachId: string,
  offerId: string
): string {
  const base = pathWithLocale(locale, '/dashboard/find-coach')
  const params = new URLSearchParams({
    coach: coachId,
    offer: offerId,
  })
  return `${base}?${params.toString()}`
}

/** Deep link annuaire public → dashboard find-coach (gate OAuth / post-auth). */
export function isFindCoachDeepLinkRedirect(path: string | null | undefined): boolean {
  const validated = validatePostAuthRedirect(path)
  if (!validated) return false
  return (
    validated.startsWith('/dashboard/find-coach') ||
    validated.startsWith('/en/dashboard/find-coach')
  )
}

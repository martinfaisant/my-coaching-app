/**
 * Chemins autorisés pour success_url / cancel_url Stripe (abonnement plateforme coach).
 * Évite les open redirects.
 */

const COACH_PLATFORM_SUBSCRIPTION_PATH = '/dashboard/coach-platform-subscription'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function pathWithoutQuery(path: string): string {
  const q = path.indexOf('?')
  return q === -1 ? path : path.slice(0, q)
}

/**
 * Valide et normalise le chemin de retour (sans host, sans query).
 * @returns chemin sûr ou null si invalide
 */
export function sanitizeCoachPlatformCheckoutReturnPath(raw: string | null | undefined): string | null {
  if (raw == null || typeof raw !== 'string') return null
  const trimmed = pathWithoutQuery(raw.trim())
  if (!trimmed.startsWith('/')) return null
  if (trimmed === COACH_PLATFORM_SUBSCRIPTION_PATH) return trimmed
  if (trimmed === '/dashboard/athletes') return trimmed
  if (trimmed.startsWith('/dashboard/athletes/')) {
    const rest = trimmed.slice('/dashboard/athletes/'.length)
    if (!rest || rest.includes('/')) return null
    if (!UUID_RE.test(rest)) return null
    return trimmed
  }
  return null
}

export function resolveCoachPlatformCheckoutReturnPath(
  raw: string | null | undefined,
  fallback: string = '/dashboard/athletes'
): string {
  return sanitizeCoachPlatformCheckoutReturnPath(raw) ?? fallback
}

export { COACH_PLATFORM_SUBSCRIPTION_PATH }

/**
 * Origine publique pour success_url / cancel_url Stripe (Checkout coach plateforme).
 * Priorité à l’hôte de la requête courante s’il est autorisé (preview Vercel, localhost, ou hôte des env),
 * sinon repli sur NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL pour éviter les open redirects.
 */

function trimTrailingSlash(s: string): string {
  return s.replace(/\/$/, '')
}

function toOrigin(url: string): string | null {
  const raw = trimTrailingSlash(url.trim())
  if (!raw) return null
  try {
    const parsed = new URL(raw.startsWith('http://') || raw.startsWith('https://') ? raw : `https://${raw}`)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return null
  }
}

function hostnameOf(url: string): string | null {
  const o = toOrigin(url)
  if (!o) return null
  try {
    return new URL(o).hostname.toLowerCase()
  } catch {
    return null
  }
}

function stripLeadingWww(host: string): string {
  const h = host.toLowerCase()
  return h.startsWith('www.') ? h.slice(4) : h
}

function collectEnvHosts(): string[] {
  const out = new Set<string>()
  for (const key of [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXT_PUBLIC_APP_URL]) {
    const h = key ? hostnameOf(key) : null
    if (h) out.add(stripLeadingWww(h))
  }
  return [...out]
}

/**
 * @param requestHeaders - ex. await headers() dans une Server Action
 * @param envFallback - NEXT_PUBLIC_SITE_URL ?? NEXT_PUBLIC_APP_URL (déjà validé non vide)
 */
export function resolveStripeCheckoutReturnBaseUrl(requestHeaders: Headers, envFallback: string): string {
  const envOrigin = toOrigin(envFallback)
  if (!envOrigin) {
    return trimTrailingSlash(envFallback)
  }

  const forwardedProtoRaw = requestHeaders.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const proto =
    forwardedProtoRaw === 'http' || forwardedProtoRaw === 'https' ? forwardedProtoRaw : 'https'

  const forwardedHost = requestHeaders.get('x-forwarded-host')?.split(',')[0]?.trim()
  const hostHeader = requestHeaders.get('host')?.split(',')[0]?.trim()
  const fullHost = (forwardedHost || hostHeader || '').trim()
  if (!fullHost) {
    return envOrigin
  }

  const hostname = stripLeadingWww(fullHost.split(':')[0].toLowerCase())

  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'
  const isVercelPreview = hostname.endsWith('.vercel.app')
  const envHosts = collectEnvHosts()
  const matchesConfigured = envHosts.some((h) => stripLeadingWww(hostname) === stripLeadingWww(h))

  if (isVercelPreview || isLocalhost || matchesConfigured) {
    return trimTrailingSlash(`${proto}://${fullHost}`)
  }

  return envOrigin
}

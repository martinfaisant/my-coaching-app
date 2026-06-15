const DEFAULT_PRODUCTION_SITE_URL = 'https://mysportally.com'

/**
 * URL publique canonique du site (sans slash final).
 * Utilisée pour sitemap, robots et métadonnées SEO.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    DEFAULT_PRODUCTION_SITE_URL

  return raw.replace(/\/$/, '')
}

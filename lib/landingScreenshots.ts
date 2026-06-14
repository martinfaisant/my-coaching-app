import type { LandingScreenshotId } from '@/lib/landingConfig'

/**
 * Chemin public d'une capture landing localisée (WebP dans public/landing/{locale}/).
 */
export function getLandingScreenshotSrc(
  locale: string,
  id: LandingScreenshotId
): string {
  const loc = locale === 'en' ? 'en' : 'fr'
  return `/landing/${loc}/${id}.webp`
}

import type { MetadataRoute } from 'next'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { getSiteUrl } from '@/lib/siteUrl'

/** Chemins publics indexables (hors dashboard, auth, etc.). */
export const SEO_PUBLIC_PATHS = [
  '/',
  '/coaches',
  '/pricing',
  '/contact',
  '/terms',
  '/privacy',
  '/faq/athlete',
  '/faq/coach',
] as const

export type SeoPublicPath = (typeof SEO_PUBLIC_PATHS)[number]

function priorityForPath(path: SeoPublicPath): number {
  if (path === '/') return 1
  if (path === '/coaches') return 0.9
  if (path === '/pricing') return 0.8
  if (path === '/faq/athlete' || path === '/faq/coach') return 0.7
  return 0.5
}

function changeFrequencyForPath(
  path: SeoPublicPath
): MetadataRoute.Sitemap[number]['changeFrequency'] {
  return path === '/' ? 'weekly' : 'monthly'
}

function toAbsolutePublicUrl(base: string, localePath: string): string {
  // pathWithLocale('en', '/') → '/en/' ; la route canonique servie est /en
  const normalizedPath = localePath === '/en/' ? '/en' : localePath
  return `${base}${normalizedPath}`
}

function localizedUrlsForPath(base: string, path: SeoPublicPath): { fr: string; en: string } {
  return {
    fr: toAbsolutePublicUrl(base, pathWithLocale('fr', path)),
    en: toAbsolutePublicUrl(base, pathWithLocale('en', path)),
  }
}

/** URLs absolues FR/EN d'une page publique (sitemap, canonical, hreflang). */
export function getPublicPageAbsoluteUrls(path: SeoPublicPath): { fr: string; en: string } {
  return localizedUrlsForPath(getSiteUrl(), path)
}

/**
 * Entrées sitemap pour toutes les pages marketing / légales (FR + EN + hreflang).
 */
export function buildPublicSitemapEntries(
  lastModified: Date = new Date()
): MetadataRoute.Sitemap {
  const base = getSiteUrl()

  return SEO_PUBLIC_PATHS.flatMap((path) => {
    const { fr, en } = localizedUrlsForPath(base, path)
    const alternates = {
      languages: {
        fr,
        en,
        'x-default': fr,
      },
    }
    const shared = {
      lastModified,
      changeFrequency: changeFrequencyForPath(path),
      priority: priorityForPath(path),
      alternates,
    }

    return [
      { url: fr, ...shared },
      { url: en, ...shared },
    ]
  })
}

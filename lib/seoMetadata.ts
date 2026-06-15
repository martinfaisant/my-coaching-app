import type { Metadata } from 'next'
import {
  type SeoPublicPath,
  getPublicPageAbsoluteUrls,
} from '@/lib/seoPublicRoutes'

function resolveCanonicalLocale(locale: string): 'fr' | 'en' {
  return locale === 'en' ? 'en' : 'fr'
}

/** URL absolue canonique de la page publique pour la locale courante. */
export function getCanonicalPublicPageUrl(locale: string, path: SeoPublicPath): string {
  const urls = getPublicPageAbsoluteUrls(path)
  return urls[resolveCanonicalLocale(locale)]
}

/** Balises canonical + hreflang pour une page publique indexable. */
export function buildPublicPageAlternates(
  locale: string,
  path: SeoPublicPath
): NonNullable<Metadata['alternates']> {
  const urls = getPublicPageAbsoluteUrls(path)
  const canonical = urls[resolveCanonicalLocale(locale)]

  return {
    canonical,
    languages: {
      fr: urls.fr,
      en: urls.en,
      'x-default': urls.fr,
    },
  }
}

type PublicPageMetadataInput = {
  locale: string
  path: SeoPublicPath
  title: string
  description?: string
}

/** Métadonnées SEO communes (title, description optionnelle, canonical, hreflang, Open Graph de base). */
export function buildPublicPageMetadata({
  locale,
  path,
  title,
  description,
}: PublicPageMetadataInput): Metadata {
  const canonical = getCanonicalPublicPageUrl(locale, path)

  return {
    title,
    ...(description ? { description } : {}),
    alternates: buildPublicPageAlternates(locale, path),
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url: canonical,
    },
  }
}

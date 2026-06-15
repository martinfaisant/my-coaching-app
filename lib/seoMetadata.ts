import type { Metadata } from 'next'
import { pathWithLocale } from '@/lib/pathWithLocale'
import {
  type SeoPublicPath,
  getPublicPageAbsoluteUrls,
} from '@/lib/seoPublicRoutes'
import { buildSocialMetadata } from '@/lib/seoSocial'
import { getSiteUrl } from '@/lib/siteUrl'

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
  imageAlt?: string
}

/** Métadonnées SEO communes (title, description, canonical, hreflang, Open Graph, Twitter). */
export function buildPublicPageMetadata({
  locale,
  path,
  title,
  description,
  imageAlt,
}: PublicPageMetadataInput): Metadata {
  const canonical = getCanonicalPublicPageUrl(locale, path)
  const social = buildSocialMetadata({
    locale,
    title,
    description,
    url: canonical,
    imageAlt,
  })

  return {
    title,
    ...(description ? { description } : {}),
    alternates: buildPublicPageAlternates(locale, path),
    ...social,
  }
}

function toAbsolutePublicUrl(base: string, localePath: string): string {
  const normalizedPath = localePath === '/en/' ? '/en' : localePath
  return `${base}${normalizedPath}`
}

function dynamicPublicUrls(path: string): { fr: string; en: string } {
  const base = getSiteUrl()
  return {
    fr: toAbsolutePublicUrl(base, pathWithLocale('fr', path)),
    en: toAbsolutePublicUrl(base, pathWithLocale('en', path)),
  }
}

type DynamicPublicPageMetadataInput = {
  locale: string
  /** Chemin sans locale, ex. /coaches/uuid */
  path: string
  title: string
  description?: string
  imageAlt?: string
}

/** Métadonnées SEO pour routes publiques dynamiques (fiches coach). */
export function buildDynamicPublicPageMetadata({
  locale,
  path,
  title,
  description,
  imageAlt,
}: DynamicPublicPageMetadataInput): Metadata {
  const urls = dynamicPublicUrls(path)
  const canonical = urls[resolveCanonicalLocale(locale)]
  const social = buildSocialMetadata({
    locale,
    title,
    description,
    url: canonical,
    imageAlt,
  })

  return {
    title,
    ...(description ? { description } : {}),
    alternates: {
      canonical,
      languages: {
        fr: urls.fr,
        en: urls.en,
        'x-default': urls.fr,
      },
    },
    ...social,
  }
}

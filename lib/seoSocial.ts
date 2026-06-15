import type { Metadata } from 'next'
import { getSiteUrl } from '@/lib/siteUrl'

export const SITE_NAME = 'My Sport Ally'

export const OG_IMAGE_WIDTH = 1200
export const OG_IMAGE_HEIGHT = 630
export const OG_IMAGE_PATH = '/og/default.jpg'

/** URL absolue de l'image Open Graph par défaut (1200×630). */
export function getDefaultOgImageUrl(): string {
  return `${getSiteUrl()}${OG_IMAGE_PATH}`
}

export function resolveOgLocale(locale: string): 'fr_FR' | 'en_US' {
  return locale === 'en' ? 'en_US' : 'fr_FR'
}

export function resolveOgAlternateLocale(locale: string): 'fr_FR' | 'en_US' {
  return locale === 'en' ? 'fr_FR' : 'en_US'
}

type BuildSocialMetadataInput = {
  locale: string
  title: string
  description?: string
  url: string
  imageUrl?: string
  imageAlt?: string
}

/** Open Graph + Twitter Card pour pages publiques indexables. */
export function buildSocialMetadata({
  locale,
  title,
  description,
  url,
  imageUrl = getDefaultOgImageUrl(),
  imageAlt = SITE_NAME,
}: BuildSocialMetadataInput): Pick<Metadata, 'openGraph' | 'twitter'> {
  const ogLocale = resolveOgLocale(locale)
  const alternateLocale = resolveOgAlternateLocale(locale)

  return {
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: ogLocale,
      alternateLocale: [alternateLocale],
      title,
      ...(description ? { description } : {}),
      url,
      images: [
        {
          url: imageUrl,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
      images: [imageUrl],
    },
  }
}

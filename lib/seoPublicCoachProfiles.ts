import type { MetadataRoute } from 'next'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { getSiteUrl } from '@/lib/siteUrl'
import { loadPublicCoachSitemapEntries } from '@/lib/publicCoachesData'

function toAbsolutePublicUrl(base: string, localePath: string): string {
  const normalizedPath = localePath === '/en/' ? '/en' : localePath
  return `${base}${normalizedPath}`
}

/**
 * Entrées sitemap pour les fiches coach publiques (FR + EN + hreflang).
 */
export async function buildPublicCoachProfileSitemapEntries(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()
  const coaches = await loadPublicCoachSitemapEntries()

  return coaches.flatMap(({ coachId, lastModified }) => {
    const path = `/coaches/${coachId}`
    const fr = toAbsolutePublicUrl(base, pathWithLocale('fr', path))
    const en = toAbsolutePublicUrl(base, pathWithLocale('en', path))
    const alternates = {
      languages: {
        fr,
        en,
        'x-default': fr,
      },
    }
    const shared = {
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates,
    }

    return [
      { url: fr, ...shared },
      { url: en, ...shared },
    ]
  })
}

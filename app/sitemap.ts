import type { MetadataRoute } from 'next'
import { buildPublicSitemapEntries } from '@/lib/seoPublicRoutes'
import { buildPublicCoachProfileSitemapEntries } from '@/lib/seoPublicCoachProfiles'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [staticEntries, coachEntries] = await Promise.all([
    Promise.resolve(buildPublicSitemapEntries()),
    buildPublicCoachProfileSitemapEntries(),
  ])
  return [...staticEntries, ...coachEntries]
}

import type { MetadataRoute } from 'next'
import { buildPublicSitemapEntries } from '@/lib/seoPublicRoutes'

export default function sitemap(): MetadataRoute.Sitemap {
  return buildPublicSitemapEntries()
}

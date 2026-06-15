import type { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/siteUrl'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',
        '/en/dashboard',
        '/admin',
        '/en/admin',
        '/login',
        '/en/login',
        '/auth/',
        '/en/auth/',
        '/reset-password',
        '/en/reset-password',
        '/api/',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: new URL(siteUrl).host,
  }
}

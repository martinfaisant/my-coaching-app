import { SITE_NAME } from '@/lib/seoSocial'
import { getSiteUrl } from '@/lib/siteUrl'

/** JSON-LD Organization + WebSite pour la page d'accueil. */
export function buildHomeJsonLdGraph(): string {
  const siteUrl = getSiteUrl()
  const logoUrl = `${siteUrl}/logo.png`

  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: siteUrl,
        logo: logoUrl,
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: siteUrl,
        inLanguage: ['fr', 'en'],
      },
    ],
  }

  return JSON.stringify(payload)
}

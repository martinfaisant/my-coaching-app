import { SEO_PUBLIC_PATHS, getPublicPageAbsoluteUrls } from '@/lib/seoPublicRoutes'
import { getSiteUrl } from '@/lib/siteUrl'

/** Contenu llms.txt synchronisé sur SEO_PUBLIC_PATHS. */
export function buildLlmsTxtContent(): string {
  const siteUrl = getSiteUrl()
  const frUrls = SEO_PUBLIC_PATHS.map((path) => getPublicPageAbsoluteUrls(path).fr)
  const enUrls = SEO_PUBLIC_PATHS.map((path) => getPublicPageAbsoluteUrls(path).en)

  return [
    '# My Sport Ally',
    '> Online sports coaching platform (FR/EN)',
    '',
    '## Key pages (FR)',
    ...frUrls.map((url) => `- ${url}`),
    '',
    '## Key pages (EN)',
    ...enUrls.map((url) => `- ${url}`),
    '',
    '## Full index',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '(includes dynamic coach profile pages)',
  ].join('\n')
}

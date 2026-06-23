import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'
import { FaqPublicPage } from '@/components/public/FaqPublicPage'
import { PublicMarketingFooter } from '@/components/public/PublicMarketingFooter'
import { buildPublicPageMetadata } from '@/lib/seoMetadata'

type FaqAthletePageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: FaqAthletePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return buildPublicPageMetadata({
    locale,
    path: '/faq/athlete',
    title: t('faqAthleteTitle'),
    description: t('faqAthleteDescription'),
    imageAlt: t('ogImageAlt'),
  })
}

export default async function FaqAthletePage({ params }: FaqAthletePageProps) {
  const { locale } = await params

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicOrDashboardHeader />
      <FaqPublicPage audience="athlete" locale={locale} />
      <PublicMarketingFooter activeLink="athlete" />
    </div>
  )
}

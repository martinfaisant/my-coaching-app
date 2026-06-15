import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'
import { FaqPublicPage } from '@/components/public/FaqPublicPage'
import { PublicMarketingFooter } from '@/components/public/PublicMarketingFooter'
import { buildPublicPageMetadata } from '@/lib/seoMetadata'

type FaqCoachPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: FaqCoachPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return buildPublicPageMetadata({
    locale,
    path: '/faq/coach',
    title: t('faqCoachTitle'),
    description: t('faqCoachDescription'),
    imageAlt: t('ogImageAlt'),
  })
}

export default async function FaqCoachPage({ params }: FaqCoachPageProps) {
  const { locale } = await params

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicOrDashboardHeader />
      <FaqPublicPage audience="coach" locale={locale} />
      <PublicMarketingFooter activeFaq="coach" />
    </div>
  )
}

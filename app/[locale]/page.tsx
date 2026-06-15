import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getDashboardEntryPath } from '@/lib/dashboardEntryPath'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { buildPublicPageMetadata } from '@/lib/seoMetadata'
import { buildHomeJsonLdGraph } from '@/lib/seoJsonLd'
import { JsonLdScript } from '@/components/JsonLdScript'
import { createClient } from '@/utils/supabase/server'
import { getOptionalUserWithProfile } from '@/utils/auth'
import { HomeEmailConfirmedTrigger } from '@/components/HomeEmailConfirmedTrigger'
import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'
import { PublicMarketingFooter } from '@/components/public/PublicMarketingFooter'
import { LandingHero } from '@/components/landing/LandingHero'
import { LandingShowcaseTabs } from '@/components/landing/LandingShowcaseTabs'
import { LandingAudienceCards } from '@/components/landing/LandingAudienceCards'
import { LandingHowItWorks } from '@/components/landing/LandingHowItWorks'
import { LandingFinalCta } from '@/components/landing/LandingFinalCta'

type HomePageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ emailConfirmed?: string; code?: string }>
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return buildPublicPageMetadata({
    locale,
    path: '/',
    title: t('homeTitle'),
    description: t('homeDescription'),
    imageAlt: t('ogImageAlt'),
  })
}

export default async function Home({ params, searchParams }: HomePageProps) {
  const { locale } = await params
  const resolvedSearchParams = await searchParams
  const emailConfirmed = resolvedSearchParams?.emailConfirmed === '1'
  const code = resolvedSearchParams?.code

  if (code && !emailConfirmed) {
    const resetPath =
      locale === 'en'
        ? `/en/reset-password?code=${encodeURIComponent(code)}`
        : `/reset-password?code=${encodeURIComponent(code)}`
    redirect(resetPath)
  }

  if (emailConfirmed) {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const dashboardPath = locale === 'en' ? '/en/dashboard' : '/dashboard'
      redirect(dashboardPath)
    }
  }

  const sessionUser = await getOptionalUserWithProfile()
  if (sessionUser) {
    redirect(pathWithLocale(locale, getDashboardEntryPath(sessionUser.profile)))
  }

  return (
    <div className="min-h-screen bg-background">
      <JsonLdScript json={buildHomeJsonLdGraph()} />
      <HomeEmailConfirmedTrigger showEmailConfirmedModal={emailConfirmed} />
      <PublicOrDashboardHeader />

      <main>
        <LandingHero locale={locale} />
        <LandingShowcaseTabs locale={locale} />
        <LandingAudienceCards locale={locale} />
        <LandingHowItWorks />
        <LandingFinalCta locale={locale} />
      </main>

      <PublicMarketingFooter />
    </div>
  )
}

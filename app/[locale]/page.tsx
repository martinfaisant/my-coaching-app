import Link from 'next/link'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { getDashboardEntryPath } from '@/lib/dashboardEntryPath'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { buildPublicPageMetadata } from '@/lib/seoMetadata'
import { createClient } from '@/utils/supabase/server'
import { getOptionalUserWithProfile } from '@/utils/auth'
import { HomeEmailConfirmedTrigger } from '@/components/HomeEmailConfirmedTrigger'
import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'
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

  const t = await getTranslations('landing')

  const termsPath = locale === 'en' ? '/en/terms' : '/terms'
  const privacyPath = locale === 'en' ? '/en/privacy' : '/privacy'
  const contactPath = locale === 'en' ? '/en/contact' : '/contact'

  return (
    <div className="min-h-screen bg-background">
      <HomeEmailConfirmedTrigger showEmailConfirmedModal={emailConfirmed} />
      <PublicOrDashboardHeader />

      <main>
        <LandingHero locale={locale} />
        <LandingShowcaseTabs locale={locale} />
        <LandingAudienceCards locale={locale} />
        <LandingHowItWorks />
        <LandingFinalCta locale={locale} />
      </main>

      <footer className="border-t border-stone-200 bg-stone-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-3 text-center text-stone-600">
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link
                href={privacyPath}
                className="underline underline-offset-4 hover:text-stone-900"
              >
                {t('footer.privacyLink')}
              </Link>
              <Link
                href={termsPath}
                className="underline underline-offset-4 hover:text-stone-900"
              >
                {t('footer.termsLink')}
              </Link>
              <Link
                href={contactPath}
                className="underline underline-offset-4 hover:text-stone-900"
              >
                {t('footer.contactLink')}
              </Link>
            </div>
            <p className="text-sm">
              © {new Date().getFullYear()} My Sport Ally. {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'
import { PublicMarketingFooter } from '@/components/public/PublicMarketingFooter'
import { buildPublicPageMetadata } from '@/lib/seoMetadata'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { getOptionalUserWithProfile } from '@/utils/auth'
import { loadPublicCoachDirectory } from '@/lib/publicCoachesData'
import { PublicCoachesDirectorySection } from '@/app/[locale]/coaches/PublicCoachesDirectorySection'

export const revalidate = 300

type CoachesPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: CoachesPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'publicCoaches' })

  return buildPublicPageMetadata({
    locale,
    path: '/coaches',
    title: t('pageTitle'),
    description: t('pageDescription'),
  })
}

export default async function PublicCoachesPage({ params }: CoachesPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'publicCoaches' })
  const userBundle = await getOptionalUserWithProfile()

  if (userBundle?.profile.role === 'athlete' && !userBundle.profile.coach_id) {
    redirect(pathWithLocale(locale, '/dashboard/find-coach'))
  }

  const { coaches, offersByCoach, ratingsByCoach } = await loadPublicCoachDirectory()

  return (
    <div className="min-h-screen bg-background">
      <PublicOrDashboardHeader />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
        <section className="text-center md:text-left space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-stone-900">{t('heroTitle')}</h1>
          <p className="text-stone-600 text-sm md:text-base max-w-2xl">{t('heroSubtitle')}</p>
        </section>

        <PublicCoachesDirectorySection
          coaches={coaches}
          offersByCoach={offersByCoach}
          ratingsByCoach={ratingsByCoach}
        />
      </main>

      <PublicMarketingFooter />
    </div>
  )
}

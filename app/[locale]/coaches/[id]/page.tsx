import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'
import { PublicMarketingFooter } from '@/components/public/PublicMarketingFooter'
import { buildDynamicPublicPageMetadata } from '@/lib/seoMetadata'
import { getOptionalUserWithProfile } from '@/utils/auth'
import { loadPublicCoachProfile } from '@/lib/publicCoachesData'
import { getDisplayName } from '@/lib/displayName'
import { getDisplayPresentation } from '@/lib/coachListingUtils'
import { PublicCoachAuthGateProvider } from '@/app/[locale]/coaches/PublicCoachAuthGateProvider'
import { PublicCoachProfileSection } from '@/app/[locale]/coaches/PublicCoachProfileSection'

export const revalidate = 300

type CoachProfilePageProps = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: CoachProfilePageProps): Promise<Metadata> {
  const { locale, id } = await params
  const data = await loadPublicCoachProfile(id)

  if (!data) {
    const t = await getTranslations({ locale, namespace: 'publicCoaches' })
    return { title: t('profileNotFound') }
  }

  const t = await getTranslations({ locale, namespace: 'publicCoaches' })
  const name = getDisplayName(data.coach)
  const presentation = getDisplayPresentation(data.coach, locale)
  const description =
    presentation.length > 160 ? `${presentation.slice(0, 157)}…` : presentation

  return buildDynamicPublicPageMetadata({
    locale,
    path: `/coaches/${id}`,
    title: t('profileMetaTitle', { name }),
    description: description || t('pageDescription'),
  })
}

export default async function PublicCoachProfilePage({ params }: CoachProfilePageProps) {
  const { locale, id } = await params
  const userBundle = await getOptionalUserWithProfile()
  const data = await loadPublicCoachProfile(id)

  if (!data) {
    notFound()
  }

  const isAthleteWithCoach =
    userBundle?.profile.role === 'athlete' && Boolean(userBundle.profile.coach_id)
  const isAthleteWithoutCoach =
    userBundle?.profile.role === 'athlete' && !userBundle.profile.coach_id

  return (
    <div className="min-h-screen bg-background">
      <PublicOrDashboardHeader />

      <PublicCoachAuthGateProvider>
        <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8">
          <PublicCoachProfileSection
            coach={data.coach}
            offers={data.offers}
            ratings={data.ratings}
            showGateCta={!userBundle}
            showDashboardLinkCta={isAthleteWithoutCoach}
            showAlreadyHasCoachBanner={isAthleteWithCoach}
          />
        </main>
      </PublicCoachAuthGateProvider>

      <PublicMarketingFooter />
    </div>
  )
}

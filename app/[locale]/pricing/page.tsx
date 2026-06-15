import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { CheckCircle2 } from 'lucide-react'
import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'
import { PublicMarketingFooter } from '@/components/public/PublicMarketingFooter'
import { CoachPricingPublicManageBanner } from '@/components/CoachPricingPublicManageBanner'
import { CoachPricingPublicOffers } from '@/components/CoachPricingPublicOffers'
import { CoachPricingPublicFinalCta } from '@/components/CoachPricingPublicFinalCta'
import { CoachPricingPublicSignupProvider } from '@/components/CoachPricingPublicSignupProvider'
import {
  resolveCoachPricingPublicView,
  shouldShowCoachPricingPublicFinalSignupCta,
  shouldShowCoachPricingPublicManageBanner,
  shouldShowCoachPricingPublicOfferGrid,
} from '@/lib/coachPricingPublicView'
import { resolveCoachPlatformTrialPresentationForCoach } from '@/lib/coachPlatformTrialEligibility'
import { loadCoachPlatformCatalogForEnv } from '@/lib/stripeCoachPlatformCatalog'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { getOptionalUserWithProfile } from '@/utils/auth'
import { createClient } from '@/utils/supabase/server'
import { buildPublicPageMetadata } from '@/lib/seoMetadata'
import type { CoachPlatformSubscription } from '@/types/database'

type PricingPageProps = {
  params: Promise<{ locale: string }>
}

const INCLUDED_FEATURE_KEYS = [
  'included.unlimitedAthletes',
  'included.calendarPlanning',
  'included.messaging',
  'included.goals',
] as const

const FAQ_KEYS = ['payOnSignup', 'vsCoachOffers'] as const

const TIMELINE_STEP_KEYS = ['step1', 'step2', 'step3'] as const

export async function generateMetadata({ params }: PricingPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return buildPublicPageMetadata({
    locale,
    path: '/pricing',
    title: t('pricingTitle'),
    description: t('pricingDescription'),
  })
}

export default async function PricingPage({ params }: PricingPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'coachPricingPublic' })
  const userBundle = await getOptionalUserWithProfile()
  const catalog = await loadCoachPlatformCatalogForEnv()

  let platformRow: CoachPlatformSubscription | null = null
  if (userBundle?.profile.role === 'coach') {
    const supabase = await createClient()
    const { data } = await supabase
      .from('coach_platform_subscriptions')
      .select('*')
      .eq('coach_id', userBundle.id)
      .maybeSingle()
    platformRow = (data ?? null) as CoachPlatformSubscription | null
  }

  const viewMode = resolveCoachPricingPublicView(userBundle?.profile ?? null, platformRow)
  const showManageBanner = shouldShowCoachPricingPublicManageBanner(viewMode)
  const showOfferGrid =
    shouldShowCoachPricingPublicOfferGrid(viewMode) && catalog.offers.length > 0
  const showFinalCta = shouldShowCoachPricingPublicFinalSignupCta(viewMode)
  const catalogUnavailable = catalog.offers.length === 0

  let subscriptionTrialDays = catalog.subscriptionTrialDays
  let trialEligible = subscriptionTrialDays > 0

  if (viewMode === 'coach_no_sub' && userBundle) {
    const supabase = await createClient()
    const trialPresentation = await resolveCoachPlatformTrialPresentationForCoach(
      supabase,
      userBundle.id,
      platformRow
    )
    subscriptionTrialDays = trialPresentation.subscriptionTrialDays
    trialEligible = trialPresentation.trialEligible
  }

  const contactPath = pathWithLocale(locale, '/contact')
  const subscribePath = '/dashboard/coach-platform-subscription'

  return (
    <div className="min-h-screen bg-background">
      <PublicOrDashboardHeader />

      <CoachPricingPublicSignupProvider>
        <main>
          <section className="py-12 sm:py-16 bg-gradient-to-b from-palette-forest-light/10 to-background">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">{t('heroTitle')}</h1>
              <p className="mt-3 text-lg text-stone-600 max-w-xl mx-auto">{t('heroSubtitle')}</p>
            </div>
          </section>

          {showManageBanner ? <CoachPricingPublicManageBanner locale={locale} /> : null}

          <section className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8">
            <div className="rounded-2xl border border-palette-forest-light/40 bg-palette-forest-light/15 p-5 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-palette-forest-dark/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-palette-forest-dark" aria-hidden />
              </div>
              <div>
                <p className="font-semibold text-stone-900">{t('freeUntilCoachingTitle')}</p>
                <p className="text-sm text-stone-600 mt-1">{t('freeUntilCoachingDescription')}</p>
              </div>
            </div>
          </section>

          <section className="py-14 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-center text-stone-900 mb-10">{t('timelineTitle')}</h2>
            <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TIMELINE_STEP_KEYS.map((stepKey, index) => (
                <li key={stepKey} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-palette-forest-dark text-white text-lg font-bold mb-4">
                    {index + 1}
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-2">{t(`timeline.${stepKey}.title`)}</h3>
                  <p className="text-sm text-stone-600 leading-relaxed">{t(`timeline.${stepKey}.description`)}</p>
                </li>
              ))}
            </ol>
          </section>

          {showOfferGrid ? (
            <CoachPricingPublicOffers
              offers={catalog.offers}
              viewMode={viewMode}
              subscriptionTrialDays={subscriptionTrialDays}
              trialEligible={trialEligible}
              subscribeHref={subscribePath}
            />
          ) : null}

          {catalogUnavailable && shouldShowCoachPricingPublicOfferGrid(viewMode) ? (
            <section className="py-10 mx-auto max-w-lg px-4 sm:px-6 lg:px-8">
              <div className="rounded-xl border border-stone-200 bg-white p-8 text-center shadow-sm">
                <p className="text-sm text-stone-600">{t('catalogUnavailable')}</p>
                <Link
                  href={contactPath}
                  className="inline-block mt-4 text-sm font-medium text-palette-forest-dark underline underline-offset-4 hover:text-palette-olive"
                >
                  {t('catalogContactLink')}
                </Link>
              </div>
            </section>
          ) : null}

          <section className="py-14 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-center text-stone-900 mb-8">{t('includedTitle')}</h2>
            <ul className="grid sm:grid-cols-2 gap-4">
              {INCLUDED_FEATURE_KEYS.map((key) => (
                <li key={key} className="flex items-start gap-3 text-sm text-stone-700">
                  <CheckCircle2 className="w-5 h-5 text-palette-forest-dark shrink-0 mt-0.5" aria-hidden />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="py-10 bg-stone-50">
            <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
              <h2 className="text-xl font-bold text-center text-stone-900 mb-6">{t('faqTitle')}</h2>
              <dl className="space-y-4">
                {FAQ_KEYS.map((key) => (
                  <div key={key} className="rounded-xl border border-stone-200 bg-white p-4">
                    <dt className="font-semibold text-sm text-stone-900">{t(`faq.${key}.question`)}</dt>
                    <dd className="text-sm text-stone-600 mt-1">{t(`faq.${key}.answer`)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          {showFinalCta ? <CoachPricingPublicFinalCta /> : null}
        </main>
      </CoachPricingPublicSignupProvider>

      <PublicMarketingFooter />
    </div>
  )
}

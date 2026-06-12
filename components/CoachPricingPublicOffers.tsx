'use client'

import { useTranslations } from 'next-intl'
import { CoachPlatformOfferGrid } from '@/components/CoachPlatformOfferGrid'
import { useCoachPricingPublicSignup } from '@/components/CoachPricingPublicSignupProvider'
import type { CoachPricingPublicViewMode } from '@/lib/coachPricingPublicView'
import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'

type CoachPricingPublicOffersProps = {
  offers: CoachPlatformCatalogOffer[]
  viewMode: CoachPricingPublicViewMode
  subscriptionTrialDays: number
  trialEligible: boolean
  subscribeHref: string
}

export function CoachPricingPublicOffers({
  offers,
  viewMode,
  subscriptionTrialDays,
  trialEligible,
  subscribeHref,
}: CoachPricingPublicOffersProps) {
  const t = useTranslations('coachPricingPublic')
  const { openSignup } = useCoachPricingPublicSignup()

  const marketingCta =
    viewMode === 'visitor'
      ? ('signup' as const)
      : viewMode === 'coach_no_sub'
        ? ('subscribe' as const)
        : ('none' as const)

  return (
    <section className="py-8 bg-stone-50" aria-labelledby="coach-pricing-offers-heading">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 id="coach-pricing-offers-heading" className="text-xl font-bold text-center text-stone-900 mb-8">
          {t('offersTitle')}
        </h2>
        <CoachPlatformOfferGrid
          mode="marketing"
          offers={offers}
          subscriptionTrialDays={subscriptionTrialDays}
          trialEligible={trialEligible}
          marketingCta={marketingCta}
          createAccountCtaLabel={t('createAccountCta')}
          subscribeCtaLabel={t('subscribeCta')}
          onCreateAccountClick={openSignup}
          subscribeHref={subscribeHref}
        />
      </div>
    </section>
  )
}

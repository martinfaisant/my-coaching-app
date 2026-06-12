'use client'

import { useTranslations } from 'next-intl'
import { useCoachPricingPublicSignup } from '@/components/CoachPricingPublicSignupProvider'

export function CoachPricingPublicFinalCta() {
  const t = useTranslations('coachPricingPublic')
  const { openSignup } = useCoachPricingPublicSignup()

  return (
    <section className="py-16 bg-gradient-to-br from-palette-forest-dark to-palette-forest-default text-white">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold mb-3">{t('finalCtaTitle')}</h2>
        <p className="text-white/90 mb-8 max-w-md mx-auto text-sm sm:text-base">{t('finalCtaSubtitle')}</p>
        <button
          type="button"
          onClick={openSignup}
          className="px-8 py-3.5 bg-white text-palette-forest-dark rounded-xl font-semibold shadow-lg hover:bg-stone-50 transition-colors"
        >
          {t('createAccountCta')}
        </button>
      </div>
    </section>
  )
}

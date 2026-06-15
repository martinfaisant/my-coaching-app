import { getTranslations } from 'next-intl/server'
import { LandingSignupButton } from '@/components/landing/LandingSignupButton'
import { LandingPricingLink } from '@/components/landing/LandingPricingLink'
import type { FaqAudience } from '@/lib/faqPublicConfig'

type FaqFinalCtaProps = {
  audience: FaqAudience
  locale: string
}

export async function FaqFinalCta({ audience, locale }: FaqFinalCtaProps) {
  const namespace = audience === 'athlete' ? 'faqAthlete' : 'faqCoach'
  const t = await getTranslations(namespace)

  return (
    <section className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
      <h2 className="text-xl font-bold text-stone-900">{t('finalCta.title')}</h2>
      <p className="mt-2 text-sm text-stone-600">{t('finalCta.subtitle')}</p>
      {audience === 'athlete' ? (
        <div className="mt-6 flex justify-center">
          <LandingSignupButton label={t('finalCta.button')} />
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <LandingSignupButton label={t('finalCta.button')} />
          <LandingPricingLink locale={locale} context="finalCta" className="rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-semibold no-underline hover:bg-stone-50" />
        </div>
      )}
    </section>
  )
}

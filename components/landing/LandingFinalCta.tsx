import { getTranslations } from 'next-intl/server'
import { AuthButtons } from '@/components/AuthButtons'
import { LandingPricingLink } from '@/components/landing/LandingPricingLink'

type LandingFinalCtaProps = {
  locale: string
}

export async function LandingFinalCta({ locale }: LandingFinalCtaProps) {
  const t = await getTranslations('landing')

  return (
    <section
      className="bg-gradient-to-br from-palette-forest-dark to-palette-olive py-16 text-white lg:py-20"
      aria-labelledby="landing-cta-title"
    >
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 id="landing-cta-title" className="mb-4 text-3xl font-bold sm:text-4xl">
          {t('cta.title')}
        </h2>
        <p className="mx-auto mb-8 max-w-xl text-lg text-white/90">{t('cta.subtitle')}</p>
        <div className="mb-6 flex flex-col items-center gap-4">
          <AuthButtons variant="ctaBand" />
          <LandingPricingLink locale={locale} context="finalCta" tone="onDark" />
        </div>
      </div>
    </section>
  )
}

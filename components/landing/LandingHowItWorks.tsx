import { getTranslations } from 'next-intl/server'
import { LANDING_HOW_IT_WORKS_STEPS } from '@/lib/landingConfig'

export async function LandingHowItWorks() {
  const t = await getTranslations('landing')

  return (
    <section className="bg-stone-50 py-16 lg:py-20" aria-labelledby="landing-how-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 id="landing-how-title" className="mb-2 text-3xl font-bold text-stone-900 sm:text-4xl">
            {t('howItWorks.title')}
          </h2>
          <p className="text-stone-600">{t('howItWorks.subtitle')}</p>
        </div>

        <div className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12">
          <div
            className="pointer-events-none absolute top-8 hidden h-0.5 bg-gradient-to-r from-palette-forest-light via-palette-forest-dark/30 to-palette-forest-light md:block md:left-[16.666%] md:right-[16.666%]"
            aria-hidden
          />

          {LANDING_HOW_IT_WORKS_STEPS.map((step) => (
            <div key={step} className="relative text-center">
              <div className="relative z-10 mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-palette-forest-dark text-xl font-bold text-white shadow-lg">
                {step}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-stone-900">
                {t(`howItWorks.step${step}.title`)}
              </h3>
              <p className="text-sm leading-relaxed text-stone-600 md:text-base">
                {t(`howItWorks.step${step}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

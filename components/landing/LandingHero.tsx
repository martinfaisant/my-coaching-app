import { getTranslations } from 'next-intl/server'
import { AuthButtons } from '@/components/AuthButtons'
import { LandingHeroVisual } from '@/components/landing/LandingHeroVisual'
import { LandingPricingLink } from '@/components/landing/LandingPricingLink'

type LandingHeroProps = {
  locale: string
}

export async function LandingHero({ locale }: LandingHeroProps) {
  const t = await getTranslations('landing')

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-palette-forest-light/40 to-background py-10 lg:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-palette-forest-dark/20 bg-palette-forest-light/60 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-palette-forest-dark" />
              <span className="text-sm font-medium text-palette-forest-dark">
                {t('hero.badge')}
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl lg:text-6xl lg:leading-tight">
              {t('hero.title')}{' '}
              <span className="text-palette-forest-dark">{t('hero.titleHighlight')}</span>
            </h1>

            <p className="mx-auto max-w-md text-lg leading-relaxed text-stone-600 lg:mx-0">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-col items-center gap-4 lg:items-start">
              <AuthButtons variant="hero" />
              <LandingPricingLink locale={locale} context="hero" />
            </div>
          </div>

          <LandingHeroVisual locale={locale} />
        </div>
      </div>
    </section>
  )
}

import { Users, User } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { LandingScreenshotFrame } from '@/components/landing/LandingScreenshotFrame'
import { LandingSignupButton } from '@/components/landing/LandingSignupButton'
import { LandingPricingLink } from '@/components/landing/LandingPricingLink'

type LandingAudienceCardsProps = {
  locale: string
}

const ATHLETE_BULLET_KEYS = ['bullet1', 'bullet2', 'bullet3'] as const
const COACH_BULLET_KEYS = ['bullet1', 'bullet2', 'bullet3'] as const

export async function LandingAudienceCards({ locale }: LandingAudienceCardsProps) {
  const t = await getTranslations('landing')

  return (
    <section className="py-16 lg:py-20" aria-labelledby="landing-audience-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2
          id="landing-audience-title"
          className="mb-12 text-center text-3xl font-bold text-stone-900 sm:text-4xl"
        >
          {t('audience.title')}
        </h2>

        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          <article className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:border-palette-forest-light hover:shadow-lg lg:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-palette-forest-light text-palette-forest-dark">
                <User className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-stone-900">{t('audience.athlete.title')}</h3>
            </div>
            <ul className="mb-6 flex-1 space-y-2 text-sm text-stone-600">
              {ATHLETE_BULLET_KEYS.map((key) => (
                <li key={key} className="flex gap-2">
                  <span className="text-palette-forest-dark" aria-hidden>
                    ✓
                  </span>
                  {t(`audience.athlete.${key}`)}
                </li>
              ))}
            </ul>
            <div className="mb-6 grid grid-cols-2 gap-2">
              <LandingScreenshotFrame
                locale={locale}
                screenshotId="calendar-athlete"
                alt={t('showcase.screenshots.calendar-athlete.alt')}
                sizes="(max-width: 768px) 45vw, 240px"
                className="shadow-none"
                imageClassName="h-24 w-full object-cover object-top rounded-lg"
                aspectClassName="relative w-full"
              />
              <LandingScreenshotFrame
                locale={locale}
                screenshotId="workout-feedback"
                alt={t('showcase.screenshots.workout-feedback.alt')}
                sizes="(max-width: 768px) 45vw, 240px"
                className="shadow-none"
                imageClassName="h-24 w-full object-cover object-top rounded-lg"
                aspectClassName="relative w-full"
              />
            </div>
            <LandingSignupButton
              label={t('audience.athlete.cta')}
              fullWidth
            />
          </article>

          <article className="flex flex-col rounded-2xl border border-stone-200 bg-white p-6 transition-all hover:border-palette-forest-light hover:shadow-lg lg:p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-palette-forest-light text-palette-olive">
                <Users className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="text-xl font-bold text-stone-900">{t('audience.coach.title')}</h3>
            </div>
            <ul className="mb-6 flex-1 space-y-2 text-sm text-stone-600">
              {COACH_BULLET_KEYS.map((key) => (
                <li key={key} className="flex gap-2">
                  <span className="text-palette-forest-dark" aria-hidden>
                    ✓
                  </span>
                  {t(`audience.coach.${key}`)}
                </li>
              ))}
            </ul>
            <div className="mb-6 grid grid-cols-2 gap-2">
              <LandingScreenshotFrame
                locale={locale}
                screenshotId="calendar-coach"
                alt={t('showcase.screenshots.calendar-coach.alt')}
                sizes="(max-width: 768px) 45vw, 240px"
                className="shadow-none"
                imageClassName="h-24 w-full object-cover object-top rounded-lg"
                aspectClassName="relative w-full"
              />
              <LandingScreenshotFrame
                locale={locale}
                screenshotId="coach-offers"
                alt={t('showcase.screenshots.coach-offers.alt')}
                sizes="(max-width: 768px) 45vw, 240px"
                className="shadow-none"
                imageClassName="h-24 w-full object-cover object-top rounded-lg"
                aspectClassName="relative w-full"
              />
            </div>
            <div className="flex flex-col gap-2">
              <LandingSignupButton
                label={t('audience.coach.cta')}
                fullWidth
              />
              <LandingPricingLink
                locale={locale}
                context="coachCard"
                className="w-full justify-center py-2"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

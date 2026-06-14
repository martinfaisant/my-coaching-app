import { getTranslations } from 'next-intl/server'
import { LandingScreenshotFrame } from '@/components/landing/LandingScreenshotFrame'

type LandingHeroVisualProps = {
  locale: string
}

export async function LandingHeroVisual({ locale }: LandingHeroVisualProps) {
  const t = await getTranslations('landing')

  return (
    <>
      {/* Desktop : stack athlète devant, coach derrière */}
      <div className="relative hidden h-[420px] xl:h-[480px] lg:block">
        <div className="absolute right-0 top-8 w-[78%] rotate-1">
          <LandingScreenshotFrame
            locale={locale}
            screenshotId="calendar-coach"
            alt={t('showcase.screenshots.calendar-coach.alt')}
            sizes="(max-width: 1280px) 45vw, 540px"
            imageClassName="object-cover object-top max-h-[320px] w-full rounded-lg"
          />
        </div>
        <div className="absolute left-0 top-0 z-10 w-[85%] -rotate-1">
          <LandingScreenshotFrame
            locale={locale}
            screenshotId="calendar-athlete"
            alt={t('showcase.screenshots.calendar-athlete.alt')}
            priority
            sizes="(max-width: 1280px) 50vw, 600px"
            className="shadow-2xl"
            imageClassName="object-cover object-top max-h-[360px] w-full rounded-lg"
          />
        </div>
      </div>

      {/* Mobile : une seule capture */}
      <div className="lg:hidden">
        <LandingScreenshotFrame
          locale={locale}
          screenshotId="calendar-athlete"
          alt={t('showcase.screenshots.calendar-athlete.alt')}
          priority
          sizes="100vw"
          className="shadow-xl"
          imageClassName="object-cover object-top w-full rounded-lg"
        />
      </div>
    </>
  )
}

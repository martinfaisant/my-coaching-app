import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { pathWithLocale } from '@/lib/pathWithLocale'

type CoachPricingPublicManageBannerProps = {
  locale: string
}

export async function CoachPricingPublicManageBanner({ locale }: CoachPricingPublicManageBannerProps) {
  const t = await getTranslations({ locale, namespace: 'coachPricingPublic' })
  const subscriptionPath = pathWithLocale(locale, '/dashboard/coach-platform-subscription')

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 -mt-2">
      <div className="rounded-2xl border border-palette-forest-light/50 bg-palette-forest-light/20 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="font-semibold text-stone-900">{t('manageBannerTitle')}</p>
          <p className="text-sm text-stone-600 mt-1">{t('manageBannerDescription')}</p>
        </div>
        <Link
          href={subscriptionPath}
          className="inline-flex justify-center shrink-0 rounded-lg bg-palette-forest-dark text-white px-5 py-2.5 text-sm font-medium hover:bg-palette-olive transition-colors"
        >
          {t('manageSubscriptionCta')}
        </Link>
      </div>
    </div>
  )
}

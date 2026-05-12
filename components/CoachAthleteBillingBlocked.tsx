'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Button } from '@/components/Button'
import { createCoachPlatformCheckoutSession } from '@/app/[locale]/dashboard/athletes/coachPlatformActions'

type CoachAthleteBillingBlockedProps = {
  athletesListHref: string
}

export function CoachAthleteBillingBlocked({ athletesListHref }: CoachAthleteBillingBlockedProps) {
  const t = useTranslations('coachPlatform')
  const locale = useLocale()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = () => {
    setError(null)
    startTransition(async () => {
      const result = await createCoachPlatformCheckoutSession(locale, { returnPath: pathname })
      if (!result.ok) {
        setError(result.error)
        return
      }
      window.location.href = result.url
    })
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-6 min-h-[50vh]">
      <div className="max-w-md w-full rounded-2xl border border-stone-200 bg-section p-8 text-center">
        <p className="text-stone-800 font-semibold mb-2">{t('calendarBlockedTitle')}</p>
        <p className="text-sm text-stone-600 mb-6">{t('calendarBlockedDescription')}</p>
        {error ? <p className="text-sm text-palette-danger mb-4">{error}</p> : null}
        <div className="flex flex-col gap-3">
          <Button type="button" variant="primary" disabled={isPending} onClick={handleCheckout} className="w-full">
            {isPending ? t('checkoutPending') : t('checkoutCta')}
          </Button>
          <Link
            href={athletesListHref}
            className="text-sm font-medium text-palette-forest-dark hover:text-palette-olive underline"
          >
            {t('backToAthletes')}
          </Link>
        </div>
      </div>
    </div>
  )
}

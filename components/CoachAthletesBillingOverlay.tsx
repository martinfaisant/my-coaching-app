'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Button } from '@/components/Button'
import { createCoachPlatformCheckoutSession } from '@/app/[locale]/dashboard/athletes/coachPlatformActions'

type CoachAthletesBillingOverlayProps = {
  coachHasPlatformAccess: boolean
  athleteCount: number
}

export function CoachAthletesBillingOverlay({
  coachHasPlatformAccess,
  athleteCount,
}: CoachAthletesBillingOverlayProps) {
  const t = useTranslations('coachPlatform')
  const locale = useLocale()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const blocked = !coachHasPlatformAccess && athleteCount >= 1
  if (!blocked) return null

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
    <div className="relative rounded-2xl border border-stone-200 min-h-[12rem] mb-8">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-[2px] p-6 text-center border border-stone-200">
        <p className="text-stone-800 font-semibold text-sm md:text-base mb-1">{t('listBlockedTitle')}</p>
        <p className="text-sm text-stone-600 max-w-md mb-4">{t('listBlockedDescription')}</p>
        {error ? <p className="text-sm text-palette-danger mb-3 max-w-md">{error}</p> : null}
        <Button type="button" variant="primary" disabled={isPending} onClick={handleCheckout}>
          {isPending ? t('checkoutPending') : t('checkoutCta')}
        </Button>
      </div>
      <div className="p-6 opacity-40 pointer-events-none select-none" aria-hidden>
        <p className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">—</p>
        <div className="h-14 rounded-xl border border-stone-200 bg-stone-50 mb-2" />
        <div className="h-14 rounded-xl border border-stone-200 bg-stone-50" />
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { CoachPlatformSubscribeOffersModal } from '@/components/CoachPlatformSubscribeOffersModal'

type CoachAthleteBillingBlockedProps = {
  athletesListHref: string
}

export function CoachAthleteBillingBlocked({ athletesListHref }: CoachAthleteBillingBlockedProps) {
  const t = useTranslations('coachPlatform')
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false)

  return (
    <>
      <div className="flex flex-1 flex-col items-center justify-center p-6 min-h-[50vh]">
        <div className="max-w-md w-full rounded-2xl border border-stone-200 bg-section p-8 text-center">
          <p className="text-stone-800 font-semibold mb-2">{t('calendarBlockedTitle')}</p>
          <p className="text-sm text-stone-600 mb-6">{t('calendarBlockedDescription')}</p>
          <div className="flex flex-col gap-3">
            <Button type="button" variant="primary" onClick={() => setSubscribeModalOpen(true)} className="w-full">
              {t('checkoutCta')}
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
      <CoachPlatformSubscribeOffersModal
        isOpen={subscribeModalOpen}
        onClose={() => setSubscribeModalOpen(false)}
      />
    </>
  )
}

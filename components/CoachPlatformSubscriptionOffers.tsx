'use client'

import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'
import { CoachPlatformOfferGrid } from '@/components/CoachPlatformOfferGrid'
import { useState, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { createCoachPlatformCheckoutSession } from '@/app/[locale]/dashboard/athletes/coachPlatformActions'

type CoachPlatformSubscriptionOffersProps = {
  offers: CoachPlatformCatalogOffer[]
}

export function CoachPlatformSubscriptionOffers({ offers }: CoachPlatformSubscriptionOffersProps) {
  const locale = useLocale()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [pendingPriceId, setPendingPriceId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (offers.length === 0) return null

  const handleSubscribe = (priceId: string) => {
    setError(null)
    setPendingPriceId(priceId)
    startTransition(async () => {
      const result = await createCoachPlatformCheckoutSession(locale, {
        priceId,
        returnPath: pathname,
      })
      setPendingPriceId(null)
      if (!result.ok) {
        setError(result.error)
        return
      }
      window.location.href = result.url
    })
  }

  return (
    <section aria-labelledby="coach-msa-offers-heading" className="mb-8">
      <CoachPlatformOfferGrid
        offers={offers}
        showOffersHeading
        pendingPriceId={pendingPriceId}
        isPending={isPending}
        error={error}
        onSubscribe={handleSubscribe}
      />
    </section>
  )
}

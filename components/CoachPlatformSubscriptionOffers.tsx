'use client'

import { useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Button } from '@/components/Button'
import { createCoachPlatformCheckoutSession } from '@/app/[locale]/dashboard/athletes/coachPlatformActions'
import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'

type CoachPlatformSubscriptionOffersProps = {
  offers: CoachPlatformCatalogOffer[]
}

export function CoachPlatformSubscriptionOffers({ offers }: CoachPlatformSubscriptionOffersProps) {
  const t = useTranslations('coachMsaSubscription')
  const locale = useLocale()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [pendingPriceId, setPendingPriceId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (offers.length === 0) return null

  const formatPrice = (offer: CoachPlatformCatalogOffer): string => {
    if (offer.unitAmountMajor == null) return '—'
    try {
      return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
        style: 'currency',
        currency: offer.currency || 'EUR',
      }).format(offer.unitAmountMajor)
    } catch {
      return `${offer.unitAmountMajor} ${offer.currency}`
    }
  }

  const intervalLabel = (offer: CoachPlatformCatalogOffer): string | null => {
    if (!offer.interval) return null
    const count = offer.intervalCount ?? 1
    const key =
      offer.interval === 'month'
        ? count === 1
          ? 'priceIntervalPerMonth'
          : 'priceIntervalEveryNMonths'
        : offer.interval === 'year'
          ? count === 1
            ? 'priceIntervalPerYear'
            : 'priceIntervalEveryNYears'
          : null
    if (!key) return null
    if (key === 'priceIntervalEveryNMonths' || key === 'priceIntervalEveryNYears') {
      return t(key, { n: count })
    }
    return t(key)
  }

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
      <h2 id="coach-msa-offers-heading" className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-3">
        {t('offersTitle')}
      </h2>
      {error ? <p className="text-sm text-palette-danger mb-3">{error}</p> : null}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {offers.map((offer) => {
          const busy = isPending && pendingPriceId === offer.priceId
          const interval = intervalLabel(offer)
          return (
            <li
              key={offer.priceId}
              className="rounded-xl border border-stone-200 p-4 flex flex-col h-full min-w-0 bg-white shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900">{offer.productName}</p>
                {offer.description ? (
                  <p className="text-sm text-stone-600 mt-1 line-clamp-4">{offer.description}</p>
                ) : null}
                <p className="text-sm font-medium text-palette-forest-dark mt-2">
                  {formatPrice(offer)}
                  {interval ? <span className="text-stone-600 font-normal"> · {interval}</span> : null}
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                className="mt-4 w-full"
                disabled={isPending}
                onClick={() => handleSubscribe(offer.priceId)}
              >
                {busy ? t('subscribePending') : t('subscribeCta')}
              </Button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

'use client'

import { useMemo } from 'react'
import { useLocale, useMessages, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'
import {
  enrichCoachPlatformOffersForDisplay,
  getCoachMsaOfferOverridesFromMessages,
} from '@/lib/coachMsaOfferDisplay'

type CoachPlatformOfferGridProps = {
  offers: CoachPlatformCatalogOffer[]
  /** Bandeau « Offres disponibles » au-dessus de la grille (page dédiée) */
  showOffersHeading?: boolean
  pendingPriceId: string | null
  isPending: boolean
  error: string | null
  onSubscribe: (priceId: string) => void
}

export function CoachPlatformOfferGrid({
  offers,
  showOffersHeading = false,
  pendingPriceId,
  isPending,
  error,
  onSubscribe,
}: CoachPlatformOfferGridProps) {
  const t = useTranslations('coachMsaSubscription')
  const locale = useLocale()
  const messages = useMessages()

  const enriched = useMemo(() => {
    const overrides = getCoachMsaOfferOverridesFromMessages(messages)
    return enrichCoachPlatformOffersForDisplay(offers, overrides)
  }, [messages, offers])

  const formatPrice = (offer: (typeof enriched)[number]): string => {
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

  const intervalLabel = (offer: (typeof enriched)[number]): string | null => {
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

  if (offers.length === 0) return null

  return (
    <div className={showOffersHeading ? 'mb-8' : ''}>
      {showOffersHeading ? (
        <h2 id="coach-msa-offers-heading" className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-3">
          {t('offersTitle')}
        </h2>
      ) : null}
      {error ? <p className="text-sm text-palette-danger mb-3">{error}</p> : null}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {enriched.map((offer) => {
          const busy = isPending && pendingPriceId === offer.priceId
          const interval = intervalLabel(offer)
          return (
            <li
              key={offer.priceId}
              className="rounded-xl border border-stone-200 p-4 flex flex-col h-full min-w-0 bg-white shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-stone-900">{offer.displayTitle}</p>
                {offer.displayDescription ? (
                  <p className="text-sm text-stone-600 mt-1 line-clamp-4">{offer.displayDescription}</p>
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
                onClick={() => onSubscribe(offer.priceId)}
              >
                {busy ? t('subscribePending') : t('subscribeCta')}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

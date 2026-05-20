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
  /** Si > 0 : badge + ligne d’essai (variable `COACH_PLATFORM_SUBSCRIPTION_TRIAL_DAYS`). */
  subscriptionTrialDays?: number
  pendingPriceId: string | null
  isPending: boolean
  error: string | null
  onSubscribe: (priceId: string) => void
}

function formatMainPrice(offer: CoachPlatformCatalogOffer, locale: string): string {
  if (offer.unitAmountMajor == null) return '—'
  try {
    return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
      style: 'currency',
      currency: offer.currency || 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: offer.unitAmountMajor % 1 === 0 ? 0 : 2,
    }).format(offer.unitAmountMajor)
  } catch {
    return `${offer.unitAmountMajor} ${offer.currency}`
  }
}

function offerIntervalSlash(
  offer: CoachPlatformCatalogOffer,
  t: (key: string, values?: Record<string, number | string>) => string
): string | null {
  if (!offer.interval) return null
  const count = offer.intervalCount ?? 1
  if (offer.interval === 'month') {
    return count === 1 ? t('priceDisplayedUnitPerMonth') : t('priceDisplayedUnitEveryNMonths', { n: count })
  }
  if (offer.interval === 'year') {
    return count === 1 ? t('priceDisplayedUnitPerYear') : t('priceDisplayedUnitEveryNYears', { n: count })
  }
  return null
}

export function CoachPlatformOfferGrid({
  offers,
  subscriptionTrialDays = 0,
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

  const trialCampaignActive = subscriptionTrialDays > 0

  if (offers.length === 0) return null

  return (
    <>
      {error ? <p className="text-sm text-palette-danger mb-3">{error}</p> : null}
      <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {enriched.map((offer) => {
          const busy = isPending && pendingPriceId === offer.priceId
          const intervalSlash = offerIntervalSlash(offer, t)
          const mainPrice = formatMainPrice(offer, locale)
          const thenPriceCompact =
            offer.unitAmountMajor != null && intervalSlash
              ? `${mainPrice}${intervalSlash}`
              : mainPrice

          const bodyCopy = offer.displayTagline ?? offer.displayDescription

          return (
            <li
              key={offer.priceId}
              className="rounded-2xl border border-stone-200 bg-white shadow-sm p-6 flex flex-col h-full min-w-0 transition-all"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 min-w-0">
                  <h3 className="text-lg font-bold text-stone-900 min-w-0 text-left">{offer.displayTitle}</h3>
                  {trialCampaignActive ? (
                    <span className="shrink-0 px-2.5 py-0.5 rounded-full bg-palette-forest-dark/10 text-palette-forest-dark text-xs font-bold uppercase tracking-wider">
                      {t('trialCatalogBadgeFreeDays', { days: subscriptionTrialDays })}
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex items-baseline gap-1 flex-wrap">
                  <span className="text-3xl font-black text-stone-900 tabular-nums">{mainPrice}</span>
                  {intervalSlash ? (
                    <span className="text-sm font-normal text-stone-500 whitespace-nowrap">{intervalSlash}</span>
                  ) : null}
                </div>

                {trialCampaignActive ? (
                  <p className="text-xs font-medium text-palette-forest-dark mb-4">
                    {t('trialCatalogTrialLine', {
                      days: subscriptionTrialDays,
                      thenPrice: thenPriceCompact,
                    })}
                  </p>
                ) : null}

                {bodyCopy ? (
                  <p className="text-sm text-stone-600 mb-6 min-h-[2.5rem] leading-snug">{bodyCopy}</p>
                ) : null}

                {offer.displayFeatures.length > 0 ? (
                  <ul className="space-y-3">
                    {offer.displayFeatures.map((line) => (
                      <li key={line} className="flex items-start gap-2.5 text-sm text-stone-600">
                        <svg
                          className="w-5 h-5 text-palette-forest-dark shrink-0 mt-0.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <Button
                type="button"
                variant="primary"
                className="mt-8 w-full"
                disabled={isPending}
                onClick={() => onSubscribe(offer.priceId)}
              >
                {busy ? t('subscribePending') : t('subscribeCta')}
              </Button>
            </li>
          )
        })}
      </ul>
    </>
  )
}

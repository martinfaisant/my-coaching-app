'use client'

import { useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import type { CoachPlatformBillingPeriod } from '@/lib/coachPlatformSubscriptionDisplay'

const CalendarIcon = () => (
  <svg
    className="w-4 h-4 text-stone-400 shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
    />
  </svg>
)

const WarningIcon = () => (
  <svg
    className="w-4 h-4 text-palette-amber shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    aria-hidden
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
)

export type CoachPlatformCurrentOfferCardProps = {
  planLabel: string
  status: 'active' | 'trialing'
  scheduledEnd: boolean
  accessEndLabel: string | null
  periodEndLabel: string | null
  priceLine: string | null
  priceIntervalSuffix: string | null
  trialRemainingMessage: string | null
  pricingUnavailable: boolean
  billingPeriod: CoachPlatformBillingPeriod
  onManage: () => void
  onResumeScheduledEnd: () => void
}

export function CoachPlatformCurrentOfferCard({
  planLabel,
  status,
  scheduledEnd,
  accessEndLabel,
  periodEndLabel,
  priceLine,
  priceIntervalSuffix,
  trialRemainingMessage,
  pricingUnavailable,
  billingPeriod,
  onManage,
  onResumeScheduledEnd,
}: CoachPlatformCurrentOfferCardProps) {
  const t = useTranslations('coachMsaSubscription.currentOfferCard')
  const tSub = useTranslations('coachMsaSubscription')

  if (scheduledEnd) {
    return (
      <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-palette-amber" aria-hidden />
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-stone-900 min-w-0">{planLabel}</h3>
          <span className="shrink-0 inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-palette-amber/15 text-stone-900 border border-palette-amber/30">
            {t('badgeScheduledEnd')}
          </span>
        </div>

        {accessEndLabel ? (
          <div className="rounded-xl p-3.5 border border-palette-amber/25 bg-palette-amber/10 text-xs text-stone-800 my-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-stone-900">
                <WarningIcon />
                <span>{t('scheduledAlertTitle')}</span>
              </div>
              <p className="leading-relaxed text-stone-600">{t('scheduledAlertBody', { date: accessEndLabel })}</p>
            </div>
            {priceLine ? (
              <div className="flex items-baseline gap-1.5 shrink-0 tabular-nums sm:self-center">
                <span className="text-lg font-black text-stone-400 line-through tracking-tight sm:text-xl">
                  {priceLine}
                </span>
                {priceIntervalSuffix ? (
                  <span className="text-sm font-normal text-stone-500">{priceIntervalSuffix}</span>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-stone-50">
          <p className="text-xs text-stone-500">{t('scheduledFooterHint')}</p>
          <Button type="button" variant="primary" className="w-full sm:w-auto shrink-0" onClick={onResumeScheduledEnd}>
            {t('resumeScheduledEnd')}
          </Button>
        </div>
      </div>
    )
  }

  const statusBadge =
    status === 'trialing' ? tSub('subscriptionStatus.trialing') : tSub('subscriptionStatus.active')

  return (
    <div className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-xl font-bold text-stone-900 min-w-0">{planLabel}</h3>
        <span className="shrink-0 inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20">
          {statusBadge}
        </span>
      </div>

      {status === 'trialing' && trialRemainingMessage ? (
        <p className="text-sm text-stone-700 font-medium mt-3">{trialRemainingMessage}</p>
      ) : null}

      <div className="py-4 border-t border-b border-stone-100 my-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-2.5 text-sm text-stone-600 min-w-0">
          <CalendarIcon />
          {status === 'trialing' && priceLine ? (
            <span>
              <span className="font-normal text-stone-800">{tSub('trialThenPrefix')}</span>{' '}
              <strong className="text-stone-900">{priceLine}</strong>
              {priceIntervalSuffix ? (
                <span className="text-stone-500"> {priceIntervalSuffix}</span>
              ) : null}
              {periodEndLabel ? (
                <>
                  {' '}
                  · {t('trialEndOn', { date: periodEndLabel })}
                </>
              ) : null}
            </span>
          ) : periodEndLabel ? (
            <span>
              {t('nextPaymentOn', { date: periodEndLabel })}
            </span>
          ) : null}
        </div>
        {status === 'active' && priceLine && !pricingUnavailable ? (
          <div className="shrink-0 md:text-right">
            <span className="text-2xl font-black text-stone-900 tabular-nums tracking-tight">{priceLine}</span>
            {priceIntervalSuffix ? (
              <span className="text-sm text-stone-500"> {priceIntervalSuffix}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      {pricingUnavailable && status === 'active' ? (
        <p className="text-sm text-stone-500 -mt-2 mb-4">{tSub('cardPricingUnavailable')}</p>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <p className="text-xs text-stone-500">
          {status === 'trialing' ? t('footerHintTrial') : t('footerHintActive')}
        </p>
        {billingPeriod !== 'other' ? (
          <Button type="button" variant="muted" className="w-full sm:w-auto shrink-0" onClick={onManage}>
            {t('manage')}
          </Button>
        ) : null}
      </div>
    </div>
  )
}

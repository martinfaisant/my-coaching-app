'use client'

import { CoachPlatformCurrentOfferCard } from '@/components/CoachPlatformCurrentOfferCard'
import { CoachPlatformManageSubscriptionFlow } from '@/components/CoachPlatformManageSubscriptionFlow'
import type { CoachPlatformBillingPeriod } from '@/lib/coachPlatformSubscriptionDisplay'

export type CoachPlatformSubscriptionStatusSectionProps = {
  locale: string
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
}

export function CoachPlatformSubscriptionStatusSection(props: CoachPlatformSubscriptionStatusSectionProps) {
  const {
    locale,
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
  } = props

  return (
    <CoachPlatformManageSubscriptionFlow
      locale={locale}
      status={status}
      billingPeriod={billingPeriod}
      periodEndLabel={periodEndLabel}
    >
      {({ onManage, onResumeScheduledEnd }) => (
        <CoachPlatformCurrentOfferCard
          planLabel={planLabel}
          status={status}
          scheduledEnd={scheduledEnd}
          accessEndLabel={accessEndLabel}
          periodEndLabel={periodEndLabel}
          priceLine={priceLine}
          priceIntervalSuffix={priceIntervalSuffix}
          trialRemainingMessage={trialRemainingMessage}
          pricingUnavailable={pricingUnavailable}
          billingPeriod={billingPeriod}
          onManage={onManage}
          onResumeScheduledEnd={onResumeScheduledEnd}
        />
      )}
    </CoachPlatformManageSubscriptionFlow>
  )
}

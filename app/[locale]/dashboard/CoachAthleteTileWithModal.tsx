'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AthleteTile } from '@/components/AthleteTile'
import { getFrozenTitleForLocale } from '@/lib/frozenOfferI18n'
import type { AthleteTileNextGoal } from '@/components/AthleteTile'
import { CoachSubscriptionDetailModal } from '@/app/[locale]/dashboard/CoachSubscriptionDetailModal'
import type { CoachSubscriptionRow } from '@/app/[locale]/dashboard/CoachSubscriptionDetailModal'

type Props = {
  athlete: {
    displayName: string
    avatarUrl: string | null
  }
  subscription: CoachSubscriptionRow | null
  subscriptionTitle: string | null
  locale: string
  /** Current user id (coach): only they can cancel a cancellation they requested. */
  currentUserId?: string | null
  athleteHref: string
  practicedSports: string[]
  nextGoal: AthleteTileNextGoal | null
  plannedUntil?: string | null
  isUpToDate: boolean
  labels: {
    nextGoal: string
    noGoal: string
    plannedUntil: string
    upToDate: string
    late: string
  }
  viewPlanningLabel: string
}

export function CoachAthleteTileWithModal({
  athlete,
  subscription,
  subscriptionTitle,
  locale,
  currentUserId = null,
  athleteHref,
  practicedSports,
  nextGoal,
  plannedUntil,
  isUpToDate,
  labels,
  viewPlanningLabel,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <AthleteTile
        avatarUrl={athlete.avatarUrl}
        displayName={athlete.displayName}
        practicedSports={practicedSports}
        nextGoal={nextGoal}
        plannedUntil={plannedUntil}
        isUpToDate={isUpToDate}
        subscriptionTitle={subscriptionTitle}
        onSubscriptionClick={subscription ? () => setModalOpen(true) : undefined}
        footer={
          <Link
            href={athleteHref}
            className="text-xs font-medium text-palette-forest-dark hover:text-palette-forest-darker flex items-center justify-end transition-transform group-hover:translate-x-1"
          >
            {viewPlanningLabel}
            <svg className="w-4 h-4 ml-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        }
        labels={labels}
      />

      {subscription && (
        <CoachSubscriptionDetailModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          subscription={subscription}
          athlete={athlete}
          locale={locale}
          currentUserId={currentUserId}
        />
      )}
    </>
  )
}

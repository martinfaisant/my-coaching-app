'use client'

import { useTranslations } from 'next-intl'
import { Modal } from '@/components/Modal'
import { EndSubscriptionButton } from '@/app/[locale]/dashboard/coach/EndSubscriptionButton'
import { CancelCancellationButton } from '@/app/[locale]/dashboard/coach/CancelCancellationButton'
import { getFrozenTitleForLocale, getFrozenDescriptionForLocale } from '@/lib/frozenOfferI18n'
import { formatShortDate } from '@/lib/dateUtils'
import { getNextMonthlyCycleEndDate } from '@/lib/dateUtils'
import { getInitials } from '@/lib/stringUtils'
import type { FrozenPriceType } from '@/types/database'

export type CoachSubscriptionRow = {
  id: string
  frozen_title_fr?: string | null
  frozen_title_en?: string | null
  frozen_title?: string | null
  frozen_description_fr?: string | null
  frozen_description_en?: string | null
  frozen_description?: string | null
  frozen_price: number | null
  frozen_price_type: FrozenPriceType | null
  start_date: string
  end_date: string | null
  status?: 'active' | 'cancelled' | 'cancellation_scheduled'
  cancellation_requested_by_user_id?: string | null
}

export type CoachSubscriptionDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  subscription: CoachSubscriptionRow
  athlete: { displayName: string; avatarUrl: string | null }
  locale: string
  /** Current user id: only this user can cancel the cancellation (when they requested it). */
  currentUserId?: string | null
}

function formatPriceType(
  sub: { frozen_price: number | null; frozen_price_type: FrozenPriceType | null },
  t: (key: string, values?: Record<string, string | number>) => string
): string {
  const type = sub.frozen_price_type ?? 'one_time'
  const price = sub.frozen_price ?? 0
  if (type === 'free' || price === 0) return t('subscription.free')
  if (type === 'monthly') return t('subscription.monthly', { price })
  return t('subscription.oneTime', { price })
}

function isCancellationScheduled(sub: CoachSubscriptionRow): boolean {
  const status = sub.status ?? 'active'
  if (status === 'cancellation_scheduled') return true
  if (status === 'active' && sub.end_date) {
    const end = new Date(sub.end_date)
    return end > new Date()
  }
  return false
}

export function CoachSubscriptionDetailModal({
  isOpen,
  onClose,
  subscription,
  athlete,
  locale,
  currentUserId = null,
}: CoachSubscriptionDetailModalProps) {
  const tDetail = useTranslations('athletes.subscriptionDetail')
  const tMyCoach = useTranslations('myCoach')
  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR'
  const scheduled = isCancellationScheduled(subscription)
  const canCancelCancellation =
    scheduled &&
    currentUserId != null &&
    (subscription.cancellation_requested_by_user_id ?? null) === currentUserId
  const endDateFormatted =
    subscription.end_date
      ? formatShortDate(subscription.end_date, dateLocale)
      : subscription.frozen_price_type === 'monthly'
        ? formatShortDate(getNextMonthlyCycleEndDate(subscription.start_date), dateLocale)
        : null

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tDetail('title')} size="lg">
      <div className="px-6 py-4 space-y-4">
        <div className="flex items-center gap-4">
          {athlete.avatarUrl?.trim() ? (
            <img
              src={athlete.avatarUrl}
              alt=""
              className="w-12 h-12 rounded-full object-cover ring-2 ring-stone-100"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-palette-olive text-white flex items-center justify-center text-base font-bold ring-2 ring-stone-100">
              {getInitials(athlete.displayName)}
            </div>
          )}
          <div>
            <p className="font-bold text-stone-900">{athlete.displayName}</p>
            <p className="text-sm text-stone-500">{tDetail('athleteLabel')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-bold text-stone-900 min-w-0 flex-1">
            {getFrozenTitleForLocale(subscription, locale) || '—'}
          </h3>
          {scheduled ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-amber border border-palette-amber shrink-0">
              {tMyCoach('subscription.cancellationScheduledBadge')}
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20 shrink-0">
              {tMyCoach('subscription.activeBadge')}
            </span>
          )}
        </div>

        {getFrozenDescriptionForLocale(subscription, locale) && (
          <p className="text-sm text-stone-600">
            {getFrozenDescriptionForLocale(subscription, locale)}
          </p>
        )}

        <p className="text-sm text-stone-600">
          {formatPriceType(subscription, tMyCoach)}
          {' · '}
          {tMyCoach('subscription.startedOn', { date: formatShortDate(subscription.start_date, dateLocale) })}
          {subscription.end_date && (
            <>
              {' · '}
              {tMyCoach('subscription.endPlannedOn', {
                date: formatShortDate(subscription.end_date, dateLocale),
              })}
            </>
          )}
        </p>

        {(scheduled && canCancelCancellation) || !scheduled ? (
          <div className="mt-5 pt-4 border-t border-stone-200 flex justify-end">
            {scheduled ? (
              <CancelCancellationButton subscriptionId={subscription.id} locale={locale} onSuccess={onClose} />
            ) : (
              <EndSubscriptionButton
                subscriptionId={subscription.id}
                isMonthly={subscription.frozen_price_type === 'monthly'}
                endDateFormatted={endDateFormatted}
                locale={locale}
              />
            )}
          </div>
        ) : null}
      </div>
    </Modal>
  )
}

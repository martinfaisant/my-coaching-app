'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CoachSubscriptionDetailModal } from '@/app/[locale]/dashboard/CoachSubscriptionDetailModal'
import { TileCard } from '@/components/TileCard'
import { getFrozenTitleForLocale, getFrozenDescriptionForLocale } from '@/lib/frozenOfferI18n'
import { formatShortDate } from '@/lib/dateUtils'
import type { CoachSubscriptionRow } from '@/app/[locale]/dashboard/CoachSubscriptionDetailModal'
import type { FrozenPriceType } from '@/types/database'

export type ActiveSubscriptionItem = {
  subscription: CoachSubscriptionRow
  athlete: { displayName: string; avatarUrl: string | null }
}

export type HistorySubscriptionItem = {
  subscription: CoachSubscriptionRow
  athlete: { displayName: string }
}

type Props = {
  activeSubscriptions: ActiveSubscriptionItem[]
  cancellationScheduledSubscriptions: ActiveSubscriptionItem[]
  historySubscriptions: HistorySubscriptionItem[]
  locale: string
  /** Current user id (coach): only they can cancel a cancellation they requested. */
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

export function CoachSubscriptionsContent({
  activeSubscriptions,
  cancellationScheduledSubscriptions,
  historySubscriptions,
  locale,
  currentUserId = null,
}: Props) {
  const t = useTranslations('coachSubscriptions')
  const tMyCoach = useTranslations('myCoach')
  const tHistory = useTranslations('subscriptionHistory')
  const tDetail = useTranslations('athletes.subscriptionDetail')
  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR'
  const [selectedSubscription, setSelectedSubscription] = useState<ActiveSubscriptionItem | null>(null)

  return (
    <>
      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-4">{t('activeSection')}</h2>
        {activeSubscriptions.length === 0 ? (
          <p className="text-sm text-stone-500">{t('noActive')}</p>
        ) : (
          <ul className="space-y-4">
            {activeSubscriptions.map((item) => (
              <li
                key={item.subscription.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedSubscription(item)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedSubscription(item)}
                className="rounded-lg border border-l-4 border-stone-200 border-l-palette-forest-dark bg-white shadow-sm p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:border-palette-forest-dark/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSubscription(item)}
                    className="text-sm font-semibold text-stone-900 hover:text-palette-forest-dark transition-colors text-left"
                  >
                    {item.athlete.displayName}
                  </button>
                  <p className="text-sm text-stone-600 mt-0.5">
                    {getFrozenTitleForLocale(item.subscription, locale) || '—'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {formatPriceType(item.subscription, tMyCoach)} · {tMyCoach('subscription.fromDate', { date: formatShortDate(item.subscription.start_date, dateLocale) })} · {t('inProgress')}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedSubscription(item)}
                    className="text-sm font-medium text-palette-forest-dark hover:text-palette-forest-darker"
                  >
                    {t('viewDetail')}
                  </button>
                  <EndSubscriptionButtonPlaceholder
                    onClick={() => setSelectedSubscription(item)}
                    label={tMyCoach('subscription.endButton')}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mb-10">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-4">{t('cancellationScheduledSection')}</h2>
        {cancellationScheduledSubscriptions.length === 0 ? (
          <p className="text-sm text-stone-500">{t('noCancellationScheduled')}</p>
        ) : (
          <ul className="space-y-4">
            {cancellationScheduledSubscriptions.map((item) => (
              <li
                key={item.subscription.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedSubscription(item)}
                onKeyDown={(e) => e.key === 'Enter' && setSelectedSubscription(item)}
                className="rounded-lg border border-l-4 border-stone-200 border-l-palette-amber bg-white shadow-sm p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:border-palette-amber/50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSubscription(item)}
                    className="text-sm font-semibold text-stone-900 hover:text-palette-forest-dark transition-colors text-left"
                  >
                    {item.athlete.displayName}
                  </button>
                  <p className="text-sm text-stone-600 mt-0.5">
                    {getFrozenTitleForLocale(item.subscription, locale) || '—'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {formatPriceType(item.subscription, tMyCoach)} · {tMyCoach('subscription.fromDate', { date: formatShortDate(item.subscription.start_date, dateLocale) })}
                    {item.subscription.end_date && (
                      <> · {tMyCoach('subscription.endPlannedOn', { date: formatShortDate(item.subscription.end_date, dateLocale) })}</>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedSubscription(item)}
                    className="text-sm font-medium text-palette-forest-dark hover:text-palette-forest-darker"
                  >
                    {t('viewDetail')}
                  </button>
                  {item.subscription.cancellation_requested_by_user_id === currentUserId && (
                    <EndSubscriptionButtonPlaceholder
                      onClick={() => setSelectedSubscription(item)}
                      label={tMyCoach('subscription.cancelCancellationButton')}
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-4">{t('historySection')}</h2>
        <p className="text-sm text-stone-600 mb-4">{t('historyIntro')}</p>
        {historySubscriptions.length === 0 ? (
          <p className="text-sm text-stone-500">{t('noHistory')}</p>
        ) : (
          <ul className="space-y-3">
            {historySubscriptions.map((item) => (
              <li key={item.subscription.id}>
                <TileCard leftBorderColor="stone" badge={tHistory('terminatedBadge')}>
                  <p className="font-semibold text-stone-900 text-sm">
                    {item.athlete.displayName}
                  </p>
                  <p className="text-sm text-stone-600 mt-0.5">
                    {getFrozenTitleForLocale(item.subscription, locale) || '—'}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    {formatPriceType(item.subscription, tMyCoach)} · {tHistory('periodFromTo', {
                      start: formatShortDate(item.subscription.start_date, dateLocale),
                      end: item.subscription.end_date ? formatShortDate(item.subscription.end_date, dateLocale) : '—',
                    })}
                  </p>
                </TileCard>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedSubscription && (
        <CoachSubscriptionDetailModal
          isOpen={!!selectedSubscription}
          onClose={() => setSelectedSubscription(null)}
          subscription={selectedSubscription.subscription}
          athlete={selectedSubscription.athlete}
          locale={locale}
          currentUserId={currentUserId}
        />
      )}
    </>
  )
}

function EndSubscriptionButtonPlaceholder({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-4 py-2 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 bg-white hover:bg-stone-50"
    >
      {label}
    </button>
  )
}

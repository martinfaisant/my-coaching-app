import type { Metadata } from 'next'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/utils/supabase/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { TileCard } from '@/components/TileCard'
import { getFrozenTitleForLocale, getFrozenDescriptionForLocale } from '@/lib/frozenOfferI18n'
import { getDisplayName } from '@/lib/displayName'
import { formatShortDate } from '@/lib/dateUtils'
import type { FrozenPriceType } from '@/types/database'

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

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'subscriptionHistory' })
  return { title: t('title') }
}

export default async function SubscriptionHistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'athlete') {
    redirect('/dashboard')
  }

  const t = await getTranslations({ locale, namespace: 'subscriptionHistory' })
  const tMyCoach = await getTranslations({ locale, namespace: 'myCoach' })
  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR'

  const supabase = await createClient()
  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, coach_id, frozen_title, frozen_title_fr, frozen_title_en, frozen_description, frozen_description_fr, frozen_description_en, frozen_price, frozen_price_type, start_date, end_date')
    .eq('athlete_id', current.id)
    .eq('status', 'cancelled')
    .order('end_date', { ascending: false })

  const coachIds = [...new Set((subscriptions ?? []).map((s) => s.coach_id).filter(Boolean))]
  const { data: coachProfiles } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email')
    .in('user_id', coachIds)

  const coachNameById = new Map<string, string>()
  for (const p of coachProfiles ?? []) {
    coachNameById.set(p.user_id, getDisplayName(p))
  }

  return (
    <DashboardPageShell title={t('title')}>
      {!subscriptions?.length ? (
        <p className="text-sm text-stone-500">{t('noSubscriptions')}</p>
      ) : (
        <ul className="space-y-3">
          {subscriptions.map((sub) => (
            <li key={sub.id}>
              <TileCard leftBorderColor="stone" badge={t('terminatedBadge')}>
                <p className="font-semibold text-stone-900 text-sm">
                  {coachNameById.get(sub.coach_id) ?? '—'}{' '}
                  <span className="text-stone-500 font-normal">· {t('coachLabel')}</span>
                </p>
                <h3 className="text-sm font-semibold text-stone-800 mt-1">
                  {getFrozenTitleForLocale(sub, locale) || '—'}
                </h3>
                {getFrozenDescriptionForLocale(sub, locale) && (
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                    {getFrozenDescriptionForLocale(sub, locale)}
                  </p>
                )}
                <p className="text-xs text-stone-500 mt-1.5">
                  {formatPriceType(sub, tMyCoach)} · {t('periodFromTo', {
                    start: formatShortDate(sub.start_date, dateLocale),
                    end: sub.end_date ? formatShortDate(sub.end_date, dateLocale) : '—',
                  })}
                </p>
              </TileCard>
            </li>
          ))}
        </ul>
      )}
    </DashboardPageShell>
  )
}

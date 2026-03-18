import type { Metadata } from 'next'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/utils/supabase/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { AvatarImage } from '@/components/AvatarImage'
import { getMyCoachRating } from './actions'
import { CoachRatingForm } from './CoachRatingForm'
import { LANGUAGES_OPTIONS } from '@/lib/sportsOptions'
import { SPORT_ICONS, SPORT_TRANSLATION_KEYS } from '@/lib/sportStyles'
import type { SportType } from '@/lib/sportStyles'
import { getInitials } from '@/lib/stringUtils'
import { getDisplayName } from '@/lib/displayName'
import { formatShortDate, formatDateFr, getNextMonthlyCycleEndDate } from '@/lib/dateUtils'
import { getFrozenTitleForLocale, getFrozenDescriptionForLocale } from '@/lib/frozenOfferI18n'
import type { FrozenPriceType } from '@/types/database'
import { EndSubscriptionButton } from './EndSubscriptionButton'
import { CancelCancellationButton } from './CancelCancellationButton'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'navigation' })
  return {
    title: t('myCoach')
  }
}

function languageLabel(value: string): string {
  return LANGUAGES_OPTIONS.find((o) => o.value === value)?.label ?? value
}

function getInitialsForCoach(fullName: string | null, email: string): string {
  const name = (fullName ?? '').trim()
  if (name) return getInitials(name)
  return getInitials(email)
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

export default async function MonCoachPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'myCoach' })
  const tSports = await getTranslations({ locale, namespace: 'sports' })
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'athlete' || !current.profile.coach_id) {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('id, frozen_title, frozen_title_fr, frozen_title_en, frozen_description, frozen_description_fr, frozen_description_en, frozen_price, frozen_price_type, start_date, end_date, status, cancellation_requested_by_user_id')
    .eq('athlete_id', current.id)
    .in('status', ['active', 'cancellation_scheduled'])
    .limit(2)

  const now = new Date()
  const activeSubscription = (subscriptions ?? []).find(
    (s) => !s.end_date || new Date(s.end_date) > now
  ) ?? null

  const isCancellationScheduled =
    activeSubscription?.status === 'cancellation_scheduled' ||
    (activeSubscription?.status === 'active' &&
      !!activeSubscription?.end_date &&
      new Date(activeSubscription.end_date) > now)
  const canCancelCancellation =
    isCancellationScheduled &&
    activeSubscription != null &&
    (activeSubscription.cancellation_requested_by_user_id ?? null) === current.id

  const { data: coach } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, coached_sports, languages, presentation_fr, presentation_en, avatar_url')
    .eq('user_id', current.profile.coach_id)
    .single()

  if (!coach) {
    return (
      <DashboardPageShell>
        <p className="mt-1 text-sm text-stone-600">{t('notFound')}</p>
      </DashboardPageShell>
    )
  }

  const myRating = await getMyCoachRating(current.profile.coach_id!)

  const displayPresentation =
    locale === 'fr'
      ? (coach.presentation_fr ?? '').trim() || (coach.presentation_en ?? '').trim()
      : (coach.presentation_en ?? '').trim() || (coach.presentation_fr ?? '').trim()

  const dateLocale = locale === 'en' ? 'en-GB' : 'fr-FR'

  const isMonthly =
    activeSubscription?.frozen_price_type === 'monthly'
  const endDateFormattedForModal =
    activeSubscription && isMonthly
      ? activeSubscription.end_date
        ? formatDateFr(activeSubscription.end_date, false, dateLocale)
        : formatDateFr(
            getNextMonthlyCycleEndDate(activeSubscription.start_date),
            false,
            dateLocale
          )
      : null

  return (
    <DashboardPageShell>
        {/* Carte principale avec bannière et avatar */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
          {/* BANNIÈRE BRANDÉE : Dégradé Forest Dark -> Olive */}
          <div className="h-[136px] bg-gradient-palette relative">
            {/* Avatar positionné sur la bannière */}
            <div className="absolute -bottom-10 left-8">
              <div className="relative">
                <div className="w-28 h-28 rounded-full bg-stone-100 border-4 border-white shadow-md flex items-center justify-center text-stone-300 overflow-hidden">
                  <AvatarImage
                    src={coach.avatar_url}
                    initials={getInitialsForCoach(getDisplayName(coach), coach.email)}
                    alt={t('avatarAlt')}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contenu */}
          <div className="pt-16 pb-4 px-8">
            {/* Header section */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-stone-800">
                {getDisplayName(coach, coach.email)}
              </h1>
            </div>

            {/* Section Sports coachés et Langues sur la même ligne */}
            {((coach.coached_sports ?? []).length > 0 || (coach.languages ?? []).length > 0) && (
              <div className="mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Section Sports coachés */}
                  {(coach.coached_sports ?? []).length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-3">{t('coachedSports')}</h2>
                      <div className="flex flex-wrap gap-3">
                        {(coach.coached_sports ?? []).map((sportValue: string) => {
                          const sportKey = sportValue in SPORT_ICONS ? (sportValue as SportType) : 'course'
                          const Icon = SPORT_ICONS[sportKey]
                          const translationKey = SPORT_TRANSLATION_KEYS[sportKey]
                          const label = translationKey ? tSports(translationKey) : sportValue
                          return (
                            <div
                              key={sportValue}
                              className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 text-sm font-medium select-none flex items-center gap-2"
                            >
                              <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
                              <span>{label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Section Langues */}
                  {(coach.languages ?? []).length > 0 && (
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-3">{t('spokenLanguages')}</h2>
                      <div className="flex flex-wrap gap-2">
                        {(coach.languages ?? []).map((langCode: string) => {
                          const opt = LANGUAGES_OPTIONS.find(o => o.value === langCode)
                          return (
                            <div
                              key={langCode}
                              className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 text-sm font-medium select-none"
                            >
                              {opt?.label ?? languageLabel(langCode)}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {((coach.coached_sports ?? []).length > 0 || (coach.languages ?? []).length > 0) && (
              <hr className="border-stone-100 my-4" />
            )}

            {/* Présentation (selon langue d'affichage) */}
            {displayPresentation && (
              <div className="mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-3">{t('presentation')}</h2>
                <div className="relative">
                  <p className="w-full border border-stone-200 rounded-xl p-4 text-stone-700 leading-relaxed text-sm bg-stone-50 whitespace-pre-wrap">
                    {displayPresentation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bloc Ma souscription (US1) – design aligné mockup 01 */}
        <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100 mb-8">
          <div className="px-8 py-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-700 mb-4">{t('subscription.blockTitle')}</h2>
            {activeSubscription ? (
              <div className="border border-stone-200 rounded-xl p-5 bg-stone-50/50">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-stone-900">
                    {getFrozenTitleForLocale(activeSubscription, locale) || t('subscription.inProgress')}
                  </h3>
                  {isCancellationScheduled ? (
                    <span className="inline-flex shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-palette-amber border border-palette-amber">
                      {t('subscription.cancellationScheduledBadge')}
                    </span>
                  ) : (
                    <span className="inline-flex shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20">
                      {t('subscription.activeBadge')}
                    </span>
                  )}
                </div>
                {(() => {
                  const desc = getFrozenDescriptionForLocale(activeSubscription, locale)
                  return desc ? <p className="text-sm text-stone-600 mt-1 line-clamp-2">{desc}</p> : null
                })()}
                <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20">
                      {formatPriceType(activeSubscription, t)}
                    </span>
                    <span className="text-xs text-stone-500">
                      {t('subscription.startedOn', {
                        date: formatShortDate(activeSubscription.start_date, dateLocale),
                      })}
                      {activeSubscription.end_date && (
                        <> · {t('subscription.endPlannedOn', {
                          date: formatShortDate(activeSubscription.end_date, dateLocale),
                        })}</>
                      )}
                    </span>
                  </div>
                  {isCancellationScheduled ? (
                    canCancelCancellation && (
                      <CancelCancellationButton
                        subscriptionId={activeSubscription.id}
                        locale={locale}
                      />
                    )
                  ) : (
                    <EndSubscriptionButton
                      subscriptionId={activeSubscription.id}
                      isMonthly={isMonthly}
                      endDateFormatted={endDateFormattedForModal}
                      locale={locale}
                    />
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-stone-500">{t('subscription.noActiveSubscription')}</p>
            )}
          </div>
        </div>

        {/* Section Avis */}
        <div className="max-w-3xl mx-auto mt-8 bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
          <div className="px-8 py-6">
            <CoachRatingForm
              coachId={current.profile.coach_id!}
              initialRating={myRating?.rating ?? null}
              initialComment={myRating?.comment ?? ''}
            />
          </div>
        </div>
      </DashboardPageShell>
  )
}

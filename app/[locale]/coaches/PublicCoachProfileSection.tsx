'use client'

import { useEffect, useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Badge } from '@/components/Badge'
import { Button } from '@/components/Button'
import { CoachReviewsModal } from '@/components/CoachReviewsModal'
import { getInitials } from '@/lib/stringUtils'
import { formatCoachRating } from '@/lib/formatRating'
import { getDisplayName } from '@/lib/displayName'
import {
  getDisplayPresentation,
  getOfferDisplayDescription,
  getOfferDisplayTitle,
  type CoachOfferForDisplay,
} from '@/lib/coachListingUtils'
import { LANGUAGES_OPTIONS } from '@/lib/sportsOptions'
import { PublicCoachAlreadyHasCoachBanner } from '@/app/[locale]/coaches/PublicCoachAlreadyHasCoachBanner'
import { usePublicCoachAuthGate } from '@/app/[locale]/coaches/PublicCoachAuthGateProvider'
import type { PublicCoachProfile } from '@/lib/publicCoachesData'
import {
  getCoachPublicReviews,
  type CoachPublicReview,
} from '@/app/[locale]/dashboard/find-coach/reviewsActions'
import { formatShortDate } from '@/lib/dateUtils'

type PublicCoachProfileSectionProps = {
  coach: PublicCoachProfile
  offers: CoachOfferForDisplay[]
  ratings: { averageRating: number; reviewCount: number } | null
  showGateCta: boolean
  showDashboardLinkCta: boolean
  showAlreadyHasCoachBanner: boolean
}

export function PublicCoachProfileSection({
  coach,
  offers,
  ratings,
  showGateCta,
  showDashboardLinkCta,
  showAlreadyHasCoachBanner,
}: PublicCoachProfileSectionProps) {
  const t = useTranslations('publicCoaches')
  const tFindCoach = useTranslations('findCoach')
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const { openGate } = usePublicCoachAuthGate()
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [previewReviews, setPreviewReviews] = useState<CoachPublicReview[] | null>(null)

  const displayName = getDisplayName(coach)
  const presentation = getDisplayPresentation(coach, locale)
  const initials = getInitials(displayName)

  const sortedOffers = useMemo(
    () => [...offers].sort((a, b) => a.display_order - b.display_order),
    [offers]
  )

  const languageLabel = (code: string) =>
    LANGUAGES_OPTIONS.find((o) => o.value === code)?.label ?? code.toUpperCase()

  useEffect(() => {
    if ((ratings?.reviewCount ?? 0) === 0) return
    let cancelled = false
    void (async () => {
      const result = await getCoachPublicReviews(coach.user_id)
      if (cancelled) return
      setPreviewReviews(result.ok ? result.reviews.slice(0, 3) : [])
    })()
    return () => {
      cancelled = true
    }
  }, [coach.user_id, ratings?.reviewCount])

  return (
    <div className="space-y-8">
      <Link
        href="/coaches"
        className="inline-flex items-center gap-1 text-sm font-medium text-palette-forest-dark hover:underline"
      >
        ← {t('backToDirectory')}
      </Link>

      {showAlreadyHasCoachBanner ? <PublicCoachAlreadyHasCoachBanner /> : null}

      <section className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {coach.avatar_url?.trim() ? (
            <img
              src={coach.avatar_url}
              alt=""
              className="w-20 h-20 rounded-full object-cover bg-stone-200 shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-palette-olive text-white flex items-center justify-center text-2xl font-bold shrink-0">
              {initials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-stone-900">{displayName}</h1>
            {ratings && ratings.reviewCount > 0 ? (
              <p className="text-sm text-stone-500 mt-1">
                ★ {formatCoachRating(locale, ratings.averageRating)} ·{' '}
                <button
                  type="button"
                  className="text-palette-forest-dark underline-offset-2 hover:underline"
                  onClick={() => setReviewsOpen(true)}
                >
                  {ratings.reviewCount} {tFindCoach('coachCard.reviews')}
                </button>
              </p>
            ) : (
              <p className="text-sm text-stone-500 mt-1">{tFindCoach('coachCard.new')}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {(coach.coached_sports ?? []).map((sport) => (
                <Badge key={sport} sport={sport as Parameters<typeof Badge>[0]['sport']} />
              ))}
              {(coach.languages ?? []).map((lang) => (
                <span
                  key={lang}
                  className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600"
                >
                  {languageLabel(lang)}
                </span>
              ))}
            </div>
            {presentation ? (
              <p className="mt-4 text-stone-700 leading-relaxed text-sm whitespace-pre-wrap">
                {presentation}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-stone-900">{t('offersTitle')}</h2>
        {sortedOffers.map((offer) => {
          const title = getOfferDisplayTitle(offer, locale)
          const description = getOfferDisplayDescription(offer, locale)
          const isFree = offer.price_type === 'free'
          const isMonthly = offer.price_type === 'monthly'
          const isFeatured = offer.is_featured

          return (
            <article
              key={offer.id}
              className={`bg-white rounded-2xl p-6 ${
                isFeatured ? 'border-2 border-palette-amber' : 'border border-stone-200'
              } relative`}
            >
              {isFeatured ? (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase bg-palette-amber/20 text-palette-amber px-2 py-0.5 rounded-full">
                  {tFindCoach('modal.recommended')}
                </span>
              ) : null}
              <h3 className="font-bold text-lg text-stone-900 pr-24">{title}</h3>
              <p className="text-2xl font-bold text-palette-forest-dark mt-1">
                {isFree ? (
                  tFindCoach('coachCard.free')
                ) : (
                  <>
                    {offer.price}€
                    {isMonthly ? (
                      <span className="text-sm font-normal text-stone-500">
                        /{tFindCoach('coachCard.perMonth')}
                      </span>
                    ) : (
                      <span className="text-sm font-normal text-stone-500">
                        {' '}
                        · {tFindCoach('coachCard.plan')}
                      </span>
                    )}
                  </>
                )}
              </p>
              {description ? (
                <p className="text-sm text-stone-600 mt-2 whitespace-pre-wrap">{description}</p>
              ) : null}
              {showGateCta ? (
                <Button
                  type="button"
                  className="mt-4 w-full sm:w-auto"
                  onClick={() => openGate(coach.user_id, displayName, offer.id, title)}
                >
                  {t('requestOffer')}
                </Button>
              ) : null}
              {showDashboardLinkCta ? (
                <Link
                  href={`/dashboard/find-coach?coach=${encodeURIComponent(coach.user_id)}&offer=${encodeURIComponent(offer.id)}`}
                  className="inline-flex items-center justify-center gap-2 min-h-10 px-4 py-2.5 text-sm font-medium rounded-lg text-white bg-palette-forest-dark hover:bg-palette-forest-darker transition-colors focus:outline-none mt-4 w-full sm:w-auto"
                >
                  {t('requestOffer')}
                </Link>
              ) : null}
            </article>
          )
        })}
      </section>

      {ratings && ratings.reviewCount > 0 ? (
        <section className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-stone-900">{t('reviewsTitle')}</h2>
            <button
              type="button"
              className="text-sm font-medium text-palette-forest-dark hover:underline"
              onClick={() => setReviewsOpen(true)}
            >
              {t('seeAllReviews')}
            </button>
          </div>
          <div className="space-y-4 text-sm">
            {(previewReviews ?? []).map((review) => (
              <div key={review.id} className="border-b border-stone-100 pb-3 last:border-0">
                <p className="font-medium text-stone-800">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)} ·{' '}
                  {formatShortDate(review.created_at, localeTag)}
                </p>
                <p className="text-stone-600 mt-1">
                  {review.comment?.trim()
                    ? review.comment
                    : tFindCoach('reviewsModal.noComment')}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <CoachReviewsModal
        isOpen={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        coachId={coach.user_id}
        coachDisplayName={displayName}
      />
    </div>
  )
}

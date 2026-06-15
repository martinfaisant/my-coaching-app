'use client'

import { useMemo, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/Button'
import { SearchInput } from '@/components/SearchInput'
import { SportTileSelectable } from '@/components/SportTileSelectable'
import { CoachTile } from '@/components/CoachTile'
import { CoachReviewsModal } from '@/components/CoachReviewsModal'
import { LANGUAGES_OPTIONS } from '@/lib/sportsOptions'
import { useCoachedSportsOptions } from '@/lib/hooks/useSportsOptions'
import { getDisplayName } from '@/lib/displayName'
import {
  filterCoachesForDisplay,
  getDisplayPresentation,
  getOfferDisplayTitle,
  type CoachOfferForDisplay,
} from '@/lib/coachListingUtils'
import type { PublicCoachProfile } from '@/lib/publicCoachesData'

type PublicCoachesDirectorySectionProps = {
  coaches: PublicCoachProfile[]
  offersByCoach: Record<string, CoachOfferForDisplay[]>
  ratingsByCoach: Record<string, { averageRating: number; reviewCount: number }>
}

export function PublicCoachesDirectorySection({
  coaches,
  offersByCoach,
  ratingsByCoach,
}: PublicCoachesDirectorySectionProps) {
  const t = useTranslations('publicCoaches')
  const tFindCoach = useTranslations('findCoach')
  const locale = useLocale()
  const coachedSportsOptions = useCoachedSportsOptions()
  const [searchName, setSearchName] = useState('')
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [reviewsModalCoach, setReviewsModalCoach] = useState<{ id: string; name: string } | null>(
    null
  )

  const filteredCoaches = useMemo(
    () =>
      filterCoachesForDisplay(coaches, {
        searchName,
        selectedSports,
        selectedLanguages,
      }),
    [coaches, searchName, selectedSports, selectedLanguages]
  )

  const toggleSport = (value: string) => {
    setSelectedSports((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  const toggleLanguage = (value: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(value) ? prev.filter((l) => l !== value) : [...prev, value]
    )
  }

  const clearFilters = () => {
    setSearchName('')
    setSelectedSports([])
    setSelectedLanguages([])
  }

  if (coaches.length === 0) {
    return (
      <p className="text-sm text-stone-600 rounded-lg border border-stone-200 bg-stone-50 p-6">
        {t('noCoaches')}
      </p>
    )
  }

  return (
    <section className="space-y-8">
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-stone-900">{tFindCoach('filters.title')}</h2>
          <Button type="button" variant="secondary" onClick={clearFilters}>
            {tFindCoach('filters.reset')}
          </Button>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
            {tFindCoach('filters.nameSearchLabel')}
          </h3>
          <SearchInput
            placeholder={tFindCoach('filters.nameSearchPlaceholder')}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            aria-label={tFindCoach('filters.nameSearchLabel')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {tFindCoach('filters.coachedSport')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {coachedSportsOptions.map((opt) => (
                <SportTileSelectable
                  key={opt.value}
                  value={opt.value}
                  selected={selectedSports.includes(opt.value)}
                  onChange={() => toggleSport(opt.value)}
                />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">
              {tFindCoach('filters.spokenLanguage')}
            </h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleLanguage(opt.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium select-none transition-all ${
                    selectedLanguages.includes(opt.value)
                      ? 'border-palette-forest-dark bg-palette-forest-dark text-white shadow-palette-forest'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-palette-forest-dark'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
        {tFindCoach('results')}
        <span className="bg-stone-200 text-stone-600 text-xs py-0.5 px-2 rounded-full">
          {filteredCoaches.length}
        </span>
      </h2>

      {filteredCoaches.length === 0 ? (
        <p className="text-sm text-stone-600 rounded-lg border border-stone-200 bg-stone-50 p-6">
          {tFindCoach('noResults')}
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCoaches.map((coach) => {
            const displayName = getDisplayName(coach)
            return (
              <li key={coach.user_id}>
                <CoachTile
                  avatarUrl={coach.avatar_url}
                  fullName={displayName}
                  coachedSports={coach.coached_sports ?? []}
                  bio={
                    getDisplayPresentation(coach, locale) || tFindCoach('coachCard.defaultBio')
                  }
                  rating={ratingsByCoach[coach.user_id] ?? null}
                  onReviewsClick={
                    (ratingsByCoach[coach.user_id]?.reviewCount ?? 0) > 0
                      ? () =>
                          setReviewsModalCoach({
                            id: coach.user_id,
                            name: displayName,
                          })
                      : undefined
                  }
                  offers={(offersByCoach[coach.user_id] ?? []).slice(0, 3).map((offer) => ({
                    id: offer.id,
                    title: getOfferDisplayTitle(offer, locale),
                    price: offer.price ?? 0,
                    priceType:
                      offer.price_type === 'free'
                        ? 'free'
                        : offer.price_type === 'monthly'
                          ? 'monthly'
                          : 'one_time',
                    isFeatured: offer.is_featured,
                  }))}
                  footer={
                    <Link
                      href={`/coaches/${coach.user_id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-stone-200 py-2.5 text-sm font-semibold text-stone-800 hover:border-palette-forest-dark hover:text-palette-forest-dark transition-colors"
                    >
                      {t('viewProfile')}
                      <span aria-hidden>→</span>
                    </Link>
                  }
                  labels={{
                    new: tFindCoach('coachCard.new'),
                    reviews: tFindCoach('coachCard.reviews'),
                    openReviewsAria: tFindCoach('reviewsModal.openReviewsAria', {
                      name: displayName,
                    }),
                    availableOffers: tFindCoach('coachCard.availableOffers'),
                    free: tFindCoach('coachCard.free'),
                    perMonth: tFindCoach('coachCard.perMonth'),
                    plan: tFindCoach('coachCard.plan'),
                  }}
                />
              </li>
            )
          })}
        </ul>
      )}

      {reviewsModalCoach && (
        <CoachReviewsModal
          isOpen
          onClose={() => setReviewsModalCoach(null)}
          coachId={reviewsModalCoach.id}
          coachDisplayName={reviewsModalCoach.name}
        />
      )}
    </section>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations, useLocale } from 'next-intl'
import { RequestCoachButton } from './RequestCoachButton'
import { Button } from '@/components/Button'
import { Textarea } from '@/components/Textarea'
import { AvatarImage } from '@/components/AvatarImage'
import { Badge } from '@/components/Badge'
import { CoachTile } from '@/components/CoachTile'
import { SportTileSelectable } from '@/components/SportTileSelectable'
import { createCoachRequest } from './actions'
import { LANGUAGES_OPTIONS } from '@/lib/sportsOptions'
import { useCoachedSportsOptions, usePracticedSportsOptions } from '@/lib/hooks/useSportsOptions'
import { useRouter } from 'next/navigation'
import { getInitials } from '@/lib/stringUtils'
import { getDisplayName } from '@/lib/displayName'

function getInitialsForCoach(displayName: string | null, email: string): string {
  const name = (displayName ?? '').trim()
  if (name) return getInitials(name)
  return getInitials(email)
}

/** Environ 10 lignes en caractères (ordre de grandeur) pour afficher "Voir plus" */
const PRESENTATION_LONG_THRESHOLD = 500


export type CoachForList = {
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
  coached_sports: string[] | null
  languages: string[] | null
  /** Présentation selon la langue d'affichage (dérivée de presentation_fr / presentation_en côté appelant ou ici). */
  presentation?: string | null
  presentation_fr?: string | null
  presentation_en?: string | null
  avatar_url?: string | null
}

/** Retourne la présentation à afficher selon la locale (FR prioritaire en fr, EN en en, avec repli sur l'autre langue). */
function getDisplayPresentation(coach: CoachForList, locale: string): string {
  const fr = (coach.presentation_fr ?? '').trim()
  const en = (coach.presentation_en ?? '').trim()
  const legacy = (coach.presentation ?? '').trim()
  if (locale === 'fr') return fr || en || legacy
  return en || fr || legacy
}

type OfferForDisplay = {
  id: string
  title?: string | null
  description?: string | null
  title_fr?: string | null
  title_en?: string | null
  description_fr?: string | null
  description_en?: string | null
  price: number
  price_type: string
  is_featured: boolean
  display_order: number
}

function getOfferDisplayTitle(offer: OfferForDisplay, locale: string): string {
  const fr = (offer.title_fr ?? '').trim()
  const en = (offer.title_en ?? '').trim()
  const legacy = (offer.title ?? '').trim()
  if (locale === 'fr') return fr || en || legacy
  return en || fr || legacy
}

function getOfferDisplayDescription(offer: OfferForDisplay, locale: string): string {
  const fr = (offer.description_fr ?? '').trim()
  const en = (offer.description_en ?? '').trim()
  const legacy = (offer.description ?? '').trim()
  if (locale === 'fr') return fr || en || legacy
  return en || fr || legacy
}

type FindCoachSectionProps = {
  coaches: CoachForList[]
  /** coach_id -> status (serializable from server) */
  statusByCoach: Record<string, 'pending' | 'declined'>
  /** coach_id -> request id (for pending requests, to allow cancel) */
  requestIdByCoach?: Record<string, string>
  /** Sports déjà renseignés dans le profil (pour préremplir le formulaire de demande) */
  initialPracticedSports?: string[]
  /** coach_id -> { averageRating, reviewCount } pour afficher la note et le nombre d'avis */
  ratingsByCoach?: Record<string, { averageRating: number; reviewCount: number }>
  /** coach_id -> offres du coach */
  offersByCoach?: Record<string, Array<OfferForDisplay>>
}

function matchesSport(coach: CoachForList, selectedSports: string[]): boolean {
  if (selectedSports.length === 0) return true
  const coachSports = coach.coached_sports ?? []
  return selectedSports.some((s) => coachSports.includes(s))
}

function matchesLanguage(coach: CoachForList, selectedLanguages: string[]): boolean {
  if (selectedLanguages.length === 0) return true
  const coachLangs = coach.languages ?? []
  return selectedLanguages.some((l) => coachLangs.includes(l))
}

export function FindCoachSection({ coaches, statusByCoach, requestIdByCoach = {}, initialPracticedSports = [], ratingsByCoach = {}, offersByCoach = {} }: FindCoachSectionProps) {
  const t = useTranslations('findCoach')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const coachedSportsOptions = useCoachedSportsOptions()
  const practicedSportsOptions = usePracticedSportsOptions()
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [presentationModalCoach, setPresentationModalCoach] = useState<CoachForList | null>(null)
  const [detailModalCoach, setDetailModalCoach] = useState<CoachForList | null>(null)
  const getStatus = (coachId: string): 'pending' | 'declined' | null =>
    statusByCoach[coachId] ?? null
  const getRequestId = (coachId: string): string | null => requestIdByCoach[coachId] ?? null

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPresentationModalCoach(null)
    }
    if (presentationModalCoach) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [presentationModalCoach])

  const filteredCoaches = useMemo(() => {
    return coaches.filter(
      (c) => matchesSport(c, selectedSports) && matchesLanguage(c, selectedLanguages)
    )
  }, [coaches, selectedSports, selectedLanguages])

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

  const languageLabel = (code: string) => LANGUAGES_OPTIONS.find((o) => o.value === code)?.label ?? code

  const clearFilters = () => {
    setSelectedSports([])
    setSelectedLanguages([])
  }

  return (
    <section className="space-y-8">
      {/* Section Filtres — alignée sur le HTML */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-10">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-lg font-bold text-stone-900">{t('filters.title')}</h1>
          </div>
          <Button
            type="button"
            variant="muted"
            onClick={clearFilters}
            className="!border-0 !px-0 underline bg-transparent hover:bg-transparent text-palette-forest-dark hover:text-palette-forest-darker text-xs"
          >
            {t('filters.reset')}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">{t('filters.coachedSport')}</h3>
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">{t('filters.spokenLanguage')}</h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleLanguage(opt.value)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium select-none transition-all ${
                    selectedLanguages.includes(opt.value)
                      ? 'border-palette-forest-dark bg-palette-forest-dark text-white shadow-[0_4px_6px_-1px_rgba(98,126,89,0.3)]'
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

      {/* Titre Résultats + badge (HTML) */}
      <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
        {t('results')}
        <span className="bg-stone-200 text-stone-600 text-xs py-0.5 px-2 rounded-full">
          {filteredCoaches.length}
        </span>
      </h2>

      {filteredCoaches.length === 0 ? (
        <p className="text-sm text-stone-600 rounded-lg border border-stone-200 bg-stone-50 p-6">
          {t('noResults')}
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((c) => (
            <li key={c.user_id}>
              <CoachTile
                avatarUrl={c.avatar_url}
                fullName={getDisplayName(c)}
                email={c.email}
                coachedSports={c.coached_sports ?? []}
                bio={getDisplayPresentation(c, locale) || t('coachCard.defaultBio')}
                rating={ratingsByCoach[c.user_id] ?? null}
                offers={(offersByCoach[c.user_id] ?? []).slice(0, 3).map((offer) => ({
                  id: offer.id,
                  title: getOfferDisplayTitle(offer, locale),
                  price: offer.price ?? 0,
                  priceType: (offer.price_type === 'free' ? 'free' : offer.price_type === 'monthly' ? 'monthly' : 'one_time') as 'free' | 'monthly' | 'one_time',
                  isFeatured: offer.is_featured,
                }))}
                footer={
                  getStatus(c.user_id) === 'pending' ? (
                    <RequestCoachButton
                      coachId={c.user_id}
                      coachName={getDisplayName(c)}
                      requestStatus={getStatus(c.user_id)}
                      requestId={getRequestId(c.user_id)}
                      initialPracticedSports={initialPracticedSports}
                    />
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDetailModalCoach(c)}
                      className="w-full"
                    >
                      <span>{t('coachCard.viewDetails')}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </Button>
                  )
                }
                labels={{
                  new: t('coachCard.new'),
                  reviews: t('coachCard.reviews'),
                  availableOffers: t('coachCard.availableOffers'),
                  free: t('coachCard.free'),
                  perMonth: t('coachCard.perMonth'),
                  plan: t('coachCard.plan'),
                }}
              />
            </li>
          ))}
        </ul>
      )}

      {detailModalCoach && (
        <CoachDetailModal
          coach={detailModalCoach}
          offers={offersByCoach[detailModalCoach.user_id] ?? []}
          ratings={ratingsByCoach[detailModalCoach.user_id]}
          onClose={() => setDetailModalCoach(null)}
          requestStatus={getStatus(detailModalCoach.user_id)}
          requestId={getRequestId(detailModalCoach.user_id)}
          initialPracticedSports={initialPracticedSports}
        />
      )}

      {presentationModalCoach && (
        <>
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]"
            onClick={() => setPresentationModalCoach(null)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="presentation-modal-title"
          >
            <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-stone-100">
            <div className="sticky top-0 flex justify-end p-3 bg-white rounded-t-xl z-10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPresentationModalCoach(null)}
                aria-label={tCommon('close')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
            <div className="px-8 pb-8">
              <div className="flex items-center gap-4 mb-4">
                {(presentationModalCoach.avatar_url ?? '').trim() && (
                  <img
                    src={presentationModalCoach.avatar_url!}
                    alt=""
                    className="w-14 h-14 rounded-xl object-cover bg-stone-200 shrink-0"
                  />
                )}
                <h2 id="presentation-modal-title" className="text-xl font-semibold text-stone-900">
                  {t('modal.presentation')} {getDisplayName(presentationModalCoach, presentationModalCoach.email)}
                </h2>
              </div>
              {(presentationModalCoach.coached_sports?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {presentationModalCoach.coached_sports!.map((sportValue) => (
                    <Badge key={sportValue} sport={sportValue as Parameters<typeof Badge>[0]['sport']} />
                  ))}
                </div>
              )}
              {(presentationModalCoach.languages?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {presentationModalCoach.languages!.map((langCode) => (
                    <span
                      key={langCode}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-palette-olive/10 text-palette-olive"
                    >
                      {languageLabel(langCode)}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-stone-700 whitespace-pre-wrap">
                {getDisplayPresentation(presentationModalCoach, locale)}
              </p>
            </div>
          </div>
          </div>
        </>
      )}
    </section>
  )
}

type CoachDetailModalProps = {
  coach: CoachForList
  offers: Array<OfferForDisplay>
  ratings?: { averageRating: number; reviewCount: number }
  onClose: () => void
  requestStatus: 'pending' | 'declined' | null
  requestId?: string | null
  initialPracticedSports?: string[]
}

type OfferSelectButtonProps = {
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
}

function OfferSelectButton({ isSelected, onClick }: OfferSelectButtonProps) {
  const t = useTranslations('findCoach')
  
  return (
    <Button
      type="button"
      variant={isSelected ? 'primary' : 'outline'}
      onClick={onClick}
      className={`w-full ${!isSelected ? '!border-stone-200 !text-stone-600 hover:!border-stone-400 hover:!bg-stone-50' : ''}`}
    >
      {isSelected ? (
        <>
          {t('modal.selected')}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </>
      ) : (
        t('modal.select')
      )}
    </Button>
  )
}

function CoachDetailModal({ coach, offers, ratings, onClose, requestStatus, requestId, initialPracticedSports = [] }: CoachDetailModalProps) {
  const t = useTranslations('findCoach')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const router = useRouter()
  const practicedSportsOptions = usePracticedSportsOptions()
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)
  const [sports, setSports] = useState<string[]>(initialPracticedSports)
  const [need, setNeed] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sortedOffers = [...offers].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    return a.display_order - b.display_order
  })

  // Déterminer le nombre de colonnes selon le nombre d'offres
  const getGridCols = (count: number) => {
    if (count === 1) return 'grid-cols-1'
    if (count === 2) return 'grid-cols-1 md:grid-cols-2'
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  const toggleSport = (value: string) => {
    setSports((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOfferId) {
      setError(t('validation.selectOffer'))
      return
    }
    if (sports.length === 0 || !need.trim()) {
      setError(t('validation.fillRequired'))
      return
    }
    setError(null)
    setIsSubmitting(true)
    const result = await createCoachRequest(coach.user_id, sports, need.trim(), selectedOfferId, locale)
    setIsSubmitting(false)
    if (result.error) {
      setError(result.error)
      return
    }
    router.refresh()
    onClose()
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const formatPrice = (offer: typeof offers[0]) => {
    if (offer.price_type === 'free') return t('modal.free')
    if (offer.price_type === 'monthly') return `${offer.price}€/${t('coachCard.perMonth')}`
    return `${offer.price}€`
  }

  const getOfferBadge = (offer: typeof offers[0]) => {
    if (offer.is_featured) return { label: t('modal.recommended'), className: 'bg-palette-forest-dark/10 text-palette-forest-dark' }
    if (offer.price_type === 'free') return { label: t('modal.discovery'), className: 'bg-stone-100 text-stone-600' }
    if (offer.price_type === 'monthly') return { label: t('modal.fullTracking'), className: 'bg-palette-forest-dark/10 text-palette-forest-dark' }
    return { label: t('modal.singlePlan'), className: 'bg-blue-50 text-blue-600' }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]" onClick={onClose} />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
          {/* HEADER FIXE (Identité + Note) */}
          <div className="p-6 border-b border-stone-100 flex gap-5 items-center bg-white shrink-0">
            <div className="relative">
              <AvatarImage
                src={coach.avatar_url}
                initials={getInitialsForCoach(getDisplayName(coach), coach.email)}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-stone-50"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-stone-900">{getDisplayName(coach, coach.email)}</h2>
              {ratings && ratings.reviewCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-amber-500 font-bold mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {ratings.averageRating} <span className="text-stone-400 font-normal ml-1">({ratings.reviewCount} {t('coachCard.reviews')})</span>
                </div>
              )}
              {/* Tags Sports & Langues */}
              {((coach.coached_sports ?? []).length > 0 || (coach.languages ?? []).length > 0) && (
                <div className="flex flex-wrap gap-2 items-center mt-2">
                  {/* Tuiles Sports */}
                  {(coach.coached_sports ?? []).map((sportValue) => (
                    <Badge key={sportValue} sport={sportValue as Parameters<typeof Badge>[0]['sport']} />
                  ))}
                  {/* Séparateur si sports ET langues */}
                  {(coach.coached_sports ?? []).length > 0 && (coach.languages ?? []).length > 0 && (
                    <div className="w-px h-6 bg-stone-300 mx-1" />
                  )}
                  {/* Tuiles Langues */}
                  {(coach.languages ?? []).map((langCode) => {
                    const opt = LANGUAGES_OPTIONS.find(o => o.value === langCode)
                    return (
                      <span
                        key={langCode}
                        className="inline-flex items-center px-2 py-1 rounded bg-stone-100 text-stone-500 text-xs font-medium"
                      >
                        {opt?.label ?? langCode}
                      </span>
                    )
                  })}
                </div>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="rounded-full min-w-10 min-h-10"
              aria-label={tCommon('close')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>

          {/* CORPS SCROLLABLE */}
          <div className="overflow-y-auto p-6 md:p-8 bg-stone-50 flex-1">
            {requestStatus === 'pending' ? (
              <div className="text-center py-12">
                <p className="text-stone-600 font-medium mb-2">{t('modal.pendingRequest')}</p>
                <p className="text-sm text-stone-500">{t('modal.alreadySent')}</p>
              </div>
            ) : (
              <>
                {/* INFO PROFIL (Bio, selon langue d'affichage) */}
                {getDisplayPresentation(coach, locale) && (
                  <>
                    <div className="mb-8">
                      <p className="text-stone-600 text-sm leading-relaxed max-w-3xl whitespace-pre-wrap">
                        {getDisplayPresentation(coach, locale)}
                      </p>
                    </div>
                    <hr className="border-stone-200 mb-8" />
                  </>
                )}

                {/* SECTION OFFRES */}
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-palette-forest-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7h-4m-2-4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
                  </svg>
                  {t('modal.chooseOffer')}
                </h3>

                {sortedOffers.length === 0 ? (
                  <p className="text-sm text-stone-600 text-center py-8">{t('modal.noOffers')}</p>
                ) : (
                  <>
                    {/* GRID OFFRES */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                      {sortedOffers.map((offer) => {
                        const isSelected = selectedOfferId === offer.id
                        const isFeatured = offer.is_featured
                        return (
                          <div
                            key={offer.id}
                            className={`relative bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all group flex flex-col ${
                              isSelected 
                                ? 'border-palette-forest-dark shadow-md hover:border-palette-forest-dark' 
                                : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
                            }`}
                            onClick={() => setSelectedOfferId(offer.id)}
                          >
                            {isFeatured && (
                              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm transition-colors ${
                                isSelected ? 'bg-palette-forest-dark text-white' : 'bg-stone-500 text-white group-hover:bg-palette-forest-dark'
                              }`}>
                                  {t('modal.recommended')}
                              </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-stone-900">{getOfferDisplayTitle(offer, locale)}</h4>
                                {getOfferDisplayDescription(offer, locale) && (
                                  <p className="text-sm text-stone-500 mt-1 whitespace-pre-wrap">{getOfferDisplayDescription(offer, locale)}</p>
                                )}
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 transition-colors shrink-0 ${
                                isSelected 
                                  ? 'border-palette-forest-dark bg-palette-forest-dark' 
                                  : 'border-stone-300 group-hover:border-stone-300'
                              }`}>
                                {isSelected && (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div className="flex-1" />
                            <div className="flex items-baseline gap-1 mt-auto">
                              <span className="text-3xl font-bold text-stone-900">
                                {offer.price_type === 'free' ? t('modal.free') : `${offer.price}€`}
                              </span>
                              {offer.price_type === 'monthly' && (
                                <span className="text-sm text-stone-500 font-medium">/{t('coachCard.perMonth')}</span>
                              )}
                              {offer.price_type === 'one_time' && (
                                <span className="text-sm text-stone-500 font-medium">/{t('coachCard.plan')}</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* PLACEHOLDER FORMULAIRE */}
                    {!selectedOfferId ? (
                      <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center bg-stone-50/50">
                        <p className="text-stone-400 text-sm">{t('modal.selectOffer')}</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
                        <h4 className="text-base font-semibold text-stone-900">{t('modal.completeRequest')}</h4>
                        {error && (
                          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            {t('modal.practicedSports')}
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {practicedSportsOptions.map((opt) => (
                              <SportTileSelectable
                                key={opt.value}
                                value={opt.value}
                                selected={sports.includes(opt.value)}
                                onChange={() => toggleSport(opt.value)}
                              />
                            ))}
                          </div>
                        </div>
                        <Textarea
                          id="coaching_need"
                          label={t('modal.coachingNeed')}
                          value={need}
                          onChange={(e) => setNeed(e.target.value)}
                          rows={4}
                          placeholder={t('modal.coachingNeedPlaceholder')}
                          className="rounded-xl py-3"
                          required
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={isSubmitting}
                          loading={isSubmitting}
                          loadingText={t('modal.sending')}
                          className="w-full"
                        >
                          {t('modal.sendRequest')}
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Button>
                      </form>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}

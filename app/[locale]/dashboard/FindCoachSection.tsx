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
import { Input } from '@/components/Input'
import { SearchInput } from '@/components/SearchInput'
import { SportTileSelectable } from '@/components/SportTileSelectable'
import { createCoachRequest } from './actions'
import { LANGUAGES_OPTIONS } from '@/lib/sportsOptions'
import { getWeeklyVolumeDisplaySports, getWeeklyVolumeUnit, SPORT_ICONS, SPORT_CARD_STYLES, SPORT_TRANSLATION_KEYS } from '@/lib/sportStyles'
import type { SportType } from '@/lib/sportStyles'
import { useCoachedSportsOptions, usePracticedSportsOptions } from '@/lib/hooks/useSportsOptions'
import { useRouter } from 'next/navigation'
import { getInitials } from '@/lib/stringUtils'
import { getDisplayName } from '@/lib/displayName'
import type { Goal } from '@/types/database'
import { TileCard } from '@/components/TileCard'
import { GoalFullModal } from '@/app/[locale]/dashboard/objectifs/GoalFullModal'
import { RequestGoalAddModal } from '@/app/[locale]/dashboard/RequestGoalAddModal'
import { RequestGoalsListModal } from '@/app/[locale]/dashboard/RequestGoalsListModal'
import { formatGoalDateBlock } from '@/lib/dateUtils'
import { FORM_ERROR_BOX_CLASSES } from '@/lib/formStyles'
import {
  hasGoalResult,
  hasTargetTime,
  formatTargetTime,
  formatGoalResultTime,
  formatGoalResultPlaceOrdinal,
} from '@/lib/goalResultUtils'

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
  /** Prénom de l'athlète (pour afficher les champs nom/prénom dans la modale si vide) */
  athleteFirstName?: string
  /** Nom de l'athlète (pour afficher les champs nom/prénom dans la modale si vide) */
  athleteLastName?: string
  /** Volume actuel (heures/sem., profil athlète, pour préremplir le formulaire de demande) */
  initialWeeklyCurrentHours?: number | null
  /** Volume maximum (heures/sem., profil athlète, pour préremplir le formulaire de demande) */
  initialWeeklyTargetHours?: number | null
  /** Volumes par sport (profil athlète, pour préremplir le formulaire de demande) */
  initialWeeklyVolumeBySport?: Record<string, number> | null
  /** Objectifs de l'athlète (pour la section objectifs/résultats dans la modale de demande) */
  initialGoals?: Goal[]
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

function matchesName(coach: CoachForList, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (q === '') return true
  const first = (coach.first_name ?? '').trim().toLowerCase()
  const last = (coach.last_name ?? '').trim().toLowerCase()
  return first.includes(q) || last.includes(q)
}

export function FindCoachSection({ coaches, statusByCoach, requestIdByCoach = {}, initialPracticedSports = [], ratingsByCoach = {}, offersByCoach = {}, athleteFirstName = '', athleteLastName = '', initialWeeklyCurrentHours, initialWeeklyTargetHours, initialWeeklyVolumeBySport, initialGoals = [] }: FindCoachSectionProps) {
  const t = useTranslations('findCoach')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const coachedSportsOptions = useCoachedSportsOptions()
  const practicedSportsOptions = usePracticedSportsOptions()
  const [searchName, setSearchName] = useState('')
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
      (c) =>
        matchesName(c, searchName) &&
        matchesSport(c, selectedSports) &&
        matchesLanguage(c, selectedLanguages)
    )
  }, [coaches, searchName, selectedSports, selectedLanguages])

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
    setSearchName('')
    setSelectedSports([])
    setSelectedLanguages([])
  }

  return (
    <section className="space-y-8">
      {/* Section Filtres — alignée sur le HTML */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 mb-10">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-lg font-bold text-stone-900">{t('filters.title')}</h1>
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={clearFilters}
          >
            {t('filters.reset')}
          </Button>
        </div>

        <div className="mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">{t('filters.nameSearchLabel')}</h3>
          <SearchInput
            placeholder={t('filters.nameSearchPlaceholder')}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            aria-label={t('filters.nameSearchLabel')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                      athleteWeeklyCurrentHours={initialWeeklyCurrentHours}
                      athleteWeeklyTargetHours={initialWeeklyTargetHours}
                      athleteWeeklyVolumeBySport={initialWeeklyVolumeBySport}
                      initialGoals={initialGoals}
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
          initialWeeklyCurrentHours={initialWeeklyCurrentHours}
          initialWeeklyTargetHours={initialWeeklyTargetHours}
          initialWeeklyVolumeBySport={initialWeeklyVolumeBySport}
          showNameFields={!((athleteFirstName ?? '').trim() && (athleteLastName ?? '').trim())}
          athleteFirstName={athleteFirstName}
          athleteLastName={athleteLastName}
          initialGoals={initialGoals}
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
  initialWeeklyCurrentHours?: number | null
  initialWeeklyTargetHours?: number | null
  initialWeeklyVolumeBySport?: Record<string, number> | null
  /** Afficher les champs Prénom/Nom (profil athlète incomplet) */
  showNameFields?: boolean
  athleteFirstName?: string
  athleteLastName?: string
  /** Objectifs de l'athlète (section objectifs/résultats dans le formulaire de demande) */
  initialGoals?: Goal[]
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

const MapIconSmall = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z" />
    <path d="m14.5 12.5 2-2" />
    <path d="m11.5 9.5 2-2" />
    <path d="m8.5 6.5 2-2" />
    <path d="m17.5 15.5 2-2" />
  </svg>
)

const ClockIconSmall = ({ className = 'w-3.5 h-3.5' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

function CoachDetailModal({ coach, offers, ratings, onClose, requestStatus, requestId, initialPracticedSports = [], initialWeeklyCurrentHours, initialWeeklyTargetHours, initialWeeklyVolumeBySport, showNameFields = false, athleteFirstName = '', athleteLastName = '', initialGoals = [] }: CoachDetailModalProps) {
  const t = useTranslations('findCoach')
  const tGoals = useTranslations('goals')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const tProfile = useTranslations('profile')
  const tSports = useTranslations('sports')
  const tCoachReq = useTranslations('coachRequests.validation')
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const router = useRouter()
  const practicedSportsOptions = usePracticedSportsOptions()
  const [selectedOfferId, setSelectedOfferId] = useState<string | null>(null)
  const [addGoalModalOpen, setAddGoalModalOpen] = useState(false)
  const [seeMoreGoalsModalOpen, setSeeMoreGoalsModalOpen] = useState(false)
  const [goalForFullModal, setGoalForFullModal] = useState<Goal | null>(null)
  const [fullModalInitialTab, setFullModalInitialTab] = useState<'objective' | 'result'>('objective')
  const [sports, setSports] = useState<string[]>(initialPracticedSports)
  const [need, setNeed] = useState('')
  const [firstName, setFirstName] = useState(athleteFirstName)
  const [lastName, setLastName] = useState(athleteLastName)
  const [weeklyCurrentHoursInput, setWeeklyCurrentHoursInput] = useState(
    initialWeeklyCurrentHours != null ? String(initialWeeklyCurrentHours) : ''
  )
  const [weeklyTargetHoursInput, setWeeklyTargetHoursInput] = useState(
    initialWeeklyTargetHours != null ? String(initialWeeklyTargetHours) : ''
  )
  const [weeklyVolumeInputs, setWeeklyVolumeInputs] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {}
    const list = getWeeklyVolumeDisplaySports(initialPracticedSports ?? [])
    for (const sport of list) {
      const v = initialWeeklyVolumeBySport?.[sport]
      init[sport] = v != null ? String(v) : ''
    }
    if ((initialPracticedSports ?? []).includes('trail')) {
      const v = initialWeeklyVolumeBySport?.course_elevation_m
      init.course_elevation_m = v != null ? String(v) : ''
    }
    return init
  })
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const displaySportsForVolume = getWeeklyVolumeDisplaySports(sports)

  useEffect(() => {
    setWeeklyVolumeInputs((prev) => {
      const next = { ...prev }
      for (const sport of displaySportsForVolume) {
        if (!(sport in next)) next[sport] = ''
      }
      if (sports.includes('trail') && !('course_elevation_m' in next)) next.course_elevation_m = ''
      return next
    })
  }, [sports.join(',')])

  const setVolumeInput = (key: string, value: string) => {
    setWeeklyVolumeInputs((prev) => ({ ...prev, [key]: value }))
  }

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
    if (showNameFields) {
      const first = firstName.trim()
      const last = lastName.trim()
      if (!first || !last) {
        setError(t('validation.requireFirstNameLastName'))
        return
      }
    }
    const currentHoursRaw = weeklyCurrentHoursInput.trim().replace(',', '.')
    const currentHoursNum = currentHoursRaw === '' ? NaN : parseFloat(currentHoursRaw)
    if (Number.isNaN(currentHoursNum) || currentHoursNum < 0 || currentHoursNum > 168) {
      setError(tCoachReq('requireWeeklyTargetAndVolume'))
      return
    }
    const hoursRaw = weeklyTargetHoursInput.trim().replace(',', '.')
    const hoursNum = hoursRaw === '' ? NaN : parseFloat(hoursRaw)
    if (Number.isNaN(hoursNum) || hoursNum < 0 || hoursNum > 168) {
      setError(tCoachReq('requireWeeklyTargetAndVolume'))
      return
    }
    const volumeBySport: Record<string, number> = {}
    for (const sport of displaySportsForVolume) {
      const raw = (weeklyVolumeInputs[sport] ?? '').trim().replace(',', '.')
      const val = raw === '' ? NaN : parseFloat(raw)
      if (Number.isNaN(val) || val < 0) {
        setError(tCoachReq('requireWeeklyTargetAndVolume'))
        return
      }
      volumeBySport[sport] = Math.round(val * 100) / 100
    }
    if (sports.includes('trail')) {
      const raw = (weeklyVolumeInputs.course_elevation_m ?? '').trim().replace(',', '.')
      const val = raw === '' ? NaN : parseFloat(raw)
      if (Number.isNaN(val) || val < 0 || val > 50000) {
        setError(tCoachReq('requireWeeklyTargetAndVolume'))
        return
      }
      volumeBySport.course_elevation_m = Math.round(val * 100) / 100
    }
    setError(null)
    setIsSubmitting(true)
    try {
      const result = await createCoachRequest(
        coach.user_id,
        sports,
        need.trim(),
        selectedOfferId,
        locale,
        showNameFields ? firstName.trim() : undefined,
        showNameFields ? lastName.trim() : undefined,
        Math.round(currentHoursNum * 100) / 100,
        Math.round(hoursNum * 100) / 100,
        volumeBySport
      )
      if (result.error) {
        setError(result.error)
        return
      }
      router.refresh()
      onClose()
    } catch {
      setError(tErrors('somethingWentWrong'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const weeklyCurrentValid =
    (() => {
      const raw = weeklyCurrentHoursInput.trim().replace(',', '.')
      if (raw === '') return false
      const n = parseFloat(raw)
      return !Number.isNaN(n) && n >= 0 && n <= 168
    })()
  const weeklyTargetValid =
    (() => {
      const raw = weeklyTargetHoursInput.trim().replace(',', '.')
      if (raw === '') return false
      const n = parseFloat(raw)
      return !Number.isNaN(n) && n >= 0 && n <= 168
    })()
  const volumesComplete =
    displaySportsForVolume.every((s) => {
      const raw = (weeklyVolumeInputs[s] ?? '').trim().replace(',', '.')
      if (raw === '') return false
      const n = parseFloat(raw)
      return !Number.isNaN(n) && n >= 0
    }) &&
    (!sports.includes('trail') ||
      (() => {
        const raw = (weeklyVolumeInputs.course_elevation_m ?? '').trim().replace(',', '.')
        if (raw === '') return false
        const n = parseFloat(raw)
        return !Number.isNaN(n) && n >= 0 && n <= 50000
      })())

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
                          <div className={FORM_ERROR_BOX_CLASSES} role="alert">
                            {error}
                          </div>
                        )}
                        {showNameFields && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Input
                              label={`${tProfile('firstName')} *`}
                              name="first_name"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              placeholder=""
                            />
                            <Input
                              label={`${tProfile('lastName')} *`}
                              name="last_name"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              placeholder=""
                            />
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

                        {/* Section Volumes hebdomadaires */}
                        <div>
                          <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">
                            {tProfile('weeklyVolumesSectionTitle')}
                          </h4>
                          {sports.length === 0 ? (
                            <p className="text-sm text-stone-500">{tProfile('noPracticedSportsMessage')}</p>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-100">
                                  <span className="text-sm font-medium text-stone-700 shrink-0">
                                    {tProfile('weeklyCurrentHoursLabel')}
                                  </span>
                                  <div className="relative w-[6.5rem] shrink-0">
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={weeklyCurrentHoursInput}
                                      onChange={(e) => setWeeklyCurrentHoursInput(e.target.value)}
                                      placeholder="6"
                                      className="w-full pl-3 pr-10 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
                                      {tProfile('suffixHoursPerWeek')}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-100">
                                  <span className="text-sm font-medium text-stone-700 shrink-0">
                                    {tProfile('weeklyMaxHoursLabel')}
                                  </span>
                                  <div className="relative w-[6.5rem] shrink-0">
                                    <input
                                      type="text"
                                      inputMode="decimal"
                                      value={weeklyTargetHoursInput}
                                      onChange={(e) => setWeeklyTargetHoursInput(e.target.value)}
                                      placeholder="10"
                                      className="w-full pl-3 pr-10 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
                                      {tProfile('suffixHoursPerWeek')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                {displaySportsForVolume.map((sport) => {
                                  const sportKey = sport as SportType
                                  const Icon = SPORT_ICONS[sportKey] ?? SPORT_ICONS.course
                                  const styles = SPORT_CARD_STYLES[sportKey] ?? SPORT_CARD_STYLES.course
                                  const unit = getWeeklyVolumeUnit(sport)
                                  const suffixKey =
                                    unit === 'km' ? 'suffixKmPerWeek' : unit === 'm' ? 'suffixMPerWeek' : 'suffixHoursPerWeek'
                                  const showCourseElevation = sport === 'course' && sports.includes('trail')
                                  return (
                                    <div
                                      key={sport}
                                      className={`rounded-xl border-l-4 border border-stone-200 bg-white p-3 flex flex-wrap items-center justify-between gap-3 ${styles.borderLeft}`}
                                    >
                                      <div className="flex items-center gap-2 min-w-0 shrink-0">
                                        <span className={styles.badge}>
                                          <Icon className="w-4 h-4" />
                                        </span>
                                        <span className="text-sm font-semibold text-stone-800">
                                          {tSports(SPORT_TRANSLATION_KEYS[sportKey])}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-3 ml-auto min-w-0 w-full sm:w-auto justify-end">
                                        <div className="relative w-[6.5rem] shrink-0">
                                          <input
                                            type="text"
                                            inputMode="decimal"
                                            value={weeklyVolumeInputs[sport] ?? ''}
                                            onChange={(e) => setVolumeInput(sport, e.target.value)}
                                            placeholder={unit === 'm' ? '2500' : unit === 'h' ? '2,5' : '42'}
                                            className="w-full pl-3 pr-11 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
                                          />
                                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none whitespace-nowrap">
                                            {tProfile(suffixKey)}
                                          </span>
                                        </div>
                                        {showCourseElevation && (
                                          <div className="relative w-[6.5rem] shrink-0">
                                            <input
                                              type="text"
                                              inputMode="decimal"
                                              value={weeklyVolumeInputs.course_elevation_m ?? ''}
                                              onChange={(e) => setVolumeInput('course_elevation_m', e.target.value)}
                                              placeholder="500"
                                              className="w-full pl-3 pr-12 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none whitespace-nowrap">
                                              {tProfile('suffixDPlusPerWeek')}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Section Objectifs de course / résultats passés */}
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wide">
                              {t('requestGoals.sectionTitle')}
                            </h4>
                            {initialGoals.length > 0 && (
                              <Button
                                type="button"
                                variant="outline"
                                className="shrink-0 text-xs px-2 py-1"
                                onClick={() => setAddGoalModalOpen(true)}
                              >
                                {t('requestGoals.addButton')}
                              </Button>
                            )}
                          </div>
                          {initialGoals.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50/50 p-6 text-center">
                              <p className="text-sm text-stone-500 mb-3">{t('requestGoals.emptyMessage')}</p>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setAddGoalModalOpen(true)}
                              >
                                {t('requestGoals.addButtonLong')}
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {initialGoals.slice(0, 5).map((goal) => {
                                const today = new Date().toISOString().slice(0, 10)
                                const isPast = goal.date <= today
                                const isPrimary = goal.is_primary
                                const isResult = isPast
                                const isPastOrToday = goal.date <= today
                                const hasResult = hasGoalResult(goal)
                                const dateBlock = formatGoalDateBlock(goal.date, localeTag)
                                return (
                                  <TileCard
                                    key={goal.id}
                                    leftBorderColor={isResult ? 'stone' : isPrimary ? 'amber' : 'sage'}
                                    borderLeftOnly={isResult}
                                  >
                                    <div className="flex gap-4 items-start min-w-0 justify-between">
                                      <div className="flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-xl w-12 h-12 shrink-0">
                                        <span className="text-[10px] font-bold text-stone-400 uppercase">{dateBlock.monthYear}</span>
                                        <span className="text-lg font-bold text-stone-800">{dateBlock.day}</span>
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                          <h4 className="text-sm font-bold truncate text-stone-900">
                                            {goal.race_name}
                                          </h4>
                                          {isPrimary ? (
                                            <span className="bg-white text-palette-amber text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-amber shrink-0">
                                              {tGoals('priority.primary')}
                                            </span>
                                          ) : (
                                            <span className="bg-white text-palette-sage text-[10px] font-bold px-2 py-0.5 rounded-full border border-palette-sage shrink-0">
                                              {tGoals('priority.secondary')}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-stone-500 font-medium flex-wrap">
                                          <MapIconSmall className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                          <span>{goal.distance} km</span>
                                          {hasTargetTime(goal) && (
                                            <>
                                              <span className="text-stone-400">·</span>
                                              <span className="flex items-center gap-1">
                                                <ClockIconSmall className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                                {isPast && hasGoalResult(goal) ? (
                                                  <span>{tGoals('targetTimeLabel')} {formatTargetTime(goal)} · {tGoals('achieved')} {formatGoalResultTime(goal)}</span>
                                                ) : (
                                                  <span>{tGoals('targetTimeLabel')} : {formatTargetTime(goal)}</span>
                                                )}
                                              </span>
                                            </>
                                          )}
                                          {!hasTargetTime(goal) && isPast && hasGoalResult(goal) && (
                                            <>
                                              <span className="text-stone-400">·</span>
                                              <span className="flex items-center gap-1">
                                                <ClockIconSmall className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                                                <span>{formatGoalResultTime(goal)}</span>
                                              </span>
                                            </>
                                          )}
                                          {hasGoalResult(goal) && goal.result_place != null && (
                                            <>
                                              <span className="text-stone-400">·</span>
                                              <span>{formatGoalResultPlaceOrdinal(goal.result_place, locale)}</span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <div className="shrink-0">
                                        <Button
                                          type="button"
                                          variant="muted"
                                          className="text-xs px-2 py-1"
                                          onClick={() => {
                                            setGoalForFullModal(goal)
                                            setFullModalInitialTab(isPastOrToday ? 'result' : 'objective')
                                          }}
                                        >
                                          {!isPastOrToday
                                            ? tGoals('editGoal')
                                            : hasResult
                                              ? tGoals('editGoal')
                                              : tGoals('result.addResult')}
                                        </Button>
                                      </div>
                                    </div>
                                  </TileCard>
                                )
                              })}
                              {initialGoals.length > 5 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => setSeeMoreGoalsModalOpen(true)}
                                >
                                  {t('requestGoals.seeMore', { count: initialGoals.length })}
                                </Button>
                              )}
                            </div>
                          )}
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
                          disabled={
                            isSubmitting
                            || !selectedOfferId
                            || sports.length === 0
                            || !need.trim()
                            || (showNameFields && (!firstName.trim() || !lastName.trim()))
                            || !weeklyCurrentValid
                            || !weeklyTargetValid
                            || !volumesComplete
                          }
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

      <RequestGoalAddModal
        isOpen={addGoalModalOpen}
        onClose={() => setAddGoalModalOpen(false)}
      />
      <RequestGoalsListModal
        isOpen={seeMoreGoalsModalOpen}
        onClose={() => setSeeMoreGoalsModalOpen(false)}
        goals={initialGoals}
        title={t('requestGoals.seeMoreModalTitle')}
        layer={1}
      />
      {goalForFullModal && (
        <GoalFullModal
          goal={goalForFullModal}
          isOpen={!!goalForFullModal}
          onClose={() => setGoalForFullModal(null)}
          initialTab={fullModalInitialTab}
          layer={1}
        />
      )}
    </>,
    document.body
  )
}

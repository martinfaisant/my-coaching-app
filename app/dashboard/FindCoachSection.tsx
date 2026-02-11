'use client'

import { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { RequestCoachButton } from './RequestCoachButton'
import { AvatarImage } from '@/components/AvatarImage'
import { createCoachRequest } from './actions'
import { PRACTICED_SPORTS_OPTIONS } from './sportsOptions'
import { useRouter } from 'next/navigation'

function getInitials(fullName: string | null, email: string): string {
  const name = (fullName ?? '').trim()
  if (name) {
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    if (parts[0].length >= 2) return parts[0].slice(0, 2).toUpperCase()
    return parts[0][0].toUpperCase()
  }
  if (email.length >= 2) return email.slice(0, 2).toUpperCase()
  return '?'
}

/** Environ 10 lignes en caractères (ordre de grandeur) pour afficher "Voir plus" */
const PRESENTATION_LONG_THRESHOLD = 500

/** Même ordre et libellés que le profil coach, avec emoji pour les tuiles. */
const COACHED_SPORTS_OPTIONS: { value: string; label: string; emoji: string }[] = [
  { value: 'course_route', label: 'Course à pied', emoji: '🏃' },
  { value: 'trail', label: 'Trail', emoji: '⛰️' },
  { value: 'triathlon', label: 'Triathlon', emoji: '🏊‍♂️' },
  { value: 'velo', label: 'Vélo', emoji: '🚴' },
]

const LANGUAGES_OPTIONS: { value: string; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'zh', label: '中文' },
]

export type CoachForList = {
  user_id: string
  email: string
  full_name: string | null
  coached_sports: string[] | null
  languages: string[] | null
  presentation: string | null
  avatar_url?: string | null
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
  offersByCoach?: Record<string, Array<{ id: string; title: string; description: string | null; price: number; price_type: string; is_featured: boolean; display_order: number }>>
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
  const sportLabel = (value: string) => COACHED_SPORTS_OPTIONS.find((o) => o.value === value)?.label ?? value
  const sportEmoji = (value: string) => COACHED_SPORTS_OPTIONS.find((o) => o.value === value)?.emoji ?? ''

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
            <h1 className="text-lg font-bold text-stone-900">Filtre</h1>
          </div>
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-semibold text-[#627e59] hover:text-[#506648] underline transition-colors"
          >
            Réinitialiser
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Sport coaché</h3>
            <div className="flex flex-wrap gap-2">
              {COACHED_SPORTS_OPTIONS.map((opt) => (
                <label key={opt.value} className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSports.includes(opt.value)}
                    onChange={() => toggleSport(opt.value)}
                    className="hidden chip-checkbox"
                  />
                  <div className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 hover:border-[#627e59] transition-all text-sm font-medium select-none flex items-center gap-2">
                    <span aria-hidden>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Langue parlée</h3>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES_OPTIONS.map((opt) => (
                <label key={opt.value} className="cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(opt.value)}
                    onChange={() => toggleLanguage(opt.value)}
                    className="hidden chip-checkbox"
                  />
                  <div className="px-3 py-2 rounded-md border border-stone-200 bg-white text-stone-600 hover:border-[#627e59] transition-all text-sm font-medium select-none">
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Titre Résultats + badge (HTML) */}
      <h2 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
        Résultats
        <span className="bg-stone-200 text-stone-600 text-xs py-0.5 px-2 rounded-full">
          {filteredCoaches.length}
        </span>
      </h2>

      {filteredCoaches.length === 0 ? (
        <p className="text-sm text-stone-600 rounded-lg border border-stone-200 bg-stone-50 p-6">
          Aucun coach ne correspond à vos critères. Modifiez les filtres ou revenez plus tard.
        </p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map((c) => (
            <li
              key={c.user_id}
              className="bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-lg hover:border-[#627e59]/30 transition-all flex flex-col overflow-hidden group h-full"
            >
              <div className="p-6 flex flex-col flex-grow">
                {/* Header carte : avatar 12 + nom (HTML) */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {c.avatar_url?.trim() ? (
                        <img
                          src={c.avatar_url}
                          alt=""
                          className="w-12 h-12 rounded-full object-cover ring-2 ring-stone-100 group-hover:ring-[#627e59]/20 transition-all"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-[#8e9856] text-white flex items-center justify-center text-base font-bold ring-2 ring-stone-100 group-hover:ring-[#627e59]/20 transition-all">
                          {getInitials(c.full_name ?? null, c.email)}
                        </div>
                      )}
                      {/* Badge "Pro" optionnel - à afficher si le coach a des avis */}
                      {ratingsByCoach[c.user_id] && ratingsByCoach[c.user_id].reviewCount > 0 && (
                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full ring-2 ring-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight text-stone-900 group-hover:text-[#627e59] transition-colors">
                        {c.full_name?.trim() || c.email}
                      </h3>
                      {ratingsByCoach[c.user_id] && ratingsByCoach[c.user_id].reviewCount > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-stone-500 mt-0.5">
                          <span className="text-amber-500 font-bold flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 fill-current mr-0.5" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {ratingsByCoach[c.user_id].averageRating}
                          </span>
                          <span>({ratingsByCoach[c.user_id].reviewCount} avis)</span>
                        </div>
                      ) : (
                        <span className="text-[10px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded">Nouveau</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tags : sports (avec emoji) */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(c.coached_sports ?? []).map((sportValue) => (
                    <span
                      key={sportValue}
                      className="inline-flex items-center px-2 py-1 rounded-md bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wide border border-stone-200"
                    >
                      <span aria-hidden>{sportEmoji(sportValue)}</span>
                      <span>{sportLabel(sportValue)}</span>
                    </span>
                  ))}
                </div>

                {/* Bio Courte */}
                <p className="text-sm text-stone-500 line-clamp-2 mb-5 flex-1">
                  {c.presentation?.trim() || 'Coach disponible pour vous accompagner dans votre progression.'}
                </p>

                {/* BLOC OFFRES */}
                {offersByCoach[c.user_id] && offersByCoach[c.user_id].length > 0 && (
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 mb-4">
                    <div className="mb-3">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Formules disponibles</p>
                    </div>
                    <div className="space-y-2.5">
                      {offersByCoach[c.user_id].slice(0, 3).map((offer) => {
                        const isFree = offer.price_type === 'free'
                        const isMonthly = offer.price_type === 'monthly'
                        const isFeatured = offer.is_featured
                        const dotColor = isFeatured ? 'bg-emerald-500 shadow-sm shadow-emerald-200' : isMonthly ? 'bg-blue-500' : 'bg-stone-400'
                        return (
                          <div key={offer.id} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                              <span className={`text-xs ${isFeatured ? 'font-semibold text-stone-700' : 'font-medium text-stone-600'}`}>{offer.title}</span>
                            </div>
                            <div className="text-right">
                              {isFree ? (
                                <span className="text-xs font-bold text-[#627e59] bg-[#627e59]/10 px-1.5 py-0.5 rounded">Gratuit</span>
                              ) : (
                                <>
                                  <span className="text-xs font-bold text-stone-900">{offer.price}€</span>
                                  <span className="text-[10px] text-stone-400">/{isMonthly ? 'mois' : 'plan'}</span>
                                </>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer carte : bouton pleine largeur (HTML) */}
              <div className="p-4 border-t border-stone-100 bg-stone-50 mt-auto w-full [&_button]:w-full">
                {getStatus(c.user_id) === 'pending' ? (
                  <RequestCoachButton
                    coachId={c.user_id}
                    coachName={c.full_name?.trim() || c.email}
                    requestStatus={getStatus(c.user_id)}
                    requestId={getRequestId(c.user_id)}
                    initialPracticedSports={initialPracticedSports}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setDetailModalCoach(c)}
                    className="w-full py-2.5 rounded-xl bg-white border-2 border-[#627e59] text-[#627e59] font-bold text-sm hover:bg-[#627e59] hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <span>Voir le détail</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                )}
              </div>
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
            className="fixed inset-0 bg-palette-forest-dark/50 backdrop-blur-sm z-[90]"
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
              <button
                type="button"
                onClick={() => setPresentationModalCoach(null)}
                className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
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
                  Présentation — {presentationModalCoach.full_name?.trim() || presentationModalCoach.email}
                </h2>
              </div>
              {(presentationModalCoach.coached_sports?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {presentationModalCoach.coached_sports!.map((sportValue) => (
                    <span
                      key={sportValue}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#627e59]/10 text-[#627e59] border border-[#627e59]/20"
                    >
                      <span aria-hidden>{sportEmoji(sportValue)}</span>
                      <span>{sportLabel(sportValue)}</span>
                    </span>
                  ))}
                </div>
              )}
              {(presentationModalCoach.languages?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {presentationModalCoach.languages!.map((langCode) => (
                    <span
                      key={langCode}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8e9856]/10 text-[#8e9856]"
                    >
                      {languageLabel(langCode)}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-sm text-stone-700 whitespace-pre-wrap">
                {presentationModalCoach.presentation!.trim()}
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
  offers: Array<{ id: string; title: string; description: string | null; price: number; price_type: string; is_featured: boolean; display_order: number }>
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
        isSelected
          ? 'bg-[#627e59] text-white hover:bg-[#506648] shadow-md'
          : 'border-2 border-stone-200 text-stone-600 hover:border-stone-400 hover:bg-stone-50'
      }`}
    >
      {isSelected ? (
        <>
          Sélectionné
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </>
      ) : (
        'Sélectionner'
      )}
    </button>
  )
}

function CoachDetailModal({ coach, offers, ratings, onClose, requestStatus, requestId, initialPracticedSports = [] }: CoachDetailModalProps) {
  const router = useRouter()
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
      setError('Veuillez sélectionner une offre.')
      return
    }
    if (sports.length === 0 || !need.trim()) {
      setError('Veuillez renseigner au moins un sport pratiqué et votre besoin de coaching.')
      return
    }
    setError(null)
    setIsSubmitting(true)
    const result = await createCoachRequest(coach.user_id, sports, need.trim(), selectedOfferId)
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
    if (offer.price_type === 'free') return 'Gratuit'
    if (offer.price_type === 'monthly') return `${offer.price}€/mois`
    return `${offer.price}€`
  }

  const getOfferBadge = (offer: typeof offers[0]) => {
    if (offer.is_featured) return { label: 'Recommandé', className: 'bg-[#627e59]/10 text-[#627e59]' }
    if (offer.price_type === 'free') return { label: 'Découverte', className: 'bg-stone-100 text-stone-600' }
    if (offer.price_type === 'monthly') return { label: 'Suivi Complet', className: 'bg-[#627e59]/10 text-[#627e59]' }
    return { label: 'Plan Unique', className: 'bg-blue-50 text-blue-600' }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 bg-palette-forest-dark/50 backdrop-blur-sm z-[90]" onClick={onClose} />
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
        <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] my-auto">
          {/* HEADER FIXE (Identité + Note) */}
          <div className="p-6 border-b border-stone-100 flex gap-5 items-center bg-white shrink-0">
            <div className="relative">
              <AvatarImage
                src={coach.avatar_url}
                initials={getInitials(coach.full_name, coach.email)}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-stone-50"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-stone-900">{coach.full_name?.trim() || coach.email}</h2>
              {ratings && ratings.reviewCount > 0 && (
                <div className="flex items-center gap-1 text-sm text-amber-500 font-bold mt-0.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {ratings.averageRating} <span className="text-stone-400 font-normal ml-1">({ratings.reviewCount} avis)</span>
                </div>
              )}
              {/* Tags Sports & Langues */}
              {((coach.coached_sports ?? []).length > 0 || (coach.languages ?? []).length > 0) && (
                <div className="flex flex-wrap gap-2 items-center mt-2">
                  {/* Tuiles Sports */}
                  {(coach.coached_sports ?? []).map((sportValue) => {
                    const opt = COACHED_SPORTS_OPTIONS.find(o => o.value === sportValue)
                    return (
                      <span
                        key={sportValue}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-600 text-xs font-bold uppercase tracking-wide"
                      >
                        <span aria-hidden>{opt?.emoji ?? ''}</span>
                        {opt?.label ?? sportValue}
                      </span>
                    )
                  })}
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
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-stone-50 hover:bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-600 transition-colors shrink-0"
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {/* CORPS SCROLLABLE */}
          <div className="overflow-y-auto p-6 md:p-8 bg-stone-50 flex-1">
            {requestStatus === 'pending' ? (
              <div className="text-center py-12">
                <p className="text-stone-600 font-medium mb-2">Demande en attente</p>
                <p className="text-sm text-stone-500">Vous avez déjà envoyé une demande à ce coach.</p>
              </div>
            ) : (
              <>
                {/* INFO PROFIL (Bio) */}
                {coach.presentation?.trim() && (
                  <div className="mb-8">
                    <p className="text-stone-600 text-sm leading-relaxed max-w-3xl">
                      {coach.presentation.trim()}
                    </p>
                  </div>
                )}

                {coach.presentation?.trim() && <hr className="border-stone-200 mb-8" />}

                {/* SECTION OFFRES */}
                <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#627e59]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M20 7h-4m-2-4H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
                  </svg>
                  Choisissez une formule
                </h3>

                {sortedOffers.length === 0 ? (
                  <p className="text-sm text-stone-600 text-center py-8">Ce coach n'a pas encore d'offres disponibles.</p>
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
                                ? 'border-[#627e59] shadow-md hover:border-[#627e59]' 
                                : 'border-stone-200 hover:border-stone-300 hover:shadow-md'
                            }`}
                            onClick={() => setSelectedOfferId(offer.id)}
                          >
                            {isFeatured && (
                              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm transition-colors ${
                                isSelected ? 'bg-[#627e59] text-white' : 'bg-stone-500 text-white group-hover:bg-[#627e59]'
                              }`}>
                                Recommandé
                              </div>
                            )}
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className="text-lg font-bold text-stone-900">{offer.title}</h4>
                                {offer.description && (
                                  <p className="text-sm text-stone-500 mt-1">{offer.description}</p>
                                )}
                              </div>
                              <div className={`w-5 h-5 rounded-full border-2 transition-colors shrink-0 ${
                                isSelected 
                                  ? 'border-[#627e59] bg-[#627e59]' 
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
                                {offer.price_type === 'free' ? 'Gratuit' : `${offer.price}€`}
                              </span>
                              {offer.price_type === 'monthly' && (
                                <span className="text-sm text-stone-500 font-medium">/mois</span>
                              )}
                              {offer.price_type === 'one_time' && (
                                <span className="text-sm text-stone-500 font-medium">/plan</span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* PLACEHOLDER FORMULAIRE */}
                    {!selectedOfferId ? (
                      <div className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center bg-stone-50/50">
                        <p className="text-stone-400 text-sm">Veuillez sélectionner une offre ci-dessus pour continuer.</p>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 p-6 space-y-6">
                        <h4 className="text-base font-semibold text-stone-900">Compléter votre demande</h4>
                        {error && (
                          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                          </div>
                        )}
                        <div>
                          <label className="block text-sm font-medium text-stone-700 mb-2">
                            Sports pratiqués *
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {PRACTICED_SPORTS_OPTIONS.map((opt) => (
                              <label key={opt.value} className="cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={sports.includes(opt.value)}
                                  onChange={() => toggleSport(opt.value)}
                                  className="hidden"
                                />
                                <div className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                  sports.includes(opt.value)
                                    ? 'bg-[#627e59] text-white'
                                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                                }`}>
                                  {opt.emoji} {opt.label}
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="coaching_need" className="block text-sm font-medium text-stone-700 mb-2">
                            Besoin de coaching *
                          </label>
                          <textarea
                            id="coaching_need"
                            value={need}
                            onChange={(e) => setNeed(e.target.value)}
                            rows={4}
                            placeholder="Décrivez votre objectif, votre niveau actuel, vos contraintes..."
                            className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#627e59] focus:border-transparent resize-y"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full py-3 rounded-xl bg-[#627e59] text-white font-bold hover:bg-[#506648] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Envoi en cours...' : 'Envoyer la demande'}
                          {!isSubmitting && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path d="m9 18 6-6-6-6" />
                            </svg>
                          )}
                        </button>
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

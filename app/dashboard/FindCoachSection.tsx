'use client'

import { useState, useMemo, useEffect } from 'react'
import { RequestCoachButton } from './RequestCoachButton'

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

export function FindCoachSection({ coaches, statusByCoach, requestIdByCoach = {}, initialPracticedSports = [], ratingsByCoach = {} }: FindCoachSectionProps) {
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [presentationModalCoach, setPresentationModalCoach] = useState<CoachForList | null>(null)
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
              className="bg-white rounded-2xl border border-stone-200 flex flex-col h-full overflow-hidden transition-all duration-300 ease-out hover:border-[#627e59] hover:shadow-lg hover:-translate-y-1"
            >
              <div className="p-6 flex flex-col flex-grow">
                {/* Header carte : avatar 16 + nom (HTML) */}
                <div className="flex items-center gap-4 mb-4">
                  {c.avatar_url?.trim() ? (
                    <img
                      src={c.avatar_url}
                      alt=""
                      className="w-16 h-16 rounded-full border-2 border-white shadow-md object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#8e9856] text-white flex items-center justify-center text-xl font-bold border-2 border-white shadow-md flex-shrink-0">
                      {getInitials(c.full_name ?? null, c.email)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-stone-900 leading-tight">
                      {c.full_name?.trim() || c.email}
                    </h3>
                    {ratingsByCoach[c.user_id] && ratingsByCoach[c.user_id].reviewCount > 0 ? (
                      <div className="flex items-center gap-1 text-amber-400 text-sm mt-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 fill-current shrink-0" viewBox="0 0 20 20" aria-hidden>
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-stone-500 font-medium ml-1">
                          {ratingsByCoach[c.user_id].averageRating} ({ratingsByCoach[c.user_id].reviewCount} avis)
                        </span>
                      </div>
                    ) : (
                      <p className="text-stone-400 font-medium text-sm mt-1">Nouveau coach</p>
                    )}
                  </div>
                </div>

                {/* Tags : sports (avec emoji) + langues (pastille olive) */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {(c.coached_sports ?? []).map((sportValue) => (
                    <span
                      key={sportValue}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#627e59]/10 text-[#627e59] border border-[#627e59]/20"
                    >
                      <span aria-hidden>{sportEmoji(sportValue)}</span>
                      <span>{sportLabel(sportValue)}</span>
                    </span>
                  ))}
                  {(c.languages ?? []).map((langCode) => (
                    <span
                      key={langCode}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#8e9856]/10 text-[#8e9856]"
                    >
                      {languageLabel(langCode)}
                    </span>
                  ))}
                </div>

                {/* Description (line-clamp-3) + lien Voir le profil complet */}
                {c.presentation?.trim() ? (
                  <>
                    <p className="text-sm text-stone-600 leading-relaxed mb-4 line-clamp-3">
                      {c.presentation.trim()}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPresentationModalCoach(c)}
                      className="text-xs font-semibold text-[#627e59] hover:underline mb-4 inline-block text-left"
                    >
                      Voir le profil complet
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPresentationModalCoach(c)}
                    className="text-xs font-semibold text-[#627e59] hover:underline mb-4 inline-block text-left"
                  >
                    Voir le profil complet
                  </button>
                )}
              </div>

              {/* Footer carte : bouton pleine largeur (HTML) */}
              <div className="p-4 border-t border-stone-100 bg-stone-50 mt-auto w-full [&_button]:w-full">
                <RequestCoachButton
                  coachId={c.user_id}
                  coachName={c.full_name?.trim() || c.email}
                  requestStatus={getStatus(c.user_id)}
                  requestId={getRequestId(c.user_id)}
                  initialPracticedSports={initialPracticedSports}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      {presentationModalCoach && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="presentation-modal-title"
        >
          <div
            className="absolute inset-0 bg-palette-forest-dark/50 backdrop-blur-sm"
            onClick={() => setPresentationModalCoach(null)}
            aria-hidden="true"
          />
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
      )}
    </section>
  )
}

'use client'

import { useState, useMemo, useEffect } from 'react'
import { RequestCoachButton } from './RequestCoachButton'

/** Environ 10 lignes en caractères (ordre de grandeur) pour afficher "Voir plus" */
const PRESENTATION_LONG_THRESHOLD = 500

const COACHED_SPORTS_OPTIONS: { value: string; label: string }[] = [
  { value: 'course_route', label: 'Course à pied sur route' },
  { value: 'trail', label: 'Trail' },
  { value: 'triathlon', label: 'Triathlon' },
  { value: 'velo', label: 'Vélo' },
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
}

type FindCoachSectionProps = {
  coaches: CoachForList[]
  /** coach_id -> status (serializable from server) */
  statusByCoach: Record<string, 'pending' | 'declined'>
  /** coach_id -> request id (for pending requests, to allow cancel) */
  requestIdByCoach?: Record<string, string>
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

export function FindCoachSection({ coaches, statusByCoach, requestIdByCoach = {} }: FindCoachSectionProps) {
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

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-stone-200 bg-section p-4">
        <h2 className="text-xl font-semibold text-stone-900 mb-3">Trouver un coach</h2>
        <h3 className="text-sm font-semibold text-stone-900 mb-3">Filtrer par</h3>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">Sport coaché</p>
            <div className="flex flex-wrap gap-2">
              {COACHED_SPORTS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSports.includes(opt.value)}
                    onChange={() => toggleSport(opt.value)}
                    className="h-3.5 w-3.5 rounded border-stone-300 text-palette-forest-dark focus:ring-palette-olive"
                  />
                  <span className="text-sm text-stone-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-stone-500 mb-2">Langue parlée</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(opt.value)}
                    onChange={() => toggleLanguage(opt.value)}
                    className="h-3.5 w-3.5 rounded border-stone-300 text-palette-forest-dark focus:ring-palette-olive"
                  />
                  <span className="text-sm text-stone-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-base font-semibold text-stone-900">
        Liste des coachs
        {filteredCoaches.length !== coaches.length && (
          <span className="font-normal text-stone-500 ml-2">
            ({filteredCoaches.length} sur {coaches.length})
          </span>
        )}
      </h3>

      {filteredCoaches.length === 0 ? (
        <p className="text-sm text-stone-600 rounded-lg border border-stone-200 bg-section p-6">
          Aucun coach ne correspond à vos critères. Modifiez les filtres ou revenez plus tard.
        </p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCoaches.map((c) => (
            <li
              key={c.user_id}
              className="flex flex-col rounded-xl border border-stone-200 bg-section p-5 hover:border-stone-300 transition-colors"
            >
              <div className="flex flex-col gap-4 flex-1 min-h-0">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-stone-900">
                    {c.full_name?.trim() || c.email}
                  </p>
                  {(c.coached_sports?.length ?? 0) > 0 && (
                    <p className="text-xs text-stone-500 mt-2">
                      Sports : {c.coached_sports!.map(sportLabel).join(', ')}
                    </p>
                  )}
                  {(c.languages?.length ?? 0) > 0 && (
                    <p className="text-xs text-stone-500 mt-0.5">
                      Langues : {c.languages!.map(languageLabel).join(', ')}
                    </p>
                  )}
                  {c.presentation?.trim() && (
                    <div className="mt-3">
                      <p className="text-sm text-stone-700 whitespace-pre-wrap line-clamp-[10]">
                        {c.presentation.trim()}
                      </p>
                      {c.presentation.trim().length > PRESENTATION_LONG_THRESHOLD && (
                        <button
                          type="button"
                          onClick={() => setPresentationModalCoach(c)}
                          className="mt-2 text-sm font-medium text-stone-500 hover:text-stone-700 underline underline-offset-2 transition-colors"
                        >
                          Voir plus
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-2 flex justify-center">
                  <RequestCoachButton
                    coachId={c.user_id}
                    coachName={c.full_name?.trim() || c.email}
                    requestStatus={getStatus(c.user_id)}
                    requestId={getRequestId(c.user_id)}
                  />
                </div>
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
              <h2 id="presentation-modal-title" className="text-xl font-semibold text-stone-900 mb-2">
                Présentation — {presentationModalCoach.full_name?.trim() || presentationModalCoach.email}
              </h2>
              {(presentationModalCoach.coached_sports?.length ?? 0) > 0 && (
                <p className="text-sm text-stone-600 mb-1">
                  <span className="font-medium">Sports :</span>{' '}
                  {presentationModalCoach.coached_sports!.map(sportLabel).join(', ')}
                </p>
              )}
              {(presentationModalCoach.languages?.length ?? 0) > 0 && (
                <p className="text-sm text-stone-600 mb-3">
                  <span className="font-medium">Langues :</span>{' '}
                  {presentationModalCoach.languages!.map(languageLabel).join(', ')}
                </p>
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

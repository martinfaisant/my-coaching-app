'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components/PrimaryButton'
import { createCoachRequest, cancelCoachRequest } from './actions'
import { PRACTICED_SPORTS_OPTIONS } from './sportsOptions'

export { PRACTICED_SPORTS_OPTIONS }

type RequestCoachButtonProps = {
  coachId: string
  coachName: string
  requestStatus: 'pending' | 'declined' | null
  /** Id de la demande (quand status === 'pending') pour permettre l'annulation */
  requestId?: string | null
  /** Sports déjà renseignés dans le profil (préremplissent le formulaire à l'ouverture) */
  initialPracticedSports?: string[]
}

/** Affiche les sports pratiqués (valeur stockée en base, ex. "course,velo") avec les libellés. */
export function formatSportPracticedDisplay(value: string): string {
  if (!value?.trim()) return '—'
  const labels = value.split(',').map((v) => {
    const opt = PRACTICED_SPORTS_OPTIONS.find((o) => o.value === v.trim())
    return opt ? opt.label : v.trim()
  })
  return labels.filter(Boolean).join(', ')
}

export function RequestCoachButton({ coachId, coachName, requestStatus, requestId, initialPracticedSports = [] }: RequestCoachButtonProps) {
  const [open, setOpen] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [sports, setSports] = useState<string[]>(initialPracticedSports)
  const [need, setNeed] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const toggleSport = (value: string) => {
    setSports((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createCoachRequest(coachId, sports, need.trim())
      if (result.error) {
        setError(result.error)
        return
      }
      setOpen(false)
      setSports([])
      setNeed('')
      router.refresh()
    })
  }

  const closeModal = () => {
    if (!isPending) setOpen(false)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
    }
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      if (!isPending) setSports(initialPracticedSports?.length ? [...initialPracticedSports] : [])
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      // Ne réinitialiser overflow que si la modale de confirmation n'est pas ouverte
      if (!confirmCancelOpen) {
        document.body.style.overflow = ''
      }
    }
  }, [open, isPending, initialPracticedSports, confirmCancelOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) {
        setError(null)
        setConfirmCancelOpen(false)
      }
    }
    if (confirmCancelOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      // Ne réinitialiser overflow que si aucune modale n'est ouverte
      if (!open && !confirmCancelOpen) {
        document.body.style.overflow = ''
      }
    }
  }, [confirmCancelOpen, isPending, open])

  const handleConfirmCancel = () => {
    if (!requestId) return
    startTransition(async () => {
      const result = await cancelCoachRequest(requestId)
      if (result.error) {
        setError(result.error)
        return
      }
      // Fermer la modale d'abord, puis refresh au prochain tick pour éviter un glitch visuel (vibration)
      setConfirmCancelOpen(false)
      setTimeout(() => router.refresh(), 0)
    })
  }

  if (requestStatus === 'pending') {
    return (
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm text-stone-600 font-medium">
          Demande envoyée
        </span>
        {requestId && (
          <>
            <button
              type="button"
              onClick={() => { setError(null); setConfirmCancelOpen(true) }}
              disabled={isPending}
              className="text-sm font-medium text-stone-500 hover:text-stone-700 underline underline-offset-2 disabled:opacity-50 transition-colors"
            >
              Annuler la demande
            </button>
            {confirmCancelOpen &&
              typeof document !== 'undefined' &&
              createPortal(
                <>
                  <div
                    className="fixed inset-0 bg-palette-forest-dark/50 backdrop-blur-sm z-[90]"
                    onClick={() => { if (!isPending) { setError(null); setConfirmCancelOpen(false) } }}
                    aria-hidden="true"
                  />
                  <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-cancel-title"
                  >
                    <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-stone-100">
                      <div className="sticky top-0 flex justify-end p-3 bg-white rounded-t-xl z-10">
                        <button
                          type="button"
                          onClick={() => { if (!isPending) { setError(null); setConfirmCancelOpen(false) } }}
                          className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
                          aria-label="Fermer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                          </svg>
                        </button>
                      </div>
                      <div className="px-8 pb-8">
                        <h2 id="confirm-cancel-title" className="text-xl font-semibold text-stone-900 text-center mb-2">
                          Annuler la demande ?
                        </h2>
                        <p className="text-sm text-stone-600 text-center mb-8">
                          Êtes-vous sûr de vouloir annuler cette demande envoyée à ce coach ?
                        </p>
                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => { setError(null); setConfirmCancelOpen(false) }}
                            disabled={isPending}
                            className="flex-1 py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
                          >
                            Retour
                          </button>
                          <PrimaryButton
                            type="button"
                            onClick={handleConfirmCancel}
                            disabled={isPending}
                            className="flex-1"
                          >
                            {isPending ? 'Annulation...' : 'Oui, annuler'}
                          </PrimaryButton>
                        </div>
                        {error && (
                          <p className="text-sm text-red-600 mt-4 text-center" role="alert">{error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>,
                document.body
              )}
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <PrimaryButton
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        Choisir ce coach
      </PrimaryButton>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-palette-forest-dark/50 backdrop-blur-sm z-[90]"
              onClick={closeModal}
              aria-hidden="true"
            />
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="request-coach-title"
            >
            <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-stone-100">
              <div className="sticky top-0 flex justify-end p-3 bg-white rounded-t-xl z-10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
                  aria-label="Fermer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-8 pb-8">
                <h2 id="request-coach-title" className="text-2xl font-semibold text-stone-900 text-center mb-2">
                  Demande de coaching
                </h2>
                <p className="text-sm text-stone-600 text-center mb-8">
                  Renseignez les informations ci-dessous. Le coach pourra accepter ou refuser votre demande.
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <p className="block text-sm font-medium text-stone-700 mb-3">Sports pratiqués</p>
                    <div className="flex flex-wrap gap-3" role="group" aria-label="Sports pratiqués">
                      {PRACTICED_SPORTS_OPTIONS.map((opt) => (
                        <label key={opt.value} className="cursor-pointer">
                          <input
                            type="checkbox"
                            name="sport_practiced"
                            value={opt.value}
                            checked={sports.includes(opt.value)}
                            onChange={() => toggleSport(opt.value)}
                            className="hidden chip-checkbox"
                          />
                          <div className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 hover:border-[#627e59] transition-all text-sm font-medium select-none flex items-center gap-2">
                            <span>{opt.emoji}</span>
                            <span>{opt.label}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="need" className="block text-sm font-medium text-stone-700 mb-2">
                      Besoin de coaching
                    </label>
                    <textarea
                      id="need"
                      value={need}
                      onChange={(e) => setNeed(e.target.value)}
                      required
                      rows={4}
                      placeholder="Décrivez votre objectif ou votre besoin d'accompagnement..."
                      className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent resize-y transition"
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600" role="alert">{error}</p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={closeModal}
                      disabled={isPending}
                      className="flex-1 py-2.5 rounded-lg border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
                    >
                      Annuler
                    </button>
                    <PrimaryButton
                      type="submit"
                      disabled={isPending || sports.length === 0}
                      className="flex-1"
                    >
                      {isPending ? 'Envoi...' : 'Envoyer la demande'}
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            </div>
            </div>
          </>,
          document.body
        )}
    </>
  )
}

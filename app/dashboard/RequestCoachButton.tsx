'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components/PrimaryButton'
import { createCoachRequest, cancelCoachRequest } from './actions'

type RequestCoachButtonProps = {
  coachId: string
  coachName: string
  requestStatus: 'pending' | 'declined' | null
  /** Id de la demande (quand status === 'pending') pour permettre l'annulation */
  requestId?: string | null
}

export function RequestCoachButton({ coachId, coachName, requestStatus, requestId }: RequestCoachButtonProps) {
  const [open, setOpen] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [sport, setSport] = useState('')
  const [need, setNeed] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await createCoachRequest(coachId, sport.trim(), need.trim())
      if (result.error) {
        setError(result.error)
        return
      }
      setOpen(false)
      setSport('')
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
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, isPending])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) setConfirmCancelOpen(false)
    }
    if (confirmCancelOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [confirmCancelOpen, isPending])

  const handleConfirmCancel = () => {
    if (!requestId) return
    startTransition(async () => {
      const result = await cancelCoachRequest(requestId)
      if (result.error) {
        setError(result.error)
        return
      }
      setConfirmCancelOpen(false)
      router.refresh()
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
            {confirmCancelOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-cancel-title"
              >
                <div
                  className="absolute inset-0 bg-palette-forest-dark/50 backdrop-blur-sm"
                  onClick={() => { if (!isPending) { setError(null); setConfirmCancelOpen(false) } }}
                  aria-hidden="true"
                />
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

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-coach-title"
        >
          <div
            className="absolute inset-0 bg-palette-forest-dark/50 backdrop-blur-sm"
            onClick={closeModal}
            aria-hidden="true"
          />
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
                  <label htmlFor="sport" className="block text-sm font-medium text-stone-700 mb-2">
                    Sport pratiqué
                  </label>
                  <input
                    id="sport"
                    type="text"
                    value={sport}
                    onChange={(e) => setSport(e.target.value)}
                    required
                    placeholder="Ex. Course à pied, Musculation..."
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
                  />
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
                    disabled={isPending}
                    className="flex-1"
                  >
                    {isPending ? 'Envoi...' : 'Envoyer la demande'}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

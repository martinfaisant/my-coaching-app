'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createCoachRequest } from './actions'

type RequestCoachButtonProps = {
  coachId: string
  coachName: string
  requestStatus: 'pending' | 'declined' | null
}

export function RequestCoachButton({ coachId, coachName, requestStatus }: RequestCoachButtonProps) {
  const [open, setOpen] = useState(false)
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

  if (requestStatus === 'pending') {
    return (
      <span className="text-sm text-stone-600 font-medium">
        Demande envoyée
      </span>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={isPending}
        className="rounded-lg bg-palette-forest-dark px-4 py-2 text-sm font-medium text-white border-2 border-palette-olive hover:bg-palette-olive transition-colors disabled:opacity-50"
      >
        Choisir ce coach
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-coach-title"
        >
          <div
            className="absolute inset-0 bg-stone-900/50bg-black/50 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-xl border border-stone-100border-stone-800 bg-whitebg-stone-900 shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="request-coach-title" className="text-lg font-semibold text-stone-900text-white">
                Demande de coaching — {coachName}
              </h2>
              <button
                type="button"
                onClick={() => !isPending && setOpen(false)}
                className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50text-white0hover:text-stone-300hover:bg-palette-olive transition-colors"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-stone-600text-stone-400 mb-4">
              Renseignez les informations ci-dessous. Le coach pourra accepter ou refuser votre demande.
            </p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
                  Sport pratiqué
                </label>
                <input
                  id="sport"
                  type="text"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  required
                  placeholder="Ex. Course à pied, Musculation..."
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-palette-forest-dark bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="need" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
                  Besoin de coaching
                </label>
                <textarea
                  id="need"
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  required
                  rows={4}
                  placeholder="Décrivez votre objectif ou votre besoin d'accompagnement..."
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-palette-forest-dark bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent resize-y transition"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600" role="alert">{error}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-lg border-2 border-palette-forest-dark text-stone-700 font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-lg bg-palette-forest-dark text-white font-medium border-2 border-palette-olive hover:bg-palette-olive transition-colors disabled:opacity-50"
                >
                  {isPending ? 'Envoi...' : 'Envoyer la demande'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

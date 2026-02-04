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
      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
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
        className="rounded-xl bg-slate-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 transition"
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
            className="absolute inset-0 bg-slate-900/60 dark:bg-black/60 backdrop-blur-sm"
            onClick={() => !isPending && setOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="request-coach-title" className="text-lg font-semibold text-slate-900 dark:text-white">
                Demande de coaching — {coachName}
              </h2>
              <button
                type="button"
                onClick={() => !isPending && setOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Renseignez les informations ci-dessous. Le coach pourra accepter ou refuser votre demande.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="sport" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Sport pratiqué
                </label>
                <input
                  id="sport"
                  type="text"
                  value={sport}
                  onChange={(e) => setSport(e.target.value)}
                  required
                  placeholder="Ex. Course à pied, Musculation..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <div>
                <label htmlFor="need" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Besoin de coaching
                </label>
                <textarea
                  id="need"
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  required
                  rows={4}
                  placeholder="Décrivez votre objectif ou votre besoin d'accompagnement..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 resize-y"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">{error}</p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition disabled:opacity-50"
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

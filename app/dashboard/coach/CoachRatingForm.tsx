'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components/PrimaryButton'
import { upsertCoachRating } from './actions'

type CoachRatingFormProps = {
  coachId: string
  initialRating: number | null
  initialComment: string
}

export function CoachRatingForm({ coachId, initialRating, initialComment }: CoachRatingFormProps) {
  const [rating, setRating] = useState<number>(initialRating ?? 0)
  const [comment, setComment] = useState(initialComment ?? '')
  const [error, setError] = useState<string | null>(null)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false)
  const isSubmittingRef = useRef(false)
  const router = useRouter()

  const initialRatingValue = initialRating ?? 0
  const initialCommentValue = initialComment ?? ''
  const hasUnsavedChanges =
    rating !== initialRatingValue || comment.trim() !== initialCommentValue.trim()

  // Réinitialiser "Enregistré" dès qu'une nouvelle modification est détectée (comportement profil)
  useEffect(() => {
    if (hasUnsavedChanges && showSavedFeedback) {
      setShowSavedFeedback(false)
    }
  }, [hasUnsavedChanges, showSavedFeedback])

  // beforeunload : avertir si modifications non enregistrées
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmittingRef.current && hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Intercepter les clics sur les liens (même modale que Mes informations)
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (isSubmittingRef.current) return
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (!link) return
      const href = link.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return
      if (hasUnsavedChanges) {
        e.preventDefault()
        setPendingNavigation(href)
        setUnsavedChangesModalOpen(true)
      }
    }
    document.addEventListener('click', handleLinkClick, true)
    return () => document.removeEventListener('click', handleLinkClick, true)
  }, [hasUnsavedChanges])

  // Retour navigateur
  useEffect(() => {
    const handlePopState = () => {
      if (hasUnsavedChanges && !isSubmittingRef.current) {
        const confirmed = window.confirm(
          'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?'
        )
        if (!confirmed) {
          window.history.pushState(null, '', window.location.href)
        }
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [hasUnsavedChanges])

  // Échap pour fermer la modale
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && unsavedChangesModalOpen && !isSavingBeforeLeave) {
        setUnsavedChangesModalOpen(false)
        setPendingNavigation(null)
      }
    }
    if (unsavedChangesModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [unsavedChangesModalOpen, isSavingBeforeLeave])

  const handleSaveAndLeave = async () => {
    if (rating < 1 || rating > 5) return
    setIsSavingBeforeLeave(true)
    const result = await upsertCoachRating(coachId, rating, comment)
    setIsSavingBeforeLeave(false)
    if (!result.error) {
      setUnsavedChangesModalOpen(false)
      if (pendingNavigation) router.push(pendingNavigation)
      setPendingNavigation(null)
      router.refresh()
    }
  }

  const handleLeaveWithoutSaving = () => {
    setUnsavedChangesModalOpen(false)
    if (pendingNavigation) router.push(pendingNavigation)
    setPendingNavigation(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1 || rating > 5) {
      setError('Veuillez sélectionner une note entre 1 et 5.')
      return
    }
    setError(null)
    isSubmittingRef.current = true
    startTransition(async () => {
      const result = await upsertCoachRating(coachId, rating, comment)
      isSubmittingRef.current = false
      if (result.error) {
        setError(result.error)
        return
      }
      setShowSavedFeedback(true)
      router.refresh()
      setTimeout(() => setShowSavedFeedback(false), 2500)
    })
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">Votre note</p>
        <div className="flex gap-1" role="group" aria-label="Note sur 5">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-palette-olive focus:ring-offset-1 transition-transform hover:scale-110"
              aria-label={`${value} sur 5`}
              aria-pressed={rating === value}
            >
              <span
                className={`text-2xl ${
                  value <= rating ? 'text-amber-400' : 'text-stone-200'
                }`}
                aria-hidden
              >
                ★
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-500 mt-1">{rating > 0 ? `${rating} / 5` : 'Cliquez pour choisir'}</p>
      </div>

      <div>
        <label htmlFor="rating-comment" className="block text-sm font-medium text-stone-700 mb-2">
          Commentaire (facultatif)
        </label>
        <textarea
          id="rating-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Votre avis sur l'accompagnement..."
          className="w-full px-4 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent resize-y transition"
        />
      </div>

      <div className="flex flex-col items-start gap-2">
        <PrimaryButton
          type="submit"
          disabled={!hasUnsavedChanges || isPending || rating < 1}
          className={error ? '!bg-red-600 hover:!bg-red-700 focus:!ring-red-500' : ''}
        >
          {showSavedFeedback ? (
            <>
              <span>Enregistré</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5 animate-saved-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </>
          ) : error ? (
            <>
              <span>Non enregistré</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
              </svg>
            </>
          ) : isPending ? (
            'Enregistrement...'
          ) : (
            'Enregistrer'
          )}
        </PrimaryButton>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>

    {unsavedChangesModalOpen && (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="coach-rating-unsaved-title"
      >
        <div
          className="absolute inset-0 bg-palette-forest-dark/50 backdrop-blur-sm z-[90]"
          onClick={() => !isSavingBeforeLeave && (setUnsavedChangesModalOpen(false), setPendingNavigation(null))}
          aria-hidden="true"
        />
        <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-stone-100">
          <div className="sticky top-0 flex justify-end p-3 bg-white rounded-t-xl z-10">
            <button
              type="button"
              onClick={() => !isSavingBeforeLeave && (setUnsavedChangesModalOpen(false), setPendingNavigation(null))}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
              aria-label="Fermer"
              disabled={isSavingBeforeLeave}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <div className="px-8 pb-8">
            <h2 id="coach-rating-unsaved-title" className="text-xl font-semibold text-stone-900 mb-2">
              Modifications non enregistrées
            </h2>
            <p className="text-sm text-stone-600 mb-8">
              Vous avez des modifications non enregistrées. Que souhaitez-vous faire ?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLeaveWithoutSaving}
                disabled={isSavingBeforeLeave}
                className="flex-1 py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
              >
                Quitter sans enregistrer
              </button>
              <PrimaryButton
                type="button"
                onClick={handleSaveAndLeave}
                disabled={isSavingBeforeLeave || rating < 1}
                className="flex-1"
              >
                {isSavingBeforeLeave ? 'Enregistrement...' : 'Enregistrer et quitter'}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

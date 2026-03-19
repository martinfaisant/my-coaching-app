'use client'

import { useState, useTransition, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Textarea } from '@/components/Textarea'
import { upsertCoachRating } from './actions'

type CoachRatingFormProps = {
  coachId: string
  initialRating: number | null
  initialComment: string
}

export function CoachRatingForm({ coachId, initialRating, initialComment }: CoachRatingFormProps) {
  const t = useTranslations('myCoach.rating')
  const locale = useLocale()
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
  const initialSignature = `${coachId}|${initialRatingValue}|${initialCommentValue.trim()}`
  // Valeurs de référence après un save réussi (comme ProfileForm)
  const [savedState, setSavedState] = useState<{
    signature: string
    values: { rating: number; comment: string }
  } | null>(null)
  const refForComparison =
    savedState?.signature === initialSignature
      ? savedState.values
      : { rating: initialRatingValue, comment: initialCommentValue }
  const hasUnsavedChanges =
    rating !== refForComparison.rating || comment.trim() !== refForComparison.comment.trim()

  const clearFeedbackOnInput = () => {
    if (showSavedFeedback) setShowSavedFeedback(false)
    if (error) setError(null)
  }

  const handleRatingChange = (value: number) => {
    clearFeedbackOnInput()
    setRating(value)
  }

  const handleCommentChange = (value: string) => {
    clearFeedbackOnInput()
    setComment(value)
  }

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
          t('unsavedChangesAlert')
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
    const result = await upsertCoachRating(coachId, rating, comment, locale)
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
      setError(t('validationError'))
      return
    }
    setError(null)
    isSubmittingRef.current = true
    startTransition(async () => {
      const result = await upsertCoachRating(coachId, rating, comment, locale)
      isSubmittingRef.current = false
      if (result.error) {
        setError(result.error)
        return
      }
      // Comme ProfileForm : mettre à jour les refs pour que hasUnsavedChanges passe à false
      // (sinon le useEffect "clear on hasUnsavedChanges" efface immédiatement le feedback)
      setSavedState({
        signature: initialSignature,
        values: { rating, comment },
      })
      setShowSavedFeedback(true)
      setTimeout(() => {
        setShowSavedFeedback(false)
        router.refresh()
      }, 2500)
    })
  }

  return (
    <>
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* En-tête : titre à gauche, bouton à droite */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-base font-semibold text-stone-900">{t('title')}</h2>
        <Button
          type="submit"
          variant="primary"
          disabled={!hasUnsavedChanges || isPending || rating < 1}
          loading={isPending}
          loadingText={t('saving')}
          success={showSavedFeedback}
          error={!!error}
        >
          {t('save')}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-palette-danger-dark -mt-2 mb-2" role="alert">
          {error}
        </p>
      )}
      <div>
        <p className="text-sm font-medium text-stone-700 mb-2">{t('yourRating')}</p>
        <div className="flex gap-1" role="group" aria-label={t('ratingLabel')}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => handleRatingChange(value)}
              className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-palette-olive focus:ring-offset-1 transition-transform hover:scale-110"
              aria-label={t('starLabel', { value })}
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
        <p className="text-xs text-stone-500 mt-1">{rating > 0 ? t('ratingDisplay', { rating }) : t('clickToChoose')}</p>
      </div>

      <Textarea
        id="rating-comment"
        label={t('commentLabel')}
        value={comment}
        onChange={(e) => handleCommentChange(e.target.value)}
        rows={3}
        placeholder={t('commentPlaceholder')}
      />
    </form>

    <Modal
      isOpen={unsavedChangesModalOpen}
      onClose={() => !isSavingBeforeLeave && (setUnsavedChangesModalOpen(false), setPendingNavigation(null))}
      title={t('unsavedChangesModal.title')}
      size="md"
      titleId="coach-rating-unsaved-title"
      disableOverlayClose={isSavingBeforeLeave}
      disableEscapeClose={isSavingBeforeLeave}
      footer={
        <div className="flex gap-3 w-full">
          <Button
            type="button"
            variant="muted"
            onClick={handleLeaveWithoutSaving}
            disabled={isSavingBeforeLeave}
            className="flex-1"
          >
            {t('unsavedChangesModal.leaveWithoutSaving')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveAndLeave}
            disabled={isSavingBeforeLeave || rating < 1}
            loading={isSavingBeforeLeave}
            loadingText={t('saving')}
            className="flex-1"
          >
            {t('unsavedChangesModal.saveAndLeave')}
          </Button>
        </div>
      }
    >
      <div className="px-6 py-4">
        <p className="text-sm text-stone-600">
          {t('unsavedChangesModal.message')}
        </p>
      </div>
    </Modal>
    </>
  )
}

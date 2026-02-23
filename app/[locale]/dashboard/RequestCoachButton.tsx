'use client'

import { useState, useTransition, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Textarea } from '@/components/Textarea'
import { createCoachRequest, cancelCoachRequest } from './actions'
import { SportTileSelectable } from '@/components/SportTileSelectable'
import { usePracticedSportsOptions } from '@/lib/hooks/useSportsOptions'
import { AthleteSentRequestDetailModal } from './AthleteSentRequestDetailModal'

type RequestCoachButtonProps = {
  coachId: string
  coachName: string
  requestStatus: 'pending' | 'declined' | null
  /** Id de la demande (quand status === 'pending') pour permettre l'annulation */
  requestId?: string | null
  /** Sports déjà renseignés dans le profil (préremplissent le formulaire à l'ouverture) */
  initialPracticedSports?: string[]
}

export function RequestCoachButton({ coachId, coachName, requestStatus, requestId, initialPracticedSports = [] }: RequestCoachButtonProps) {
  const t = useTranslations('requestCoachButton')
  const tCommon = useTranslations('common')
  const tErrors = useTranslations('errors')
  const locale = useLocale()
  const practicedSportsOptions = usePracticedSportsOptions()
  const [open, setOpen] = useState(false)
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
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
      try {
        const result = await createCoachRequest(coachId, sports, need.trim())
        if (result.error) {
          setError(result.error)
          return
        }
        setOpen(false)
        setSports([])
        setNeed('')
        router.refresh()
      } catch {
        setError(tErrors('somethingWentWrong'))
      }
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
      <>
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="danger"
            onClick={() => { setError(null); setConfirmCancelOpen(true) }}
            disabled={isPending}
            className="flex-1"
          >
            {t('cancelRequest')}
          </Button>
          {requestId && (
            <Button
              type="button"
              variant="muted"
              onClick={() => setDetailModalOpen(true)}
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-1 shrink-0"
            >
              {t('requestSent')}
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          )}
        </div>
        {requestId && (
          <AthleteSentRequestDetailModal
            isOpen={detailModalOpen}
            onClose={() => setDetailModalOpen(false)}
            requestId={requestId}
            coachName={coachName}
            locale={locale}
            onRequestCancel={() => {
              setDetailModalOpen(false)
              setConfirmCancelOpen(true)
            }}
          />
        )}
        {confirmCancelOpen &&
              typeof document !== 'undefined' &&
              createPortal(
                <>
                  <div
                    className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]"
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
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => { if (!isPending) { setError(null); setConfirmCancelOpen(false) } }}
                          disabled={isPending}
                          aria-label={t('closeAria')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                          </svg>
                        </Button>
                      </div>
                      <div className="px-8 pb-8">
                        <h2 id="confirm-cancel-title" className="text-xl font-semibold text-stone-900 text-center mb-2">
                          {t('cancelRequestConfirmTitle')}
                        </h2>
                        <p className="text-sm text-stone-600 text-center mb-8">
                          {t('cancelRequestConfirmMessage')}
                        </p>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="muted"
                            onClick={() => { setError(null); setConfirmCancelOpen(false) }}
                            disabled={isPending}
                            className="flex-1"
                          >
                            {t('back')}
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            onClick={handleConfirmCancel}
                            disabled={isPending}
                            loading={isPending}
                            loadingText={t('cancelling')}
                            className="flex-1"
                          >
                            {t('confirmCancel')}
                          </Button>
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
    )
  }

  return (
    <>
      <Button
        type="button"
        variant="primary"
        onClick={() => setOpen(true)}
        disabled={isPending}
      >
        {t('chooseCoach')}
      </Button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]"
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
                <Button
                  type="button"
                  variant="ghost"
                  onClick={closeModal}
                  aria-label={t('closeAria')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
              <div className="px-8 pb-8">
                <h2 id="request-coach-title" className="text-2xl font-semibold text-stone-900 text-center mb-2">
                  {t('requestTitle')}
                </h2>
                <p className="text-sm text-stone-600 text-center mb-8">
                  {t('requestIntro')}
                </p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <p className="block text-sm font-medium text-stone-700 mb-3">{t('practicedSports')}</p>
                    <div className="flex flex-wrap gap-3" role="group" aria-label={t('practicedSports')}>
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
                  <Textarea
                    id="need"
                    label={t('coachingNeed')}
                    value={need}
                    onChange={(e) => setNeed(e.target.value)}
                    required
                    rows={4}
                  />
                  {error && (
                    <p className="text-sm text-red-600" role="alert">{error}</p>
                  )}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="muted"
                      onClick={closeModal}
                      disabled={isPending}
                      className="flex-1"
                    >
                      {tCommon('cancel')}
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={isPending || sports.length === 0}
                      loading={isPending}
                      loadingText={t('sending')}
                      className="flex-1"
                    >
                      {t('sendRequest')}
                    </Button>
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

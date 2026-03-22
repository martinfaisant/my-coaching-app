'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Modal } from '@/components/Modal'
import { getCoachPublicReviews, type CoachPublicReview } from '@/app/[locale]/dashboard/find-coach/reviewsActions'
import { formatShortDate } from '@/lib/dateUtils'

type CoachReviewsModalProps = {
  isOpen: boolean
  onClose: () => void
  coachId: string
  coachDisplayName: string
  /** Au-dessus d’une autre modale (ex. détail coach) */
  layer?: number
}

export function CoachReviewsModal({
  isOpen,
  onClose,
  coachId,
  coachDisplayName,
  layer = 0,
}: CoachReviewsModalProps) {
  const t = useTranslations('findCoach.reviewsModal')
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const [reviews, setReviews] = useState<CoachPublicReview[] | null>(null)
  const [loadError, setLoadError] = useState(false)

  const handleClose = useCallback(() => {
    setReviews(null)
    setLoadError(false)
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      setLoadError(false)
      setReviews(null)
      void (async () => {
        const result = await getCoachPublicReviews(coachId)
        if (cancelled) return
        if (result.ok) {
          setReviews(result.reviews)
        } else {
          setLoadError(true)
          setReviews([])
        }
      })()
    })
    return () => {
      cancelled = true
    }
  }, [isOpen, coachId])

  const loading = isOpen && reviews === null && !loadError

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      layer={layer}
      size="lg"
      title={t('title', { name: coachDisplayName })}
    >
      <div className="px-1 pb-2">
        {loading && (
          <p className="text-sm text-stone-500 py-4 text-center" role="status">
            {t('loading')}
          </p>
        )}
        {loadError && !loading && (
          <p className="text-sm text-palette-danger py-4 text-center" role="alert">
            {t('error')}
          </p>
        )}
        {!loading && !loadError && reviews && reviews.length === 0 && (
          <p className="text-sm text-stone-500 py-4 text-center">{t('empty')}</p>
        )}
        {!loading && !loadError && reviews && reviews.length > 0 && (
          <ul className="space-y-4 max-h-[min(60vh,28rem)] overflow-y-auto pr-1">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-xl border border-stone-100 bg-stone-50/80 p-4"
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-0.5 text-amber-500" aria-hidden>
                    {Array.from({ length: 5 }, (_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        className={`w-4 h-4 ${i < r.rating ? 'fill-current' : 'fill-stone-200 text-stone-200'}`}
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <time
                    className="text-xs text-stone-400 shrink-0"
                    dateTime={r.created_at}
                  >
                    {formatShortDate(r.created_at, localeTag)}
                  </time>
                </div>
                {(r.comment ?? '').trim() ? (
                  <p className="text-sm text-stone-700 whitespace-pre-wrap">{r.comment}</p>
                ) : (
                  <p className="text-sm text-stone-400 italic">{t('noComment')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  )
}

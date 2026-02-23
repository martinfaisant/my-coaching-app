'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { IconHourglass } from '@/components/icons/IconHourglass'
import { IconClose } from '@/components/icons/IconClose'
import { getCoachRequestDetail, type CoachRequestDetail } from './actions'
import { getFrozenTitleForLocale, getFrozenDescriptionForLocale } from '@/lib/frozenOfferI18n'
import { formatDateFr } from '@/lib/dateUtils'
import type { SportType } from '@/lib/sportStyles'

type AthleteSentRequestDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  requestId: string
  coachName: string
  locale: string
  /** Appelé quand l'utilisateur clique sur « Annuler la demande » (ouvrir la confirmation d'annulation). */
  onRequestCancel: () => void
}

const KNOWN_SPORT_TYPES: SportType[] = [
  'course',
  'course_route',
  'velo',
  'natation',
  'musculation',
  'nordic_ski',
  'backcountry_ski',
  'ice_skating',
  'trail',
  'randonnee',
  'triathlon',
]

function parseSports(sportPracticed: string): string[] {
  return sportPracticed
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

export function AthleteSentRequestDetailModal({
  isOpen,
  onClose,
  requestId,
  coachName,
  locale,
  onRequestCancel,
}: AthleteSentRequestDetailModalProps) {
  const t = useTranslations('athleteSentRequest')
  const tCommon = useTranslations('common')
  const [detail, setDetail] = useState<CoachRequestDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!isOpen || !requestId) return
    setLoading(true)
    setNotFound(false)
    setDetail(null)
    getCoachRequestDetail(requestId).then((result) => {
      setLoading(false)
      if ('notFound' in result && result.notFound) {
        setNotFound(true)
        return
      }
      if ('error' in result && result.error) {
        setNotFound(true)
        return
      }
      setDetail(result as CoachRequestDetail)
    })
  }, [isOpen, requestId])

  useEffect(() => {
    if (!isOpen) return
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const localeForDate = locale === 'fr' ? 'fr-FR' : 'en-US'
  const dateLabel =
    detail?.created_at != null
      ? formatDateFr(detail.created_at, false, localeForDate)
      : ''

  const modalContent = (
    <>
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-detail-title"
      >
        <div className="relative w-full max-w-lg max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-xl border border-stone-200 flex flex-col">
          {/* Header : titre, envoyée à + date, statut En attente (sablier) */}
          <div className="shrink-0 px-6 pt-5 pb-4 border-b border-stone-100">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id="request-detail-title" className="text-xl font-bold text-stone-900">
                  {t('title')}
                </h2>
                {!loading && !notFound && detail && (
                  <p className="text-sm text-stone-600 mt-0.5">
                    {t('sentTo', { name: coachName })} · {dateLabel}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {!loading && !notFound && detail && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-palette-amber/15 text-palette-amber border border-palette-amber/30">
                    <IconHourglass className="w-3.5 h-3.5 shrink-0" />
                    {t('pending')}
                  </span>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="rounded-lg min-h-9 min-w-9 p-0 text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                  aria-label={tCommon('close')}
                >
                  <IconClose className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Corps scrollable */}
          <div className="overflow-y-auto flex-1 px-6 py-6 space-y-6">
            {loading && (
              <div className="space-y-6 animate-pulse" aria-busy="true" aria-label={t('loading')}>
                <div className="h-4 w-48 bg-stone-200 rounded" />
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <div className="h-3 w-24 bg-stone-200 rounded" />
                  <div className="h-4 w-full bg-stone-200 rounded" />
                  <div className="h-3 w-full bg-stone-200 rounded" />
                  <div className="h-3 w-3/4 bg-stone-200 rounded" />
                  <div className="flex justify-end">
                    <div className="h-6 w-14 bg-stone-200 rounded" />
                  </div>
                </div>
                <div>
                  <div className="h-3 w-28 bg-stone-200 rounded mb-2" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 w-16 bg-stone-200 rounded-full" />
                    <div className="h-6 w-14 bg-stone-200 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="h-3 w-24 bg-stone-200 rounded mb-2" />
                  <div className="h-20 w-full bg-stone-200 rounded-lg" />
                </div>
              </div>
            )}
            {notFound && !loading && (
              <p className="text-sm text-stone-600" role="alert">{t('requestNotFound')}</p>
            )}
            {detail && !loading && (
              <>
                {/* Offre choisie – carte mise en avant */}
                <div className="rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white overflow-hidden shadow-sm">
                  <div className="border-l-4 border-palette-forest-dark p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-palette-forest-dark/80 mb-1">
                          {t('offerChosen')}
                        </p>
                        <p className="font-semibold text-stone-900 text-base">
                          {getFrozenTitleForLocale(detail, locale) || '—'}
                        </p>
                        <p className="text-sm text-stone-600 mt-1.5 leading-relaxed">
                          {getFrozenDescriptionForLocale(detail, locale) || ''}
                        </p>
                      </div>
                      <div className="shrink-0 rounded-lg bg-palette-forest-dark/10 px-3 py-1.5 text-center">
                        {detail.frozen_price_type === 'free' || (detail.frozen_price != null && detail.frozen_price === 0) ? (
                          <span className="text-sm font-bold text-palette-forest-dark">{t('free')}</span>
                        ) : (
                          <span className="text-sm font-bold text-palette-forest-dark whitespace-nowrap">
                            {detail.frozen_price ?? 0}€
                            <span className="text-stone-500 font-normal"> / {detail.frozen_price_type === 'monthly' ? t('perMonth') : t('plan')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sports pratiqués */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-1.5">
                    {t('sportsPracticed')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {parseSports(detail.sport_practiced).map((sportValue) => {
                      const normalized = sportValue as SportType
                      if (KNOWN_SPORT_TYPES.includes(normalized)) {
                        return <Badge key={sportValue} sport={normalized} />
                      }
                      return (
                        <Badge key={sportValue} variant="default">
                          {sportValue}
                        </Badge>
                      )
                    })}
                  </div>
                </div>

                {/* Votre message – champ texte classique */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                    {t('yourMessage')}
                  </p>
                  <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700 leading-relaxed">
                    {detail.coaching_need || '—'}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer : Annuler (gauche), Fermer (droite), même taille */}
          <div className="shrink-0 p-4 border-t border-stone-200 bg-stone-50/80 flex gap-3">
            {loading || notFound ? (
              <Button variant="muted" onClick={onClose} className="flex-1">
                {t('close')}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="danger"
                  onClick={onRequestCancel}
                  className="flex-1"
                >
                  {t('cancelRequest')}
                </Button>
                <Button variant="muted" onClick={onClose} className="flex-1">
                  {t('close')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}

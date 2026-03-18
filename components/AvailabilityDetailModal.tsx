'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import type { AthleteAvailabilitySlot } from '@/types/database'
import { deleteAvailability } from '@/app/[locale]/dashboard/availability/actions'
import { formatDateFr } from '@/lib/dateUtils'

function formatTimeDisplay(timeStr: string): string {
  const [h, m] = timeStr.split(':').map(Number)
  if (m === 0) return `${String(h).padStart(2, '0')}h`
  return `${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}`
}

export type AvailabilityDetailModalProps = {
  isOpen: boolean
  onClose: () => void
  slot: AthleteAvailabilitySlot
  dateStr: string
  /** Athlète = true (Modifier / Supprimer). Coach = false (lecture seule). */
  canEdit: boolean
  athleteId: string
  pathToRevalidate: string
  onEdit: (slot: AthleteAvailabilitySlot) => void
  onDeleted: () => void
}

export function AvailabilityDetailModal({
  isOpen,
  onClose,
  slot,
  dateStr,
  canEdit,
  athleteId,
  pathToRevalidate,
  onEdit,
  onDeleted,
}: AvailabilityDetailModalProps) {
  const t = useTranslations('availability')
  const tCommon = useTranslations('common')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  const isAvailable = slot.type === 'available'
  const label = isAvailable ? t('available') : t('unavailable')
  const hasTime = slot.start_time != null && slot.end_time != null
  const timeRange = hasTime && slot.start_time && slot.end_time
    ? `${formatTimeDisplay(slot.start_time)} – ${formatTimeDisplay(slot.end_time)}`
    : null
  const note = slot.note?.trim() || null
  const dateLabel = formatDateFr(dateStr, true)

  const handleDelete = async () => {
    setDeleteError(null)
    setDeleting(true)
    try {
      const result = await deleteAvailability(athleteId, pathToRevalidate, slot.id)
      if (result.error) {
        setDeleteError(result.error)
        setDeleting(false)
        return
      }
      setShowConfirmDelete(false)
      onDeleted()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  const calendarIcon = (
    <span
      className={`inline-flex items-center justify-center w-9 h-9 rounded-xl shrink-0 ${
        isAvailable ? 'text-palette-forest-dark bg-palette-forest-dark/10' : 'text-orange-600 bg-orange-100'
      }`}
      aria-hidden
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    </span>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={canEdit ? 'md' : 'sm'}
      title={canEdit ? dateLabel : label}
      icon={canEdit ? undefined : calendarIcon}
      iconRaw={!canEdit}
      titleId="availability-detail-modal-title"
      footer={
        canEdit ? (
          <div className="flex gap-2 justify-end w-full flex-wrap items-center">
            {showConfirmDelete ? (
              <>
                <span className="text-sm text-stone-600 mr-2">{t('confirmDelete')}</span>
                <Button variant="muted" onClick={() => setShowConfirmDelete(false)} disabled={deleting}>
                  {tCommon('cancel')}
                </Button>
                <Button variant="danger" onClick={handleDelete} loading={deleting} disabled={deleting}>
                  {t('deleteConfirm')}
                </Button>
              </>
            ) : (
              <>
                <Button variant="muted" onClick={onClose}>
                  {tCommon('close')}
                </Button>
                <Button variant="primaryDark" onClick={() => { onClose(); onEdit(slot) }}>
                  {t('modify')}
                </Button>
                <Button variant="danger" onClick={() => setShowConfirmDelete(true)} disabled={deleting}>
                  {t('delete')}
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="w-full flex justify-end">
            <Button variant="primaryDark" onClick={onClose}>
              {tCommon('close')}
            </Button>
          </div>
        )
      }
    >
      {canEdit ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {calendarIcon}
            <span className={`font-semibold ${isAvailable ? 'text-palette-forest-dark' : 'text-orange-700'}`}>
              {label}
            </span>
          </div>
          {timeRange && (
            <div className="text-sm text-stone-600">
              <span className="font-medium text-stone-500">{t('start')} – {t('end')}: </span>
              {timeRange}
            </div>
          )}
          {!timeRange && (
            <div className="text-sm text-stone-500 italic">{t('fullDay')}</div>
          )}
          {note && (
            <div>
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1">{t('note')}</div>
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{note}</p>
            </div>
          )}
          {deleteError && (
            <p className="text-sm text-palette-danger">{deleteError}</p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-stone-50 rounded-xl border border-stone-100 p-4 space-y-3">
            <div>
              <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-0.5">{t('date')}</div>
              <p className="text-sm font-medium text-stone-800">{dateLabel}</p>
            </div>
            {timeRange ? (
              <div>
                <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-0.5">
                  {t('start')} – {t('end')}
                </div>
                <p className="text-sm text-stone-700">{timeRange}</p>
              </div>
            ) : (
              <div>
                <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-0.5">{t('fullDay')}</div>
                <p className="text-sm text-stone-600">{t('fullDay')}</p>
              </div>
            )}
            {note ? (
              <div>
                <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-0.5">{t('note')}</div>
                <p className="text-sm text-stone-700 whitespace-pre-wrap">{note}</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Modal>
  )
}

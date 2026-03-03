'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useFormStatus } from 'react-dom'
import { useActionState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { saveAvailability, deleteAvailability } from '@/app/[locale]/dashboard/availability/actions'
import type { AthleteAvailabilitySlot } from '@/types/database'
import { Modal } from '@/components/Modal'
import { Segments } from '@/components/Segments'
import { DatePickerPopup } from '@/components/DatePickerPopup'
import { Button } from '@/components/Button'
import { Textarea } from '@/components/Textarea'
import { Dropdown } from '@/components/Dropdown'
import { formatDateFr, toDateStr } from '@/lib/dateUtils'

/** Options horaires par pas de 15 min (00:00 à 23:45). */
function getTimeOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [{ value: '', label: '—' }]
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      options.push({
        value: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
      })
    }
  }
  return options
}

const TIME_OPTIONS = getTimeOptions()

type AvailabilityModalProps = {
  isOpen: boolean
  onClose: (closedBySuccess?: boolean) => void
  date: string
  athleteId: string
  pathToRevalidate: string
  /** En mode édition : pré-remplit le formulaire et enregistre via update (pas de récurrence). */
  editSlot?: AthleteAvailabilitySlot | null
}

function SubmitButton({ disabled, isSubmitting, showSuccess }: { disabled?: boolean; isSubmitting?: boolean; showSuccess?: boolean }) {
  const { pending } = useFormStatus()
  const t = useTranslations('common')
  return (
    <Button
      type="submit"
      form="availability-form"
      variant="primaryDark"
      disabled={disabled || pending || isSubmitting}
      loading={pending || isSubmitting}
      loadingText={t('saving')}
      success={showSuccess}
      successText={t('saved')}
      className="flex-1 min-w-0"
    >
      {t('save')}
    </Button>
  )
}

export function AvailabilityModal({
  isOpen,
  onClose,
  date,
  athleteId,
  pathToRevalidate,
  editSlot = null,
}: AvailabilityModalProps) {
  const locale = useLocale()
  const localeForPicker = locale === 'fr' ? 'fr-FR' : 'en-US'
  const t = useTranslations('availability')
  const tCommon = useTranslations('common')

  const [typeSegment, setTypeSegment] = useState<'available' | 'unavailable' | ''>('')
  const [editableDate, setEditableDate] = useState(date)
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [note, setNote] = useState('')

  const [showDatePickerPopup, setShowDatePickerPopup] = useState(false)
  const dateTriggerRef = useRef<HTMLDivElement>(null)
  const [datePickerAnchor, setDatePickerAnchor] = useState<DOMRect | null>(null)

  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const previousSubmittingRef = useRef(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const initialValuesRef = useRef({ typeSegment, editableDate, startTime, endTime, note })
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [state, action, isPending] = useActionState(
    async (prev: { error?: string; success?: boolean }, fd: FormData) =>
      saveAvailability(athleteId, pathToRevalidate, prev, fd),
    {} as { error?: string; success?: boolean }
  )

  const isEditMode = !!editSlot

  useEffect(() => {
    if (isOpen) {
      setDeleteError(null)
      if (editSlot) {
        setEditableDate(editSlot.date)
        setTypeSegment(editSlot.type)
        setStartTime(editSlot.start_time ?? '')
        setEndTime(editSlot.end_time ?? '')
        setNote(editSlot.note ?? '')
        initialValuesRef.current = {
          typeSegment: editSlot.type,
          editableDate: editSlot.date,
          startTime: editSlot.start_time ?? '',
          endTime: editSlot.end_time ?? '',
          note: editSlot.note ?? '',
        }
      } else {
        setEditableDate(date)
        setTypeSegment('')
        setStartTime('')
        setEndTime('')
        setNote('')
        initialValuesRef.current = {
          typeSegment: '',
          editableDate: date,
          startTime: '',
          endTime: '',
          note: '',
        }
      }
      setHasUnsavedChanges(false)
    }
  }, [isOpen, date, editSlot])

  useEffect(() => {
    if (previousSubmittingRef.current && !(isPending || state?.success)) {
      setShowSavedFeedback(true)
      const t = setTimeout(() => setShowSavedFeedback(false), 2500)
      return () => clearTimeout(t)
    }
    previousSubmittingRef.current = !!isPending || !!state?.success
  }, [isPending, state?.success])

  useEffect(() => {
    const current = { typeSegment, editableDate, startTime, endTime, note }
    const init = initialValuesRef.current
    const changed =
      current.typeSegment !== init.typeSegment ||
      current.editableDate !== init.editableDate ||
      current.startTime !== init.startTime ||
      current.endTime !== init.endTime ||
      current.note !== init.note
    setHasUnsavedChanges(changed)
  }, [typeSegment, editableDate, startTime, endTime, note])

  const openDatePicker = () => {
    dateTriggerRef.current?.getBoundingClientRect && setDatePickerAnchor(dateTriggerRef.current.getBoundingClientRect())
    setShowDatePickerPopup(true)
  }
  const closeDatePicker = () => {
    setShowDatePickerPopup(false)
    setDatePickerAnchor(null)
  }

  const handleClose = () => {
    if (state?.success) {
      onClose(true)
    } else {
      onClose(false)
    }
  }

  // Fermer la modale une seule fois quand le succès arrive. onClose exclu des deps volontairement
  // pour éviter une boucle : après router.refresh() le parent repasse une nouvelle ref → effet
  // se ré-exécutait et rappelait onClose(true) en boucle.
  useEffect(() => {
    if (state?.success) {
      const t = setTimeout(() => {
        onClose(true)
      }, 500)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.success])

  const dateBlock = (
    <div
      ref={dateTriggerRef}
      className="flex items-center gap-2 border border-stone-300 rounded-lg py-1.5 px-3 bg-white focus-within:ring-2 focus-within:ring-palette-forest-dark focus-within:border-transparent transition"
    >
      <span className="text-sm font-bold text-stone-900 min-w-[10rem]" aria-hidden>
        {formatDateFr(editableDate, true, localeForPicker)}
      </span>
      <button
        type="button"
        onClick={openDatePicker}
        className="shrink-0 p-1 rounded text-stone-400 hover:text-palette-forest-dark hover:bg-stone-100"
        title={t('until')}
        aria-label={t('until')}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
    </div>
  )

  const datePickerPopover =
    showDatePickerPopup && datePickerAnchor && typeof document !== 'undefined'
      ? createPortal(
          <>
            <div className="fixed inset-0 z-[105]" aria-hidden onClick={closeDatePicker} />
            <div
              className="fixed z-[110] shadow-xl"
              style={{ top: datePickerAnchor.bottom + 8, left: datePickerAnchor.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <DatePickerPopup
                value={editableDate}
                onChange={(dateStr) => {
                  setEditableDate(dateStr)
                  closeDatePicker()
                }}
                locale={localeForPicker}
                minDate={toDateStr(new Date())}
                monthDropdownId="availability-date-picker-month"
              />
            </div>
          </>,
          document.body
        )
      : null

  const handleDelete = async () => {
    if (!editSlot) return
    if (!confirm(t('confirmDelete'))) return
    setDeleteError(null)
    setDeleteLoading(true)
    const result = await deleteAvailability(athleteId, pathToRevalidate, editSlot.id)
    setDeleteLoading(false)
    if (result.error) {
      setDeleteError(result.error)
      return
    }
    onClose(true)
  }

  return (
    <>
      {datePickerPopover}
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        size="workout"
        title={undefined}
        icon={dateBlock}
        iconRaw
        titleId="availability-modal-title"
        contentClassName="px-6 py-4"
        footer={
          <div className="w-full">
            {(state?.error || deleteError) && (
              <p className="text-sm text-palette-danger mb-3" role="alert">
                {state?.error ?? deleteError}
              </p>
            )}
            <div className="flex gap-3 items-center">
              {!isEditMode && (
                <Button type="button" variant="muted" onClick={() => onClose(false)} className="flex-1 min-w-0">
                  {tCommon('cancel')}
                </Button>
              )}
              {isEditMode && editSlot && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  loading={deleteLoading}
                  loadingText={tCommon('deleting')}
                  className="flex-1 min-w-0 flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  {t('delete')}
                </Button>
              )}
              <SubmitButton disabled={!hasUnsavedChanges || typeSegment === ''} isSubmitting={isPending} showSuccess={showSavedFeedback} />
            </div>
          </div>
        }
      >
        <form id="availability-form" action={action} className="space-y-5">
          {isEditMode && editSlot && <input type="hidden" name="slot_id" value={editSlot.id} readOnly aria-hidden />}
          <input type="hidden" name="date" value={editableDate} readOnly aria-hidden />
          <input type="hidden" name="type" value={typeSegment} readOnly aria-hidden />
          <input type="hidden" name="start_time" value={startTime} readOnly aria-hidden />
          <input type="hidden" name="end_time" value={endTime} readOnly aria-hidden />
          <input type="hidden" name="note" value={note} readOnly aria-hidden />

          <div>
            <Segments
              name="availability-type"
              options={[
                { value: 'available', label: t('available') },
                { value: 'unavailable', label: t('unavailable') },
              ]}
              value={typeSegment}
              onChange={(v) => { setTypeSegment(v as 'available' | 'unavailable'); setHasUnsavedChanges(true) }}
              ariaLabel={t('type')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Dropdown
              id="availability-start"
              label={t('start')}
              options={TIME_OPTIONS}
              value={startTime}
              onChange={setStartTime}
              ariaLabel={t('start')}
            />
            <Dropdown
              id="availability-end"
              label={t('end')}
              options={TIME_OPTIONS}
              value={endTime}
              onChange={setEndTime}
              ariaLabel={t('end')}
            />
          </div>

          <div>
            <Textarea
              label={t('note')}
              placeholder={t('notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </form>
      </Modal>
    </>
  )
}

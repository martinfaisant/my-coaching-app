'use client'

import { useActionState, useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Modal } from '@/components/Modal'
import { DatePickerPopup } from '@/components/DatePickerPopup'
import { addGoal, type GoalFormState } from '@/app/[locale]/dashboard/objectifs/actions'
import { formatDateFr } from '@/lib/dateUtils'
import { FORM_INPUT_HEIGHT, FORM_INPUT_TEXT_SIZE } from '@/lib/formStyles'

type RequestGoalAddModalProps = {
  isOpen: boolean
  onClose: () => void
}

const today = () => new Date().toISOString().slice(0, 10)

export function RequestGoalAddModal({ isOpen, onClose }: RequestGoalAddModalProps) {
  const locale = useLocale()
  const router = useRouter()
  const tGoals = useTranslations('goals')
  const tFindCoach = useTranslations('findCoach')
  const tCommon = useTranslations('common')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [priority, setPriority] = useState<'primary' | 'secondary'>('primary')
  const [selectedDate, setSelectedDate] = useState('')
  const [showDatePickerPopup, setShowDatePickerPopup] = useState(false)
  const [datePickerAnchor, setDatePickerAnchor] = useState<DOMRect | null>(null)
  const dateTriggerRef = useRef<HTMLDivElement>(null)
  const datePickerPopupRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const actionWithUiSync = useCallback(async (prevState: GoalFormState, formData: FormData) => {
    const result = await addGoal(prevState, formData)
    setIsSubmitting(false)

    if (result?.success) {
      onClose()
      router.refresh()
    }

    return result
  }, [onClose, router])

  const [state, action] = useActionState<GoalFormState, FormData>(actionWithUiSync, {})


  const localeForPicker = locale === 'fr' ? 'fr-FR' : 'en-US'
  const isPast = selectedDate !== '' && selectedDate < today()

  const closeDatePicker = useCallback(() => {
    setShowDatePickerPopup(false)
    setDatePickerAnchor(null)
  }, [])

  const openDatePicker = useCallback(() => {
    const rect = dateTriggerRef.current?.getBoundingClientRect()
    if (rect) setDatePickerAnchor(rect)
    setShowDatePickerPopup(true)
  }, [])

  useEffect(() => {
    if (!showDatePickerPopup) return

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      const inPopup = datePickerPopupRef.current?.contains(target)
      const inTrigger = dateTriggerRef.current?.contains(target)
      if (!inPopup && !inTrigger) closeDatePicker()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDatePicker()
    }

    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    window.addEventListener('resize', closeDatePicker)

    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('resize', closeDatePicker)
    }
  }, [showDatePickerPopup, closeDatePicker])

  if (!isOpen) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      layer={1}
      size="lg"
      title={tFindCoach('requestGoals.addButtonLong')}
      titleWrap
      footer={
        <div className="flex gap-3 w-full">
          <Button type="button" variant="muted" onClick={onClose} className="flex-1">
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form="request-goal-add-form"
            variant="primaryDark"
            className="flex-1"
            disabled={isSubmitting}
            loading={isSubmitting}
            loadingText={tCommon('saving')}
          >
            {tFindCoach('requestGoals.addButton')}
          </Button>
        </div>
      }
    >
      <form
        ref={formRef}
        id="request-goal-add-form"
        action={action}
        onSubmit={() => setIsSubmitting(true)}
        className="px-6 py-4 space-y-5"
      >
        <input type="hidden" name="locale" value={locale} />

        <Input
          id="request-goal-race_name"
          name="race_name"
          type="text"
          required
          placeholder={tGoals('raceNamePlaceholder')}
          label={`${tGoals('raceName')} *`}
          labelClassName="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 ml-1"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="request-goal-date-trigger" className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 ml-1">
              {tGoals('date')} *
            </label>
            <input type="hidden" name="date" value={selectedDate} required readOnly aria-hidden />
            <div
              ref={dateTriggerRef}
              id="request-goal-date-trigger"
              role="button"
              tabIndex={0}
              onClick={openDatePicker}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDatePicker() } }}
              className={`flex items-center gap-2 w-full border border-stone-300 rounded-lg py-2.5 px-4 bg-white focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition text-left ${FORM_INPUT_TEXT_SIZE} ${FORM_INPUT_HEIGHT}`}
              aria-label={tGoals('date')}
            >
              <span className={`text-sm flex-1 ${selectedDate ? 'font-medium text-stone-900' : 'text-stone-400'}`}>
                {selectedDate ? formatDateFr(selectedDate, false, localeForPicker) : tGoals('date')}
              </span>
              <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div>
            <Input
              id="request-goal-distance"
              name="distance"
              type="number"
              required
              min={0}
              step="0.1"
              placeholder="42"
              label={`${tGoals('distance')} *`}
              labelClassName="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5 ml-1"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 ml-1">{tGoals('priority.label')}</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="is_primary"
                value="primary"
                checked={priority === 'primary'}
                onChange={() => setPriority('primary')}
                className="hidden peer"
              />
              <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-semibold transition-all ${
                priority === 'primary'
                  ? 'bg-white text-palette-amber border-palette-amber'
                  : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
              }`}>
                <span>{tGoals('priority.primary')}</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="is_primary"
                value="secondary"
                checked={priority === 'secondary'}
                onChange={() => setPriority('secondary')}
                className="hidden peer"
              />
              <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-semibold transition-all ${
                priority === 'secondary'
                  ? 'bg-white text-palette-sage border-palette-sage'
                  : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
              }`}>
                <span>{tGoals('priority.secondary')}</span>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">
            {tGoals('targetTimeOptional')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div className="relative">
              <Input
                id="request-goal-target_time_hours"
                name="target_time_hours"
                type="number"
                min={0}
                max={99}
                placeholder=""
                className="text-center pr-9"
                aria-label={tGoals('result.hours')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                {tGoals('result.unitHours')}
              </span>
            </div>
            <div className="relative">
              <Input
                id="request-goal-target_time_minutes"
                name="target_time_minutes"
                type="number"
                min={0}
                max={59}
                placeholder=""
                className="text-center pr-10"
                aria-label={tGoals('result.minutes')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                {tGoals('result.unitMinutes')}
              </span>
            </div>
            <div className="relative">
              <Input
                id="request-goal-target_time_seconds"
                name="target_time_seconds"
                type="number"
                min={0}
                max={59}
                placeholder=""
                className="text-center pr-8"
                aria-label={tGoals('result.seconds')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                {tGoals('result.unitSeconds')}
              </span>
            </div>
          </div>
        </div>

        {isPast && (
          <>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                {tGoals('result.time')} <span className="text-palette-danger">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <div className="relative">
                  <Input
                    name="result_time_hours"
                    type="number"
                    min={0}
                    max={99}
                    placeholder="0"
                    className="text-center pr-9"
                    aria-label={tGoals('result.hours')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                    {tGoals('result.unitHours')}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    name="result_time_minutes"
                    type="number"
                    min={0}
                    max={59}
                    placeholder="0"
                    className="text-center pr-10"
                    aria-label={tGoals('result.minutes')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                    {tGoals('result.unitMinutes')}
                  </span>
                </div>
                <div className="relative">
                  <Input
                    name="result_time_seconds"
                    type="number"
                    min={0}
                    max={59}
                    placeholder="0"
                    className="text-center pr-8"
                    aria-label={tGoals('result.seconds')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                    {tGoals('result.unitSeconds')}
                  </span>
                </div>
              </div>
            </div>
            <Input
              name="result_place"
              label={tGoals('result.placeOptional')}
              type="number"
              min={1}
              placeholder="42"
            />
            <Textarea
              name="result_note"
              label={tGoals('result.noteOptional')}
              placeholder={tGoals('result.notePlaceholder')}
              rows={3}
            />
          </>
        )}

        {state?.error && (
          <p className="text-sm text-palette-danger font-medium" role="alert">
            {state.error}
          </p>
        )}
      </form>

      {showDatePickerPopup && datePickerAnchor && typeof document !== 'undefined' &&
        createPortal(
          <>
            <div
              className="fixed z-[210] shadow-xl"
              ref={datePickerPopupRef}
              style={(() => {
                const POPUP_W = 320
                const POPUP_H = 360
                const M = 8
                const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
                const vh = typeof window !== 'undefined' ? window.innerHeight : 800
                const left = Math.max(M, Math.min(datePickerAnchor.left, vw - POPUP_W - M))
                const preferBottomTop = datePickerAnchor.bottom + M
                const fitsBelow = preferBottomTop + POPUP_H <= vh - M
                const top = fitsBelow
                  ? preferBottomTop
                  : Math.max(M, datePickerAnchor.top - M - POPUP_H)
                return { top, left, maxHeight: `calc(100vh - ${M * 2}px)` }
              })()}
            >
              <DatePickerPopup
                value={selectedDate || today()}
                onChange={(dateStr) => {
                  setSelectedDate(dateStr)
                  closeDatePicker()
                }}
                locale={localeForPicker}
                monthDropdownId="request-goal-date-picker-month"
              />
            </div>
          </>,
          document.body
        )}
    </Modal>
  )
}

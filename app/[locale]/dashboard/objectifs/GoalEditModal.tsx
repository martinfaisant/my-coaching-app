'use client'

import { useActionState, useRef, useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import type { Goal } from '@/types/database'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { DatePickerPopup } from '@/components/DatePickerPopup'
import { formatDateFr } from '@/lib/dateUtils'
import { FORM_INPUT_HEIGHT, FORM_INPUT_TEXT_SIZE } from '@/lib/formStyles'
import { updateGoal, type GoalFormState } from './actions'

type GoalEditModalProps = {
  goal: Goal
  isOpen: boolean
  onClose: () => void
}

export function GoalEditModal({ goal, isOpen, onClose }: GoalEditModalProps) {
  if (!isOpen) return null

  const modalKey = [
    goal.id,
    goal.race_name,
    goal.date,
    goal.distance,
    goal.is_primary ? '1' : '0',
    goal.target_time_hours ?? '',
    goal.target_time_minutes ?? '',
    goal.target_time_seconds ?? '',
  ].join('|')

  return <GoalEditModalInner key={modalKey} goal={goal} isOpen={isOpen} onClose={onClose} />
}

function GoalEditModalInner({ goal, isOpen, onClose }: GoalEditModalProps) {
  const locale = useLocale()
  const router = useRouter()
  const tGoals = useTranslations('goals')
  const tCommon = useTranslations('common')

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState(goal.date)
  const [showDatePickerPopup, setShowDatePickerPopup] = useState(false)
  const [datePickerAnchor, setDatePickerAnchor] = useState<DOMRect | null>(null)
  const previousIsSubmittingRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const dateTriggerRef = useRef<HTMLDivElement>(null)
  const datePickerPopupRef = useRef<HTMLDivElement>(null)
  const [priority, setPriority] = useState<'primary' | 'secondary'>(goal.is_primary ? 'primary' : 'secondary')

  const localeForPicker = locale === 'fr' ? 'fr-FR' : 'en-US'

  const initialValues = {
    race_name: goal.race_name,
    date: goal.date,
    distance: goal.distance,
    is_primary: goal.is_primary ? 'primary' : 'secondary' as const,
    target_time_hours: goal.target_time_hours != null ? String(goal.target_time_hours) : '',
    target_time_minutes: goal.target_time_minutes != null ? String(goal.target_time_minutes) : '',
    target_time_seconds: goal.target_time_seconds != null ? String(goal.target_time_seconds) : '',
  }
  const initialValuesRef = useRef(initialValues)
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const actionWithUiSync = useCallback(async (_prev: GoalFormState, formData: FormData) => {
    const result = await updateGoal(_prev, formData)

    isSubmittingRef.current = false
    setIsSubmitting(false)

    if (result?.success) {
      setShowSavedFeedback(true)
      onClose()
      router.refresh()
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
      successTimerRef.current = setTimeout(() => setShowSavedFeedback(false), 2500)
    } else if (result?.error) {
      setShowSavedFeedback(false)
    }

    return result
  }, [onClose, router])

  const [state, action] = useActionState<GoalFormState, FormData>(actionWithUiSync, {})

  const checkUnsavedChanges = useCallback((priorityOverride?: 'primary' | 'secondary') => {
    const form = formRef.current
    if (!form) return false
    const raceName = (form.querySelector('[name="race_name"]') as HTMLInputElement)?.value.trim() ?? ''
    const date = (form.querySelector('[name="date"]') as HTMLInputElement)?.value.trim() ?? ''
    const distance = (form.querySelector('[name="distance"]') as HTMLInputElement)?.value.trim() ?? ''
    const currentPriority = priorityOverride ?? priority
    const th = (form.querySelector('[name="target_time_hours"]') as HTMLInputElement)?.value ?? ''
    const tm = (form.querySelector('[name="target_time_minutes"]') as HTMLInputElement)?.value ?? ''
    const ts = (form.querySelector('[name="target_time_seconds"]') as HTMLInputElement)?.value ?? ''
    const initial = initialValuesRef.current
    if (raceName !== initial.race_name) return true
    if (date !== initial.date) return true
    if (distance !== initial.distance) return true
    if (currentPriority !== initial.is_primary) return true
    if (th !== initial.target_time_hours || tm !== initial.target_time_minutes || ts !== initial.target_time_seconds) return true
    return false
  }, [priority])

  useEffect(() => {
    const form = formRef.current
    if (!form || !isOpen) return
    const update = () => setHasUnsavedChanges(checkUnsavedChanges())
    const inputs = form.querySelectorAll('input')
    inputs.forEach((el) => {
      el.addEventListener('input', update)
      el.addEventListener('change', update)
    })
    return () => {
      inputs.forEach((el) => {
        el.removeEventListener('input', update)
        el.removeEventListener('change', update)
      })
    }
  }, [isOpen, checkUnsavedChanges])

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

  useEffect(() => {
    previousIsSubmittingRef.current = isSubmitting
  }, [isSubmitting])

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current)
    }
  }, [])

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={tGoals('editGoalTitle')}
      footer={
        <div className="flex gap-3 w-full">
          <Button type="button" variant="muted" onClick={onClose} className="flex-1">
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form="goal-edit-form"
            variant="primaryDark"
            className="flex-1"
            disabled={!hasUnsavedChanges || isSubmitting}
            loading={isSubmitting}
            loadingText={tCommon('saving')}
            success={showSavedFeedback}
            successText={tCommon('saved')}
            error={!!state?.error}
            errorText={tCommon('notSaved')}
          >
            {tCommon('save')}
          </Button>
        </div>
      }
    >
      <form
        ref={formRef}
        id="goal-edit-form"
        action={action}
        onSubmit={() => {
          isSubmittingRef.current = true
          setIsSubmitting(true)
        }}
        className="px-6 py-4 space-y-5"
      >
        <input type="hidden" name="goal_id" value={goal.id} />
        <input type="hidden" name="locale" value={locale} />

        <Input
          id="edit-race_name"
          label={tGoals('raceName')}
          name="race_name"
          type="text"
          required
          defaultValue={goal.race_name}
          placeholder={tGoals('raceNamePlaceholder')}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="edit-date-trigger" className="block text-sm font-medium text-stone-700 mb-2">
              {tGoals('date')} <span className="text-palette-danger">*</span>
            </label>
            <input type="hidden" name="date" value={date} required readOnly aria-hidden />
            <div
              ref={dateTriggerRef}
              id="edit-date-trigger"
              role="button"
              tabIndex={0}
              onClick={openDatePicker}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDatePicker() } }}
              className={`flex items-center gap-2 w-full border border-stone-300 rounded-lg py-2.5 px-4 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition text-left ${FORM_INPUT_TEXT_SIZE} ${FORM_INPUT_HEIGHT}`}
              aria-label={tGoals('date')}
            >
              <span className="text-sm flex-1">{formatDateFr(date, false, localeForPicker)}</span>
              <svg className="w-5 h-5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <Input
            id="edit-distance"
            label={tGoals('distance')}
            name="distance"
            type="number"
            required
            min={0}
            step="0.1"
            defaultValue={goal.distance}
            placeholder="42"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">{tGoals('priority.label')}</label>
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="is_primary"
                value="primary"
                checked={priority === 'primary'}
                onChange={() => { setPriority('primary'); setTimeout(() => setHasUnsavedChanges(checkUnsavedChanges('primary')), 0) }}
                className="hidden peer"
              />
              <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                priority === 'primary' ? 'bg-white text-palette-amber border-palette-amber' : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
              }`}>
                {tGoals('priority.primary')}
              </div>
            </label>
            <label className="cursor-pointer">
              <input
                type="radio"
                name="is_primary"
                value="secondary"
                checked={priority === 'secondary'}
                onChange={() => { setPriority('secondary'); setTimeout(() => setHasUnsavedChanges(checkUnsavedChanges('secondary')), 0) }}
                className="hidden peer"
              />
              <div className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                priority === 'secondary' ? 'bg-white text-palette-sage border-palette-sage' : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
              }`}>
                {tGoals('priority.secondary')}
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
                name="target_time_hours"
                type="number"
                min={0}
                max={99}
                placeholder=""
                defaultValue={initialValues.target_time_hours}
                className="text-center pr-9"
                aria-label={tGoals('result.hours')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                {tGoals('result.unitHours')}
              </span>
            </div>
            <div className="relative">
              <Input
                name="target_time_minutes"
                type="number"
                min={0}
                max={59}
                placeholder=""
                defaultValue={initialValues.target_time_minutes}
                className="text-center pr-10"
                aria-label={tGoals('result.minutes')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                {tGoals('result.unitMinutes')}
              </span>
            </div>
            <div className="relative">
              <Input
                name="target_time_seconds"
                type="number"
                min={0}
                max={59}
                placeholder=""
                defaultValue={initialValues.target_time_seconds}
                className="text-center pr-8"
                aria-label={tGoals('result.seconds')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                {tGoals('result.unitSeconds')}
              </span>
            </div>
          </div>
        </div>

        {state?.error && (
          <p className="text-sm text-palette-danger font-medium" role="alert">
            {state.error}
          </p>
        )}
      </form>

      {showDatePickerPopup && datePickerAnchor && typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed z-[210]"
            ref={datePickerPopupRef}
            style={(() => {
              const POPUP_W = 280
              const POPUP_H = 340
              const M = 8
              const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
              const vh = typeof window !== 'undefined' ? window.innerHeight : 800
              const left = Math.max(M, Math.min(datePickerAnchor.left, vw - POPUP_W - M))
              const preferBottom = datePickerAnchor.bottom + M
              const fitsBelow = preferBottom + POPUP_H <= vh - M
              const top = fitsBelow ? preferBottom : Math.max(M, datePickerAnchor.top - M - POPUP_H)
              return { top, left, maxHeight: `calc(100vh - ${M * 2}px)` }
            })()}
          >
            <DatePickerPopup
              value={date}
              onChange={(dateStr) => {
                setDate(dateStr)
                closeDatePicker()
              }}
              locale={localeForPicker}
              monthDropdownId="goal-edit-date-picker-month"
            />
          </div>,
          document.body
        )}
    </Modal>
  )
}

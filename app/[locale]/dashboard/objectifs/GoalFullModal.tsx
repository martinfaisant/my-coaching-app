'use client'

import { useActionState, useRef, useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { Goal } from '@/types/database'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Modal } from '@/components/Modal'
import { DatePickerPopup } from '@/components/DatePickerPopup'
import { formatDateFr } from '@/lib/dateUtils'
import { FORM_INPUT_HEIGHT, FORM_INPUT_TEXT_SIZE } from '@/lib/formStyles'
import { saveGoalFull, type GoalFormState } from './actions'

type GoalFullModalProps = {
  goal: Goal
  isOpen: boolean
  onClose: () => void
  /** Onglet initial souhaité : 'objective' ou 'result'. */
  initialTab: 'objective' | 'result'
  /** Niveau d'empilement pour usage dans d'autres modales (ex. demande coaching). */
  layer?: number
}

export function GoalFullModal({
  goal,
  isOpen,
  onClose,
  initialTab,
  layer = 0,
}: GoalFullModalProps) {
  const locale = useLocale()
  const router = useRouter()
  const tGoals = useTranslations('goals')
  const tCommon = useTranslations('common')

  const [state, action] = useActionState<GoalFormState, FormData>(saveGoalFull, {})

  const [activeTab, setActiveTab] = useState<'objective' | 'result'>(initialTab)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState(goal.date)
  const [showDatePickerPopup, setShowDatePickerPopup] = useState(false)
  const [datePickerAnchor, setDatePickerAnchor] = useState<DOMRect | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const dateTriggerRef = useRef<HTMLDivElement>(null)
  const datePickerPopupRef = useRef<HTMLDivElement>(null)

  const localeForPicker = locale === 'fr' ? 'fr-FR' : 'en-US'
  const today = new Date().toISOString().slice(0, 10)
  const canShowResultSection = goal.date <= today

  useEffect(() => {
    if (!isOpen) return
    setDate(goal.date)
    if (!canShowResultSection && activeTab === 'result') {
      setActiveTab('objective')
    } else if (canShowResultSection) {
      setActiveTab(initialTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, canShowResultSection, goal.id, goal.date])

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
    if (state?.success) {
      onClose()
      router.refresh()
    }
    if (state?.success || state?.error) {
      setIsSubmitting(false)
    }
  }, [state, onClose, router])

  if (!isOpen) return null

  const handleSubmit = () => {
    setIsSubmitting(true)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      layer={layer}
      size="lg"
      title={tGoals('editGoalTitle')}
      titleWrap
      footer={
        <div className="flex gap-3 w-full">
          <Button type="button" variant="muted" onClick={onClose} className="flex-1">
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form="goal-full-form"
            variant="primaryDark"
            className="flex-1"
            disabled={isSubmitting}
            loading={isSubmitting}
            loadingText={tCommon('saving')}
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
        id="goal-full-form"
        action={action}
        onSubmit={handleSubmit}
        className="px-6 py-4 space-y-6"
      >
        <input type="hidden" name="goal_id" value={goal.id} />
        <input type="hidden" name="locale" value={locale} />

        {/* Onglets type Segments (affichés uniquement si une section Résultat est disponible) */}
        {canShowResultSection && (
          <div className="flex gap-2 p-1 bg-stone-100 rounded-lg">
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'objective'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
              onClick={() => setActiveTab('objective')}
            >
              {tGoals('goalDetails')}
            </button>
            <button
              type="button"
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium ${
                activeTab === 'result'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
              onClick={() => setActiveTab('result')}
            >
              {tGoals('result.resultSection')}
            </button>
          </div>
        )}

        {/* Contenu Objectif (toujours dans le DOM, masqué visuellement si onglet Résultat actif) */}
        <div className={`space-y-5 ${activeTab === 'objective' ? '' : 'hidden'}`}>
            <Input
              id="full-race_name"
              label={tGoals('raceName')}
              name="race_name"
              type="text"
              required
              defaultValue={goal.race_name}
              placeholder={tGoals('raceNamePlaceholder')}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="full-date-trigger" className="block text-sm font-medium text-stone-700 mb-2">
                  {tGoals('date')} <span className="text-palette-danger">*</span>
                </label>
                <input type="hidden" name="date" value={date} required readOnly aria-hidden />
                <div
                  ref={dateTriggerRef}
                  id="full-date-trigger"
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
                id="full-distance"
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
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2 ml-1">
                {tGoals('priority.label')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="is_primary"
                    value="primary"
                    defaultChecked={goal.is_primary}
                    className="hidden peer"
                  />
                  <div
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                      goal.is_primary
                        ? 'bg-white text-palette-amber border-palette-amber'
                        : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    {tGoals('priority.primary')}
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="is_primary"
                    value="secondary"
                    defaultChecked={!goal.is_primary}
                    className="hidden peer"
                  />
                  <div
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border text-[10px] font-bold transition-all ${
                      !goal.is_primary
                        ? 'bg-white text-palette-sage border-palette-sage'
                        : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                    }`}
                  >
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
                    defaultValue={goal.target_time_hours ?? ''}
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
                    defaultValue={goal.target_time_minutes ?? ''}
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
                    defaultValue={goal.target_time_seconds ?? ''}
                    className="text-center pr-8"
                    aria-label={tGoals('result.seconds')}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 pointer-events-none">
                    {tGoals('result.unitSeconds')}
                  </span>
                </div>
              </div>
            </div>
        </div>

        {/* Contenu Résultat (toujours dans le DOM quand autorisé, masqué si onglet Objectif actif) */}
        {canShowResultSection && (
          <div className={`space-y-5 ${activeTab === 'result' ? '' : 'hidden'}`}>
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
                    defaultValue={goal.result_time_hours ?? ''}
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
                    defaultValue={goal.result_time_minutes ?? ''}
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
                    defaultValue={goal.result_time_seconds ?? ''}
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
              defaultValue={goal.result_place != null ? String(goal.result_place) : ''}
            />

            <Textarea
              name="result_note"
              label={tGoals('result.noteOptional')}
              placeholder={tGoals('result.notePlaceholder')}
              defaultValue={goal.result_note ?? ''}
              rows={3}
            />
          </div>
        )}

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
              monthDropdownId="goal-full-date-picker-month"
            />
          </div>,
          document.body
        )}
    </Modal>
  )
}


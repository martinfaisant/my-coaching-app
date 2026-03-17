'use client'

import { useActionState, useRef, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Goal } from '@/types/database'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Modal } from '@/components/Modal'
import { updateGoal, type GoalFormState } from './actions'

type GoalEditModalProps = {
  goal: Goal
  isOpen: boolean
  onClose: () => void
}

export function GoalEditModal({ goal, isOpen, onClose }: GoalEditModalProps) {
  const locale = useLocale()
  const router = useRouter()
  const tGoals = useTranslations('goals')
  const tCommon = useTranslations('common')

  const [state, action] = useActionState<GoalFormState, FormData>(updateGoal, {})

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previousIsSubmittingRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [priority, setPriority] = useState<'primary' | 'secondary'>(goal.is_primary ? 'primary' : 'secondary')

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

  useEffect(() => {
    if (isOpen) {
      setPriority(goal.is_primary ? 'primary' : 'secondary')
      initialValuesRef.current = {
        race_name: goal.race_name,
        date: goal.date,
        distance: goal.distance,
        is_primary: goal.is_primary ? 'primary' : 'secondary',
        target_time_hours: goal.target_time_hours != null ? String(goal.target_time_hours) : '',
        target_time_minutes: goal.target_time_minutes != null ? String(goal.target_time_minutes) : '',
        target_time_seconds: goal.target_time_seconds != null ? String(goal.target_time_seconds) : '',
      }
    }
  }, [isOpen, goal.id, goal.race_name, goal.date, goal.distance, goal.is_primary, goal.target_time_hours, goal.target_time_minutes, goal.target_time_seconds])

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

  const saveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isSubmitting}`
  useEffect(() => {
    const justFinishedSubmitting = previousIsSubmittingRef.current && !isSubmitting
    previousIsSubmittingRef.current = isSubmitting

    if (state?.success && justFinishedSubmitting) {
      setShowSavedFeedback(true)
      onClose()
      router.refresh()
      const t = setTimeout(() => setShowSavedFeedback(false), 2500)
      return () => clearTimeout(t)
    }
    if (state?.error) setShowSavedFeedback(false)
  }, [saveFeedbackKey, state?.success, state?.error, isSubmitting, onClose])

  useEffect(() => {
    if (state?.success || state?.error) {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }, [state])

  if (!isOpen) return null

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
          <Input
            id="edit-date"
            label={tGoals('date')}
            name="date"
            type="date"
            required
            defaultValue={goal.date}
          />
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
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide ml-1">
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
    </Modal>
  )
}

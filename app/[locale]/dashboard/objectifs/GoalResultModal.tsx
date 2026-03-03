'use client'

import { useActionState, useRef, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Modal } from '@/components/Modal'
import { saveGoalResult, type GoalFormState } from './actions'
import type { Goal } from '@/types/database'

type GoalResultModalProps = {
  goal: Goal
  isOpen: boolean
  onClose: () => void
}

export function GoalResultModal({ goal, isOpen, onClose }: GoalResultModalProps) {
  const locale = useLocale()
  const tGoals = useTranslations('goals')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const [state, action] = useActionState<GoalFormState, FormData>(saveGoalResult, {})

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previousIsSubmittingRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  const initialValues = {
    hours: goal.result_time_hours ?? '',
    minutes: goal.result_time_minutes ?? '',
    seconds: goal.result_time_seconds ?? '',
    place: goal.result_place != null ? String(goal.result_place) : '',
    note: goal.result_note ?? '',
  }
  const initialValuesRef = useRef(initialValues)

  useEffect(() => {
    if (isOpen) {
      initialValuesRef.current = {
        hours: goal.result_time_hours != null ? String(goal.result_time_hours) : '',
        minutes: goal.result_time_minutes != null ? String(goal.result_time_minutes) : '',
        seconds: goal.result_time_seconds != null ? String(goal.result_time_seconds) : '',
        place: goal.result_place != null ? String(goal.result_place) : '',
        note: goal.result_note ?? '',
      }
    }
  }, [isOpen, goal.id, goal.result_time_hours, goal.result_time_minutes, goal.result_time_seconds, goal.result_place, goal.result_note])

  const checkUnsavedChanges = useCallback(() => {
    const form = formRef.current
    if (!form) return false
    const hours = (form.querySelector('[name="result_time_hours"]') as HTMLInputElement)?.value ?? ''
    const minutes = (form.querySelector('[name="result_time_minutes"]') as HTMLInputElement)?.value ?? ''
    const seconds = (form.querySelector('[name="result_time_seconds"]') as HTMLInputElement)?.value ?? ''
    const place = (form.querySelector('[name="result_place"]') as HTMLInputElement)?.value ?? ''
    const note = (form.querySelector('[name="result_note"]') as HTMLTextAreaElement)?.value ?? ''
    const initial = initialValuesRef.current
    return (
      hours !== initial.hours ||
      minutes !== initial.minutes ||
      seconds !== initial.seconds ||
      place !== initial.place ||
      note !== initial.note
    )
  }, [])

  useEffect(() => {
    const form = formRef.current
    if (!form) return
    const update = () => setHasUnsavedChanges(checkUnsavedChanges())
    const inputs = form.querySelectorAll('input, textarea')
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
    if (state?.error) {
      setShowSavedFeedback(false)
    }
  }, [saveFeedbackKey, state?.success, state?.error, isSubmitting, onClose, router])

  useEffect(() => {
    if (hasUnsavedChanges && showSavedFeedback) {
      setShowSavedFeedback(false)
    }
  }, [hasUnsavedChanges, showSavedFeedback])

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
      title={goal.race_name}
      titleWrap
      footer={
        <div className="flex gap-3 w-full">
          <Button type="button" variant="muted" onClick={onClose} className="flex-1">
            {tCommon('cancel')}
          </Button>
          <Button
            type="submit"
            form="goal-result-form"
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
        id="goal-result-form"
        action={action}
        onSubmit={() => {
          isSubmittingRef.current = true
          setIsSubmitting(true)
        }}
        className="px-6 py-4 space-y-5"
      >
        <input type="hidden" name="goal_id" value={goal.id} />
        <input type="hidden" name="_locale" value={locale} />

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
                defaultValue={initialValues.hours}
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
                defaultValue={initialValues.minutes}
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
                defaultValue={initialValues.seconds}
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
          defaultValue={initialValues.place}
        />

        <Textarea
          name="result_note"
          label={tGoals('result.noteOptional')}
          placeholder={tGoals('result.notePlaceholder')}
          defaultValue={initialValues.note}
          rows={3}
        />

        {state?.error && (
          <p className="text-sm text-palette-danger font-medium" role="alert">
            {state.error}
          </p>
        )}
      </form>
    </Modal>
  )
}

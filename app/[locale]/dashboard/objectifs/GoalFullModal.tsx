'use client'

import { useActionState, useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import type { Goal } from '@/types/database'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Modal } from '@/components/Modal'
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
  const formRef = useRef<HTMLFormElement>(null)

  const today = new Date().toISOString().slice(0, 10)
  const canShowResultSection = goal.date <= today

  useEffect(() => {
    if (!isOpen) return
    if (!canShowResultSection && activeTab === 'result') {
      setActiveTab('objective')
    } else if (canShowResultSection) {
      setActiveTab(initialTab)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, canShowResultSection, goal.id])

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
              <Input
                id="full-date"
                label={tGoals('date')}
                name="date"
                type="date"
                required
                defaultValue={goal.date}
              />
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
    </Modal>
  )
}


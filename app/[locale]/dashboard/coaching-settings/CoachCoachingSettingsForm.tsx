'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useActionState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import {
  CoachSessionUnitsGrid,
  type SessionUnitValue,
} from '@/components/coach/CoachSessionUnitsGrid'
import {
  getDefaultWorkoutPrimaryMetric,
  type WorkoutPrimaryMetricSportKey,
} from '@/lib/workoutPrimaryMetric'
import type { WorkoutPrimaryMetricBySport } from '@/types/database'
import {
  saveCoachWorkoutPrimaryMetrics,
  type CoachSessionUnitsFormState,
} from './actions'

type CoachCoachingSettingsFormProps = {
  initialMetrics: WorkoutPrimaryMetricBySport | null
}

type UnitState = Record<WorkoutPrimaryMetricSportKey, SessionUnitValue>

function buildUnitState(initialMetrics: WorkoutPrimaryMetricBySport | null): UnitState {
  return {
    course: getDefaultWorkoutPrimaryMetric(initialMetrics, 'course'),
    trail: getDefaultWorkoutPrimaryMetric(initialMetrics, 'trail'),
    velo: getDefaultWorkoutPrimaryMetric(initialMetrics, 'velo'),
    natation: getDefaultWorkoutPrimaryMetric(initialMetrics, 'natation'),
    nordic_ski: getDefaultWorkoutPrimaryMetric(initialMetrics, 'nordic_ski'),
    backcountry_ski: getDefaultWorkoutPrimaryMetric(initialMetrics, 'backcountry_ski'),
    ice_skating: getDefaultWorkoutPrimaryMetric(initialMetrics, 'ice_skating'),
    randonnee: getDefaultWorkoutPrimaryMetric(initialMetrics, 'randonnee'),
    triathlon: getDefaultWorkoutPrimaryMetric(initialMetrics, 'triathlon'),
    canot: getDefaultWorkoutPrimaryMetric(initialMetrics, 'canot'),
  }
}

export function CoachCoachingSettingsForm({ initialMetrics }: CoachCoachingSettingsFormProps) {
  const locale = useLocale()
  const t = useTranslations('coachCoachingSettings')
  const tWorkouts = useTranslations('workouts')
  const tSports = useTranslations('sports')
  const tCommon = useTranslations('common')

  const [state, action, isPending] = useActionState<CoachSessionUnitsFormState, FormData>(
    saveCoachWorkoutPrimaryMetrics,
    {}
  )

  const [units, setUnits] = useState<UnitState>(() => buildUnitState(initialMetrics))
  const initialValuesRef = useRef<UnitState>(buildUnitState(initialMetrics))
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const previousIsPendingRef = useRef(false)

  const setUnit = useCallback((key: WorkoutPrimaryMetricSportKey, value: SessionUnitValue) => {
    setUnits((prev) => ({ ...prev, [key]: value }))
  }, [])

  const checkUnsavedChanges = useCallback(() => {
    const initial = initialValuesRef.current
    return (Object.keys(initial) as WorkoutPrimaryMetricSportKey[]).some((key) => units[key] !== initial[key])
  }, [units])

  useEffect(() => {
    setHasUnsavedChanges(checkUnsavedChanges())
  }, [checkUnsavedChanges])

  const saveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isPending}`

  useEffect(() => {
    const wasPending = previousIsPendingRef.current
    previousIsPendingRef.current = isPending

    if (wasPending && !isPending && state?.success) {
      setShowSavedFeedback(true)
      initialValuesRef.current = { ...units }
      setHasUnsavedChanges(false)
      const timer = setTimeout(() => setShowSavedFeedback(false), 2500)
      return () => clearTimeout(timer)
    }
    if (state?.error) {
      setShowSavedFeedback(false)
    }
  }, [saveFeedbackKey, isPending, state?.success, state?.error, units])

  useEffect(() => {
    if (hasUnsavedChanges && showSavedFeedback) {
      setShowSavedFeedback(false)
    }
  }, [hasUnsavedChanges, showSavedFeedback])

  return (
    <div className="max-w-xl w-full mx-auto space-y-4">
      <h1 className="hidden md:block text-xl font-bold text-stone-900">{t('pageTitle')}</h1>

      <form action={action} className="rounded-2xl border border-stone-200 bg-stone-50/50 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-200 bg-white">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">{t('sections.sessionUnits')}</h2>
        </div>

        <div className="p-4 space-y-4 bg-white">
          <p className="text-sm text-stone-600">{t('sessionUnitsIntro')}</p>

          <input type="hidden" name="locale" value={locale} />

          <CoachSessionUnitsGrid
            variant="page"
            tWorkouts={tWorkouts}
            tSports={tSports}
            unitCourse={units.course}
            setUnitCourse={(v) => setUnit('course', v)}
            unitTrail={units.trail}
            setUnitTrail={(v) => setUnit('trail', v)}
            unitVelo={units.velo}
            setUnitVelo={(v) => setUnit('velo', v)}
            unitNatation={units.natation}
            setUnitNatation={(v) => setUnit('natation', v)}
            unitTriathlon={units.triathlon}
            setUnitTriathlon={(v) => setUnit('triathlon', v)}
            unitCanot={units.canot}
            setUnitCanot={(v) => setUnit('canot', v)}
            unitNordicSki={units.nordic_ski}
            setUnitNordicSki={(v) => setUnit('nordic_ski', v)}
            unitBackcountrySki={units.backcountry_ski}
            setUnitBackcountrySki={(v) => setUnit('backcountry_ski', v)}
            unitIceSkating={units.ice_skating}
            setUnitIceSkating={(v) => setUnit('ice_skating', v)}
            unitRandonnee={units.randonnee}
            setUnitRandonnee={(v) => setUnit('randonnee', v)}
          />

          {state?.error ? (
            <p className="text-sm text-palette-danger" role="alert">
              {state.error}
            </p>
          ) : null}

          <Button
            type="submit"
            variant="primaryDark"
            className="w-full"
            disabled={!hasUnsavedChanges || isPending}
            loading={isPending}
            loadingText={tCommon('saving')}
            success={showSavedFeedback}
            successText={tCommon('saved')}
            error={!!state?.error}
            errorText={tCommon('notSaved')}
          >
            {tCommon('save')}
          </Button>
        </div>
      </form>
    </div>
  )
}

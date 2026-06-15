import { useEffect, useMemo, useReducer, useRef } from 'react'
import type { SportType, Workout, WorkoutTimeOfDay, WorkoutPrimaryMetricBySport } from '@/types/database'
import { getWorkoutPrimaryMetricForSport } from '@/lib/workoutPrimaryMetric'
import { workoutHasPaceField, workoutHasTimeDistanceTargets } from '@/lib/sportsRegistry'
import {
  computeDistanceKmFromDurationPace,
  computeDurationMinutesFromDistancePace,
  computePaceFromDurationAndDistance,
} from '@/lib/workoutTargetMath'

type TargetMode = 'time' | 'distance'

type WorkoutFormValues = {
  /** `null` = nouvelle séance, aucun sport choisi encore (coach / formulaire legacy). */
  sportType: SportType | null
  title: string
  description: string
  targetMode: TargetMode
  targetDurationMinutes: string
  targetDistanceKm: string
  targetElevationM: string
  targetPace: string
  editableDate: string
  timeOfDaySegment: WorkoutTimeOfDay | null
}

type LastMetricEdit = 'pace' | 'duration' | 'distance' | null

type State = {
  values: WorkoutFormValues
  initial: WorkoutFormValues
  justLoaded: boolean
  /** Dernier champ objectif modifié par l’utilisateur (pour ne pas écraser durée/distance quand on ajuste l’allure implicite). */
  lastMetricEdit: LastMetricEdit
}

/** Exportés pour tests Vitest (`workoutFormReducer`). */
export type WorkoutFormReducerState = State
export type WorkoutFormReducerAction = Action

type InitPayload = {
  workout: Workout | null
  date: string
  coachPrimaryMetrics: WorkoutPrimaryMetricBySport | null
}

type Action =
  | { type: 'INIT'; payload: InitPayload }
  | { type: 'SET_VALUE'; key: keyof WorkoutFormValues; value: string | SportType | WorkoutTimeOfDay | null }
  | { type: 'SET_TARGET_MODE'; mode: TargetMode }
  | { type: 'AUTO_CALC_UPDATE'; payload: { hasTimeDistanceChoice: boolean } }
  | { type: 'MARK_SAVED' }
  | { type: 'CLEAR_JUST_LOADED' }

function modeForSport(sportType: SportType | null, coachPrimaryMetrics: WorkoutPrimaryMetricBySport | null): TargetMode {
  if (sportType == null) return 'time'
  if (sportType === 'musculation') return 'time'
  return getWorkoutPrimaryMetricForSport(sportType, coachPrimaryMetrics) === 'distance' ? 'distance' : 'time'
}

function normalizeFromWorkout(
  workout: Workout,
  fallbackDate: string,
  coachPrimaryMetrics: WorkoutPrimaryMetricBySport | null
): WorkoutFormValues {
  if (workout.planned_by === 'athlete') {
    const durationStr =
      workout.actual_duration_minutes != null ? String(workout.actual_duration_minutes) : ''
    const distanceStr = workout.actual_distance_km != null ? String(workout.actual_distance_km) : ''
    const elevationStr = workout.actual_elevation_m != null ? String(workout.actual_elevation_m) : ''
    const paceStr = workout.target_pace != null ? String(workout.target_pace) : ''

    return {
      sportType: workout.sport_type,
      title: workout.title,
      description: workout.description,
      targetDurationMinutes: durationStr,
      targetDistanceKm: distanceStr,
      targetElevationM: elevationStr,
      targetPace: paceStr,
      targetMode: modeForSport(workout.sport_type, null),
      editableDate: workout.date ?? fallbackDate,
      timeOfDaySegment: workout.time_of_day ?? null,
    }
  }

  const durationStr = workout.target_duration_minutes != null ? String(workout.target_duration_minutes) : ''
  const distanceStr = workout.target_distance_km != null ? String(workout.target_distance_km) : ''
  const elevationStr = workout.target_elevation_m != null ? String(workout.target_elevation_m) : ''
  const paceStr = workout.target_pace != null ? String(workout.target_pace) : ''

  return {
    sportType: workout.sport_type,
    title: workout.title,
    description: workout.description,
    targetDurationMinutes: durationStr,
    targetDistanceKm: distanceStr,
    targetElevationM: elevationStr,
    targetPace: paceStr,
    targetMode: modeForSport(workout.sport_type, coachPrimaryMetrics),
    editableDate: workout.date ?? fallbackDate,
    timeOfDaySegment: workout.time_of_day ?? null,
  }
}

function defaultValues(date: string, coachPrimaryMetrics: WorkoutPrimaryMetricBySport | null): WorkoutFormValues {
  return {
    sportType: null,
    title: '',
    description: '',
    targetMode: modeForSport(null, coachPrimaryMetrics),
    targetDurationMinutes: '',
    targetDistanceKm: '',
    targetElevationM: '',
    targetPace: '',
    editableDate: date,
    timeOfDaySegment: null,
  }
}

function formatPaceForForm(sportType: SportType, pace: number): string {
  if (sportType === 'velo' || sportType === 'canot' || sportType === 'triathlon') {
    return String(Math.round(pace))
  }
  return String(Number(pace.toFixed(1)))
}

function paceNearlyMatchesComputed(sportType: SportType, stored: number, computed: number): boolean {
  if (sportType === 'velo' || sportType === 'canot' || sportType === 'triathlon') {
    return Math.abs(stored - computed) < 0.51
  }
  return Math.abs(stored - computed) < 0.051
}

export function workoutFormReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT': {
      const { workout, date, coachPrimaryMetrics } = action.payload
      const values = workout
        ? normalizeFromWorkout(workout, date, coachPrimaryMetrics)
        : defaultValues(date, coachPrimaryMetrics)
      return { values, initial: values, justLoaded: true, lastMetricEdit: null }
    }
    case 'SET_TARGET_MODE': {
      return { ...state, lastMetricEdit: null, values: { ...state.values, targetMode: action.mode } }
    }
    case 'SET_VALUE': {
      let lastMetricEdit: LastMetricEdit = state.lastMetricEdit
      if (action.key === 'targetPace') lastMetricEdit = 'pace'
      else if (action.key === 'targetDurationMinutes') lastMetricEdit = 'duration'
      else if (action.key === 'targetDistanceKm') lastMetricEdit = 'distance'
      return {
        ...state,
        lastMetricEdit,
        values: { ...state.values, [action.key]: action.value } as WorkoutFormValues,
      }
    }
    case 'AUTO_CALC_UPDATE': {
      const { hasTimeDistanceChoice } = action.payload
      if (!hasTimeDistanceChoice) return state

      const { sportType, targetMode, targetPace, targetDistanceKm, targetDurationMinutes } = state.values
      if (sportType == null) return state

      const paceNum = Number(targetPace)
      const paceOk = (targetPace?.trim() ?? '') !== '' && paceNum > 0
      const isJustLoaded = state.justLoaded

      const durParsed = targetDurationMinutes ? parseInt(targetDurationMinutes, 10) : NaN
      const distParsed = targetDistanceKm ? parseFloat(targetDistanceKm) : NaN
      const durOk = Number.isFinite(durParsed) && durParsed > 0
      const distOk = Number.isFinite(distParsed) && distParsed > 0

      /**
       * Durée + distance renseignées :
       * — si l’utilisateur vide l’allure / vitesse : on vide aussi le champ objectif non prioritaire (durée en mode distance, distance en mode temps) ;
       * — si l’utilisateur vient de modifier l’allure (sans la vider) : recalcul du champ secondaire (non prioritaire) ;
       * — sinon : on réaligne l’allure sur le couple temps+distance (évite d’écraser durée/distance après édition).
       */
      if (sportType != null && workoutHasPaceField(sportType) && durOk && distOk) {
        const computedPace = computePaceFromDurationAndDistance(sportType, durParsed, distParsed)
        if (computedPace == null) return state

        const userClearedPace = state.lastMetricEdit === 'pace' && !paceOk
        if (userClearedPace) {
          // Allure / vitesse vidée : retirer aussi le champ objectif non prioritaire (couplé à l’allure).
          const clearedSecondary =
            targetMode === 'distance'
              ? { targetDurationMinutes: '' }
              : { targetDistanceKm: '' }
          return {
            ...state,
            justLoaded: false,
            lastMetricEdit: null,
            values: { ...state.values, ...clearedSecondary },
          }
        }

        if (!paceOk) {
          return {
            ...state,
            justLoaded: false,
            lastMetricEdit: null,
            values: { ...state.values, targetPace: formatPaceForForm(sportType, computedPace) },
          }
        }
        if (paceNearlyMatchesComputed(sportType, paceNum, computedPace)) {
          return {
            ...state,
            justLoaded: false,
            lastMetricEdit: null,
            values: { ...state.values, targetPace: formatPaceForForm(sportType, computedPace) },
          }
        }
        if (state.lastMetricEdit === 'pace') {
          if (targetMode === 'distance') {
            const newDur = computeDurationMinutesFromDistancePace(sportType, distParsed, paceNum)
            if (newDur != null) {
              return {
                ...state,
                justLoaded: false,
                lastMetricEdit: null,
                values: { ...state.values, targetDurationMinutes: String(newDur) },
              }
            }
          } else {
            const newDist = computeDistanceKmFromDurationPace(sportType, durParsed, paceNum)
            if (newDist != null) {
              return {
                ...state,
                justLoaded: false,
                lastMetricEdit: null,
                values: { ...state.values, targetDistanceKm: String(newDist) },
              }
            }
          }
          return state
        }
        return {
          ...state,
          justLoaded: false,
          lastMetricEdit: null,
          values: { ...state.values, targetPace: formatPaceForForm(sportType, computedPace) },
        }
      }

      if (targetMode === 'distance') {
        if (distOk && paceOk) {
          // Ne pas recalculer la durée si l’utilisateur vient de vider ce champ (sinon la saisie est immédiatement réinjectée).
          const userClearedDuration = state.lastMetricEdit === 'duration' && !durOk
          if (!userClearedDuration) {
            const newDur = computeDurationMinutesFromDistancePace(sportType, distParsed, paceNum)
            if (newDur != null) {
              return {
                ...state,
                justLoaded: false,
                values: { ...state.values, targetDurationMinutes: String(newDur) },
              }
            }
          } else {
            // Durée dérivée (distance + allure) vidée : retirer aussi l’allure / vitesse saisie.
            return {
              ...state,
              justLoaded: false,
              lastMetricEdit: null,
              values: { ...state.values, targetPace: '' },
            }
          }
        } else if (!isJustLoaded && (!distOk || !paceOk)) {
          const userEnteredDuration = state.lastMetricEdit === 'duration' && durOk
          if (userEnteredDuration) {
            return { ...state, justLoaded: false }
          }
          return { ...state, values: { ...state.values, targetDurationMinutes: '' } }
        }
      } else {
        if (durOk && paceOk) {
          const userClearedDistance = state.lastMetricEdit === 'distance' && !distOk
          if (!userClearedDistance) {
            const newDist = computeDistanceKmFromDurationPace(sportType, durParsed, paceNum)
            if (newDist != null) {
              return {
                ...state,
                justLoaded: false,
                values: { ...state.values, targetDistanceKm: String(newDist) },
              }
            }
          } else {
            // Distance dérivée (durée + allure) vidée : retirer aussi l’allure / vitesse saisie.
            return {
              ...state,
              justLoaded: false,
              lastMetricEdit: null,
              values: { ...state.values, targetPace: '' },
            }
          }
        } else if (state.lastMetricEdit === 'duration' && !durOk) {
          // Durée vidée en mode temps : retirer aussi distance dérivée et allure / vitesse saisie.
          return {
            ...state,
            justLoaded: false,
            lastMetricEdit: null,
            values: { ...state.values, targetDistanceKm: '', targetPace: '' },
          }
        } else if (!isJustLoaded && (!durOk || !paceOk)) {
          const userEnteredDistance = state.lastMetricEdit === 'distance' && distOk
          if (userEnteredDistance) {
            return { ...state, justLoaded: false }
          }
          return { ...state, values: { ...state.values, targetDistanceKm: '' } }
        }
      }

      return state
    }
    case 'MARK_SAVED': {
      return { ...state, initial: state.values, lastMetricEdit: null }
    }
    case 'CLEAR_JUST_LOADED': {
      if (!state.justLoaded) return state
      return { ...state, justLoaded: false }
    }
    default:
      return state
  }
}

function computeDirty(values: WorkoutFormValues, initial: WorkoutFormValues): boolean {
  return (
    values.sportType !== initial.sportType ||
    values.title !== initial.title ||
    values.description !== initial.description ||
    values.targetDurationMinutes !== initial.targetDurationMinutes ||
    values.targetDistanceKm !== initial.targetDistanceKm ||
    values.targetElevationM !== initial.targetElevationM ||
    values.targetPace !== initial.targetPace ||
    values.editableDate !== initial.editableDate ||
    values.timeOfDaySegment !== initial.timeOfDaySegment ||
    values.targetMode !== initial.targetMode
  )
}

export function useWorkoutFormReducer(args: {
  workout: Workout | null
  date: string
  coachPrimaryMetrics: WorkoutPrimaryMetricBySport | null
}) {
  const { workout, date, coachPrimaryMetrics } = args

  const [state, dispatch] = useReducer(workoutFormReducer, {
    values: defaultValues(date, coachPrimaryMetrics),
    initial: defaultValues(date, coachPrimaryMetrics),
    justLoaded: false,
    lastMetricEdit: null,
  })

  const prevInitKeyRef = useRef<string>('')
  useEffect(() => {
    const key = `${workout?.id ?? 'new'}|${workout?.updated_at ?? ''}|${date}|${JSON.stringify(coachPrimaryMetrics)}`
    if (prevInitKeyRef.current === key) return
    prevInitKeyRef.current = key
    dispatch({ type: 'INIT', payload: { workout, date, coachPrimaryMetrics } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout?.id, workout?.updated_at, date, coachPrimaryMetrics])

  const hasTimeDistanceChoice =
    state.values.sportType != null && workoutHasTimeDistanceTargets(state.values.sportType)

  useEffect(() => {
    const mode = modeForSport(state.values.sportType, coachPrimaryMetrics)
    if (mode !== state.values.targetMode) {
      dispatch({ type: 'SET_TARGET_MODE', mode })
    }
  }, [state.values.sportType, coachPrimaryMetrics, state.values.targetMode])

  useEffect(() => {
    dispatch({ type: 'AUTO_CALC_UPDATE', payload: { hasTimeDistanceChoice } })
  }, [
    hasTimeDistanceChoice,
    state.values.targetPace,
    state.values.targetMode,
    state.values.sportType,
    state.values.targetDistanceKm,
    state.values.targetDurationMinutes,
  ])

  const hasUnsavedChanges = useMemo(() => computeDirty(state.values, state.initial), [state.values, state.initial])

  return {
    values: state.values,
    initialValues: state.initial,
    hasUnsavedChanges,
    markSaved: () => dispatch({ type: 'MARK_SAVED' }),
    setTargetMode: (mode: TargetMode) => dispatch({ type: 'SET_TARGET_MODE', mode }),
    setValue: <K extends keyof WorkoutFormValues>(key: K, value: WorkoutFormValues[K]) =>
      dispatch({ type: 'SET_VALUE', key, value }),
  }
}

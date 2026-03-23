import { useEffect, useMemo, useReducer, useRef } from 'react'
import type { SportType, Workout, WorkoutTimeOfDay, WorkoutPrimaryMetricBySport } from '@/types/database'
import { getWorkoutPrimaryMetricForSport } from '@/lib/workoutPrimaryMetric'

type TargetMode = 'time' | 'distance'

type WorkoutFormValues = {
  sportType: SportType
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

type State = {
  values: WorkoutFormValues
  initial: WorkoutFormValues
  justLoaded: boolean
}

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

function modeForSport(sportType: SportType, coachPrimaryMetrics: WorkoutPrimaryMetricBySport | null): TargetMode {
  if (sportType === 'musculation') return 'time'
  return getWorkoutPrimaryMetricForSport(sportType, coachPrimaryMetrics) === 'distance' ? 'distance' : 'time'
}

function normalizeFromWorkout(
  workout: Workout,
  fallbackDate: string,
  coachPrimaryMetrics: WorkoutPrimaryMetricBySport | null
): WorkoutFormValues {
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
    sportType: 'course',
    title: '',
    description: '',
    targetMode: modeForSport('course', coachPrimaryMetrics),
    targetDurationMinutes: '',
    targetDistanceKm: '',
    targetElevationM: '',
    targetPace: '',
    editableDate: date,
    timeOfDaySegment: null,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'INIT': {
      const { workout, date, coachPrimaryMetrics } = action.payload
      const values = workout
        ? normalizeFromWorkout(workout, date, coachPrimaryMetrics)
        : defaultValues(date, coachPrimaryMetrics)
      return { values, initial: values, justLoaded: true }
    }
    case 'SET_TARGET_MODE': {
      return { ...state, values: { ...state.values, targetMode: action.mode } }
    }
    case 'SET_VALUE': {
      return {
        ...state,
        values: { ...state.values, [action.key]: action.value } as WorkoutFormValues,
      }
    }
    case 'AUTO_CALC_UPDATE': {
      const { hasTimeDistanceChoice } = action.payload
      if (!hasTimeDistanceChoice) return state

      const { sportType, targetMode, targetPace, targetDistanceKm, targetDurationMinutes } = state.values

      const paceOk = targetPace && Number(targetPace) > 0
      const pace = paceOk ? Number(targetPace) : 0
      const isJustLoaded = state.justLoaded

      if (targetMode === 'distance') {
        if (targetDistanceKm && Number(targetDistanceKm) > 0 && paceOk) {
          if (sportType === 'course') {
            const distance = Number(targetDistanceKm)
            return {
              ...state,
              justLoaded: false,
              values: { ...state.values, targetDurationMinutes: String(Math.round(distance * pace)) },
            }
          }
          if (sportType === 'velo') {
            const distance = Number(targetDistanceKm)
            const durationMinutes = (distance / pace) * 60
            return {
              ...state,
              justLoaded: false,
              values: { ...state.values, targetDurationMinutes: String(Math.round(durationMinutes)) },
            }
          }
          if (sportType === 'natation') {
            const distanceM = Number(targetDistanceKm) * 1000
            return {
              ...state,
              justLoaded: false,
              values: { ...state.values, targetDurationMinutes: String(Math.round((distanceM / 100) * pace)) },
            }
          }
        } else if (!isJustLoaded && (!targetDistanceKm || !paceOk)) {
          return { ...state, values: { ...state.values, targetDurationMinutes: '' } }
        }
      } else {
        if (targetDurationMinutes && Number(targetDurationMinutes) > 0 && paceOk) {
          if (sportType === 'course') {
            const duration = Number(targetDurationMinutes)
            return {
              ...state,
              justLoaded: false,
              values: { ...state.values, targetDistanceKm: (duration / pace).toFixed(2) },
            }
          }
          if (sportType === 'velo') {
            const durationMinutes = Number(targetDurationMinutes)
            return {
              ...state,
              justLoaded: false,
              values: { ...state.values, targetDistanceKm: ((durationMinutes / 60) * pace).toFixed(2) },
            }
          }
          if (sportType === 'natation') {
            const duration = Number(targetDurationMinutes)
            const distanceKm = ((duration / pace) * 100) / 1000
            return {
              ...state,
              justLoaded: false,
              values: { ...state.values, targetDistanceKm: distanceKm.toFixed(3) },
            }
          }
        } else if (!isJustLoaded && (!targetDurationMinutes || !paceOk)) {
          return { ...state, values: { ...state.values, targetDistanceKm: '' } }
        }
      }

      return state
    }
    case 'MARK_SAVED': {
      return { ...state, initial: state.values }
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

  const [state, dispatch] = useReducer(reducer, {
    values: defaultValues(date, coachPrimaryMetrics),
    initial: defaultValues(date, coachPrimaryMetrics),
    justLoaded: false,
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
    state.values.sportType === 'course' ||
    state.values.sportType === 'velo' ||
    state.values.sportType === 'natation'

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

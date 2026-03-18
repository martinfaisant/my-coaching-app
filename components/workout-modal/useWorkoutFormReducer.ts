import { useEffect, useMemo, useReducer, useRef } from 'react'
import type { SportType, Workout, WorkoutTimeOfDay } from '@/types/database'

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
  /** Permet de skipper un clear auto-calc juste après init (équivalent workoutJustLoadedRef). */
  justLoaded: boolean
}

type InitPayload = {
  workout: Workout | null
  date: string
}

type Action =
  | { type: 'INIT'; payload: InitPayload }
  | { type: 'SET_VALUE'; key: keyof WorkoutFormValues; value: string | SportType | WorkoutTimeOfDay | null }
  | { type: 'SET_TARGET_MODE'; mode: TargetMode }
  | { type: 'AUTO_CALC_UPDATE'; payload: { hasTimeDistanceChoice: boolean } }
  | { type: 'MARK_SAVED' }
  | { type: 'CLEAR_JUST_LOADED' }

function normalizeFromWorkout(workout: Workout, fallbackDate: string): WorkoutFormValues {
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
    targetMode: workout.target_distance_km != null && workout.target_distance_km > 0 ? 'distance' : 'time',
    editableDate: workout.date ?? fallbackDate,
    timeOfDaySegment: workout.time_of_day ?? null,
  }
}

function defaultValues(date: string): WorkoutFormValues {
  return {
    sportType: 'course',
    title: '',
    description: '',
    targetMode: 'time',
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
      const values = action.payload.workout
        ? normalizeFromWorkout(action.payload.workout, action.payload.date)
        : defaultValues(action.payload.date)
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

      // NOTE: on réplique le comportement existant : on ne remplit le champ calculé que si les 2 autres sont OK,
      // et on évite de "clear" immédiatement après l'init.
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
}) {
  const { workout, date } = args

  const [state, dispatch] = useReducer(reducer, {
    values: defaultValues(date),
    initial: defaultValues(date),
    justLoaded: false,
  })

  const prevWorkoutIdRef = useRef<string | null>(null)
  useEffect(() => {
    const nextId = workout?.id ?? null
    if (prevWorkoutIdRef.current === nextId && state.initial.editableDate === date) return
    prevWorkoutIdRef.current = nextId
    dispatch({ type: 'INIT', payload: { workout, date } })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workout?.id, date])

  const hasTimeDistanceChoice =
    state.values.sportType === 'course' ||
    state.values.sportType === 'velo' ||
    state.values.sportType === 'natation'

  // Règle actuelle : musculation => time only
  useEffect(() => {
    if (state.values.sportType === 'musculation') {
      dispatch({ type: 'SET_TARGET_MODE', mode: 'time' })
    }
  }, [state.values.sportType])

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


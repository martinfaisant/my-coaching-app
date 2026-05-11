import { describe, expect, it } from 'vitest'
import { workoutFormReducer, type WorkoutFormReducerState } from './useWorkoutFormReducer'

const BASE_VALUES = {
  sportType: 'course' as const,
  title: '',
  description: '',
  targetElevationM: '',
  editableDate: '2026-05-11',
  timeOfDaySegment: null,
}

function makeState(
  values: Partial<WorkoutFormReducerState['values']> &
    Pick<WorkoutFormReducerState['values'], 'targetMode' | 'targetDurationMinutes' | 'targetDistanceKm' | 'targetPace'>
): WorkoutFormReducerState {
  const full = { ...BASE_VALUES, ...values }
  return {
    values: full,
    initial: full,
    justLoaded: false,
    lastMetricEdit: null,
  }
}

const AUTO = { type: 'AUTO_CALC_UPDATE' as const, payload: { hasTimeDistanceChoice: true } }

describe('workoutFormReducer — cascades objectifs (durée / distance / allure)', () => {
  it('mode distance : vidage de la durée retire aussi l’allure', () => {
    let s = makeState({
      targetMode: 'distance',
      targetDistanceKm: '10',
      targetPace: '6',
      targetDurationMinutes: '60',
    })
    s = workoutFormReducer(s, { type: 'SET_VALUE', key: 'targetDurationMinutes', value: '' })
    s = workoutFormReducer(s, AUTO)
    expect(s.values.targetDistanceKm).toBe('10')
    expect(s.values.targetDurationMinutes).toBe('')
    expect(s.values.targetPace).toBe('')
  })

  it('mode temps : vidage de la distance retire aussi l’allure', () => {
    let s = makeState({
      targetMode: 'time',
      targetDurationMinutes: '60',
      targetPace: '6',
      targetDistanceKm: '10',
    })
    s = workoutFormReducer(s, { type: 'SET_VALUE', key: 'targetDistanceKm', value: '' })
    s = workoutFormReducer(s, AUTO)
    expect(s.values.targetDurationMinutes).toBe('60')
    expect(s.values.targetDistanceKm).toBe('')
    expect(s.values.targetPace).toBe('')
  })

  it('mode distance : vidage de l’allure (durée+distance présentes) retire la durée', () => {
    let s = makeState({
      targetMode: 'distance',
      targetDistanceKm: '10',
      targetDurationMinutes: '60',
      targetPace: '6',
    })
    s = workoutFormReducer(s, { type: 'SET_VALUE', key: 'targetPace', value: '' })
    s = workoutFormReducer(s, AUTO)
    expect(s.values.targetDistanceKm).toBe('10')
    expect(s.values.targetDurationMinutes).toBe('')
    expect(s.values.targetPace).toBe('')
  })

  it('mode temps : vidage de l’allure (durée+distance présentes) retire la distance', () => {
    let s = makeState({
      targetMode: 'time',
      targetDurationMinutes: '60',
      targetDistanceKm: '10',
      targetPace: '6',
    })
    s = workoutFormReducer(s, { type: 'SET_VALUE', key: 'targetPace', value: '' })
    s = workoutFormReducer(s, AUTO)
    expect(s.values.targetDurationMinutes).toBe('60')
    expect(s.values.targetDistanceKm).toBe('')
    expect(s.values.targetPace).toBe('')
  })

  it('deux AUTO_CALC consécutifs restent stables après vidage allure (mode distance)', () => {
    let s = makeState({
      targetMode: 'distance',
      targetDistanceKm: '10',
      targetDurationMinutes: '60',
      targetPace: '6',
    })
    s = workoutFormReducer(s, { type: 'SET_VALUE', key: 'targetPace', value: '' })
    s = workoutFormReducer(s, AUTO)
    const once = s
    s = workoutFormReducer(s, AUTO)
    expect(s.values).toEqual(once.values)
  })
})

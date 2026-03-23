import { describe, it, expect } from 'vitest'
import type { WorkoutPrimaryMetricBySport } from '@/types/database'
import { validateWorkoutFormData, WORKOUT_VALIDATION_ERROR_CODES } from './workoutValidation'

function makeForm(entries: Record<string, string>) {
  const fd = new FormData()
  for (const [k, v] of Object.entries(entries)) {
    fd.set(k, v)
  }
  return fd
}

const completePrefs: WorkoutPrimaryMetricBySport = {
  course: 'distance',
  velo: 'distance',
  natation: 'distance',
}

describe('validateWorkoutFormData — options primaryMetricBySport', () => {
  it('renvoie workoutUnitsNotConfigured si préférences coach incomplètes', () => {
    const fd = makeForm({
      date: '2026-03-22',
      sport_type: 'course',
      title: 'Séance',
      description: '',
      target_distance_km: '10',
      target_pace: '5',
    })
    const incomplete: WorkoutPrimaryMetricBySport = { course: 'distance' }
    const r = validateWorkoutFormData(fd, { primaryMetricBySport: incomplete })
    expect('error' in r).toBe(true)
    if ('error' in r) {
      expect(r.errorCode).toBe(WORKOUT_VALIDATION_ERROR_CODES.WORKOUT_UNITS_NOT_CONFIGURED)
    }
  })

  it('avec métrique distance : accepte distance + allure', () => {
    const fd = makeForm({
      date: '2026-03-22',
      sport_type: 'course',
      title: 'Séance',
      description: '',
      target_distance_km: '10',
      target_pace: '5',
    })
    const r = validateWorkoutFormData(fd, { primaryMetricBySport: completePrefs })
    expect('data' in r).toBe(true)
    if ('data' in r) {
      expect(r.data.target_distance_km).toBe(10)
      expect(r.data.target_pace).toBe(5)
    }
  })

  it('avec métrique temps : accepte durée + allure (distance dérivée)', () => {
    const fd = makeForm({
      date: '2026-03-22',
      sport_type: 'course',
      title: 'Séance',
      description: '',
      target_duration_minutes: '50',
      target_pace: '5',
    })
    const prefs: WorkoutPrimaryMetricBySport = {
      course: 'time',
      velo: 'distance',
      natation: 'distance',
    }
    const r = validateWorkoutFormData(fd, { primaryMetricBySport: prefs })
    expect('data' in r).toBe(true)
    if ('data' in r) {
      expect(r.data.target_duration_minutes).toBe(50)
      expect(r.data.target_pace).toBe(5)
    }
  })
})

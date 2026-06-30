import { describe, expect, it } from 'vitest'

import {
  parseWorkoutPrimaryMetricsFromFormData,
  WORKOUT_PRIMARY_METRIC_FORM_FIELD_NAMES,
} from '@/lib/workoutPrimaryMetric'

function formDataWithAllMetrics(
  overrides: Partial<Record<keyof typeof WORKOUT_PRIMARY_METRIC_FORM_FIELD_NAMES, string>> = {}
): FormData {
  const fd = new FormData()
  for (const [key, fieldName] of Object.entries(WORKOUT_PRIMARY_METRIC_FORM_FIELD_NAMES)) {
    const sportKey = key as keyof typeof WORKOUT_PRIMARY_METRIC_FORM_FIELD_NAMES
    fd.set(fieldName, overrides[sportKey] ?? 'time')
  }
  return fd
}

describe('parseWorkoutPrimaryMetricsFromFormData', () => {
  it('parse les 10 sports valides', () => {
    const result = parseWorkoutPrimaryMetricsFromFormData(formDataWithAllMetrics({ velo: 'distance' }))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.course).toBe('time')
    expect(result.data.velo).toBe('distance')
    expect(Object.keys(result.data)).toHaveLength(10)
  })

  it('rejette une valeur invalide', () => {
    const fd = formDataWithAllMetrics()
    fd.set('workout_primary_metric_course', 'pace')
    expect(parseWorkoutPrimaryMetricsFromFormData(fd)).toEqual({ ok: false })
  })

  it('rejette un champ manquant', () => {
    const fd = formDataWithAllMetrics()
    fd.delete('workout_primary_metric_canot')
    expect(parseWorkoutPrimaryMetricsFromFormData(fd)).toEqual({ ok: false })
  })
})

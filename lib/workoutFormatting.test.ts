import { describe, expect, it } from 'vitest'

import {
  MINUS_SIGN,
  computeActualPace,
  formatDistance,
  formatDistanceDelta,
  formatDurationDelta,
  formatDurationHM,
  formatElevation,
  formatElevationDelta,
  formatPaceDelta,
  formatPaceValue,
  getEffectiveActualMetrics,
  shouldShowActualCard,
} from './workoutFormatting'
import type { Workout } from '@/types/database'

function makeWorkout(over: Partial<Workout> = {}): Workout {
  return {
    id: 'w-1',
    athlete_id: 'a-1',
    date: '2026-03-26',
    sport_type: 'course',
    title: 'Sortie',
    description: '',
    status: 'planned',
    target_duration_minutes: null,
    target_distance_km: null,
    target_elevation_m: null,
    target_pace: null,
    actual_duration_minutes: null,
    actual_distance_km: null,
    actual_elevation_m: null,
    perceived_feeling: null,
    perceived_intensity: null,
    perceived_pleasure: null,
    athlete_comment: null,
    athlete_comment_at: null,
    time_of_day: null,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    ...over,
  }
}

describe('shouldShowActualCard', () => {
  it('false si statut planned', () => {
    expect(shouldShowActualCard(makeWorkout({ status: 'planned', actual_duration_minutes: 30 }))).toBe(false)
  })

  it('false si statut not_completed', () => {
    expect(
      shouldShowActualCard(makeWorkout({ status: 'not_completed', actual_duration_minutes: 30 }))
    ).toBe(false)
  })

  it('false si completed sans actual_*', () => {
    expect(shouldShowActualCard(makeWorkout({ status: 'completed' }))).toBe(false)
  })

  it('true si completed avec au moins un actual_*', () => {
    expect(
      shouldShowActualCard(makeWorkout({ status: 'completed', actual_duration_minutes: 0 }))
    ).toBe(true)
    expect(
      shouldShowActualCard(makeWorkout({ status: 'completed', actual_distance_km: 5 }))
    ).toBe(true)
  })

  it('live override : completed + live duration null écrase actual persisté', () => {
    const w = makeWorkout({ status: 'completed', actual_duration_minutes: 30 })
    expect(
      shouldShowActualCard(w, { durationMinutes: null, distanceKm: null, elevationM: null })
    ).toBe(false)
  })

  it('live override : live distance saisie active la carte même si persisté null', () => {
    const w = makeWorkout({ status: 'completed' })
    expect(shouldShowActualCard(w, { distanceKm: 5 })).toBe(true)
  })
})

describe('getEffectiveActualMetrics', () => {
  it('utilise les valeurs persistées si live undefined', () => {
    const w = makeWorkout({ actual_duration_minutes: 60, actual_distance_km: 10, actual_elevation_m: 200 })
    expect(getEffectiveActualMetrics(w)).toEqual({
      durationMinutes: 60,
      distanceKm: 10,
      elevationM: 200,
    })
  })

  it('live override prime sur persisté (null compris)', () => {
    const w = makeWorkout({ actual_duration_minutes: 60, actual_distance_km: 10 })
    expect(getEffectiveActualMetrics(w, { durationMinutes: null, distanceKm: 12 })).toEqual({
      durationMinutes: null,
      distanceKm: 12,
      elevationM: null,
    })
  })

  it('normalise NaN / Infinity → null', () => {
    const w = makeWorkout()
    expect(getEffectiveActualMetrics(w, { durationMinutes: Number.NaN })).toEqual({
      durationMinutes: null,
      distanceKm: null,
      elevationM: null,
    })
  })
})

describe('formatDurationHM', () => {
  it('formats < 60', () => {
    expect(formatDurationHM(45)).toBe('45 min')
    expect(formatDurationHM(0)).toBe('0 min')
  })

  it('formats >= 60 avec padding', () => {
    expect(formatDurationHM(60)).toBe('1h00')
    expect(formatDurationHM(90)).toBe('1h30')
    expect(formatDurationHM(125)).toBe('2h05')
  })
})

describe('formatDistance', () => {
  it('course : utilise locale FR', () => {
    expect(formatDistance(5.12, 'course', 'fr')).toBe('5,12 km')
    expect(formatDistance(5, 'course', 'fr')).toBe('5 km')
  })

  it('course : utilise locale EN', () => {
    expect(formatDistance(5.12, 'course', 'en')).toBe('5.12 km')
  })

  it('natation : convertit en mètres', () => {
    expect(formatDistance(1.5, 'natation', 'fr')).toBe('1500 m')
    expect(formatDistance(0.4, 'natation', 'en')).toBe('400 m')
  })
})

describe('formatElevation', () => {
  it('arrondit à l\'entier', () => {
    expect(formatElevation(200)).toBe('200 m')
    expect(formatElevation(199.4)).toBe('199 m')
  })
})

describe('formatPaceValue', () => {
  it('course : mm:ss depuis minutes', () => {
    expect(formatPaceValue(5.0, 'course', 'fr')).toBe('5:00')
    expect(formatPaceValue(4.917, 'course', 'fr')).toBe('4:55')
  })

  it('vélo : 1 décimale', () => {
    expect(formatPaceValue(28, 'velo', 'fr')).toBe('28')
    expect(formatPaceValue(28.5, 'velo', 'fr')).toBe('28,5')
    expect(formatPaceValue(28.5, 'velo', 'en')).toBe('28.5')
  })

  it('natation : mm:ss', () => {
    expect(formatPaceValue(2.0, 'natation', 'fr')).toBe('2:00')
  })
})

describe('formatDurationDelta', () => {
  it('null si target ou actual null', () => {
    expect(formatDurationDelta(null, 30)).toBeNull()
    expect(formatDurationDelta(60, null)).toBeNull()
  })

  it('null si delta arrondi = 0', () => {
    expect(formatDurationDelta(60, 60)).toBeNull()
    expect(formatDurationDelta(60, 60.4)).toBeNull()
  })

  it('signe + et −', () => {
    expect(formatDurationDelta(60, 65)).toEqual({ value: '+5', unit: 'min' })
    expect(formatDurationDelta(60, 58)).toEqual({ value: `${MINUS_SIGN}2`, unit: 'min' })
  })

  it('format heure si |delta| >= 60 (unité embarquée → unit vide)', () => {
    expect(formatDurationDelta(60, 125)).toEqual({ value: '+1h05', unit: '' })
    expect(formatDurationDelta(180, 60)).toEqual({ value: `${MINUS_SIGN}2h00`, unit: '' })
  })
})

describe('formatDistanceDelta', () => {
  it('course : 2 décimales avec locale', () => {
    expect(formatDistanceDelta(5, 5.12, 'course', 'fr')).toEqual({ value: '+0,12', unit: 'km' })
    expect(formatDistanceDelta(5, 5.12, 'course', 'en')).toEqual({ value: '+0.12', unit: 'km' })
    expect(formatDistanceDelta(10, 8.5, 'course', 'fr')).toEqual({ value: `${MINUS_SIGN}1,5`, unit: 'km' })
  })

  it('natation : delta entier en mètres', () => {
    expect(formatDistanceDelta(1.5, 1.65, 'natation', 'fr')).toEqual({ value: '+150', unit: 'm' })
    expect(formatDistanceDelta(0.5, 0.45, 'natation', 'fr')).toEqual({ value: `${MINUS_SIGN}50`, unit: 'm' })
  })

  it('null si delta sous tolérance', () => {
    expect(formatDistanceDelta(5, 5.001, 'course', 'fr')).toBeNull()
  })
})

describe('formatPaceDelta', () => {
  it('course : delta au format mm:ss + unit min/km', () => {
    // 5:00 → 4:55 : delta -0.0833 min/km = -5 sec/km → { "−0:05", "min/km" }
    expect(formatPaceDelta(5.0, 4.9167, 'course', 'fr')).toEqual({
      value: `${MINUS_SIGN}0:05`,
      unit: 'min/km',
    })
    expect(formatPaceDelta(4.5, 4.7, 'course', 'fr')).toEqual({ value: '+0:12', unit: 'min/km' })
    // > 1 min d'écart (par exemple 65 sec) → "+1:05" + "min/km"
    expect(formatPaceDelta(5.0, 6.0833, 'course', 'fr')).toEqual({ value: '+1:05', unit: 'min/km' })
  })

  it('vélo : delta en km/h, 1 décimale', () => {
    expect(formatPaceDelta(28, 30, 'velo', 'fr')).toEqual({ value: '+2', unit: 'km/h' })
    expect(formatPaceDelta(30, 28.5, 'velo', 'fr')).toEqual({ value: `${MINUS_SIGN}1,5`, unit: 'km/h' })
  })

  it('natation : delta au format mm:ss + unit min/100m', () => {
    expect(formatPaceDelta(2.0, 2.0833, 'natation', 'fr')).toEqual({ value: '+0:05', unit: 'min/100m' })
  })

  it('null si target ou actual null', () => {
    expect(formatPaceDelta(null, 4.9, 'course', 'fr')).toBeNull()
    expect(formatPaceDelta(5, null, 'course', 'fr')).toBeNull()
  })

  it('null si delta sous tolérance', () => {
    expect(formatPaceDelta(5.0, 5.005, 'course', 'fr')).toBeNull()
    expect(formatPaceDelta(28, 28.04, 'velo', 'fr')).toBeNull()
  })
})

describe('formatElevationDelta', () => {
  it('+/− entier', () => {
    expect(formatElevationDelta(200, 212)).toEqual({ value: '+12', unit: 'm' })
    expect(formatElevationDelta(200, 188)).toEqual({ value: `${MINUS_SIGN}12`, unit: 'm' })
  })

  it('null si delta = 0', () => {
    expect(formatElevationDelta(200, 200)).toBeNull()
    expect(formatElevationDelta(200, 200.3)).toBeNull()
  })
})

describe('computeActualPace', () => {
  it('course : minutes/km', () => {
    expect(computeActualPace('course', 50, 10)).toBe(5)
  })

  it('vélo : km/h', () => {
    expect(computeActualPace('velo', 60, 30)).toBe(30)
  })

  it('natation : minutes/100m', () => {
    expect(computeActualPace('natation', 50, 2)).toBe(2.5)
  })

  it('null si l\'un est null ou ≤ 0', () => {
    expect(computeActualPace('course', null, 5)).toBeNull()
    expect(computeActualPace('course', 30, null)).toBeNull()
    expect(computeActualPace('course', 0, 5)).toBeNull()
    expect(computeActualPace('course', 30, 0)).toBeNull()
  })
})

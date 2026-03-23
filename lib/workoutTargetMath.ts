import type { SportType } from '@/types/database'

/**
 * Calcule la durée (min) à partir de la distance (km) et de l'allure, selon le sport.
 * Aligné sur `useWorkoutFormReducer` (course / vélo / natation).
 */
export function computeDurationMinutesFromDistancePace(
  sportType: SportType,
  distanceKm: number,
  pace: number
): number | null {
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || !Number.isFinite(pace) || pace <= 0) return null
  if (sportType === 'course') {
    return Math.round(distanceKm * pace)
  }
  if (sportType === 'velo') {
    return Math.round((distanceKm / pace) * 60)
  }
  if (sportType === 'natation') {
    const distanceM = distanceKm * 1000
    return Math.round((distanceM / 100) * pace)
  }
  return null
}

/**
 * Calcule la distance (km) à partir de la durée (min) et de l'allure.
 */
export function computeDistanceKmFromDurationPace(
  sportType: SportType,
  durationMinutes: number,
  pace: number
): number | null {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || !Number.isFinite(pace) || pace <= 0)
    return null
  if (sportType === 'course') {
    return Number((durationMinutes / pace).toFixed(2))
  }
  if (sportType === 'velo') {
    return Number(((durationMinutes / 60) * pace).toFixed(2))
  }
  if (sportType === 'natation') {
    const distanceKm = ((durationMinutes / pace) * 100) / 1000
    return Number(distanceKm.toFixed(3))
  }
  return null
}

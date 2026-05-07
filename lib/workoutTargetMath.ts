import type { SportType } from '@/types/database'
import { workoutPaceIsRunningStyle } from '@/lib/sportsRegistry'

/** Arrondi distance en km (affichage / état formulaire) lors d'un calcul via allure — 1 décimale. */
export function roundDistanceKmFromPaceCalc(km: number): number {
  return Number(km.toFixed(1))
}

/**
 * Allure ou vitesse dérivée quand durée et distance sont toutes deux renseignées.
 * — Course / trail / patin / skis / rando : min/km
 * — Vélo / canot / triathlon : km/h
 * — Natation : min/100 m (distance en km en interne)
 */
export function computePaceFromDurationAndDistance(
  sportType: SportType,
  durationMinutes: number,
  distanceKm: number
): number | null {
  if (
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0 ||
    !Number.isFinite(distanceKm) ||
    distanceKm <= 0
  ) {
    return null
  }
  if (workoutPaceIsRunningStyle(sportType)) {
    return durationMinutes / distanceKm
  }
  if (sportType === 'velo' || sportType === 'canot' || sportType === 'triathlon') {
    return (distanceKm / durationMinutes) * 60
  }
  if (sportType === 'natation') {
    const distanceM = distanceKm * 1000
    return durationMinutes / (distanceM / 100)
  }
  return null
}

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
  if (workoutPaceIsRunningStyle(sportType)) {
    return Math.round(distanceKm * pace)
  }
  if (sportType === 'velo' || sportType === 'triathlon') {
    return Math.round((distanceKm / pace) * 60)
  }
  if (sportType === 'canot') {
    // Canot: vitesse type vélo (km/h)
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
  if (sportType === 'course' || sportType === 'trail') {
    return roundDistanceKmFromPaceCalc(durationMinutes / pace)
  }
  if (sportType === 'velo' || sportType === 'triathlon') {
    return roundDistanceKmFromPaceCalc((durationMinutes / 60) * pace)
  }
  if (sportType === 'canot') {
    // Canot: vitesse type vélo (km/h)
    return roundDistanceKmFromPaceCalc((durationMinutes / 60) * pace)
  }
  if (sportType === 'ice_skating' || sportType === 'nordic_ski' || sportType === 'backcountry_ski' || sportType === 'randonnee') {
    return roundDistanceKmFromPaceCalc(durationMinutes / pace)
  }
  if (sportType === 'natation') {
    const distanceKm = ((durationMinutes / pace) * 100) / 1000
    return roundDistanceKmFromPaceCalc(distanceKm)
  }
  return null
}

/**
 * Formatage Objectif / Réalisé / deltas pour la modale workout (US1–US4 — refonte synthèse).
 * Module pur, sans dépendance React. Testable unitairement.
 *
 * Règles produit :
 * - Sport time-only (musculation, escalade, méditation, surf, golf, yoga) : seule la ligne Temps
 *   apparaît dans les deux cartes.
 * - Allure réalisée : non stockée, dérivée à la volée via computePaceFromDurationAndDistance.
 * - Carte Réalisé visible ssi status='completed' ET au moins un actual_* effectif non NULL.
 * - Live preview (US4 athlète) : si liveActual* est fourni (même null), il prend le pas sur
 *   la valeur persistée actual_*.
 */

import type { SportType, Workout } from '@/types/database'
import {
  workoutHasElevationField,
  workoutHasPaceField,
  workoutIsTimeOnlySport,
  workoutPaceIsRunningStyle,
} from '@/lib/sportsRegistry'
import { computePaceFromDurationAndDistance } from '@/lib/workoutTargetMath'

/** Locale supportée pour la localisation des décimales (séparateur `,` FR / `.` EN). */
export type WorkoutLocale = 'fr' | 'en'

/** Caractère minus typographique (U+2212), cohérent avec les chiffres et plus large que `-` ASCII. */
export const MINUS_SIGN = '\u2212'

/** Tolérance utilisée pour décider si un delta arrondi vaut 0. */
const DELTA_TOLERANCE_KM = 0.005
const DELTA_TOLERANCE_KMH = 0.05
const DELTA_TOLERANCE_PACE_MINUTES_PER_KM = 0.0083 // ~0,5 sec/km
const DELTA_TOLERANCE_PACE_MINUTES_PER_100M = 0.0083 // ~0,5 sec/100m

/** Snapshot des valeurs réalisées effectives (live override si fourni, sinon persisté). */
export type EffectiveActualMetrics = {
  durationMinutes: number | null
  distanceKm: number | null
  elevationM: number | null
}

export type LiveActualMetrics = {
  durationMinutes?: number | null
  distanceKm?: number | null
  elevationM?: number | null
}

/**
 * Résout les valeurs réalisées effectives :
 * - si live[key] === undefined → utilise workout.actual_*
 * - sinon (live[key] est number ou null) → utilise live[key]
 */
export function getEffectiveActualMetrics(
  workout: Pick<Workout, 'actual_duration_minutes' | 'actual_distance_km' | 'actual_elevation_m'>,
  live?: LiveActualMetrics
): EffectiveActualMetrics {
  const duration =
    live?.durationMinutes !== undefined ? live.durationMinutes : workout.actual_duration_minutes ?? null
  const distance =
    live?.distanceKm !== undefined ? live.distanceKm : workout.actual_distance_km ?? null
  const elevation =
    live?.elevationM !== undefined ? live.elevationM : workout.actual_elevation_m ?? null
  return {
    durationMinutes: normalizeNullableNumber(duration),
    distanceKm: normalizeNullableNumber(distance),
    elevationM: normalizeNullableNumber(elevation),
  }
}

/** Carte Réalisé visible : status completed + au moins un actual_* effectif non NULL. */
export function shouldShowActualCard(
  workout: Pick<Workout, 'status' | 'actual_duration_minutes' | 'actual_distance_km' | 'actual_elevation_m'>,
  live?: LiveActualMetrics
): boolean {
  if ((workout.status ?? 'planned') !== 'completed') return false
  const e = getEffectiveActualMetrics(workout, live)
  return e.durationMinutes !== null || e.distanceKm !== null || e.elevationM !== null
}

/** Allure réalisée dérivée (jamais stockée). Null si non calculable. */
export function computeActualPace(
  sportType: SportType,
  durationMinutes: number | null,
  distanceKm: number | null
): number | null {
  if (durationMinutes === null || distanceKm === null) return null
  if (durationMinutes <= 0 || distanceKm <= 0) return null
  return computePaceFromDurationAndDistance(sportType, durationMinutes, distanceKm)
}

// ─────────────────────────────────────────────────────────────────────────
// Formats absolus
// ─────────────────────────────────────────────────────────────────────────

/** "1h30" / "45 min" / "1h05". Cohérent avec l'affichage existant des targets. */
export function formatDurationHM(minutes: number): string {
  const total = Math.max(0, Math.round(minutes))
  if (total < 60) return `${total} min`
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${h}h${String(m).padStart(2, '0')}`
}

/** Distance pour course/vélo/triathlon/canot/skis/randonnée/glace ou en m pour natation. */
export function formatDistance(distanceKm: number, sportType: SportType, locale: WorkoutLocale): string {
  if (sportType === 'natation') {
    return `${Math.round(distanceKm * 1000)} m`
  }
  const formatter = new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `${formatter.format(distanceKm)} km`
}

/** D+ en mètres. */
export function formatElevation(elevationM: number): string {
  return `${Math.round(elevationM)} m`
}

/** Allure / vitesse, format absolu, sans unité — l'unité est rendue par l'UI (séparée pour styling). */
export function formatPaceValue(pace: number, sportType: SportType, locale: WorkoutLocale): string {
  if (workoutPaceIsRunningStyle(sportType)) {
    return formatRunningPace(pace)
  }
  if (sportType === 'velo' || sportType === 'triathlon' || sportType === 'canot') {
    const formatter = new Intl.NumberFormat(intlLocale(locale), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })
    return formatter.format(pace)
  }
  if (sportType === 'natation') {
    return formatRunningPace(pace) // mm:ss
  }
  const formatter = new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  })
  return formatter.format(pace)
}

/** "5:00" depuis 5.0 min/km — utilisé course/trail/skis/glace/randonnée/natation. */
function formatRunningPace(paceMinutes: number): string {
  if (!Number.isFinite(paceMinutes) || paceMinutes <= 0) return '0:00'
  const totalSeconds = Math.round(paceMinutes * 60)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// ─────────────────────────────────────────────────────────────────────────
// Deltas (chips)
// ─────────────────────────────────────────────────────────────────────────

/**
 * Type de retour pour les chips delta : null → ne pas afficher la chip.
 *
 * `value` = signe + nombre (ex. "+0:13", "−2", "+1h05").
 * `unit`  = unité affichée plus discrète à droite (ex. "min/km", "km/h", "km", "m", "min").
 *           Vide ("") quand l'unité est embarquée dans la valeur (ex. "+1h05").
 *           Le composant ajoute un espace visuel via `ml-0.5` / `ml-1`.
 */
export type DeltaChip = { value: string; unit: string } | null

/** Delta durée : "+5 min" / "−2 min" / "+1h05". Null si delta arrondi = 0 ou inputs NULL. */
export function formatDurationDelta(
  targetMinutes: number | null,
  actualMinutes: number | null
): DeltaChip {
  if (targetMinutes === null || actualMinutes === null) return null
  const delta = Math.round(actualMinutes - targetMinutes)
  if (delta === 0) return null
  const sign = delta > 0 ? '+' : MINUS_SIGN
  const abs = Math.abs(delta)
  if (abs < 60) return { value: `${sign}${abs}`, unit: 'min' }
  const h = Math.floor(abs / 60)
  const m = abs % 60
  return { value: `${sign}${h}h${String(m).padStart(2, '0')}`, unit: '' }
}

/** Delta distance : "+0,12 km" course/vélo (2 déc.) / "+150 m" natation (entier). */
export function formatDistanceDelta(
  targetKm: number | null,
  actualKm: number | null,
  sportType: SportType,
  locale: WorkoutLocale
): DeltaChip {
  if (targetKm === null || actualKm === null) return null
  const delta = actualKm - targetKm
  if (Math.abs(delta) < DELTA_TOLERANCE_KM) return null
  if (sportType === 'natation') {
    const meters = Math.round(delta * 1000)
    if (meters === 0) return null
    return { value: `${meters > 0 ? '+' : MINUS_SIGN}${Math.abs(meters)}`, unit: 'm' }
  }
  const formatter = new Intl.NumberFormat(intlLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  const sign = delta > 0 ? '+' : MINUS_SIGN
  return { value: `${sign}${formatter.format(Math.abs(delta))}`, unit: 'km' }
}

/** Delta allure / vitesse : format selon sport. */
export function formatPaceDelta(
  targetPace: number | null,
  actualPace: number | null,
  sportType: SportType,
  locale: WorkoutLocale
): DeltaChip {
  if (targetPace === null || actualPace === null) return null
  const delta = actualPace - targetPace
  if (workoutPaceIsRunningStyle(sportType)) {
    if (Math.abs(delta) < DELTA_TOLERANCE_PACE_MINUTES_PER_KM) return null
    const formatted = formatPaceDeltaMMSS(delta)
    return formatted === null ? null : { value: formatted, unit: 'min/km' }
  }
  if (sportType === 'natation') {
    if (Math.abs(delta) < DELTA_TOLERANCE_PACE_MINUTES_PER_100M) return null
    const formatted = formatPaceDeltaMMSS(delta)
    return formatted === null ? null : { value: formatted, unit: 'min/100m' }
  }
  if (sportType === 'velo' || sportType === 'triathlon' || sportType === 'canot') {
    if (Math.abs(delta) < DELTA_TOLERANCE_KMH) return null
    const formatter = new Intl.NumberFormat(intlLocale(locale), {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    })
    const sign = delta > 0 ? '+' : MINUS_SIGN
    return { value: `${sign}${formatter.format(Math.abs(delta))}`, unit: 'km/h' }
  }
  return null
}

/** Delta dénivelé : "+12 m" / "−5 m". */
export function formatElevationDelta(targetM: number | null, actualM: number | null): DeltaChip {
  if (targetM === null || actualM === null) return null
  const delta = Math.round(actualM - targetM)
  if (delta === 0) return null
  return { value: `${delta > 0 ? '+' : MINUS_SIGN}${Math.abs(delta)}`, unit: 'm' }
}

// ─────────────────────────────────────────────────────────────────────────
// Décisions d'affichage par ligne
// ─────────────────────────────────────────────────────────────────────────

/** Une ligne Objectif est affichée si la valeur est strictement positive (> 0). */
export function isPositiveTarget(value: number | null | undefined): value is number {
  return typeof value === 'number' && value > 0
}

/** Une ligne Réalisé (hors allure) est affichée si la valeur est non NULL et ≥ 0. */
export function isRenderableActual(value: number | null | undefined): value is number {
  return typeof value === 'number' && value >= 0
}

/** Sport supporte la ligne distance dans la synthèse. */
export function summaryHasDistance(sportType: SportType): boolean {
  return !workoutIsTimeOnlySport(sportType)
}

/** Sport supporte la ligne allure / vitesse dans la synthèse. */
export function summaryHasPace(sportType: SportType): boolean {
  return workoutHasPaceField(sportType)
}

/** Sport supporte la ligne D+ dans la synthèse. */
export function summaryHasElevation(sportType: SportType): boolean {
  return workoutHasElevationField(sportType)
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers internes
// ─────────────────────────────────────────────────────────────────────────

/** Delta allure (course/natation) au format `±M:SS`. Null si seconds = 0 après arrondi. */
function formatPaceDeltaMMSS(deltaMinutes: number): string | null {
  const totalSeconds = Math.round(Math.abs(deltaMinutes) * 60)
  if (totalSeconds === 0) return null
  const sign = deltaMinutes > 0 ? '+' : MINUS_SIGN
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${sign}${m}:${String(s).padStart(2, '0')}`
}

function normalizeNullableNumber(v: number | null | undefined): number | null {
  if (v === null || v === undefined) return null
  if (typeof v !== 'number' || !Number.isFinite(v)) return null
  return v
}

function intlLocale(locale: WorkoutLocale): string {
  return locale === 'fr' ? 'fr-FR' : 'en-US'
}

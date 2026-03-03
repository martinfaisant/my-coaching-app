import type { Goal } from '@/types/database'

const MAX_NOTE_LENGTH = 500

/**
 * Indique si l'objectif a un résultat enregistré (les trois champs temps sont renseignés).
 */
export function hasGoalResult(goal: Goal): boolean {
  return (
    goal.result_time_hours != null &&
    goal.result_time_minutes != null &&
    goal.result_time_seconds != null
  )
}

/**
 * Formate le temps du résultat pour l'affichage (ex. "3h42", "1h05min30s").
 */
export function formatGoalResultTime(goal: Goal): string {
  if (!hasGoalResult(goal)) return ''
  const h = goal.result_time_hours ?? 0
  const m = goal.result_time_minutes ?? 0
  const s = goal.result_time_seconds ?? 0
  const parts: string[] = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(s > 0 ? `${String(m).padStart(2, '0')}min` : `${m}`)
  if (s > 0) parts.push(`${String(s).padStart(2, '0')}s`)
  return parts.join('')
}

/**
 * Retourne la place formatée en ordinal (ex. 24 → "24e" pour FR, "24th" pour EN).
 * À utiliser avec la locale pour l'affichage.
 */
export function formatGoalResultPlaceOrdinal(place: number, locale: string): string {
  if (place <= 0) return String(place)
  if (locale === 'fr') return `${place}e`
  // EN: 1st, 2nd, 3rd, 4th, 21st, 22nd, 23rd, etc.
  const n = place % 100
  if (n >= 11 && n <= 13) return `${place}th`
  switch (place % 10) {
    case 1: return `${place}st`
    case 2: return `${place}nd`
    case 3: return `${place}rd`
    default: return `${place}th`
  }
}

export { MAX_NOTE_LENGTH }

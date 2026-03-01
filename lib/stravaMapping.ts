/**
 * Mapping type Strava (API) → sport_type app.
 * Utilisé à l'import (devices) et pour la règle « fait » même jour / même type (US6).
 * Référence : design DESIGN_WORKOUT_STATUS.md §3.
 */
import type { SportType } from '@/types/database'

export function mapStravaTypeToSportType(stravaType: string): SportType {
  const t = (stravaType || '').toLowerCase()
  if (t.includes('run') || t.includes('virtualrun')) return 'course'
  if (t.includes('ride') || t.includes('virtualride') || t.includes('ebike') || t.includes('velomobile')) return 'velo'
  if (t.includes('swim')) return 'natation'
  if (t.includes('yoga') || t.includes('weight') || t.includes('workout') || t.includes('crossfit')) return 'musculation'
  if (t.includes('nordic')) return 'nordic_ski'
  if (t.includes('backcountry')) return 'backcountry_ski'
  if (t.includes('iceskate') || t.includes('ice_skate') || t.includes('ice skate')) return 'ice_skating'
  if (t.includes('ski') && !t.includes('alpine') && !t.includes('roller')) return 'nordic_ski'
  return 'course'
}

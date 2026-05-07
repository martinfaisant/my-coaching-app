/**
 * Options centralisées pour sports coachés / pratiqués.
 * Aligné avec profile/actions.ts et lib/sportStyles.
 * 
 * Note: For translated options, use the hooks from @/lib/hooks/useSportsOptions
 * - useCoachedSportsOptions() for coached sports with translated labels
 * - usePracticedSportsOptions() for practiced sports with translated labels
 */

import { PERSISTED_WORKOUT_SPORT_TYPES, type PersistedWorkoutSportType } from '@/lib/sportsRegistry'

/**
 * Sports coachés : liste unifiée avec les sports persistés en BDD (`sport_type`).
 * Objectif : un seul référentiel (mêmes sports que la création de séances).
 */
export const COACHED_SPORTS_VALUES = PERSISTED_WORKOUT_SPORT_TYPES
export const PRACTICED_SPORTS_VALUES = [
  'course',
  'velo',
  'natation',
  'musculation',
  'yoga',
  'meditation',
  'escalade',
  'surf',
  'golf',
  'canot',
  'trail',
  'randonnee',
  'nordic_ski',
  'backcountry_ski',
  'ice_skating',
  'triathlon',
] as const

export type CoachedSportValue = PersistedWorkoutSportType
export type PracticedSportValue = (typeof PRACTICED_SPORTS_VALUES)[number]

export const LANGUAGES_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'zh', label: '中文' },
] as const

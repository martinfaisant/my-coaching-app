/**
 * Options centralisées pour sports coachés / pratiqués.
 * Aligné avec profile/actions.ts et lib/sportStyles.
 */
import type { SportType } from './sportStyles'
import { SPORT_LABELS } from './sportStyles'

export const COACHED_SPORTS_VALUES = ['course_route', 'trail', 'triathlon', 'velo'] as const
export const PRACTICED_SPORTS_VALUES = ['course', 'velo', 'natation', 'musculation', 'trail', 'triathlon'] as const

export type CoachedSportValue = (typeof COACHED_SPORTS_VALUES)[number]
export type PracticedSportValue = (typeof PRACTICED_SPORTS_VALUES)[number]

export const COACHED_SPORTS_OPTIONS: { value: CoachedSportValue; label: string }[] =
  COACHED_SPORTS_VALUES.map((v) => ({ value: v, label: SPORT_LABELS[v as SportType] ?? v }))

export const PRACTICED_SPORTS_OPTIONS: { value: PracticedSportValue; label: string }[] =
  PRACTICED_SPORTS_VALUES.map((v) => ({ value: v, label: SPORT_LABELS[v as SportType] ?? v }))

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

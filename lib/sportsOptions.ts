/**
 * Options centralisées pour sports coachés / pratiqués.
 * Aligné avec profile/actions.ts et lib/sportStyles.
 * 
 * Note: For translated options, use the hooks from @/lib/hooks/useSportsOptions
 * - useCoachedSportsOptions() for coached sports with translated labels
 * - usePracticedSportsOptions() for practiced sports with translated labels
 */

export const COACHED_SPORTS_VALUES = ['course_route', 'trail', 'triathlon', 'velo'] as const
export const PRACTICED_SPORTS_VALUES = ['course', 'velo', 'natation', 'musculation', 'trail', 'triathlon'] as const

export type CoachedSportValue = (typeof COACHED_SPORTS_VALUES)[number]
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

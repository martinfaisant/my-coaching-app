import { useSportLabel } from './useSportLabel'
import { COACHED_SPORTS_VALUES, PRACTICED_SPORTS_VALUES } from '@/lib/sportsOptions'

/**
 * Hook to get translated coached sports options.
 * Returns an array of {value, label} objects with translated labels.
 * 
 * @example
 * const options = useCoachedSportsOptions()
 * // [{ value: 'course_route', label: 'Course à pied' }, ...]
 */
export function useCoachedSportsOptions() {
  const getSportLabel = useSportLabel()
  return COACHED_SPORTS_VALUES.map(v => ({
    value: v,
    label: getSportLabel(v)
  }))
}

/**
 * Hook to get translated practiced sports options.
 * Returns an array of {value, label} objects with translated labels.
 * 
 * @example
 * const options = usePracticedSportsOptions()
 * // [{ value: 'course', label: 'Course' }, ...]
 */
export function usePracticedSportsOptions() {
  const getSportLabel = useSportLabel()
  return PRACTICED_SPORTS_VALUES.map(v => ({
    value: v,
    label: getSportLabel(v)
  }))
}

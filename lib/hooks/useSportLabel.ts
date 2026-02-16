import { useTranslations } from 'next-intl'
import { SPORT_TRANSLATION_KEYS, type SportType } from '@/lib/sportStyles'

/**
 * Hook to get translated sport labels in Client Components.
 * Returns a function that takes a sport type and returns its translated label.
 * 
 * @example
 * const getSportLabel = useSportLabel()
 * const label = getSportLabel('course') // "Course" in FR, "Running" in EN
 */
export function useSportLabel() {
  const tSports = useTranslations('sports')
  
  return (sportType: SportType | string): string => {
    const sportKey = sportType as SportType
    const translationKey = SPORT_TRANSLATION_KEYS[sportKey]
    return translationKey ? tSports(translationKey) : sportType
  }
}

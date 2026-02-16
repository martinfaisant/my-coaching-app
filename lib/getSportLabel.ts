import { getTranslations } from 'next-intl/server'
import { SPORT_TRANSLATION_KEYS, type SportType } from '@/lib/sportStyles'

/**
 * Helper function to get translated sport labels in Server Components.
 * 
 * @example
 * const label = await getSportLabel('course') // "Course" in FR, "Running" in EN
 */
export async function getSportLabel(sportType: SportType | string): Promise<string> {
  const tSports = await getTranslations('sports')
  const sportKey = sportType as SportType
  const translationKey = SPORT_TRANSLATION_KEYS[sportKey]
  return translationKey ? tSports(translationKey) : sportType
}

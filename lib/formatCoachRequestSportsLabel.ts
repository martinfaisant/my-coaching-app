import { SPORT_TRANSLATION_KEYS, type SportType } from '@/lib/sportStyles'

const SPORT_KEY_SET = new Set<string>(Object.keys(SPORT_TRANSLATION_KEYS))

/**
 * Formate la liste des sports d’une demande (clés CSV) en libellés traduits.
 */
export function formatCoachRequestSportsLabel(
  sportPracticedCsv: string,
  translateSport: (key: string) => string,
  separator: string = ' · ',
): string {
  const keys = sportPracticedCsv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  const labels = keys.map((key) => {
    if (SPORT_KEY_SET.has(key)) {
      return translateSport(SPORT_TRANSLATION_KEYS[key as SportType])
    }
    return key
  })

  return labels.length > 0 ? labels.join(separator) : '—'
}

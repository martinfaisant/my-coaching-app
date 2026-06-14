/** Formatage note coach (1 décimale, séparateur selon locale FR/EN). */
export function formatCoachRating(locale: string, value: number): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value)
}

import type { AthleteStatsMetric } from '@/lib/athleteStatsVolume'
import type { SportType } from '@/types/database'

/**
 * Formate une valeur d’axe Y pour le graphique volume (sans préfixe libellé métrique dans la valeur).
 */
export function formatAthleteStatsMetricValue(
  value: number,
  metric: AthleteStatsMetric,
  sport: SportType,
  locale: string,
): string {
  if (metric === 'time') {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(value)
  }
  if (metric === 'distance') {
    if (sport === 'natation') {
      return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
    }
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(value)
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
}

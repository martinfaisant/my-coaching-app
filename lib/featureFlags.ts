/**
 * Feature flags produit (désactivés par défaut sauf mention explicite).
 */

/** Connexion Strava / page Appareils connectés (athlète). */
export function isAthleteStravaDevicesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_ATHLETE_STRAVA_DEVICES === 'true'
}

/** Chemin calendrier dashboard selon locale next-intl. */
export function getDashboardCalendarPath(locale: 'en' | 'fr' = 'fr'): string {
  return locale === 'en' ? '/en/dashboard/calendar' : '/dashboard/calendar'
}

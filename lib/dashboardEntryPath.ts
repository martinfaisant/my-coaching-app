import type { Profile } from '@/types/database'

/**
 * Chemin relatif (sans préfixe locale) de la page d'entrée dashboard selon le profil.
 * Aligné sur la logique historique de `app/[locale]/dashboard/page.tsx`.
 */
export function getDashboardEntryPath(profile: Pick<Profile, 'role' | 'coach_id'>): string {
  if (profile.role === 'athlete' && profile.coach_id) {
    return '/dashboard/calendar'
  }
  if (profile.role === 'athlete' && !profile.coach_id) {
    return '/dashboard/find-coach'
  }
  if (profile.role === 'coach') {
    return '/dashboard/athletes'
  }
  if (profile.role === 'admin') {
    return '/dashboard/admin/members'
  }
  return '/dashboard/calendar'
}

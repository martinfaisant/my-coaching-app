/**
 * Configuration centralisée des liens de navigation du dashboard.
 * Source de vérité pour le menu dynamique (athlète / coach / admin).
 * Utilisé par DashboardTopBar et le contenu du Drawer mobile.
 */

export type NavItem = {
  href: string
  i18nKey: string
  /** Si false, actif quand pathname.startsWith(href). Défaut true = pathname === href */
  exact?: boolean
}

export type ProfileNavInput = {
  role: string
  coach_id?: string | null
}

export function getDashboardNavItems(profile: ProfileNavInput): NavItem[] {
  if (profile.role === 'athlete') {
    const items: NavItem[] = []
    if (!profile.coach_id) {
      items.push({ href: '/dashboard/find-coach', i18nKey: 'findCoach' })
    }
    items.push({ href: '/dashboard/calendar', i18nKey: 'calendar' })
    items.push({ href: '/dashboard/objectifs', i18nKey: 'goals' })
    items.push({ href: '/dashboard/devices', i18nKey: 'devices' })
    if (profile.coach_id) {
      items.push({ href: '/dashboard/coach', i18nKey: 'myCoach' })
    }
    items.push({ href: '/dashboard/subscriptions/history', i18nKey: 'subscriptionHistory' })
    return items
  }

  if (profile.role === 'coach') {
    return [
      { href: '/dashboard/athletes', i18nKey: 'athletes', exact: false },
      { href: '/dashboard/profile/offers', i18nKey: 'offers' },
      { href: '/dashboard/subscriptions', i18nKey: 'subscriptions' },
    ]
  }

  if (profile.role === 'admin') {
    return [
      { href: '/dashboard/admin/members', i18nKey: 'members' },
      { href: '/dashboard/admin/design-system', i18nKey: 'designSystem' },
    ]
  }

  return []
}

/** Retourne true si pathname correspond à l'item (page courante). */
export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact === false) {
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }
  return pathname === item.href
}

/**
 * Retourne la clé i18n du titre de la page courante (namespace navigation).
 * Utilisé pour afficher le titre dans la barre sur mobile.
 */
export function getPageTitleI18nKey(pathname: string, navItems: NavItem[]): string {
  if (pathname === '/dashboard/profile') return 'profile'
  const active = navItems.find((item) => isNavItemActive(pathname, item))
  if (active) return active.i18nKey
  if (pathname.startsWith('/dashboard/athletes/')) return 'athletes'
  if (pathname.endsWith('/admin/design-system') || pathname === '/dashboard/admin/design-system') return 'designSystem'
  if (pathname === '/dashboard/admin/members') return 'members'
  return 'dashboard'
}

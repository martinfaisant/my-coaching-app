/**
 * Configuration centralisée des liens de navigation du dashboard.
 * Source de vérité pour le menu dynamique (athlète / coach / admin).
 * Utilisé par DashboardTopBar et le contenu du Drawer mobile.
 */

export type NavItem = {
  href: string
  i18nKey: NavigationI18nKey
  /** Si false, actif quand pathname.startsWith(href). Défaut true = pathname === href */
  exact?: boolean
}

export type NavigationI18nKey =
  | 'findCoach'
  | 'calendar'
  | 'goals'
  | 'stats'
  | 'devices'
  | 'myCoach'
  | 'subscriptionHistory'
  | 'myInformation'
  | 'athletes'
  | 'offers'
  | 'subscriptions'
  | 'members'
  | 'designSystem'
  | 'profile'
  | 'dashboard'
  | 'contactUs'
  | 'publicHome'
  | 'publicPrivacy'
  | 'publicTerms'
  | 'resetPasswordPage'

export type ProfileNavInput = {
  role: string
  coach_id?: string | null
}

/** Lien « Mes informations » (page profil) — menu compte athlète. */
export function getAthleteProfileNavItem(): NavItem {
  return { href: '/dashboard/profile', i18nKey: 'myInformation' }
}

/** Lien page contact public (menu compte athlète / coach). */
export function getContactPublicNavItem(): NavItem {
  return { href: '/contact', i18nKey: 'contactUs' }
}

/** Liens centrés barre desktop + tête du drawer (athlète). */
export function getAthletePrimaryNavItems(profile: ProfileNavInput): NavItem[] {
  if (profile.role !== 'athlete') return []
  const items: NavItem[] = []
  if (!profile.coach_id) {
    items.push({ href: '/dashboard/find-coach', i18nKey: 'findCoach' })
  }
  items.push({ href: '/dashboard/calendar', i18nKey: 'calendar' })
  items.push({ href: '/dashboard/stats', i18nKey: 'stats' })
  items.push({ href: '/dashboard/objectifs', i18nKey: 'goals' })
  return items
}

/** Entrées secondaires menu compte / milieu drawer (sans la ligne profil). */
export function getAthleteAccountNavItems(profile: ProfileNavInput): NavItem[] {
  if (profile.role !== 'athlete') return []
  const items: NavItem[] = [{ href: '/dashboard/devices', i18nKey: 'devices' }]
  if (profile.coach_id) {
    items.push({ href: '/dashboard/coach', i18nKey: 'myCoach' })
  }
  items.push({ href: '/dashboard/subscriptions/history', i18nKey: 'subscriptionHistory' })
  return items
}

/** Fusion pour titre mobile et rétrocompat `getDashboardNavItems` athlète. */
export function getAthleteNavItemsForPageTitle(profile: ProfileNavInput): NavItem[] {
  if (profile.role !== 'athlete') return []
  return [...getAthletePrimaryNavItems(profile), ...getAthleteAccountNavItems(profile)]
}

export function getDashboardNavItems(profile: ProfileNavInput): NavItem[] {
  if (profile.role === 'athlete') {
    return getAthleteNavItemsForPageTitle(profile)
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

/** Indique si la route courante correspond au menu compte (hors profil). */
export function isAthleteAccountSectionActive(pathname: string, profile: ProfileNavInput): boolean {
  if (profile.role !== 'athlete') return false
  return getAthleteAccountNavItems(profile).some((item) => isNavItemActive(pathname, item))
}

/** Retourne true si le trigger menu compte doit apparaître « actif » (profil ou section compte). */
export function isAthleteAccountMenuTriggerActive(
  pathname: string,
  profile: ProfileNavInput,
): boolean {
  if (profile.role !== 'athlete') return false
  if (pathname === '/dashboard/profile') return true
  return isAthleteAccountSectionActive(pathname, profile)
}

/** Trigger menu compte coach : profil ou page contact (liens du menu). */
export function isCoachAccountMenuTriggerActive(pathname: string): boolean {
  return pathname === '/dashboard/profile' || pathname === '/contact'
}

/** Retourne true si pathname correspond à l’item (page courante). */
export function isNavItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact === false) {
    return pathname === item.href || pathname.startsWith(item.href + '/')
  }
  return pathname === item.href
}

type PageTitleProfileContext = Pick<ProfileNavInput, 'role'> | null | undefined

/**
 * Retourne la clé i18n du titre de la page courante (namespace navigation).
 * Utilisé pour afficher le titre dans la barre sur mobile.
 * @param profile — si athlète sur `/dashboard/profile`, titre = `myInformation`.
 */
export function getPageTitleI18nKey(
  pathname: string,
  navItems: NavItem[],
  profile?: PageTitleProfileContext,
): NavigationI18nKey {
  if (pathname === '/dashboard/profile' && profile?.role === 'athlete') {
    return 'myInformation'
  }
  if (pathname === '/dashboard/profile') return 'profile'

  if (pathname === '/') return 'publicHome'
  if (pathname === '/contact') return 'contactUs'
  if (pathname === '/privacy') return 'publicPrivacy'
  if (pathname === '/terms') return 'publicTerms'
  if (pathname === '/reset-password') return 'resetPasswordPage'

  const active = navItems.find((item) => isNavItemActive(pathname, item))
  if (active) return active.i18nKey
  if (pathname.startsWith('/dashboard/athletes/')) return 'athletes'
  if (pathname.endsWith('/admin/design-system') || pathname === '/dashboard/admin/design-system') {
    return 'designSystem'
  }
  if (pathname === '/dashboard/admin/members') return 'members'
  return 'dashboard'
}

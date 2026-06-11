import { COACH_PLATFORM_SUBSCRIPTION_PATH } from '@/lib/coachPlatformCheckoutReturnPath'
import { isAthleteStravaDevicesEnabled } from '@/lib/featureFlags'

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
  | 'coachPlatformSubscription'

export type ProfileNavInput = {
  role: string
  coach_id?: string | null
}

/** Lien « Mes informations » (page profil) — menu compte athlète. */
export function getAthleteProfileNavItem(): NavItem {
  return { href: '/dashboard/profile', i18nKey: 'myInformation' }
}

/** Lien « Mon Abonnement MySportAlly » (abonnement plateforme coach). */
export function getCoachPlatformSubscriptionNavItem(): NavItem {
  return { href: COACH_PLATFORM_SUBSCRIPTION_PATH, i18nKey: 'coachPlatformSubscription' }
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

export type AthleteAccountNavOptions = {
  /** Surcharge tests / storybook ; défaut = feature flag Strava devices. */
  devicesEnabled?: boolean
}

/** Entrées secondaires menu compte / milieu drawer (sans la ligne profil). */
export function getAthleteAccountNavItems(
  profile: ProfileNavInput,
  options?: AthleteAccountNavOptions,
): NavItem[] {
  if (profile.role !== 'athlete') return []
  const items: NavItem[] = []
  const showDevices = options?.devicesEnabled ?? isAthleteStravaDevicesEnabled()
  if (showDevices) {
    items.push({ href: '/dashboard/devices', i18nKey: 'devices' })
  }
  if (profile.coach_id) {
    items.push({ href: '/dashboard/coach', i18nKey: 'myCoach' })
  }
  items.push({ href: '/dashboard/subscriptions/history', i18nKey: 'subscriptionHistory' })
  return items
}

/** Fusion pour titre mobile et rétrocompat `getDashboardNavItems` athlète. */
export function getAthleteNavItemsForPageTitle(
  profile: ProfileNavInput,
  options?: AthleteAccountNavOptions,
): NavItem[] {
  if (profile.role !== 'athlete') return []
  return [...getAthletePrimaryNavItems(profile), ...getAthleteAccountNavItems(profile, options)]
}

export function getDashboardNavItems(
  profile: ProfileNavInput,
  options?: AthleteAccountNavOptions,
): NavItem[] {
  if (profile.role === 'athlete') {
    return getAthleteNavItemsForPageTitle(profile, options)
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
export function isAthleteAccountSectionActive(
  pathname: string,
  profile: ProfileNavInput,
  options?: AthleteAccountNavOptions,
): boolean {
  if (profile.role !== 'athlete') return false
  return getAthleteAccountNavItems(profile, options).some((item) => isNavItemActive(pathname, item))
}

/** Retourne true si le trigger menu compte doit apparaître « actif » (profil ou section compte). */
export function isAthleteAccountMenuTriggerActive(
  pathname: string,
  profile: ProfileNavInput,
  options?: AthleteAccountNavOptions,
): boolean {
  if (profile.role !== 'athlete') return false
  if (pathname === '/dashboard/profile') return true
  return isAthleteAccountSectionActive(pathname, profile, options)
}

/** Trigger menu compte coach : profil, abonnement plateforme ou contact. */
export function isCoachAccountMenuTriggerActive(pathname: string): boolean {
  if (pathname === '/dashboard/profile' || pathname === '/contact') return true
  return isNavItemActive(pathname, getCoachPlatformSubscriptionNavItem())
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

  if (isNavItemActive(pathname, getCoachPlatformSubscriptionNavItem())) {
    return 'coachPlatformSubscription'
  }

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

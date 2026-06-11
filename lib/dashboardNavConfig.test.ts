import { describe, expect, it } from 'vitest'

import {
  getAthleteAccountNavItems,
  getAthleteNavItemsForPageTitle,
  getAthletePrimaryNavItems,
  getAthleteProfileNavItem,
  getDashboardNavItems,
  getPageTitleI18nKey,
  isAthleteAccountMenuTriggerActive,
  isNavItemActive,
} from '@/lib/dashboardNavConfig'

const athleteNoCoach = { role: 'athlete' as const, coach_id: null as string | null }
const athleteWithCoach = { role: 'athlete' as const, coach_id: 'c1' }
const devicesOn = { devicesEnabled: true as const }
const devicesOff = { devicesEnabled: false as const }

describe('getAthletePrimaryNavItems', () => {
  it('sans coach : Trouver mon coach, calendrier, statistiques, objectifs', () => {
    expect(getAthletePrimaryNavItems(athleteNoCoach).map((i) => i.i18nKey)).toEqual([
      'findCoach',
      'calendar',
      'stats',
      'goals',
    ])
  })
  it('avec coach : calendrier, statistiques, objectifs', () => {
    expect(getAthletePrimaryNavItems(athleteWithCoach).map((i) => i.i18nKey)).toEqual([
      'calendar',
      'stats',
      'goals',
    ])
  })
  it('non-athlète : liste vide', () => {
    expect(getAthletePrimaryNavItems({ role: 'coach' })).toEqual([])
  })
})

describe('getAthleteAccountNavItems', () => {
  it('devices activés, sans coach : appareils et historique (pas Mon coach)', () => {
    expect(getAthleteAccountNavItems(athleteNoCoach, devicesOn).map((i) => i.i18nKey)).toEqual([
      'devices',
      'subscriptionHistory',
    ])
  })
  it('devices activés, avec coach : appareils, Mon coach, historique', () => {
    expect(getAthleteAccountNavItems(athleteWithCoach, devicesOn).map((i) => i.i18nKey)).toEqual([
      'devices',
      'myCoach',
      'subscriptionHistory',
    ])
  })
  it('devices désactivés : pas d’entrée appareils', () => {
    expect(getAthleteAccountNavItems(athleteWithCoach, devicesOff).map((i) => i.i18nKey)).toEqual([
      'myCoach',
      'subscriptionHistory',
    ])
    expect(getAthleteAccountNavItems(athleteNoCoach, devicesOff).map((i) => i.i18nKey)).toEqual([
      'subscriptionHistory',
    ])
  })
})

describe('getAthleteNavItemsForPageTitle / getDashboardNavItems athlete', () => {
  it('fusionne primary + account (devices activés)', () => {
    const merged = getAthleteNavItemsForPageTitle(athleteWithCoach, devicesOn)
    expect(merged.map((i) => i.href)).toEqual([
      '/dashboard/calendar',
      '/dashboard/stats',
      '/dashboard/objectifs',
      '/dashboard/devices',
      '/dashboard/coach',
      '/dashboard/subscriptions/history',
    ])
    expect(getDashboardNavItems(athleteWithCoach, devicesOn)).toEqual(merged)
  })
  it('sans coach : find coach en tête puis le reste (devices activés)', () => {
    const merged = getAthleteNavItemsForPageTitle(athleteNoCoach, devicesOn)
    expect(merged[0].i18nKey).toBe('findCoach')
    expect(merged.map((i) => i.i18nKey)).toEqual([
      'findCoach',
      'calendar',
      'stats',
      'goals',
      'devices',
      'subscriptionHistory',
    ])
  })
  it('devices désactivés : pas de lien appareils', () => {
    const merged = getAthleteNavItemsForPageTitle(athleteWithCoach, devicesOff)
    expect(merged.map((i) => i.i18nKey)).toEqual([
      'calendar',
      'stats',
      'goals',
      'myCoach',
      'subscriptionHistory',
    ])
  })
})

describe('getAthleteProfileNavItem', () => {
  it('pointe vers profil avec clé myInformation', () => {
    expect(getAthleteProfileNavItem()).toEqual({
      href: '/dashboard/profile',
      i18nKey: 'myInformation',
    })
  })
})

describe('isNavItemActive', () => {
  it('exact par défaut : égalité stricte pathname', () => {
    expect(
      isNavItemActive('/dashboard/calendar', { href: '/dashboard/calendar', i18nKey: 'calendar' }),
    ).toBe(true)
    expect(
      isNavItemActive('/dashboard/calendar/week', {
        href: '/dashboard/calendar',
        i18nKey: 'calendar',
      }),
    ).toBe(false)
  })
  it('exact false : préfixe accepté', () => {
    expect(
      isNavItemActive('/dashboard/athletes/xyz', {
        href: '/dashboard/athletes',
        i18nKey: 'athletes',
        exact: false,
      }),
    ).toBe(true)
  })
})

describe('getPageTitleI18nKey', () => {
  const nav = getAthleteNavItemsForPageTitle(athleteWithCoach, devicesOn)

  it('profil athlète : myInformation', () => {
    expect(getPageTitleI18nKey('/dashboard/profile', nav, athleteWithCoach)).toBe('myInformation')
  })
  it('profil coach : profile', () => {
    expect(getPageTitleI18nKey('/dashboard/profile', [], { role: 'coach' })).toBe('profile')
  })
  it('devices : devices', () => {
    expect(getPageTitleI18nKey('/dashboard/devices', nav, athleteWithCoach)).toBe('devices')
  })
  it('sans nav active : dashboard', () => {
    expect(getPageTitleI18nKey('/dashboard/inconnu', nav, athleteWithCoach)).toBe('dashboard')
  })
})

describe('isAthleteAccountMenuTriggerActive', () => {
  it('actif sur profil', () => {
    expect(isAthleteAccountMenuTriggerActive('/dashboard/profile', athleteWithCoach)).toBe(true)
  })
  it('actif sur /dashboard/devices quand feature activée', () => {
    expect(isAthleteAccountMenuTriggerActive('/dashboard/devices', athleteWithCoach, devicesOn)).toBe(
      true,
    )
  })
  it('inactif sur /dashboard/devices quand feature désactivée', () => {
    expect(isAthleteAccountMenuTriggerActive('/dashboard/devices', athleteWithCoach, devicesOff)).toBe(
      false,
    )
  })
  it('inactif sur calendrier', () => {
    expect(isAthleteAccountMenuTriggerActive('/dashboard/calendar', athleteWithCoach)).toBe(false)
  })
  it('non athlète : false', () => {
    expect(isAthleteAccountMenuTriggerActive('/dashboard/profile', { role: 'coach' })).toBe(false)
  })
})

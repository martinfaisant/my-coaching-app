import { afterEach, describe, expect, it } from 'vitest'

import {
  getDashboardCalendarPath,
  isAthleteStravaDevicesEnabled,
} from '@/lib/featureFlags'

describe('isAthleteStravaDevicesEnabled', () => {
  const original = process.env.NEXT_PUBLIC_ENABLE_ATHLETE_STRAVA_DEVICES

  afterEach(() => {
    if (original === undefined) {
      delete process.env.NEXT_PUBLIC_ENABLE_ATHLETE_STRAVA_DEVICES
    } else {
      process.env.NEXT_PUBLIC_ENABLE_ATHLETE_STRAVA_DEVICES = original
    }
  })

  it('désactivé par défaut', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_ATHLETE_STRAVA_DEVICES
    expect(isAthleteStravaDevicesEnabled()).toBe(false)
  })

  it('activé uniquement si true explicite', () => {
    process.env.NEXT_PUBLIC_ENABLE_ATHLETE_STRAVA_DEVICES = 'true'
    expect(isAthleteStravaDevicesEnabled()).toBe(true)
  })

  it('désactivé pour toute autre valeur', () => {
    process.env.NEXT_PUBLIC_ENABLE_ATHLETE_STRAVA_DEVICES = 'false'
    expect(isAthleteStravaDevicesEnabled()).toBe(false)
  })
})

describe('getDashboardCalendarPath', () => {
  it('fr sans préfixe', () => {
    expect(getDashboardCalendarPath('fr')).toBe('/dashboard/calendar')
  })

  it('en avec préfixe', () => {
    expect(getDashboardCalendarPath('en')).toBe('/en/dashboard/calendar')
  })
})

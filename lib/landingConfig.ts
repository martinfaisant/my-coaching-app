export type LandingScreenshotId =
  | 'calendar-athlete'
  | 'workout-feedback'
  | 'stats'
  | 'find-coach'
  | 'calendar-coach'
  | 'workout-create'
  | 'coach-offers'

export type LandingShowcaseTabId =
  | 'calendarAthlete'
  | 'stats'
  | 'findCoach'
  | 'calendarCoach'
  | 'planSession'
  | 'coachOffers'

export type LandingAudience = 'athlete' | 'coach'

export type LandingShowcaseTabConfig = {
  id: LandingShowcaseTabId
  screenshotId: LandingScreenshotId
  audience: LandingAudience
  showPricingLink?: boolean
}

/** Ordre UI : 3 onglets athlète, 3 onglets coach (équilibre 50/50). */
export const LANDING_SHOWCASE_TABS: readonly LandingShowcaseTabConfig[] = [
  {
    id: 'calendarAthlete',
    screenshotId: 'calendar-athlete',
    audience: 'athlete',
  },
  {
    id: 'stats',
    screenshotId: 'stats',
    audience: 'athlete',
  },
  {
    id: 'findCoach',
    screenshotId: 'find-coach',
    audience: 'athlete',
  },
  {
    id: 'calendarCoach',
    screenshotId: 'calendar-coach',
    audience: 'coach',
  },
  {
    id: 'planSession',
    screenshotId: 'workout-create',
    audience: 'coach',
  },
  {
    id: 'coachOffers',
    screenshotId: 'coach-offers',
    audience: 'coach',
    showPricingLink: true,
  },
] as const

export const LANDING_HOW_IT_WORKS_STEPS = ['1', '2', '3'] as const

export type LandingPricingLinkContext =
  | 'hero'
  | 'coachCard'
  | 'showcaseOffers'
  | 'finalCta'

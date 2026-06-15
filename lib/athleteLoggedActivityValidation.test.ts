import { describe, expect, it } from 'vitest'
import { getAthleteLoggedActivityMetricsUi } from '@/lib/athleteLoggedActivityValidation'

describe('getAthleteLoggedActivityMetricsUi', () => {
  it('returns duration-only for time-only sports', () => {
    expect(getAthleteLoggedActivityMetricsUi('musculation')).toEqual({
      headingKey: 'form.activityRealizedMandatoryTime',
      requiredFields: { duration: true, distance: false, pace: false },
    })
  })

  it('returns time or distance for triathlon', () => {
    expect(getAthleteLoggedActivityMetricsUi('triathlon')).toEqual({
      headingKey: 'form.activityRealizedMandatoryTimeOrDistance',
      requiredFields: { duration: true, distance: true, pace: false },
    })
  })

  it('returns time or distance for canot', () => {
    expect(getAthleteLoggedActivityMetricsUi('canot')).toEqual({
      headingKey: 'form.activityRealizedMandatoryTimeOrDistance',
      requiredFields: { duration: true, distance: true, pace: false },
    })
  })

  it('returns distance and duration for pace-required sports', () => {
    expect(getAthleteLoggedActivityMetricsUi('course')).toEqual({
      headingKey: 'form.activityRealizedMandatoryDistanceAndTime',
      requiredFields: { duration: true, distance: true, pace: false },
    })

    expect(getAthleteLoggedActivityMetricsUi('velo')).toEqual({
      headingKey: 'form.activityRealizedMandatoryDistanceAndTime',
      requiredFields: { duration: true, distance: true, pace: false },
    })
  })
})

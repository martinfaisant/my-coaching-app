import { describe, expect, it } from 'vitest'

import { mapStravaTypeToSportType } from '@/lib/stravaMapping'

describe('stravaMapping', () => {
  it('maps running types to course', () => {
    expect(mapStravaTypeToSportType('Run')).toBe('course')
    expect(mapStravaTypeToSportType('VirtualRun')).toBe('course')
  })

  it('maps cycling types to velo', () => {
    expect(mapStravaTypeToSportType('Ride')).toBe('velo')
    expect(mapStravaTypeToSportType('eBike Ride')).toBe('velo')
    expect(mapStravaTypeToSportType('velomobile')).toBe('velo')
  })

  it('maps swimming types to natation', () => {
    expect(mapStravaTypeToSportType('Swim')).toBe('natation')
  })

  it('maps gym-ish types to musculation', () => {
    expect(mapStravaTypeToSportType('Yoga')).toBe('musculation')
    expect(mapStravaTypeToSportType('Weight Training')).toBe('musculation')
    expect(mapStravaTypeToSportType('crossfit')).toBe('musculation')
  })

  it('maps ski types', () => {
    expect(mapStravaTypeToSportType('Nordic Skating')).toBe('nordic_ski')
    expect(mapStravaTypeToSportType('Backcountry Ski')).toBe('backcountry_ski')
    expect(mapStravaTypeToSportType('Ice Skating')).toBe('ice_skating')
    expect(mapStravaTypeToSportType('ice skate')).toBe('ice_skating')
  })

  it('maps hike and walk to randonnee', () => {
    expect(mapStravaTypeToSportType('Hike')).toBe('randonnee')
    expect(mapStravaTypeToSportType('Walk')).toBe('randonnee')
  })

  it('maps trail run types to trail', () => {
    expect(mapStravaTypeToSportType('TrailRun')).toBe('trail')
    expect(mapStravaTypeToSportType('trail run')).toBe('trail')
    expect(mapStravaTypeToSportType('trail_run')).toBe('trail')
  })

  it('maps triathlon types', () => {
    expect(mapStravaTypeToSportType('Triathlon')).toBe('triathlon')
    expect(mapStravaTypeToSportType('virtualtriathlon')).toBe('triathlon')
  })

  it('defaults to course for unknown types', () => {
    expect(mapStravaTypeToSportType('SomethingElse')).toBe('course')
  })
})


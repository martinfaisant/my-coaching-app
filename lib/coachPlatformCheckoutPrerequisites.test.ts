import { describe, expect, it } from 'vitest'
import {
  areCoachPlatformCheckoutPrerequisitesMet,
  isCoachBillingAddressComplete,
  isCoachProfileNameComplete,
  normalizeCoachBillingAddressFields,
} from '@/lib/coachPlatformCheckoutPrerequisites'
import type { CoachBillingAddressFields } from '@/lib/stripeCoachPlatformBillingAddress'

const completeAddress: CoachBillingAddressFields = {
  line1: '123 Rue Example',
  line2: '',
  city: 'Montréal',
  postalCode: 'H2Y 1C6',
  provinceCode: 'QC',
}

describe('coachPlatformCheckoutPrerequisites', () => {
  describe('isCoachProfileNameComplete', () => {
    it('requires both first and last name', () => {
      expect(isCoachProfileNameComplete('Marie', 'Dupont')).toBe(true)
      expect(isCoachProfileNameComplete('Marie', '')).toBe(false)
      expect(isCoachProfileNameComplete('', 'Dupont')).toBe(false)
      expect(isCoachProfileNameComplete('  ', 'Dupont')).toBe(false)
    })
  })

  describe('isCoachBillingAddressComplete', () => {
    it('requires line1, city, postal and valid province', () => {
      expect(isCoachBillingAddressComplete(completeAddress)).toBe(true)
      expect(isCoachBillingAddressComplete({ ...completeAddress, line1: '' })).toBe(false)
      expect(isCoachBillingAddressComplete({ ...completeAddress, provinceCode: 'XX' })).toBe(false)
      expect(isCoachBillingAddressComplete(null)).toBe(false)
    })

    it('allows optional line2', () => {
      expect(isCoachBillingAddressComplete({ ...completeAddress, line2: 'Suite 4' })).toBe(true)
    })
  })

  describe('areCoachPlatformCheckoutPrerequisitesMet', () => {
    it('combines name and address rules', () => {
      expect(areCoachPlatformCheckoutPrerequisitesMet('A', 'B', completeAddress)).toBe(true)
      expect(areCoachPlatformCheckoutPrerequisitesMet('A', '', completeAddress)).toBe(false)
      expect(areCoachPlatformCheckoutPrerequisitesMet('A', 'B', null)).toBe(false)
    })
  })

  describe('normalizeCoachBillingAddressFields', () => {
    it('fills missing keys with empty strings', () => {
      expect(normalizeCoachBillingAddressFields(null)).toEqual({
        line1: '',
        line2: '',
        city: '',
        postalCode: '',
        provinceCode: '',
      })
    })
  })
})

import { describe, expect, it } from 'vitest'
import { getPasswordCriteria, isPasswordValid, PASSWORD_MIN_LENGTH } from '@/lib/passwordValidation'

describe('getPasswordCriteria', () => {
  it('returns all false for empty string', () => {
    expect(getPasswordCriteria('')).toEqual({
      minLength: false,
      lowercase: false,
      uppercase: false,
      digit: false,
      specialChar: false,
    })
  })

  it('detects min length at boundary', () => {
    expect(getPasswordCriteria('a'.repeat(PASSWORD_MIN_LENGTH - 1)).minLength).toBe(false)
    expect(getPasswordCriteria('a'.repeat(PASSWORD_MIN_LENGTH)).minLength).toBe(true)
  })

  it('detects lowercase', () => {
    expect(getPasswordCriteria('ABC123!').lowercase).toBe(false)
    expect(getPasswordCriteria('aBC123!').lowercase).toBe(true)
  })

  it('detects uppercase', () => {
    expect(getPasswordCriteria('abc123!').uppercase).toBe(false)
    expect(getPasswordCriteria('Abc123!').uppercase).toBe(true)
  })

  it('detects digit', () => {
    expect(getPasswordCriteria('Abcdefg!').digit).toBe(false)
    expect(getPasswordCriteria('Abcdef1!').digit).toBe(true)
  })

  it('detects special character (non-alphanumeric)', () => {
    expect(getPasswordCriteria('Abcdef12').specialChar).toBe(false)
    expect(getPasswordCriteria('Abcdef1!').specialChar).toBe(true)
    expect(getPasswordCriteria('Abcdef1é').specialChar).toBe(true)
  })
})

describe('isPasswordValid', () => {
  it('returns false when any criterion is missing', () => {
    expect(isPasswordValid('')).toBe(false)
    expect(isPasswordValid('password')).toBe(false)
    expect(isPasswordValid('PASSWORD1!')).toBe(false)
    expect(isPasswordValid('Passwor!')).toBe(false)
    expect(isPasswordValid('Passwor1')).toBe(false)
  })

  it('returns true for a valid password', () => {
    expect(isPasswordValid('MonMot2!')).toBe(true)
  })
})

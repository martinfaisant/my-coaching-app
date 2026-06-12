export const PASSWORD_MIN_LENGTH = 8

export type PasswordCriteria = {
  minLength: boolean
  lowercase: boolean
  uppercase: boolean
  digit: boolean
  specialChar: boolean
}

export type PasswordCriterionKey = keyof PasswordCriteria

const LOWERCASE_RE = /[a-z]/
const UPPERCASE_RE = /[A-Z]/
const DIGIT_RE = /\d/
const SPECIAL_CHAR_RE = /[^A-Za-z0-9]/

export function getPasswordCriteria(password: string): PasswordCriteria {
  return {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    lowercase: LOWERCASE_RE.test(password),
    uppercase: UPPERCASE_RE.test(password),
    digit: DIGIT_RE.test(password),
    specialChar: SPECIAL_CHAR_RE.test(password),
  }
}

export function isPasswordValid(password: string): boolean {
  const criteria = getPasswordCriteria(password)
  return (
    criteria.minLength &&
    criteria.lowercase &&
    criteria.uppercase &&
    criteria.digit &&
    criteria.specialChar
  )
}

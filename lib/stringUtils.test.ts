import { describe, expect, it } from 'vitest'

import { capitalize, getInitials, slugify, truncate } from '@/lib/stringUtils'

describe('stringUtils', () => {
  it('getInitials: full name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('getInitials: email', () => {
    expect(getInitials('john.doe@example.com')).toBe('JD')
  })

  it('getInitials: single word', () => {
    expect(getInitials('alice')).toBe('AL')
  })

  it('getInitials: empty string', () => {
    expect(getInitials('')).toBe('?')
  })

  it('capitalize: normalizes casing', () => {
    expect(capitalize('hELLo')).toBe('Hello')
  })

  it('truncate: leaves short strings unchanged', () => {
    expect(truncate('hi', 5)).toBe('hi')
  })

  it('truncate: truncates and adds ellipsis', () => {
    expect(truncate('hello world', 5)).toBe('hello...')
  })

  it('slugify: removes accents and normalizes separators', () => {
    expect(slugify('Entraînement Course à pied')).toBe('entrainement-course-a-pied')
    expect(slugify('  Hello__World  ')).toBe('hello-world')
  })
})


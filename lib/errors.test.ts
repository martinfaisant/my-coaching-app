import { describe, expect, it } from 'vitest'

import { createError, createSuccess, isError } from '@/lib/errors'

describe('errors', () => {
  it('createError / isError: returns an error result', () => {
    const result = createError('No access', 'FORBIDDEN')
    expect(isError(result)).toBe(true)
    if (isError(result)) {
      expect(result.code).toBe('FORBIDDEN')
      expect(result.error).toBe('No access')
    }
  })

  it('createSuccess: returns a success result', () => {
    const result = createSuccess({ ok: true })
    expect(isError(result)).toBe(false)
    if (!isError(result)) {
      expect(result.data).toEqual({ ok: true })
    }
  })
})


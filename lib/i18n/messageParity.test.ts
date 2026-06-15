import { describe, expect, it } from 'vitest'

import {
  assertMessageParity,
  formatMessageParityDiff,
  hasMessageParityDiff,
} from '@/lib/i18n/assertMessageParity'
import en from '@/messages/en.json'
import fr from '@/messages/fr.json'

describe('message parity (fr.json / en.json)', () => {
  it('has identical keys and array lengths in both locales', () => {
    const diff = assertMessageParity(fr, en)

    expect(
      hasMessageParityDiff(diff),
      formatMessageParityDiff(diff) || 'fr.json and en.json are in sync'
    ).toBe(false)
  })

  it('reports key differences', () => {
    const diff = assertMessageParity(
      { workouts: { validation: { onlyCoachCanDelete: 'FR' } } },
      { workouts: { validation: { onlyCoachCanEdit: 'EN' } } }
    )

    expect(diff.onlyInFr).toEqual(['workouts.validation.onlyCoachCanDelete'])
    expect(diff.onlyInEn).toEqual(['workouts.validation.onlyCoachCanEdit'])
    expect(formatMessageParityDiff(diff)).toContain('onlyCoachCanDelete')
  })
})

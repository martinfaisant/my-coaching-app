import { describe, expect, it } from 'vitest'

import { collectMessageKeys } from '@/lib/i18n/collectMessageKeys'

describe('collectMessageKeys', () => {
  it('flattens nested objects', () => {
    const info = collectMessageKeys({
      common: { save: 'Save', cancel: 'Cancel' },
      auth: { login: 'Login' },
    })

    expect([...info.keys].sort()).toEqual(['auth.login', 'common.cancel', 'common.save'])
  })

  it('records array leaf keys and lengths', () => {
    const info = collectMessageKeys({
      offers: {
        byPriceId: {
          price_abc: {
            features: ['a', 'b', 'c'],
          },
        },
      },
    })

    expect(info.keys.has('offers.byPriceId.price_abc.features')).toBe(true)
    expect(info.arrayLengths.get('offers.byPriceId.price_abc.features')).toBe(3)
  })
})

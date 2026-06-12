import { describe, expect, it } from 'vitest'

import { syncFeaturedHiddenInputs } from './offersFeaturedForm'

function createOffersForm(offerCount: number): HTMLFormElement {
  const form = document.createElement('form')
  for (let i = 0; i < offerCount; i++) {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = `offer_${i}_featured`
    input.value = ''
    form.appendChild(input)
  }
  return form
}

describe('syncFeaturedHiddenInputs', () => {
  it('marque uniquement le slot recommandé à on', () => {
    const form = createOffersForm(2)

    syncFeaturedHiddenInputs(form, 2, 0)

    expect((form.elements.namedItem('offer_0_featured') as HTMLInputElement).value).toBe('on')
    expect((form.elements.namedItem('offer_1_featured') as HTMLInputElement).value).toBe('')
  })

  it('efface tous les champs quand aucune offre n’est recommandée', () => {
    const form = createOffersForm(2)
    ;(form.elements.namedItem('offer_1_featured') as HTMLInputElement).value = 'on'

    syncFeaturedHiddenInputs(form, 2, null)

    expect((form.elements.namedItem('offer_0_featured') as HTMLInputElement).value).toBe('')
    expect((form.elements.namedItem('offer_1_featured') as HTMLInputElement).value).toBe('')
  })

  it('corrige un champ caché obsolète avant sauvegarde', () => {
    const form = createOffersForm(2)
    ;(form.elements.namedItem('offer_0_featured') as HTMLInputElement).value = ''

    syncFeaturedHiddenInputs(form, 2, 0)

    expect((form.elements.namedItem('offer_0_featured') as HTMLInputElement).value).toBe('on')
  })
})

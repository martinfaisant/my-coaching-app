/** Synchronise les champs cachés offer_*_featured avec l'état React avant envoi du formulaire. */
export function syncFeaturedHiddenInputs(
  form: HTMLFormElement,
  offerCount: number,
  featuredOfferIndex: number | null
): void {
  const max = Math.min(offerCount, 3)
  for (let i = 0; i < max; i++) {
    const input = form.querySelector(`[name="offer_${i}_featured"]`) as HTMLInputElement | null
    if (input) {
      input.value = featuredOfferIndex === i ? 'on' : ''
    }
  }
}

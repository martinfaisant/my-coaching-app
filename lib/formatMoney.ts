/** Formatage montant pour affichage UI (FR/EN). */
export function formatMoneyAmount(locale: string, amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount)
  } catch {
    return `${amount} ${currency}`
  }
}

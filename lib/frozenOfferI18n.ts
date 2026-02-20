/**
 * Helpers pour l'affichage du titre et de la description figés (demande / souscription)
 * avec support i18n : frozen_title_fr, frozen_title_en (et fallback frozen_title).
 */

export type FrozenTitleRow = {
  frozen_title_fr?: string | null
  frozen_title_en?: string | null
  frozen_title?: string | null
}

export type FrozenDescriptionRow = {
  frozen_description_fr?: string | null
  frozen_description_en?: string | null
  frozen_description?: string | null
}

/** Locale courante : 'fr' ou 'en' (ou autre, traité comme 'en' pour _en). */
export function getFrozenTitleForLocale(row: FrozenTitleRow, locale: string): string | null {
  const fr = (row.frozen_title_fr ?? '').trim()
  const en = (row.frozen_title_en ?? '').trim()
  const fallback = (row.frozen_title ?? '').trim()
  if (locale === 'fr') return fr || en || fallback || null
  return en || fr || fallback || null
}

export function getFrozenDescriptionForLocale(row: FrozenDescriptionRow, locale: string): string | null {
  const fr = (row.frozen_description_fr ?? '').trim()
  const en = (row.frozen_description_en ?? '').trim()
  const fallback = (row.frozen_description ?? '').trim()
  if (locale === 'fr') return fr || en || fallback || null
  return en || fr || fallback || null
}

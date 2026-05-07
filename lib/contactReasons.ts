/**
 * Motifs du formulaire contact — clés stables (i18n dans messages contact.reasons.*).
 */

export const CONTACT_REASON_KEYS = [
  'general',
  'account_billing',
  'technical',
  'coach_athlete',
  'safety_moderation',
  'privacy_rights',
  'partnership_press',
  'product_feedback',
  'other',
] as const

export type ContactReasonKey = (typeof CONTACT_REASON_KEYS)[number]

export function isContactReasonKey(value: string): value is ContactReasonKey {
  return (CONTACT_REASON_KEYS as readonly string[]).includes(value)
}

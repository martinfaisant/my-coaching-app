/** Limites et regex du formulaire contact (client + server actions). */

export const CONTACT_MAX_NAME = 100
export const CONTACT_MAX_EMAIL = 320
export const CONTACT_MAX_PHONE = 40
export const CONTACT_MAX_MESSAGE = 10000

export const CONTACT_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

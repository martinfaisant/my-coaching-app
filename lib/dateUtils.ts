/**
 * Utilitaires de manipulation de dates pour l'application.
 * Centralise les fonctions utilisées dans les calendriers, objectifs, etc.
 */

/**
 * Retourne le lundi de la semaine contenant la date donnée.
 * @param dateInput - Date ou string ISO (YYYY-MM-DD)
 * @returns Date du lundi à 00:00:00
 */
export function getWeekMonday(dateInput: Date | string): Date {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput)
  
  // Validation: vérifier si la date est valide
  if (isNaN(date.getTime())) {
    console.warn('[getWeekMonday] Date invalide reçue:', dateInput)
    return new Date() // Retourner aujourd'hui par défaut
  }
  
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * Convertit une Date en string ISO (YYYY-MM-DD).
 * @param date - Date à convertir
 * @returns String au format YYYY-MM-DD
 */
export function toDateStr(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formate une date en français long (ex: "13 février 2026").
 * @param dateInput - Date ou string ISO
 * @param includeWeekday - Inclure le jour de la semaine (ex: "Vendredi 13 février 2026")
 * @param locale - Locale à utiliser (défaut: 'fr-FR')
 * @returns Date formatée
 */
export function formatDateFr(dateInput: Date | string, includeWeekday: boolean = false, locale: string = 'fr-FR'): string {
  let date: Date
  if (typeof dateInput === 'string') {
    // Chaîne déjà ISO avec heure (ex. Supabase timestamptz) → parser telle quelle
    date = dateInput.includes('T') ? new Date(dateInput) : new Date(dateInput + 'T12:00:00')
  } else {
    date = dateInput
  }
  if (isNaN(date.getTime())) {
    console.warn('[formatDateFr] Date invalide reçue:', dateInput)
    return 'Date invalide'
  }
  
  const formatted = new Intl.DateTimeFormat(locale, {
    ...(includeWeekday && { weekday: 'long' }),
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

/**
 * Calcule le nombre de jours entre aujourd'hui et une date cible.
 * @param targetDate - Date cible (Date ou string ISO)
 * @returns Nombre de jours (négatif si passé)
 */
export function getDaysUntil(targetDate: string | Date): number {
  const target =
    typeof targetDate === 'string'
      ? targetDate.includes('T')
        ? new Date(targetDate)
        : new Date(targetDate + 'T12:00:00')
      : targetDate
  
  // Validation: vérifier si la date est valide
  if (isNaN(target.getTime())) {
    console.warn('[getDaysUntil] Date invalide reçue:', targetDate)
    return 0
  }
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formate une date courte (ex: "13/02/2026" en FR, "02/13/2026" en EN).
 * @param dateInput - Date ou string ISO
 * @param locale - Locale à utiliser (défaut: 'fr-FR')
 * @returns Date formatée
 */
export function formatShortDate(dateInput: Date | string, locale: string = 'fr-FR'): string {
  let date: Date
  if (typeof dateInput === 'string') {
    date = dateInput.includes('T') ? new Date(dateInput) : new Date(dateInput + 'T12:00:00')
  } else {
    date = dateInput
  }
  if (isNaN(date.getTime())) {
    console.warn('[formatShortDate] Date invalide reçue:', dateInput)
    return '--/--/----'
  }
  return new Intl.DateTimeFormat(locale).format(date)
}

/**
 * Ajoute/retire des jours à une date.
 * @param date - Date de base
 * @param days - Nombre de jours à ajouter (négatif pour retirer)
 * @returns Nouvelle Date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Retourne les dates de début et fin de semaine pour une date donnée.
 * @param date - Date dans la semaine
 * @returns { start: Date, end: Date }
 */
export function getWeekRange(date: Date | string): { start: Date; end: Date } {
  const start = getWeekMonday(date)
  const end = addDays(start, 6)
  return { start, end }
}

/**
 * Calcule la date de fin du prochain cycle mensuel (anniversaire) à partir d'une date de début.
 * Utilisé pour les souscriptions monthly : si start_date est le 4 mars, et qu'on est le 7 juin,
 * retourne le 4 juillet (même jour, mois suivant).
 * @param startDate - Date de début du cycle (string ISO ou Date)
 * @returns Date de fin du prochain cycle (début de journée en UTC)
 */
export function getNextMonthlyCycleEndDate(startDate: Date | string): Date {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate
  const dayOfMonth = start.getDate()
  const now = new Date()
  let candidate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), dayOfMonth))
  if (candidate.getTime() <= now.getTime()) {
    candidate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, dayOfMonth))
  }
  return candidate
}

/**
 * Utilitaires de manipulation de chaînes de caractères.
 */

/**
 * Génère les initiales à partir d'un nom ou email.
 * @param nameOrEmail - Nom complet ou adresse email
 * @returns Initiales (2 caractères max)
 * @example getInitials("John Doe") => "JD"
 * @example getInitials("john.doe@example.com") => "JD"
 */
export function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return '?'

  // Si c'est un email, extraire la partie avant @
  if (nameOrEmail.includes('@')) {
    nameOrEmail = nameOrEmail.split('@')[0]
  }

  // Remplacer les points/underscores par des espaces
  const cleaned = nameOrEmail.replace(/[._]/g, ' ').trim()

  const parts = cleaned.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return cleaned.slice(0, 2).toUpperCase()
}

/**
 * Tronque un texte à une longueur maximale en ajoutant "...".
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale (défaut: 100)
 * @returns Texte tronqué
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Capitalise la première lettre d'une chaîne.
 * @param text - Texte à capitaliser
 * @returns Texte capitalisé
 */
export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Nettoie un string pour utilisation en URL (slug).
 * @param text - Texte à convertir
 * @returns Slug URL-safe
 * @example slugify("Entraînement Course à pied") => "entrainement-course-a-pied"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

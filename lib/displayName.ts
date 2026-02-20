/**
 * Helper pour afficher le nom d'un profil à partir de first_name, last_name et email.
 * Utilisé partout où on affiche un nom d'utilisateur (sidebar, listes, chat, etc.).
 */

export type ProfileDisplayNameInput = {
  first_name?: string | null
  last_name?: string | null
  email?: string
}

/**
 * Retourne le nom d'affichage : "first_name last_name" ou email si vide, ou "—" si rien.
 */
export function getDisplayName(profile: ProfileDisplayNameInput, fallback: string = '—'): string {
  const first = (profile.first_name ?? '').trim()
  const last = (profile.last_name ?? '').trim()
  const full = [first, last].filter(Boolean).join(' ').trim()
  if (full) return full
  if (profile.email?.trim()) return profile.email.trim()
  return fallback
}

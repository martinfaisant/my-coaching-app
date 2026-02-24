/**
 * Préfixe un chemin avec la locale si nécessaire (next-intl as-needed : fr sans préfixe).
 * Utiliser pour les redirections côté serveur (redirect(pathWithLocale(locale, '/dashboard'))).
 */
export function pathWithLocale(locale: string, path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`
  return locale === 'fr' ? p : `/${locale}${p}`
}

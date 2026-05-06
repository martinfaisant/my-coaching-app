/**
 * Logger centralisé pour l'application.
 * En développement : affiche les logs dans la console.
 * En production : les logs sont silencieux (prêt pour intégration avec Sentry, LogRocket, etc.).
 */

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Log une erreur avec contexte optionnel.
 * En production, vous pouvez envoyer à un service de monitoring (Sentry, LogRocket, etc.).
 */
function error(message: string, error?: unknown, context?: Record<string, unknown>): void {
  if (isDevelopment) {
    console.error(`[ERROR] ${message}`, error, context)
  }
  // TODO: En production, envoyer à Sentry ou autre service de monitoring
  // if (!isDevelopment && typeof window !== 'undefined') {
  //   Sentry.captureException(error, { extra: { message, ...context } })
  // }
}

/**
 * Log un avertissement avec contexte optionnel.
 */
function warn(message: string, data?: unknown): void {
  if (isDevelopment) {
    console.warn(`[WARN] ${message}`, data)
  }
}

/**
 * Log une information avec contexte optionnel.
 */
function info(message: string, data?: unknown): void {
  if (isDevelopment) {
    console.log(`[INFO] ${message}`, data)
  }
}

/**
 * Log de debug (uniquement en développement).
 */
function debug(message: string, data?: unknown): void {
  if (isDevelopment) {
    console.debug(`[DEBUG] ${message}`, data)
  }
}

export const logger = {
  error,
  warn,
  info,
  debug,
}

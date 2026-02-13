import type { AuthError } from '@supabase/supabase-js'

/**
 * Gère les erreurs de rate limiting Supabase Auth.
 * Retourne un message d'erreur traduit si c'est une erreur de rate limit, null sinon.
 */
export function handleAuthRateLimitError(error: AuthError): { error: string } | null {
  if (error.message.includes('rate limit') || error.message.includes('rate_limit')) {
    return {
      error: "Trop de demandes d'email ont été envoyées. Veuillez patienter quelques minutes avant de réessayer.",
    }
  }
  return null
}

/**
 * Gère les erreurs spécifiques au signup (utilisateur déjà existant, rate limit, etc.).
 * Retourne un objet erreur structuré avec des flags pour gérer l'UX côté client.
 */
export function handleSignupError(
  error: AuthError,
  email: string
): {
  error: string
  userExists?: boolean
  existingEmail?: string
} {
  // Vérifier d'abord le rate limit
  const rateLimitError = handleAuthRateLimitError(error)
  if (rateLimitError) return rateLimitError

  // Détecter si l'utilisateur existe déjà
  if (
    error.message.includes('already registered') ||
    error.message.includes('already exists') ||
    error.message.includes('User already registered') ||
    error.message.toLowerCase().includes('user already')
  ) {
    return {
      error: 'Un compte existe déjà avec cet email.',
      userExists: true,
      existingEmail: email,
    }
  }

  // Erreur générique
  return { error: error.message }
}

/**
 * Gère les erreurs de réinitialisation de mot de passe (rate limit principalement).
 */
export function handleResetPasswordError(error: AuthError): { error: string } {
  const rateLimitError = handleAuthRateLimitError(error)
  if (rateLimitError) return rateLimitError

  return { error: error.message }
}

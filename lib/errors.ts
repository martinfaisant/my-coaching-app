/**
 * Types d'erreur structurés pour l'application
 */

export type ApiErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'RATE_LIMIT'

export type ApiError = {
  error: string
  code?: ApiErrorCode
}

export type ApiSuccess<T> = {
  data: T
}

export type ApiResult<T> = ApiSuccess<T> | ApiError

/**
 * Type guard pour vérifier si un résultat est une erreur
 */
export function isError<T>(result: ApiResult<T>): result is ApiError {
  return 'error' in result
}

/**
 * Crée un objet erreur structuré
 */
export function createError(message: string, code?: ApiErrorCode): ApiError {
  return { error: message, code }
}

/**
 * Crée un objet succès structuré
 */
export function createSuccess<T>(data: T): ApiSuccess<T> {
  return { data }
}

/**
 * Helpers d'authentification et autorisation pour les server actions.
 * Centralise la logique d'auth répétée dans ~25 actions différentes.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Profile, Role } from '@/types/database'

/**
 * Error codes for auth operations.
 * Map to translation keys: auth.errors.{code}
 */
export const AUTH_ERROR_CODES = {
  NOT_AUTHENTICATED: 'notAuthenticated',
  ACCESS_DENIED: 'accessDenied',
  PROFILE_NOT_FOUND: 'profileNotFound',
  ROLE_REQUIRED: 'roleRequired',
} as const

/**
 * Résultat avec erreur.
 * errorCode can be used to get translated message: t(`auth.errors.${errorCode}`)
 */
export type ErrorResult = {
  error: string
  errorCode?: string
}

/**
 * Type guard pour vérifier si un résultat est une erreur.
 */
export function isError<T>(result: T | ErrorResult): result is ErrorResult {
  return typeof result === 'object' && result !== null && 'error' in result
}

/**
 * Vérifie qu'un utilisateur est authentifié.
 * @returns User ou erreur
 * 
 * @example
 * const result = await requireUser(supabase)
 * if ('error' in result) return result
 * const { user } = result
 */
export async function requireUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { 
      error: 'Non connecté.', 
      errorCode: AUTH_ERROR_CODES.NOT_AUTHENTICATED 
    } as ErrorResult
  }

  return { user }
}

/**
 * Récupère le profil d'un utilisateur.
 * @param supabase - Client Supabase
 * @param userId - ID de l'utilisateur
 * @param fields - Champs à sélectionner (défaut: '*')
 * @returns Profil ou null
 * 
 * @example
 * const profile = await getProfile(supabase, user.id, 'role, user_id, coach_id')
 */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
  fields: string = '*'
): Promise<Partial<Profile> | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(fields)
    .eq('user_id', userId)
    .single()

  if (error) return null
  return data as Partial<Profile> | null
}

/**
 * Vérifie qu'un utilisateur a un rôle spécifique.
 * @param supabase - Client Supabase
 * @param requiredRole - Rôle requis ('coach', 'admin', 'athlete')
 * @returns User + profile ou erreur
 * 
 * @example
 * const result = await requireRole(supabase, 'coach')
 * if ('error' in result) return result
 * const { user, profile } = result
 */
export async function requireRole(
  supabase: SupabaseClient,
  requiredRole: Role
): Promise<ErrorResult | { user: { id: string; email: string | undefined }; profile: Partial<Profile> }> {
  const userResult = await requireUser(supabase)
  if ('error' in userResult) return userResult

  const { user } = userResult
  const profile = await getProfile(supabase, user.id, 'role, user_id, email, first_name, last_name')

  if (!profile || profile.role !== requiredRole) {
    return { 
      error: `Accès refusé. Rôle requis : ${requiredRole}`,
      errorCode: AUTH_ERROR_CODES.ACCESS_DENIED
    }
  }

  return { user: { id: user.id, email: user.email }, profile }
}

/**
 * Vérifie qu'un utilisateur est un coach ou l'athlète concerné.
 * Utilisé dans les actions workouts, objectifs, etc.
 * 
 * **Cas d'usage** :
 * - Coach peut accéder aux données de ses athlètes (vérifie athleteProfile.coach_id === user.id)
 * - Athlète peut accéder à ses propres données (vérifie user.id === athleteId)
 * 
 * @param supabase - Client Supabase
 * @param athleteId - ID de l'athlète
 * @returns User + profiles ou erreur
 * 
 * @example
 * // Dans une action workout
 * const result = await requireCoachOrAthleteAccess(supabase, athleteId)
 * if ('error' in result) return result
 * const { user, profile, athleteProfile } = result
 * 
 * // Utiliser les profils
 * const isCoach = profile.role === 'coach'
 * const canEdit = isCoach // Le coach peut éditer, l'athlète non (selon business logic)
 */
export async function requireCoachOrAthleteAccess(
  supabase: SupabaseClient,
  athleteId: string
): Promise<
  | ErrorResult
  | {
      user: { id: string; email: string | undefined }
      profile: Partial<Profile>
      athleteProfile: Partial<Profile>
      isCoach: boolean
      isAthlete: boolean
    }
> {
  const userResult = await requireUser(supabase)
  if ('error' in userResult) return userResult

  const { user } = userResult

  // Récupérer les deux profils en parallèle
  const [myProfile, athleteProfile] = await Promise.all([
    getProfile(supabase, user.id, 'role, user_id, email, first_name, last_name'),
    getProfile(supabase, athleteId, 'coach_id, user_id, email, first_name, last_name'),
  ])

  if (!myProfile || !athleteProfile) {
    return { 
      error: 'Profil introuvable.',
      errorCode: AUTH_ERROR_CODES.PROFILE_NOT_FOUND
    }
  }

  // Déterminer si l'utilisateur a accès
  const isCoach = myProfile.role === 'coach' && athleteProfile.coach_id === user.id
  const isAthlete = myProfile.role === 'athlete' && user.id === athleteId

  if (!isCoach && !isAthlete) {
    return { 
      error: 'Accès refusé.',
      errorCode: AUTH_ERROR_CODES.ACCESS_DENIED
    }
  }

  return { user: { id: user.id, email: user.email }, profile: myProfile, athleteProfile, isCoach, isAthlete }
}

/**
 * Accès mutation (update/delete) sur `athlete_facilities` : aligné sur les politiques RLS
 * (athlète propriétaire, ou coach via `profiles.coach_id`, ou coach via souscription active / en résiliation).
 */
export async function requireAthleteFacilityMutationAccess(
  supabase: SupabaseClient,
  athleteId: string
): Promise<
  | ErrorResult
  | {
      user: { id: string; email: string | undefined }
      /** true si le demandeur est un coach (profil ou souscription), pas l’athlète lui-même */
      isCoachActor: boolean
    }
> {
  const userResult = await requireUser(supabase)
  if ('error' in userResult) return userResult

  const { user } = userResult

  const myProfile = await getProfile(supabase, user.id, 'role, user_id, email, first_name, last_name')
  if (!myProfile?.role) {
    return {
      error: 'Profil introuvable.',
      errorCode: AUTH_ERROR_CODES.PROFILE_NOT_FOUND,
    }
  }

  if (myProfile.role === 'athlete' && user.id === athleteId) {
    return { user: { id: user.id, email: user.email }, isCoachActor: false }
  }

  if (myProfile.role === 'coach') {
    const athleteProfile = await getProfile(supabase, athleteId, 'coach_id, user_id')
    if (!athleteProfile) {
      return {
        error: 'Profil introuvable.',
        errorCode: AUTH_ERROR_CODES.PROFILE_NOT_FOUND,
      }
    }

    if (athleteProfile.coach_id === user.id) {
      return { user: { id: user.id, email: user.email }, isCoachActor: true }
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('athlete_id', athleteId)
      .eq('coach_id', user.id)
      .in('status', ['active', 'cancellation_scheduled'])
      .maybeSingle()

    if (sub) {
      return { user: { id: user.id, email: user.email }, isCoachActor: true }
    }
  }

  return {
    error: 'Accès refusé.',
    errorCode: AUTH_ERROR_CODES.ACCESS_DENIED,
  }
}

/**
 * Accès à la page calendrier d’un athlète pour un **coach** : le coach connecté doit être celui
 * référencé sur `profiles.coach_id` de l’athlète (`athleteProfile.coach_id === user.id`).
 *
 * **Même règle** que `app/[locale]/dashboard/athletes/[athleteId]/page.tsx` et que les server actions
 * des notes privées (`coachNotesActions.ts`). Ne couvre pas un accès **uniquement** via souscription
 * si `profiles.coach_id` ne pointe pas vers ce coach (les installations utilisent un périmètre élargi
 * via `requireAthleteFacilityMutationAccess`).
 */
export async function requireCoachAthleteCalendarAccess(
  supabase: SupabaseClient,
  athleteId: string
): Promise<
  | ErrorResult
  | {
      user: { id: string; email: string | undefined }
      athleteProfile: Partial<Profile>
    }
> {
  const userResult = await requireUser(supabase)
  if ('error' in userResult) return userResult

  const { user } = userResult

  const myProfile = await getProfile(supabase, user.id, 'role, user_id, email, first_name, last_name')
  if (!myProfile?.role) {
    return {
      error: 'Profil introuvable.',
      errorCode: AUTH_ERROR_CODES.PROFILE_NOT_FOUND,
    }
  }

  if (myProfile.role !== 'coach') {
    return {
      error: 'Accès refusé.',
      errorCode: AUTH_ERROR_CODES.ACCESS_DENIED,
    }
  }

  const athleteProfile = await getProfile(
    supabase,
    athleteId,
    'coach_id, user_id, email, first_name, last_name, avatar_url'
  )
  if (!athleteProfile) {
    return {
      error: 'Profil introuvable.',
      errorCode: AUTH_ERROR_CODES.PROFILE_NOT_FOUND,
    }
  }

  if (user.id === athleteId) {
    return {
      error: 'Accès refusé.',
      errorCode: AUTH_ERROR_CODES.ACCESS_DENIED,
    }
  }

  if (athleteProfile.coach_id !== user.id) {
    return {
      error: 'Accès refusé.',
      errorCode: AUTH_ERROR_CODES.ACCESS_DENIED,
    }
  }

  return { user: { id: user.id, email: user.email }, athleteProfile }
}

/**
 * Vérifie qu'un utilisateur est authentifié et récupère son profil.
 * Cas d'usage : actions où on a besoin du profil mais pas de vérification de rôle stricte.
 * 
 * @param supabase - Client Supabase
 * @param fields - Champs du profil à sélectionner (défaut: 'role, user_id, email')
 * @returns User + profile ou erreur
 * 
 * @example
 * const result = await requireUserWithProfile(supabase)
 * if ('error' in result) return result
 * const { user, profile } = result
 */
export async function requireUserWithProfile(
  supabase: SupabaseClient,
  fields: string = 'role, user_id, email, first_name, last_name'
): Promise<ErrorResult | { user: { id: string; email: string | undefined }; profile: Partial<Profile> }> {
  const userResult = await requireUser(supabase)
  if ('error' in userResult) return userResult

  const { user } = userResult
  const profile = await getProfile(supabase, user.id, fields)

  if (!profile) {
    return { 
      error: 'Profil introuvable.',
      errorCode: AUTH_ERROR_CODES.PROFILE_NOT_FOUND
    }
  }

  return { user: { id: user.id, email: user.email }, profile }
}

const LIST_USERS_PAGE_SIZE = 50
const LIST_USERS_MAX_PAGES = 100

/**
 * Récupère si un utilisateur Auth existe pour cet email et si son email est confirmé.
 * À utiliser uniquement avec un client service role (createAdminClient()).
 * Utilisé au signup quand Supabase renvoie succès avec identities vide (email déjà existant).
 * Parcourt les pages de listUsers jusqu'à trouver l'email (comportement "get user by email").
 *
 * @param adminClient - Client Supabase avec service role
 * @param email - Email à chercher (comparaison insensible à la casse)
 * @returns { emailConfirmed: true } si compte existant et confirmé, { emailConfirmed: false } si existant non confirmé, null si non trouvé ou erreur
 */
export async function getExistingAuthUserConfirmationStatus(
  adminClient: SupabaseClient,
  email: string
): Promise<{ emailConfirmed: boolean } | null> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) return null
  try {
    for (let page = 1; page <= LIST_USERS_MAX_PAGES; page++) {
      const { data, error } = await adminClient.auth.admin.listUsers({
        page,
        perPage: LIST_USERS_PAGE_SIZE,
      })
      if (error || !data?.users) return null
      const existing = data.users.find(
        (u) => u.email?.toLowerCase() === normalized
      )
      if (existing) return { emailConfirmed: !!existing.email_confirmed_at }
      if (data.users.length < LIST_USERS_PAGE_SIZE) break
    }
    return null
  } catch {
    return null
  }
}

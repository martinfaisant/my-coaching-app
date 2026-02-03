import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import type { Profile, Role } from '@/types/database'

export type CurrentUserWithProfile = {
  id: string
  email: string
  profile: Profile
}

/** Retourne l'utilisateur connecté et son profil. Crée le profil si absent (nouveau compte). Redirige vers /login si non connecté. */
export async function getCurrentUserWithProfile(): Promise<CurrentUserWithProfile> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) {
    const { error } = await supabase.from('profiles').insert({
      user_id: user.id,
      email: user.email,
      role: 'athlete',
    })
    if (error) {
      throw new Error('Impossible de créer le profil: ' + error.message)
    }
    const { data: newProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (!newProfile) {
      throw new Error('Profil créé mais introuvable.')
    }
    return {
      id: user.id,
      email: user.email,
      profile: newProfile as Profile,
    }
  }

  return {
    id: user.id,
    email: user.email,
    profile: profile as Profile,
  }
}

/** Vérifie que l'utilisateur a l'un des rôles donnés. Redirige vers /dashboard si non autorisé. */
export async function requireRole(allowedRoles: Role[]): Promise<CurrentUserWithProfile> {
  const current = await getCurrentUserWithProfile()
  if (!allowedRoles.includes(current.profile.role)) {
    redirect('/dashboard')
  }
  return current
}

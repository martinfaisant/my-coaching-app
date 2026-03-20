import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import type { Profile, Role } from '@/types/database'

export type CurrentUserWithProfile = {
  id: string
  email: string
  profile: Profile
}

/** Déduplique auth + profil dans la même requête (ex: layout + page). */
const getCachedUserAndProfile = cache(async (): Promise<CurrentUserWithProfile | null> => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return null

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
})

async function getLocaleFromAcceptLanguageHeader(): Promise<'en' | 'fr'> {
  const acceptLanguage = (await headers()).get('accept-language') ?? ''
  return acceptLanguage.toLowerCase().includes('en') ? 'en' : 'fr'
}

function getHomePathForLocale(locale: 'en' | 'fr'): string {
  // Routing next-intl : `fr` sans prefixe, `en` avec prefixe.
  return locale === 'en' ? '/en' : '/'
}

/** Retourne l'utilisateur connecté et son profil. Crée le profil si absent (nouveau compte). Redirige vers la page d'accueil si non connecté. */
export async function getCurrentUserWithProfile(): Promise<CurrentUserWithProfile> {
  const result = await getCachedUserAndProfile()
  if (!result) {
    const locale = await getLocaleFromAcceptLanguageHeader()
    redirect(getHomePathForLocale(locale))
  }
  return result
}

/** Vérifie que l'utilisateur a l'un des rôles donnés. Redirige vers /dashboard si non autorisé. */
export async function requireRole(allowedRoles: Role[]): Promise<CurrentUserWithProfile> {
  const current = await getCurrentUserWithProfile()
  if (!allowedRoles.includes(current.profile.role)) {
    redirect('/dashboard')
  }
  return current
}

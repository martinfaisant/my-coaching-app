'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export type LoginState = {
  error?: string
}

export async function login(_prevState: LoginState, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email?.trim() || !password) {
    return { error: 'Email et mot de passe requis.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Récupérer l'URL de redirection depuis les headers si présente
  const headersList = await headers()
  const referer = headersList.get('referer')
  let redirectPath = '/dashboard'
  
  if (referer) {
    try {
      const url = new URL(referer)
      const redirectParam = url.searchParams.get('redirect')
      if (redirectParam && redirectParam.startsWith('/dashboard')) {
        redirectPath = redirectParam
      }
    } catch {
      // Ignorer les erreurs de parsing d'URL
    }
  }

  redirect(redirectPath)
}

export type SignupState = {
  error?: string
  success?: string
  userExists?: boolean
  existingEmail?: string
}

export async function signup(_prevState: SignupState, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const roleRaw = formData.get('role') as string

  if (!email?.trim() || !password) {
    return { error: 'Email et mot de passe requis.' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }
  }

  const role = roleRaw === 'coach' ? 'coach' : 'athlete'

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    // Traduire les erreurs courantes
    if (error.message.includes('rate limit') || error.message.includes('rate_limit')) {
      return {
        error:
          'Trop de demandes d\'email ont été envoyées. Veuillez patienter quelques minutes avant de réessayer.',
      }
    }
    // Détecter si l'utilisateur existe déjà
    if (
      error.message.includes('already registered') ||
      error.message.includes('already exists') ||
      error.message.includes('User already registered') ||
      error.message.toLowerCase().includes('user already')
    ) {
      return {
        userExists: true,
        existingEmail: email,
        error: 'Un compte existe déjà avec cet email.',
      }
    }
    return { error: error.message }
  }

  if (data?.user) {
    // Créer le profil
    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: data.user.id,
      email: data.user.email ?? email,
      role,
    })

    if (profileError) {
      return { error: 'Erreur lors de la création du profil: ' + profileError.message }
    }

    // Vérifier si une session a été créée (si l'email ne nécessite pas de confirmation)
    // Attendre un peu pour que la session soit disponible
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session) {
      // Session créée, revalider les chemins et rediriger vers le dashboard
      revalidatePath('/dashboard')
      redirect('/dashboard')
    } else {
      // Pas de session (email doit être confirmé), afficher un message
      return {
        success: 'Compte créé avec succès ! Veuillez vérifier votre email pour confirmer votre compte, puis connectez-vous.',
      }
    }
  }

  return {
    error: 'Une erreur est survenue lors de la création du compte.',
  }
}

export type ResetPasswordState = {
  error?: string
  success?: string
}

/** Envoyer un email de réinitialisation de mot de passe. */
export async function resetPassword(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const email = formData.get('email') as string

  if (!email?.trim()) {
    return { error: 'Email requis.' }
  }

  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  })

  if (error) {
    // Traduire les erreurs courantes
    if (error.message.includes('rate limit') || error.message.includes('rate_limit')) {
      return {
        error:
          'Trop de demandes d\'email ont été envoyées. Veuillez patienter quelques minutes avant de réessayer.',
      }
    }
    return { error: error.message }
  }

  return {
    success: 'Un lien de réinitialisation a été envoyé à votre adresse email.',
  }
}

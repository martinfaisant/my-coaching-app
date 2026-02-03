'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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

  redirect('/dashboard')
}

export type SignupState = {
  error?: string
  success?: string
}

export async function signup(_prevState: SignupState, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email?.trim() || !password) {
    return { error: 'Email et mot de passe requis.' }
  }

  if (password.length < 6) {
    return { error: 'Le mot de passe doit contenir au moins 6 caractères.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

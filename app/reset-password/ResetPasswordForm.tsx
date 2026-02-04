'use client'

import { useState, useActionState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { updatePassword, type UpdatePasswordState } from './actions'

export function ResetPasswordForm() {
  const [state, action] = useActionState<UpdatePasswordState, FormData>(updatePassword, {})
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  useEffect(() => {
    // Vérifier que l'utilisateur a un token valide depuis le lien email
    const checkSession = async () => {
      const supabase = createClient()

      // Vérifier si l'URL contient des hash fragments (token de reset)
      const hash = window.location.hash
      const hasHash = hash && (hash.includes('access_token') || hash.includes('type=recovery'))

      // Écouter les changements d'authentification
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setIsValidSession(true)
        }
      })

      // Vérifier la session avec plusieurs tentatives
      const check = async (attempt = 0) => {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (user && !userError) {
          setIsValidSession(true)
          return
        }

        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          setIsValidSession(true)
          return
        }

        // Si on a des hash fragments, attendre et réessayer (Supabase peut avoir besoin de temps)
        if (hasHash && attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return check(attempt + 1)
        }

        // Si pas de hash et pas de session, ou après 3 tentatives
        if (!hasHash || attempt >= 3) {
          setIsValidSession(false)
          setTimeout(() => router.push('/login'), 2000)
        }
      }

      // Attendre un peu pour laisser le temps aux hash fragments d'être traités
      await new Promise((resolve) => setTimeout(resolve, 300))
      check()

      return () => {
        subscription.unsubscribe()
      }
    }

    checkSession()
  }, [router])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLocalError(null)

    if (!password.trim() || !confirmPassword.trim()) {
      setLocalError('Les deux champs sont obligatoires.')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Les deux mots de passe doivent être identiques.')
      return
    }

    if (password.length < 6) {
      setLocalError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }

    const formData = new FormData(e.currentTarget)
    formData.set('password', password)
    formData.set('confirmPassword', confirmPassword)

    startTransition(() => {
      action(formData)
    })
  }

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }
  }, [state?.success, router])

  if (isValidSession === false) {
    return (
      <div className="p-8 sm:p-10">
        <h1 className="text-2xl font-semibold text-stone-900text-white text-center mb-1">
          Lien invalide ou expiré
        </h1>
        <p className="text-white0text-stone-400 text-sm text-center mb-6">
          Redirection vers la page de connexion...
        </p>
      </div>
    )
  }

  if (isValidSession === null) {
    return (
      <div className="p-8 sm:p-10">
        <p className="text-white0text-stone-400 text-sm text-center">
          Vérification du lien...
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 sm:p-10">
      <h1 className="text-2xl font-semibold text-stone-900text-white text-center mb-1">
        Nouveau mot de passe
      </h1>
      <p className="text-white0text-stone-400 text-sm text-center mb-6">
        Définissez votre nouveau mot de passe
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-stone-700text-stone-300 mb-2"
          >
            Nouveau mot de passe
          </label>
          <input
            id="new-password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200border-stone-700 bg-whitebg-palette-forest-dark text-stone-900text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900focus:ring-stone-100 focus:border-transparent transition"
          />
        </div>
        <div>
          <label
            htmlFor="confirm-password"
            className="block text-sm font-medium text-stone-700text-stone-300 mb-2"
          >
            Confirmer le mot de passe
          </label>
          <input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-lg border border-stone-200border-stone-700 bg-whitebg-palette-forest-dark text-stone-900text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900focus:ring-stone-100 focus:border-transparent transition"
          />
        </div>
        {(localError || state?.error) && (
          <p className="text-sm text-red-600text-red-400" role="alert">
            {localError || state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm text-palette-forest-dark" role="alert">
            {state.success}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full py-2.5 px-4 rounded-lg bg-palette-forest-darkbg-white text-whitetext-stone-900 font-medium hover:bg-palette-olivehover:bg-stone-100 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Enregistrement...' : 'Définir le nouveau mot de passe'}
        </button>
      </form>
    </div>
  )
}

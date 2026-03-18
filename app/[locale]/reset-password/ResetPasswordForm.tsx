'use client'

import { useState, useActionState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { createClient } from '@/utils/supabase/client'
import { updatePassword, type UpdatePasswordState } from './actions'

export function ResetPasswordForm() {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
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

      // PKCE : échanger le code en query string contre une session
      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!exchangeError) {
          // Nettoyer l'URL (le code n'est utilisable qu'une fois)
          window.history.replaceState({}, '', window.location.pathname)
          setIsValidSession(true)
          return
        }
      }

      // Vérifier si l'URL contient des hash fragments (flux implicite)
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
      setLocalError(t('errors.bothFieldsRequired'))
      return
    }

    if (password !== confirmPassword) {
      setLocalError(t('errors.passwordMismatch'))
      return
    }

    if (password.length < 6) {
      setLocalError(t('errors.passwordMinLength'))
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
        <h1 className="text-2xl font-semibold text-stone-900 text-center mb-1">
          {t('invalidOrExpiredLink')}
        </h1>
        <p className="text-stone-400 text-sm text-center mb-6">
          {t('redirectingToLogin')}
        </p>
      </div>
    )
  }

  if (isValidSession === null) {
    return (
      <div className="p-8 sm:p-10">
        <p className="text-stone-400 text-sm text-center">
          {t('checkingLink')}
        </p>
      </div>
    )
  }

  return (
    <div className="p-8 sm:p-10">
      <h1 className="text-2xl font-semibold text-stone-900 text-center mb-1">
        {t('newPasswordTitle')}
      </h1>
      <p className="text-stone-400 text-sm text-center mb-6">
        {t('newPasswordSubtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="new-password"
          label={t('newPassword')}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Input
          id="confirm-password"
          label={t('confirmPassword')}
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />
        {(localError || state?.error) && (
          <p className="text-sm text-palette-danger-dark" role="alert">
            {localError || state.error}
          </p>
        )}
        {state?.success && (
          <p className="text-sm text-palette-forest-dark" role="alert">
            {state.success}
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={isPending}
          fullWidth
          loading={isPending}
          loadingText={tCommon('saving')}
        >
          {t('setNewPasswordButton')}
        </Button>
      </form>
    </div>
  )
}

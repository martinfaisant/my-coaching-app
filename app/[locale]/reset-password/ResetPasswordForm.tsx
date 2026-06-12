'use client'

import { useState, useActionState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { PasswordInput } from '@/components/PasswordInput'
import { NewPasswordField } from '@/components/NewPasswordField'
import { createClient } from '@/utils/supabase/client'
import { updatePassword, type UpdatePasswordState } from './actions'
import { isPasswordValid } from '@/lib/passwordValidation'

export function ResetPasswordForm() {
  const t = useTranslations('auth')
  const tErrors = useTranslations('auth.errors')
  const tCommon = useTranslations('common')
  const [state, action] = useActionState<UpdatePasswordState, FormData>(updatePassword, {})
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const serverPasswordError =
    state?.error === tErrors('passwordRequirements') ? state.error : null
  const passwordMismatch =
    confirmPassword.length > 0 && password !== confirmPassword
  const canSubmit =
    isPasswordValid(password) &&
    confirmPassword.length > 0 &&
    password === confirmPassword

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()

      const params = new URLSearchParams(window.location.search)
      const code = params.get('code')
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
        if (!exchangeError) {
          window.history.replaceState({}, '', window.location.pathname)
          setIsValidSession(true)
          return
        }
      }

      const hash = window.location.hash
      const hasHash = hash && (hash.includes('access_token') || hash.includes('type=recovery'))

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          setIsValidSession(true)
        }
      })

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

        if (hasHash && attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 1000))
          return check(attempt + 1)
        }

        if (!hasHash || attempt >= 3) {
          setIsValidSession(false)
          setTimeout(() => router.push('/login'), 2000)
        }
      }

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
      setLocalError(tErrors('bothFieldsRequired'))
      return
    }

    if (password !== confirmPassword) {
      setLocalError(tErrors('passwordMismatch'))
      return
    }

    if (!isPasswordValid(password)) {
      setLocalError(tErrors('passwordRequirements'))
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

  const displayError =
    localError ?? (state?.error && !serverPasswordError ? state.error : null)

  return (
    <div className="p-8 sm:p-10">
      <h1 className="text-2xl font-semibold text-stone-900 text-center mb-1">
        {t('newPasswordTitle')}
      </h1>
      <p className="text-stone-400 text-sm text-center mb-6">
        {t('newPasswordSubtitle')}
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <NewPasswordField
          id="new-password"
          label={t('newPassword')}
          name="password"
          value={password}
          onChange={setPassword}
          placeholder={t('passwordPlaceholder')}
          error={serverPasswordError ?? undefined}
          highlightFailures={Boolean(serverPasswordError)}
        />
        <PasswordInput
          id="confirm-password"
          label={t('confirmPassword')}
          name="confirmPassword"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={t('passwordPlaceholder')}
          error={passwordMismatch ? tErrors('passwordMismatch') : undefined}
        />
        {displayError && (
          <p className="text-sm text-palette-danger-dark" role="alert">
            {displayError}
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
          disabled={!canSubmit || isPending}
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

'use client'

import { useState, useActionState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import {
  login,
  signup,
  resetPassword,
  type LoginState,
  type SignupState,
  type ResetPasswordState,
} from '@/app/[locale]/login/actions'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import type { AuthModalMode } from './LoginModal'

type SignupRole = 'athlete' | 'coach'

type LoginFormProps = {
  mode: AuthModalMode
  onModeChange?: (mode: AuthModalMode) => void
  onClose?: () => void
}

export function LoginForm({ mode, onModeChange, onClose }: LoginFormProps) {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const [loginState, loginAction] = useActionState<LoginState, FormData>(login, {})
  const [signupState, signupAction] = useActionState<SignupState, FormData>(signup, {})
  const [signupRole, setSignupRole] = useState<SignupRole>('athlete')
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [prefilledEmail, setPrefilledEmail] = useState<string>('')
  const emailInputRef = useRef<HTMLInputElement>(null)

  // Pré-remplir l'email quand on bascule vers le mode login
  useEffect(() => {
    if (mode === 'login' && prefilledEmail && emailInputRef.current) {
      emailInputRef.current.value = prefilledEmail
    }
  }, [mode, prefilledEmail])

  if (mode === 'login' && showForgotPassword) {
    return (
      <ForgotPasswordForm onBack={() => setShowForgotPassword(false)} />
    )
  }

  if (mode === 'login') {
    return (
      <div className="p-8">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1"></div>
          <h2 id="modal-title" className="text-2xl font-semibold text-stone-900 flex-1 text-center whitespace-nowrap">
            {t('login')}
          </h2>
          <div className="flex-1 flex justify-end">
            {onClose && (
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="p-1.5 -mt-1 -mr-1"
                aria-label={tCommon('close')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            )}
          </div>
        </div>
        <p className="text-stone-400 text-sm text-center mb-8">
          {t('enterCredentials')}
        </p>

        <form action={loginAction} className="space-y-5">
          <Input
            ref={emailInputRef}
            id="modal-email"
            label={t('email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={t('emailPlaceholder')}
            defaultValue={prefilledEmail}
          />
          <Input
            id="modal-password"
            label={t('password')}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder={t('passwordPlaceholder')}
          />
          {loginState?.error && (
            <p className="text-sm text-red-600" role="alert">
              {loginState.error}
            </p>
          )}
          <Button type="submit" fullWidth>
            {t('login')}
          </Button>
          <Button
            type="button"
            variant="muted"
            onClick={() => setShowForgotPassword(true)}
            className="w-full border-0 bg-transparent hover:bg-transparent !min-h-0 py-0 text-sm text-stone-400 hover:text-stone-700"
          >
            {t('forgotPassword')}
          </Button>
        </form>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1"></div>
        <h2 id="modal-title" className="text-2xl font-semibold text-stone-900 flex-1 text-center whitespace-nowrap">
          {t('signup')}
        </h2>
        <div className="flex-1 flex justify-end">
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="p-1.5 -mt-1 -mr-1"
              aria-label={tCommon('close')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          )}
        </div>
      </div>
      <p className="text-stone-400 text-sm text-center mb-8">
        {t('chooseProfile')}
      </p>

      <form action={signupAction} className="space-y-5">
        <div>
          <span className="block text-sm font-medium text-stone-700 mb-3">
            {t('signupAs')}
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                signupRole === 'athlete'
                  ? 'border-2 border-palette-forest-dark bg-stone-50 text-stone-900'
                  : 'border-2 border-stone-200 hover:border-stone-300 text-stone-600'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="athlete"
                checked={signupRole === 'athlete'}
                onChange={() => setSignupRole('athlete')}
                className="sr-only"
              />
              <span className="text-base font-semibold">{t('athlete')}</span>
              <span className="text-xs text-center">{t('athleteDesc')}</span>
            </label>
            <label
              className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 p-4 cursor-pointer transition-all ${
                signupRole === 'coach'
                  ? 'border-2 border-palette-forest-dark bg-stone-50 text-stone-900'
                  : 'border-2 border-stone-200 hover:border-stone-300 text-stone-600'
              }`}
            >
              <input
                type="radio"
                name="role"
                value="coach"
                checked={signupRole === 'coach'}
                onChange={() => setSignupRole('coach')}
                className="sr-only"
              />
              <span className="text-base font-semibold">{t('coach')}</span>
              <span className="text-xs text-center">{t('coachDesc')}</span>
            </label>
          </div>
        </div>
        <Input
          id="modal-signup-email"
          label={t('email')}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t('emailPlaceholder')}
        />
        <Input
          id="modal-signup-password"
          label={t('passwordMin')}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder={t('passwordPlaceholder')}
        />
        {signupState?.error && (
          <p className="text-sm text-red-600" role="alert">
            {signupState.error}
            {signupState.userExists && signupState.existingEmail && onModeChange && (
              <>
                {' '}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPrefilledEmail(signupState.existingEmail || '')
                    onModeChange('login')
                  }}
                  className="inline !min-h-0 !p-0 !border-0 bg-transparent hover:bg-transparent underline text-palette-forest-dark hover:!text-palette-olive"
                >
                  {t('login')}
                </Button>
              </>
            )}
          </p>
        )}
        {signupState?.success && (
          <p className="text-sm text-palette-forest-dark" role="alert">
            {signupState.success}
          </p>
        )}
        <Button type="submit" fullWidth>
          {t('signup')}
        </Button>
      </form>
    </div>
  )
}

function ForgotPasswordForm({ onBack }: { onBack: () => void }) {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const [resetState, resetAction] = useActionState<ResetPasswordState, FormData>(resetPassword, {})

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1"></div>
        <h2 id="modal-title" className="text-2xl font-semibold text-stone-900 flex-1 text-center whitespace-nowrap">
          {t('forgotPassword')}
        </h2>
        <div className="flex-1 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="p-1.5 -mt-1 -mr-1"
            aria-label={tCommon('close')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>
      </div>
      <p className="text-stone-400 text-sm text-center mb-8">
        {t('resetInstructions')}
      </p>

      <form action={resetAction} className="space-y-5">
        <Input
          id="reset-email"
          label={t('email')}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t('emailPlaceholder')}
        />
        {resetState?.error && (
          <p className="text-sm text-red-600" role="alert">
            {resetState.error}
          </p>
        )}
        {resetState?.success && (
          <p className="text-sm text-palette-forest-dark" role="alert">
            {resetState.success}
          </p>
        )}
        <Button type="submit" fullWidth>
          {t('sendResetLink')}
        </Button>
        <Button
          type="button"
          variant="muted"
          onClick={onBack}
          className="w-full border-0 bg-transparent hover:bg-transparent !min-h-0 py-0 text-sm text-stone-400 hover:text-stone-700"
        >
          ← {t('backToLogin')}
        </Button>
      </form>
    </div>
  )
}

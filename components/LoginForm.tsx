'use client'

import { useState, useActionState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
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
import { PasswordInput } from '@/components/PasswordInput'
import { FORM_ERROR_TEXT_CLASSES } from '@/lib/formStyles'
import { SocialAuthButtons, AuthDivider } from '@/components/SocialAuthButtons'
import { AuthRolePicker, type SignupRole } from '@/components/AuthRolePicker'
import { AuthLegalConsent } from '@/components/AuthLegalConsent'
import type { AuthModalMode } from './LoginModal'

type LoginFormProps = {
  mode: AuthModalMode
  onModeChange?: (mode: AuthModalMode) => void
  onClose?: () => void
}

export function LoginForm({ mode, onModeChange, onClose }: LoginFormProps) {
  const t = useTranslations('auth')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [loginState, loginAction] = useActionState<LoginState, FormData>(login, {})
  const [signupState, signupAction] = useActionState<SignupState, FormData>(signup, {})
  const [signupRole, setSignupRole] = useState<SignupRole | null>(null)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [prefilledEmail, setPrefilledEmail] = useState<string>('')
  const emailInputRef = useRef<HTMLInputElement>(null)
  const tErrors = useTranslations('auth.errors')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)
  const serverTermsError =
    signupState?.error === tErrors('termsRequired') ? signupState.error : null
  const serverRoleError =
    signupState?.error === tErrors('roleRequired') ? signupState.error : null
  const displayedTermsError = termsError ?? serverTermsError
  const displayedRoleError = roleError ?? serverRoleError

  // Pré-remplir l'email quand on bascule vers le mode login
  useEffect(() => {
    if (mode === 'login' && prefilledEmail && emailInputRef.current) {
      emailInputRef.current.value = prefilledEmail
    }
  }, [mode, prefilledEmail])

  const termsHref = locale === 'en' ? '/en/terms' : '/terms'
  const privacyHref = locale === 'en' ? '/en/privacy' : '/privacy'

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

        <SocialAuthButtons intent="login" locale={locale} />
        <AuthDivider />

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
          <PasswordInput
            id="modal-password"
            label={t('password')}
            name="password"
            autoComplete="current-password"
            required
            placeholder={t('passwordPlaceholder')}
          />
          {loginState?.error && (
            <p className={FORM_ERROR_TEXT_CLASSES} role="alert">
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

  // Écran succès inscription (nouveau compte ou email renvoyé)
  if (mode === 'signup' && signupState?.success && signupState?.successType) {
    const successTitle =
      signupState.successType === 'emailResent'
        ? t('successTitleEmailResent')
        : t('successTitleAccountCreated')
    return (
      <div className="p-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-palette-forest-light text-palette-forest-dark"
              aria-hidden
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
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 id="modal-title" className="text-2xl font-semibold text-stone-900 truncate">
              {successTitle}
            </h2>
          </div>
          {onClose && (
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="p-1.5 shrink-0 -mt-1 -mr-1"
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
        <p className="text-sm text-stone-600 mb-6" role="status">
          {signupState.success}
        </p>
        {onClose && (
          <Button type="button" variant="primary" fullWidth onClick={onClose}>
            {tCommon('close')}
          </Button>
        )}
        <p className="mt-4 text-center text-xs text-stone-500">
          {t('successCheckSpam')}
        </p>
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
        {t('signupSubtitleQuick')}
      </p>

      <SocialAuthButtons intent="signup" locale={locale} />
      <AuthDivider />

      <form
        action={signupAction}
        className="space-y-5"
        onSubmit={(e) => {
          let hasError = false
          if (!signupRole) {
            setRoleError(tErrors('roleRequired'))
            hasError = true
          } else {
            setRoleError(null)
          }
          if (!termsAccepted) {
            setTermsError(tErrors('termsRequired'))
            hasError = true
          } else {
            setTermsError(null)
          }
          if (hasError) e.preventDefault()
        }}
      >
        <AuthRolePicker
          value={signupRole}
          onChange={(role) => {
            setSignupRole(role)
            setRoleError(null)
          }}
          error={displayedRoleError}
          idPrefix="modal-signup-role"
        />
        <Input
          key={signupState?.existingEmail ? `signup-email-${signupState.existingEmail}` : 'signup-email'}
          id="modal-signup-email"
          label={t('email')}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder={t('emailPlaceholder')}
          defaultValue={signupState?.existingEmail ?? ''}
        />
        <PasswordInput
          id="modal-signup-password"
          label={t('passwordMin')}
          name="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder={t('passwordPlaceholder')}
        />

        <input type="hidden" name="termsAccepted" value={termsAccepted ? 'true' : 'false'} />

        <AuthLegalConsent
          locale={locale}
          checked={termsAccepted}
          onChange={(checked) => {
            setTermsAccepted(checked)
            if (checked) setTermsError(null)
          }}
          error={displayedTermsError}
          inputId="modal-termsAccepted"
        />

        {signupState?.error && !serverTermsError && !serverRoleError && (
          <p className={FORM_ERROR_TEXT_CLASSES} role="alert">
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

  // Écran succès : lien de réinitialisation envoyé (même style que succès inscription)
  if (resetState?.success) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-palette-forest-light text-palette-forest-dark"
              aria-hidden
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
                <path d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 id="modal-title" className="text-2xl font-semibold text-stone-900 truncate">
              {t('successTitleResetLinkSent')}
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="p-1.5 shrink-0 -mt-1 -mr-1"
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
        <p className="text-sm text-stone-600 mb-6" role="status">
          {resetState.success}
        </p>
        <Button type="button" variant="primary" fullWidth onClick={onBack}>
          ← {t('backToLogin')}
        </Button>
        <p className="mt-4 text-center text-xs text-stone-500">
          {t('successCheckSpam')}
        </p>
      </div>
    )
  }

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
          <p className="text-sm text-palette-danger" role="alert">
            {resetState.error}
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

'use client'

import { useState, useActionState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { login, signup, type LoginState, type SignupState } from './actions'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { PasswordInput } from '@/components/PasswordInput'
import { SocialAuthButtons, AuthDivider } from '@/components/SocialAuthButtons'
import { AuthRolePicker, type SignupRole } from '@/components/AuthRolePicker'
import { AuthLegalConsent } from '@/components/AuthLegalConsent'
import { FORM_ERROR_TEXT_CLASSES } from '@/lib/formStyles'

function getOAuthErrorMessage(
  errorCode: string | null,
  t: (key: string) => string
): string | null {
  if (!errorCode) return null
  if (errorCode === 'oauth_cancelled') return t('errors.oauthCancelled')
  if (errorCode === 'oauth_failed') return t('errors.oauthFailed')
  return null
}

function LoginPageContent() {
  const t = useTranslations('auth')
  const tErrors = useTranslations('auth.errors')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const confirmationFailed = searchParams.get('error') === 'confirmation_failed'
  const oauthError = getOAuthErrorMessage(searchParams.get('error'), t)

  const [loginState, loginAction] = useActionState<LoginState, FormData>(login, {})
  const [signupState, signupAction] = useActionState<SignupState, FormData>(signup, {})
  const [signupRole, setSignupRole] = useState<SignupRole | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)
  const [roleError, setRoleError] = useState<string | null>(null)

  const serverTermsError =
    signupState?.error === tErrors('termsRequired') ? signupState.error : null
  const serverRoleError =
    signupState?.error === tErrors('roleRequired') ? signupState.error : null
  const displayedTermsError = termsError ?? serverTermsError
  const displayedRoleError = roleError ?? serverRoleError

  const showSignupSuccess =
    Boolean(signupState?.success && signupState?.successType)
  const successTitle =
    signupState?.successType === 'emailResent'
      ? t('successTitleEmailResent')
      : t('successTitleAccountCreated')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-2 border-palette-forest-dark overflow-hidden">
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl font-semibold text-stone-900 text-center mb-1">
              {t('loginTitle')}
            </h1>
            <p className="text-stone-400 text-sm text-center mb-8">
              {t('loginSubtitle')}
            </p>

            {confirmationFailed && (
              <p
                className="mb-4 p-3 rounded-lg bg-palette-danger-light text-palette-danger-dark text-sm"
                role="alert"
              >
                {t('invalidOrExpiredLink')}
              </p>
            )}

            {oauthError && (
              <p
                className="mb-4 p-3 rounded-lg bg-palette-danger-light text-palette-danger-dark text-sm"
                role="alert"
              >
                {oauthError}
              </p>
            )}

            <SocialAuthButtons intent="login" locale={locale} />
            <AuthDivider />

            <form action={loginAction} className="space-y-5">
              <Input
                id="email"
                label={t('email')}
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder={t('emailPlaceholder')}
                className="rounded-xl"
              />
              <PasswordInput
                id="password"
                label={t('password')}
                name="password"
                autoComplete="current-password"
                required
                placeholder={t('passwordPlaceholder')}
                className="rounded-xl"
              />
              {loginState?.error && (
                <p className={FORM_ERROR_TEXT_CLASSES} role="alert">
                  {loginState.error}
                </p>
              )}
              <Button type="submit" variant="primary" fullWidth>
                {t('login')}
              </Button>
            </form>

            <AuthDivider />

            {showSignupSuccess ? (
              <div className="rounded-xl border border-palette-forest-dark bg-palette-forest-light/30 p-6 text-center">
                <div
                  className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-palette-forest-light text-palette-forest-dark"
                  aria-hidden
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
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
                <h2 className="text-lg font-semibold text-stone-900 mb-2">
                  {successTitle}
                </h2>
                <p className="text-sm text-stone-600 mb-4" role="status">
                  {signupState.success}
                </p>
                <p className="text-xs text-stone-500">{t('successCheckSpam')}</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-stone-700 mb-4">
                  {t('createAccount')}
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
                    idPrefix="page-signup-role"
                  />
                  <Input
                    key={
                      signupState?.existingEmail
                        ? `signup-email-${signupState.existingEmail}`
                        : 'signup-email'
                    }
                    id="signup-email"
                    label={t('emailSignup')}
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder={t('emailPlaceholder')}
                    className="rounded-xl"
                    defaultValue={signupState?.existingEmail ?? ''}
                  />
                  <PasswordInput
                    id="signup-password"
                    label={t('passwordMin')}
                    name="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    placeholder={t('passwordPlaceholder')}
                    className="rounded-xl"
                  />
                  <input
                    type="hidden"
                    name="termsAccepted"
                    value={termsAccepted ? 'true' : 'false'}
                  />
                  <AuthLegalConsent
                    locale={locale}
                    checked={termsAccepted}
                    onChange={(checked) => {
                      setTermsAccepted(checked)
                      if (checked) setTermsError(null)
                    }}
                    error={displayedTermsError}
                    inputId="signup-termsAccepted"
                  />
                  {signupState?.error && !serverTermsError && !serverRoleError && (
                    <p className={FORM_ERROR_TEXT_CLASSES} role="alert">
                      {signupState.error}
                    </p>
                  )}
                  <Button type="submit" variant="primary" fullWidth>
                    {t('signupButton')}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-200" />
      }
    >
      <LoginPageContent />
    </Suspense>
  )
}

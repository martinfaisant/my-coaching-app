'use client'

import { useState, useActionState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { login, signup, type LoginState, type SignupState } from './actions'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { FORM_ERROR_TEXT_CLASSES } from '@/lib/formStyles'

type SignupRole = 'athlete' | 'coach'

function LoginPageContent() {
  const t = useTranslations('auth')
  const searchParams = useSearchParams()
  const confirmationFailed =
    searchParams.get('error') === 'confirmation_failed'

  const [loginState, loginAction] = useActionState<LoginState, FormData>(login, {})
  const [signupState, signupAction] = useActionState<SignupState, FormData>(signup, {})
  const [signupRole, setSignupRole] = useState<SignupRole>('athlete')

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
              <Input
                id="password"
                label={t('password')}
                name="password"
                type="password"
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

            <div className="relative my-8">
              <span className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-palette-forest-dark" />
              </span>
              <span className="relative flex justify-center text-sm text-stone-400">
                {t('or')}
              </span>
            </div>

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
              <form action={signupAction} className="space-y-5">
                <p className="text-sm font-medium text-stone-700">
                  {t('createAccount')}
                </p>
                <div>
                  <span className="block text-sm font-medium text-stone-700 mb-2">
                    {t('signupAs')}
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-4 cursor-pointer transition ${
                        signupRole === 'athlete'
                          ? 'border-stone-900 bg-stone-100 text-stone-900'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600'
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
                      <span className="text-lg font-semibold">{t('athlete')}</span>
                      <span className="text-xs text-center">{t('athleteDesc')}</span>
                    </label>
                    <label
                      className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 p-4 cursor-pointer transition ${
                        signupRole === 'coach'
                          ? 'border-stone-900 bg-stone-100 text-stone-900'
                          : 'border-stone-200 hover:border-stone-300 text-stone-600'
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
                      <span className="text-lg font-semibold">{t('coach')}</span>
                      <span className="text-xs text-center">{t('coachDesc')}</span>
                    </label>
                  </div>
                </div>
                <Input
                  key={signupState?.existingEmail ? `signup-email-${signupState.existingEmail}` : 'signup-email'}
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
                <Input
                  id="signup-password"
                  label={t('passwordMin')}
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  placeholder={t('passwordPlaceholder')}
                  className="rounded-xl"
                />
                {signupState?.error && (
                  <p className="text-sm text-red-600" role="alert">
                    {signupState.error}
                  </p>
                )}
                <Button type="submit" variant="primary" fullWidth>
                  {t('signupButton')}
                </Button>
              </form>
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

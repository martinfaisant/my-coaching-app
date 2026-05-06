'use client'

import { useState, useActionState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { login, signup, type LoginState, type SignupState } from './actions'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { PasswordInput } from '@/components/PasswordInput'
import { FORM_ERROR_TEXT_CLASSES } from '@/lib/formStyles'

type SignupRole = 'athlete' | 'coach'

function LoginPageContent() {
  const t = useTranslations('auth')
  const tErrors = useTranslations('auth.errors')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const confirmationFailed =
    searchParams.get('error') === 'confirmation_failed'

  const [loginState, loginAction] = useActionState<LoginState, FormData>(login, {})
  const [signupState, signupAction] = useActionState<SignupState, FormData>(signup, {})
  const [signupRole, setSignupRole] = useState<SignupRole>('athlete')
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsError, setTermsError] = useState<string | null>(null)

  const serverTermsError =
    signupState?.error === tErrors('termsRequired') ? signupState.error : null
  const displayedTermsError = termsError ?? serverTermsError

  const showSignupSuccess =
    Boolean(signupState?.success && signupState?.successType)
  const successTitle =
    signupState?.successType === 'emailResent'
      ? t('successTitleEmailResent')
      : t('successTitleAccountCreated')

  const termsHref = locale === 'en' ? '/en/terms' : '/terms'
  const privacyHref = locale === 'en' ? '/en/privacy' : '/privacy'

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
              <form
                action={signupAction}
                className="space-y-5"
                onSubmit={(e) => {
                  if (termsAccepted) return
                  e.preventDefault()
                  setTermsError(tErrors('termsRequired'))
                }}
              >
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
                <input type="hidden" name="termsAccepted" value={termsAccepted ? 'true' : 'false'} />
                <div
                  className={`rounded-xl border px-4 py-3 ${
                    displayedTermsError
                      ? 'border-palette-danger bg-palette-danger-light/40'
                      : 'border-stone-200 bg-white'
                  }`}
                  aria-label={t('legalConsent.aria')}
                >
                  <div className="flex items-start gap-3">
                    <input
                      id="signup-termsAccepted"
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked)
                        if (e.target.checked) setTermsError(null)
                      }}
                      className="mt-1 h-4 w-4 rounded border-stone-300 text-palette-forest-dark focus:ring-palette-forest-dark"
                      aria-describedby={displayedTermsError ? 'signup-termsAccepted-error' : undefined}
                    />
                    <label htmlFor="signup-termsAccepted" className="text-sm text-stone-600 leading-relaxed">
                      {t('legalConsent.prefix')}{' '}
                      <Link
                        href={termsHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 text-palette-forest-dark hover:text-palette-olive font-medium"
                      >
                        {t('legalConsent.terms')}
                      </Link>{' '}
                      {t('legalConsent.and')}{' '}
                      <Link
                        href={privacyHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 text-palette-forest-dark hover:text-palette-olive font-medium"
                      >
                        {t('legalConsent.privacy')}
                      </Link>.
                    </label>
                  </div>
                  {displayedTermsError && (
                    <p id="signup-termsAccepted-error" className="mt-2 text-sm text-palette-danger" role="alert">
                      {displayedTermsError}
                    </p>
                  )}
                </div>
                {signupState?.error && !serverTermsError && (
                  <p className={FORM_ERROR_TEXT_CLASSES} role="alert">
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

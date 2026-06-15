'use client'

import { useActionState, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { AuthRolePicker, type SignupRole } from '@/components/AuthRolePicker'
import { AuthLegalConsent } from '@/components/AuthLegalConsent'
import { FORM_ERROR_TEXT_CLASSES } from '@/lib/formStyles'
import {
  completeOAuthSignup,
  type OAuthCompleteSignupState,
} from '@/app/[locale]/login/oauthActions'

type OAuthCompleteSignupFormProps = {
  email: string
  lockSignupRole?: boolean
}

export function OAuthCompleteSignupForm({ email, lockSignupRole = false }: OAuthCompleteSignupFormProps) {
  const t = useTranslations('auth')
  const tErrors = useTranslations('auth.errors')
  const locale = useLocale()
  const [state, action] = useActionState<OAuthCompleteSignupState, FormData>(
    completeOAuthSignup,
    {}
  )
  const [signupRole, setSignupRole] = useState<SignupRole | null>(lockSignupRole ? 'athlete' : null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [termsError, setTermsError] = useState<string | null>(null)

  const serverTermsError =
    state?.error === tErrors('termsRequired') ? state.error : null
  const serverRoleError =
    state?.error === tErrors('roleRequired') ? state.error : null
  const displayedTermsError = termsError ?? serverTermsError
  const displayedRoleError = roleError ?? serverRoleError
  const otherError =
    state?.error && !serverTermsError && !serverRoleError ? state.error : null

  return (
    <form
      action={action}
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
      <p className="text-center text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
        {t('oauthConnectedAs', { email })}
      </p>

      {lockSignupRole ? (
        <input type="hidden" name="role" value="athlete" />
      ) : (
        <AuthRolePicker
          value={signupRole}
          onChange={(role) => {
            setSignupRole(role)
            setRoleError(null)
          }}
          error={displayedRoleError}
          idPrefix="oauth-complete-role"
        />
      )}

      <input type="hidden" name="_locale" value={locale} />
      <input type="hidden" name="termsAccepted" value={termsAccepted ? 'true' : 'false'} />

      <AuthLegalConsent
        locale={locale}
        checked={termsAccepted}
        onChange={(checked) => {
          setTermsAccepted(checked)
          if (checked) setTermsError(null)
        }}
        error={displayedTermsError}
        inputId="oauth-complete-terms"
      />

      {otherError && (
        <p className={FORM_ERROR_TEXT_CLASSES} role="alert">
          {otherError}
        </p>
      )}

      <Button type="submit" variant="primary" fullWidth>
        {t('oauthContinue')}
      </Button>
    </form>
  )
}

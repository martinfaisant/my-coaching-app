'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { PasswordInput } from '@/components/PasswordInput'
import { FORM_ERROR_TEXT_CLASSES } from '@/lib/formStyles'
import {
  linkGoogleAccount,
  type OAuthLinkAccountState,
} from '@/app/[locale]/login/oauthActions'

type OAuthLinkAccountFormProps = {
  email?: string
}

export function OAuthLinkAccountForm({ email }: OAuthLinkAccountFormProps) {
  const t = useTranslations('auth')
  const locale = useLocale()
  const [state, action] = useActionState<OAuthLinkAccountState, FormData>(linkGoogleAccount, {})

  const loginHref = locale === 'en' ? '/en/login' : '/login'
  const forgotHref = locale === 'en' ? '/en/reset-password' : '/reset-password'

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="_locale" value={locale} />

      <p className="text-sm text-stone-600 text-center leading-relaxed">
        {email ? t('linkGoogleAccountMessage', { email }) : t('linkGoogleAccountMessageGeneric')}
      </p>
      <p className="text-xs text-stone-500 text-center">{t('linkGoogleAccountHint')}</p>

      <Input
        id="link-email"
        label={t('email')}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={email ?? ''}
        readOnly={Boolean(email)}
        placeholder={t('emailPlaceholder')}
        className="rounded-xl"
      />
      <PasswordInput
        id="link-password"
        label={t('password')}
        name="password"
        autoComplete="current-password"
        required
        placeholder={t('passwordPlaceholder')}
        className="rounded-xl"
      />

      {state?.error && (
        <p className={FORM_ERROR_TEXT_CLASSES} role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" variant="primary" fullWidth>
        {t('linkGoogleAccountSubmit')}
      </Button>

      <div className="flex flex-col items-center gap-2">
        <Link
          href={forgotHref}
          className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
        >
          {t('forgotPassword')}
        </Link>
        <Link
          href={loginHref}
          className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
        >
          ← {t('backToLogin')}
        </Link>
      </div>
    </form>
  )
}

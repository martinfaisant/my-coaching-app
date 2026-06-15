'use client'

import { useActionState } from 'react'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/Modal'
import { AuthSubmitButton } from '@/components/AuthSubmitButton'
import { Input } from '@/components/Input'
import { login, type LoginState } from '@/app/[locale]/login/actions'

type EmailValidatedModalProps = {
  isOpen: boolean
  onClose: () => void
}

const initialLoginState: LoginState = {}

export function EmailValidatedModal({ isOpen, onClose }: EmailValidatedModalProps) {
  const t = useTranslations('auth')
  const [loginState, loginAction] = useActionState<LoginState, FormData>(
    login,
    initialLoginState
  )

  const icon = (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={t('emailValidatedTitle')}
      icon={icon}
    >
      <div className="px-6 py-4">
        <p className="text-sm text-stone-600 mb-6">
          {t('emailValidatedMessage')}
        </p>
        <form action={loginAction} className="space-y-4">
          <Input
            id="email-validated-email"
            label={t('email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={t('emailPlaceholder')}
            className="rounded-xl"
          />
          <Input
            id="email-validated-password"
            label={t('password')}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder={t('passwordPlaceholder')}
            className="rounded-xl"
          />
          {loginState?.error && (
            <p className="text-sm text-palette-danger" role="alert">
              {loginState.error}
            </p>
          )}
          <AuthSubmitButton
            variant="primaryDark"
            fullWidth
            className="mt-2"
            loadingText={t('loggingIn')}
          >
            {t('login')}
          </AuthSubmitButton>
        </form>
      </div>
    </Modal>
  )
}

'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'

type AuthLegalConsentProps = {
  locale: string
  checked: boolean
  onChange: (checked: boolean) => void
  error?: string | null
  inputId: string
}

export function AuthLegalConsent({
  locale,
  checked,
  onChange,
  error,
  inputId,
}: AuthLegalConsentProps) {
  const t = useTranslations('auth')
  const termsHref = locale === 'en' ? '/en/terms' : '/terms'
  const privacyHref = locale === 'en' ? '/en/privacy' : '/privacy'

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        error
          ? 'border-palette-danger bg-palette-danger-light/40'
          : 'border-stone-200 bg-white'
      }`}
      aria-label={t('legalConsent.aria')}
    >
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-stone-300 text-palette-forest-dark focus:ring-palette-forest-dark"
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        <label htmlFor={inputId} className="text-sm text-stone-600 leading-relaxed">
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
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-sm text-palette-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

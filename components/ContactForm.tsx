'use client'

import { useActionState, useMemo, useState, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { submitContact, type ContactFormState } from '@/app/[locale]/contact/actions'
import { Button } from '@/components/Button'
import { Dropdown, type DropdownOption } from '@/components/Dropdown'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import {
  CONTACT_EMAIL_RE,
  CONTACT_MAX_MESSAGE,
  CONTACT_MAX_NAME,
} from '@/lib/contactFormConstraints'
import { CONTACT_REASON_KEYS, isContactReasonKey } from '@/lib/contactReasons'
import { FORM_ERROR_TEXT_CLASSES } from '@/lib/formStyles'

export type ContactFormInitialValues = {
  firstName: string
  lastName: string
  email: string
}

type ContactFormProps = {
  initialValues: ContactFormInitialValues
}

export function ContactForm({ initialValues }: ContactFormProps) {
  const t = useTranslations('contact')
  const locale = useLocale() as 'fr' | 'en'
  const [state, formAction, isPending] = useActionState<ContactFormState, FormData>(submitContact, {})

  const [firstName, setFirstName] = useState(initialValues.firstName)
  const [lastName, setLastName] = useState(initialValues.lastName)
  const [email, setEmail] = useState(initialValues.email)
  const [phone, setPhone] = useState('')
  const [reasonKey, setReasonKey] = useState('')
  const [message, setMessage] = useState('')

  const reasonOptions: DropdownOption[] = useMemo(
    () =>
      CONTACT_REASON_KEYS.map((key) => ({
        value: key,
        label: t(`reasons.${key}`),
      })),
    [t],
  )

  const placeholderOption: DropdownOption = useMemo(
    () => ({ value: '', label: t('reasonPlaceholder') }),
    [t],
  )

  const dropdownOptions = useMemo(() => [placeholderOption, ...reasonOptions], [placeholderOption, reasonOptions])

  const isComplete = useMemo(() => {
    const fn = firstName.trim()
    const ln = lastName.trim()
    const em = email.trim()
    const msg = message.trim()
    if (!fn || !ln || !em || !msg || !reasonKey) {
      return false
    }
    if (fn.length > CONTACT_MAX_NAME || ln.length > CONTACT_MAX_NAME || msg.length > CONTACT_MAX_MESSAGE) {
      return false
    }
    return CONTACT_EMAIL_RE.test(em)
  }, [firstName, lastName, email, message, reasonKey])

  const displayReasonLabel =
    reasonKey !== '' && isContactReasonKey(reasonKey)
      ? t(`reasons.${reasonKey}`)
      : placeholderOption.label

  const onReasonChange = useCallback(
    (value: string) => {
      setReasonKey(value)
    },
    [],
  )

  if (state.success && state.reference) {
    return (
      <div
        className="rounded-xl border border-palette-forest-dark/35 bg-palette-forest-dark/10 px-5 py-6 text-stone-800"
        role="status"
      >
        <p className="text-lg font-semibold text-palette-forest-darker mb-2">{t('success.title')}</p>
        <p className="text-stone-700 mb-3">{t('success.body')}</p>
        <p className="font-mono text-base font-medium text-palette-forest-darker tracking-wide">{state.reference}</p>
        <p className="text-sm text-stone-600 mt-4">{t('success.replyHint')}</p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="_locale" value={locale} readOnly />
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
        aria-hidden
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          name="firstName"
          label={t('labels.firstName')}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
          maxLength={CONTACT_MAX_NAME}
          required
        />
        <Input
          name="lastName"
          label={t('labels.lastName')}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
          maxLength={CONTACT_MAX_NAME}
          required
        />
      </div>

      <Input
        name="email"
        type="email"
        label={t('labels.email')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <Input
        name="phone"
        type="tel"
        label={t('labels.phone')}
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        autoComplete="tel"
      />

      <input type="hidden" name="reasonKey" value={reasonKey} readOnly />

      <div className="w-full">
        <Dropdown
          id="contact-reason"
          label={t('labels.reason')}
          options={dropdownOptions}
          value={reasonKey}
          onChange={onReasonChange}
          minWidth="100%"
          className="!block w-full"
          valueDisplay={displayReasonLabel}
          ariaLabel={t('labels.reason')}
        />
      </div>

      <Textarea
        name="message"
        label={t('labels.message')}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={CONTACT_MAX_MESSAGE}
        required
        rows={6}
      />

      {state.error && <p className={FORM_ERROR_TEXT_CLASSES}>{state.error}</p>}

      <p className="text-sm text-stone-600 leading-relaxed">
        {t.rich('privacyConsentNotice', {
          privacy: (chunks) => (
            <Link
              href="/privacy"
              className="font-medium text-palette-forest-dark underline underline-offset-2 hover:text-palette-forest-darker focus:outline-none focus-visible:ring-2 focus-visible:ring-palette-forest-dark/35 rounded-sm"
            >
              {chunks}
            </Link>
          ),
        })}
      </p>

      <Button
        type="submit"
        variant="primaryDark"
        fullWidth
        disabled={!isComplete}
        loading={isPending}
        loadingText={t('submitting')}
      >
        {t('submit')}
      </Button>
    </form>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { CoachPlatformBillingAddressFields } from '@/components/CoachPlatformBillingAddressFields'
import {
  normalizeCoachBillingAddressFields,
  type CoachPlatformCheckoutPrerequisitesSnapshot,
} from '@/lib/coachPlatformCheckoutPrerequisites'
import type { CoachBillingAddressFields } from '@/lib/stripeCoachPlatformBillingAddress'

export type CoachPlatformCheckoutPrerequisitesFormProps = {
  initialSnapshot: CoachPlatformCheckoutPrerequisitesSnapshot
  error: string | null
  isPending: boolean
  pendingPhase: 'saving' | 'redirecting' | null
  formId: string
  onRetryLoad: () => void
  billingLoadError: boolean
}

export function getCoachPlatformCheckoutPrerequisitesFormPayload(form: HTMLFormElement): {
  firstName: string
  lastName: string
  billingFields: CoachBillingAddressFields
} {
  const firstName = (form.elements.namedItem('checkout_first_name') as HTMLInputElement)?.value.trim() ?? ''
  const lastName = (form.elements.namedItem('checkout_last_name') as HTMLInputElement)?.value.trim() ?? ''
  const line1 = (form.elements.namedItem('billing_line1') as HTMLInputElement)?.value.trim() ?? ''
  const line2 = (form.elements.namedItem('billing_line2') as HTMLInputElement)?.value.trim() ?? ''
  const city = (form.elements.namedItem('billing_city') as HTMLInputElement)?.value.trim() ?? ''
  const postalCode = (form.elements.namedItem('billing_postal_code') as HTMLInputElement)?.value.trim() ?? ''
  const provinceCode =
    (form.elements.namedItem('billing_province') as HTMLInputElement)?.value.trim().toUpperCase() ?? ''
  return {
    firstName,
    lastName,
    billingFields: { line1, line2, city, postalCode, provinceCode },
  }
}

export function CoachPlatformCheckoutPrerequisitesForm({
  initialSnapshot,
  error,
  isPending,
  pendingPhase,
  formId,
  onRetryLoad,
  billingLoadError,
}: CoachPlatformCheckoutPrerequisitesFormProps) {
  const t = useTranslations('coachMsaSubscription.checkoutPrerequisites')
  const tProfile = useTranslations('profile')

  const [firstName, setFirstName] = useState(initialSnapshot.firstName)
  const [lastName, setLastName] = useState(initialSnapshot.lastName)
  const [billingFields, setBillingFields] = useState<CoachBillingAddressFields>(() =>
    normalizeCoachBillingAddressFields(initialSnapshot.billingFields)
  )

  useEffect(() => {
    setFirstName(initialSnapshot.firstName)
    setLastName(initialSnapshot.lastName)
    setBillingFields(normalizeCoachBillingAddressFields(initialSnapshot.billingFields))
  }, [initialSnapshot])

  const fieldsDisabled = isPending || billingLoadError

  if (billingLoadError) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-stone-600">{t('intro')}</p>
        <p className="text-sm text-palette-danger" role="alert">
          {t('loadError')}
        </p>
        <Button type="button" variant="muted" onClick={onRetryLoad} disabled={isPending}>
          {t('retry')}
        </Button>
      </div>
    )
  }

  return (
    <form id={formId} className="space-y-5" onSubmit={(e) => e.preventDefault()}>
      <p className="text-sm text-stone-600">{t('intro')}</p>

      {error ? (
        <p className="text-sm text-palette-danger" role="alert">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          id={`${formId}-first-name`}
          label={tProfile('firstName')}
          name="checkout_first_name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={fieldsDisabled}
        />
        <Input
          id={`${formId}-last-name`}
          label={tProfile('lastName')}
          name="checkout_last_name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={fieldsDisabled}
        />
      </div>

      <div className="space-y-3 border-t border-stone-100 pt-4">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-600">{t('billingSectionTitle')}</p>
        <CoachPlatformBillingAddressFields
          idPrefix={`${formId}-billing`}
          values={billingFields}
          onChange={setBillingFields}
          disabled={fieldsDisabled}
          useFormNames
          provinceOnSeparateRow
        />
      </div>

      {isPending && pendingPhase ? (
        <p className="text-sm text-stone-500 sr-only" aria-live="polite">
          {pendingPhase === 'redirecting' ? t('redirecting') : t('saving')}
        </p>
      ) : null}
    </form>
  )
}

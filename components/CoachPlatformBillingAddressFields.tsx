'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/Input'
import { Dropdown, type DropdownOption } from '@/components/Dropdown'
import { CANADIAN_PROVINCE_CODES } from '@/lib/canadianProvinces'
import type { CoachBillingAddressFields } from '@/lib/stripeCoachPlatformBillingAddress'

export type CoachPlatformBillingAddressFieldsProps = {
  idPrefix: string
  values: CoachBillingAddressFields
  onChange: (next: CoachBillingAddressFields) => void
  disabled?: boolean
  /** Champs HTML `name` pour soumission FormData (optionnel). */
  useFormNames?: boolean
  /** Modales étroites : province sur une ligne dédiée (CP + ville au-dessus). */
  provinceOnSeparateRow?: boolean
}

export function CoachPlatformBillingAddressFields({
  idPrefix,
  values,
  onChange,
  disabled = false,
  useFormNames = false,
  provinceOnSeparateRow = false,
}: CoachPlatformBillingAddressFieldsProps) {
  const t = useTranslations('coachMsaSubscription.billingAddress')

  const provinceOptions: DropdownOption[] = useMemo(() => {
    const placeholder: DropdownOption = { value: '', label: t('provincePlaceholder') }
    const opts = [...CANADIAN_PROVINCE_CODES].map((code) => ({
      value: code,
      label: t(`provinces.${code}`),
    }))
    return [placeholder, ...opts]
  }, [t])

  const patch = (partial: Partial<CoachBillingAddressFields>) => {
    onChange({ ...values, ...partial })
  }

  return (
    <fieldset disabled={disabled} className="space-y-3 border-0 p-0 m-0 min-w-0">
      <Input
        label={t('line1')}
        name={useFormNames ? 'billing_line1' : undefined}
        value={values.line1}
        onChange={(e) => patch({ line1: e.target.value })}
        required
        disabled={disabled}
      />
      <Input
        label={t('line2Optional')}
        name={useFormNames ? 'billing_line2' : undefined}
        value={values.line2}
        onChange={(e) => patch({ line2: e.target.value })}
        disabled={disabled}
      />
      {provinceOnSeparateRow ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label={t('postalCode')}
              name={useFormNames ? 'billing_postal_code' : undefined}
              value={values.postalCode}
              onChange={(e) => patch({ postalCode: e.target.value })}
              required
              disabled={disabled}
            />
            <Input
              label={t('city')}
              name={useFormNames ? 'billing_city' : undefined}
              value={values.city}
              onChange={(e) => patch({ city: e.target.value })}
              required
              disabled={disabled}
            />
          </div>
          <Dropdown
            id={`${idPrefix}-province`}
            label={t('province')}
            options={provinceOptions}
            value={values.provinceCode}
            onChange={(v) => patch({ provinceCode: v })}
            ariaLabel={t('province')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label={t('postalCode')}
            name={useFormNames ? 'billing_postal_code' : undefined}
            value={values.postalCode}
            onChange={(e) => patch({ postalCode: e.target.value })}
            required
            disabled={disabled}
          />
          <Input
            label={t('city')}
            name={useFormNames ? 'billing_city' : undefined}
            value={values.city}
            onChange={(e) => patch({ city: e.target.value })}
            required
            disabled={disabled}
          />
          <Dropdown
            id={`${idPrefix}-province`}
            label={t('province')}
            options={provinceOptions}
            value={values.provinceCode}
            onChange={(v) => patch({ provinceCode: v })}
            ariaLabel={t('province')}
          />
        </div>
      )}
      {useFormNames ? (
        <input type="hidden" name="billing_province" value={values.provinceCode} readOnly />
      ) : null}
      <div>
        <p className="block text-sm font-medium text-stone-700 mb-1">{t('country')}</p>
        <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700">{t('countryDisplay')}</p>
      </div>
    </fieldset>
  )
}

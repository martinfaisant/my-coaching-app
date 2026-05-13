'use client'

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Dropdown, type DropdownOption } from '@/components/Dropdown'
import { CANADIAN_PROVINCE_CODES } from '@/lib/canadianProvinces'
import type { CoachBillingAddressFields } from '@/lib/stripeCoachPlatformBillingAddress'
import {
  saveCoachPlatformBillingAddress,
  type CoachBillingAddressFormState,
} from '@/app/[locale]/dashboard/coach-platform-subscription/coachPlatformBillingAddressActions'

export type CoachPlatformBillingAddressSectionProps = {
  /** Données initiales (serveur) — null si aucune adresse Stripe. */
  initialFields: CoachBillingAddressFields | null
  /** true si `customers.retrieve` a échoué alors qu’un `stripe_customer_id` existait. */
  loadError: boolean
}

function fieldsEqual(a: CoachBillingAddressFields, b: CoachBillingAddressFields): boolean {
  return (
    a.line1 === b.line1 &&
    a.line2 === b.line2 &&
    a.city === b.city &&
    a.postalCode === b.postalCode &&
    a.provinceCode === b.provinceCode
  )
}

function normalizeBillingFields(f: CoachBillingAddressFields | null): CoachBillingAddressFields {
  return {
    line1: f?.line1 ?? '',
    line2: f?.line2 ?? '',
    city: f?.city ?? '',
    postalCode: f?.postalCode ?? '',
    provinceCode: f?.provinceCode ?? '',
  }
}

export function CoachPlatformBillingAddressSection({ initialFields, loadError }: CoachPlatformBillingAddressSectionProps) {
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('coachMsaSubscription.billingAddress')
  const tCommon = useTranslations('common')

  const [mode, setMode] = useState<'view' | 'edit'>('view')

  const [line1, setLine1] = useState(initialFields?.line1 ?? '')
  const [line2, setLine2] = useState(initialFields?.line2 ?? '')
  const [city, setCity] = useState(initialFields?.city ?? '')
  const [postalCode, setPostalCode] = useState(initialFields?.postalCode ?? '')
  const [province, setProvince] = useState(initialFields?.provinceCode ?? '')

  const [state, formAction, isPending] = useActionState<CoachBillingAddressFormState, FormData>(
    saveCoachPlatformBillingAddress,
    {}
  )

  const previousIsSubmittingRef = useRef(false)
  const savedFeedbackHideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [savedSnapshot, setSavedSnapshot] = useState<CoachBillingAddressFields>(() =>
    normalizeBillingFields(initialFields)
  )

  const normalizedServer = useMemo(() => normalizeBillingFields(initialFields), [initialFields])
  const serverJson = JSON.stringify(normalizedServer)
  const [prevServerJson, setPrevServerJson] = useState<string | null>(null)
  if (prevServerJson === null || serverJson !== prevServerJson) {
    setPrevServerJson(serverJson)
    setLine1(normalizedServer.line1)
    setLine2(normalizedServer.line2)
    setCity(normalizedServer.city)
    setPostalCode(normalizedServer.postalCode)
    setProvince(normalizedServer.provinceCode)
    setSavedSnapshot({ ...normalizedServer })
  }

  const provinceOptions: DropdownOption[] = useMemo(() => {
    const placeholder: DropdownOption = { value: '', label: t('provincePlaceholder') }
    const opts = [...CANADIAN_PROVINCE_CODES].map((code) => ({
      value: code,
      label: t(`provinces.${code}`),
    }))
    return [placeholder, ...opts]
  }, [t])

  const syncFromProps = useCallback((f: CoachBillingAddressFields | null) => {
    const next = normalizeBillingFields(f)
    setLine1(next.line1)
    setLine2(next.line2)
    setCity(next.city)
    setPostalCode(next.postalCode)
    setProvince(next.provinceCode)
    setSavedSnapshot({ ...next })
  }, [])

  const curDraft: CoachBillingAddressFields = { line1, line2, city, postalCode, provinceCode: province }
  const hasUnsavedChanges = !fieldsEqual(curDraft, savedSnapshot)

  const saveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isPending}`

  useEffect(() => {
    const justFinishedSubmitting = previousIsSubmittingRef.current && !isPending
    previousIsSubmittingRef.current = isPending

    if (state?.success && justFinishedSubmitting) {
      const next: CoachBillingAddressFields = { line1, line2, city, postalCode, provinceCode: province }
      let cancelled = false
      queueMicrotask(() => {
        if (cancelled) return
        setShowSavedFeedback(true)
        router.refresh()
        setMode('view')
        setSavedSnapshot({ ...next })
        if (savedFeedbackHideTimerRef.current !== undefined) {
          clearTimeout(savedFeedbackHideTimerRef.current)
        }
        savedFeedbackHideTimerRef.current = setTimeout(() => {
          setShowSavedFeedback(false)
          savedFeedbackHideTimerRef.current = undefined
        }, 2200)
      })
      return () => {
        cancelled = true
        if (savedFeedbackHideTimerRef.current !== undefined) {
          clearTimeout(savedFeedbackHideTimerRef.current)
          savedFeedbackHideTimerRef.current = undefined
        }
      }
    }
    if (state?.error) {
      queueMicrotask(() => {
        setShowSavedFeedback(false)
      })
    }
    return undefined
  }, [saveFeedbackKey, isPending, state?.success, state?.error, router, line1, line2, city, postalCode, province])

  const hasStoredAddress =
    !loadError &&
    initialFields != null &&
    Boolean((initialFields.line1 ?? '').trim())

  const openEdit = () => {
    syncFromProps(initialFields)
    setMode('edit')
  }

  const cancelEdit = () => {
    syncFromProps(initialFields)
    setMode('view')
  }

  const provinceLabelForRead = (code: string) => {
    if (!code) return ''
    return t(`provinces.${code}`)
  }

  if (loadError) {
    return (
      <div className="border border-stone-100 bg-white rounded-2xl p-4">
        <p className="text-sm text-palette-danger">{t('loadError')}</p>
        <Button type="button" variant="muted" className="mt-3" onClick={() => router.refresh()}>
          {t('retry')}
        </Button>
      </div>
    )
  }

  if (mode === 'edit') {
    return (
      <div className="border border-stone-100 bg-white rounded-2xl p-4">
        <form action={formAction} className="space-y-5" aria-labelledby="coach-billing-address-subheading">
          <input type="hidden" name="_locale" value={locale} readOnly />
          <input type="hidden" name="billing_province" value={province} readOnly />

          {state?.error ? <p className="text-sm text-palette-danger">{state.error}</p> : null}

          <div className="space-y-3">
            <Input
              label={t('line1')}
              name="billing_line1"
              value={line1}
              onChange={(e) => setLine1(e.target.value)}
              required
            />
            <Input
              label={t('line2Optional')}
              name="billing_line2"
              value={line2}
              onChange={(e) => setLine2(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label={t('postalCode')}
              name="billing_postal_code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
            <Input label={t('city')} name="billing_city" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Dropdown
              id="billing-province"
              label={t('province')}
              options={provinceOptions}
              value={province}
              onChange={(v) => setProvince(v)}
              ariaLabel={t('province')}
            />
          </div>

          <div>
            <p className="block text-sm font-medium text-stone-700 mb-1">{t('country')}</p>
            <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-700">{t('countryDisplay')}</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-stone-100">
            <Button type="button" variant="muted" onClick={cancelEdit}>
              {tCommon('cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!hasUnsavedChanges || isPending}
              loading={isPending}
              loadingText={t('saving')}
              success={showSavedFeedback}
              successText={t('saved')}
            >
              {tCommon('save')}
            </Button>
          </div>
        </form>
      </div>
    )
  }

  if (!hasStoredAddress && mode === 'view') {
    return (
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-dashed border-stone-200 bg-white px-4 py-6">
        <p className="text-sm text-stone-600 min-w-0 flex-1">{t('emptyDescription')}</p>
        <Button type="button" variant="secondary" className="shrink-0 whitespace-nowrap" onClick={openEdit}>
          {t('addAddress')}
        </Button>
      </div>
    )
  }

  const f = initialFields ?? {
    line1: '',
    line2: '',
    city: '',
    postalCode: '',
    provinceCode: '',
  }

  return (
    <div className="border border-stone-100 bg-white rounded-2xl p-4" aria-labelledby="coach-billing-address-subheading">
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1 text-sm text-stone-700 space-y-1.5">
          {f.line1 ? <div className="whitespace-pre-wrap">{f.line1}</div> : null}
          {f.line2 ? <div className="text-stone-500">{f.line2}</div> : null}
          {f.city ? <div>{f.city}</div> : null}
          <div>
            {[f.postalCode, f.provinceCode ? provinceLabelForRead(f.provinceCode) : '', t('countryDisplay')]
              .filter((p) => p.length > 0)
              .join(' · ')}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-auto">
          <Button type="button" variant="secondary" onClick={openEdit}>
            {t('edit')}
          </Button>
        </div>
      </div>
    </div>
  )
}

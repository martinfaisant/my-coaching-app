'use server'

import { getTranslations } from 'next-intl/server'
import { createClient, createAdminClient } from '@/utils/supabase/server'
import { requireUser } from '@/lib/authHelpers'
import { getStripeServer } from '@/lib/stripeServer'
import { logger } from '@/lib/logger'
import type { CoachPlatformSubscription } from '@/types/database'
import { isCanadianProvinceCode } from '@/lib/canadianProvinces'
import type { CoachBillingAddressFields } from '@/lib/stripeCoachPlatformBillingAddress'
import {
  fetchCoachBillingAddressFromStripe,
  persistCoachPlatformStripeBillingForCoach,
} from '@/lib/stripeCoachPlatformBillingAddress'

export type CoachBillingAddressFormState = {
  error?: string
  success?: boolean
}

function readLocale(formData: FormData): string {
  const raw = formData.get('_locale')
  return typeof raw === 'string' && raw.trim() ? raw.trim() : 'fr'
}

export async function saveCoachPlatformBillingAddress(
  _prev: CoachBillingAddressFormState,
  formData: FormData
): Promise<CoachBillingAddressFormState> {
  const locale = readLocale(formData)
  const t = await getTranslations({ locale, namespace: 'coachMsaSubscription.billingAddress' })
  const tVal = await getTranslations({ locale, namespace: 'coachMsaSubscription.billingAddress.validation' })

  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) {
    return { error: tVal('notAuthenticated') }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, first_name, last_name')
    .eq('user_id', auth.user.id)
    .single()

  if (profile?.role !== 'coach') {
    return { error: tVal('coachOnly') }
  }

  if (!profile.email?.trim()) {
    return { error: tVal('missingEmail') }
  }

  const line1 = (formData.get('billing_line1') as string)?.trim() ?? ''
  const line2 = (formData.get('billing_line2') as string)?.trim() ?? ''
  const city = (formData.get('billing_city') as string)?.trim() ?? ''
  const postalCode = (formData.get('billing_postal_code') as string)?.trim() ?? ''
  const provinceRaw = (formData.get('billing_province') as string)?.trim().toUpperCase() ?? ''

  if (!line1) {
    return { error: tVal('line1Required') }
  }
  if (!city) {
    return { error: tVal('cityRequired') }
  }
  if (!postalCode) {
    return { error: tVal('postalRequired') }
  }
  if (!isCanadianProvinceCode(provinceRaw)) {
    return { error: tVal('provinceRequired') }
  }

  const stripe = getStripeServer()
  if (!stripe) {
    logger.error('saveCoachPlatformBillingAddress: Stripe not configured')
    return { error: t('errors.stripeUnavailable') }
  }

  const { data: platformRow, error: rowError } = await supabase
    .from('coach_platform_subscriptions')
    .select('*')
    .eq('coach_id', auth.user.id)
    .maybeSingle()

  if (rowError) {
    logger.error('saveCoachPlatformBillingAddress: select coach_platform_subscriptions failed', rowError, {
      coachId: auth.user.id,
    })
    return { error: t('errors.saveFailed') }
  }

  const existingRow = (platformRow ?? null) as CoachPlatformSubscription | null
  const admin = createAdminClient()

  const persist = await persistCoachPlatformStripeBillingForCoach({
    stripe,
    supabaseUser: supabase,
    admin,
    coachId: auth.user.id,
    email: profile.email,
    locale,
    existingRow,
    firstName: profile.first_name,
    lastName: profile.last_name,
    billingBody: {
      line1,
      line2,
      city,
      postalCode,
      provinceCode: provinceRaw,
    },
  })

  if (!persist.ok) {
    if (persist.reason === 'missing_email') {
      return { error: tVal('missingEmail') }
    }
    if (persist.reason === 'persist_failed') {
      return { error: t('errors.persistFailed') }
    }
    if (persist.reason === 'stripe_customer_failed') {
      return { error: t('errors.stripeCustomerFailed') }
    }
    return { error: t('errors.saveFailed') }
  }

  return { success: true }
}

export async function loadCoachBillingAddressForPage(
  stripeCustomerId: string | null | undefined
): Promise<{ fields: CoachBillingAddressFields | null; loadError: boolean }> {
  const stripe = getStripeServer()
  if (!stripe) {
    return { fields: null, loadError: false }
  }
  const id = typeof stripeCustomerId === 'string' ? stripeCustomerId.trim() : ''
  if (!id.startsWith('cus_')) {
    return { fields: null, loadError: false }
  }
  const res = await fetchCoachBillingAddressFromStripe(stripe, id)
  if (!res.ok) {
    return { fields: null, loadError: true }
  }
  return { fields: res.fields, loadError: false }
}

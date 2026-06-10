'use server'

import { revalidatePath } from 'next/cache'
import { getTranslations } from 'next-intl/server'
import { createAdminClient, createClient } from '@/utils/supabase/server'
import { requireUser } from '@/lib/authHelpers'
import { getStripeServer } from '@/lib/stripeServer'
import { logger } from '@/lib/logger'
import type { CoachPlatformSubscription } from '@/types/database'
import { isCanadianProvinceCode } from '@/lib/canadianProvinces'
import {
  areCoachPlatformCheckoutPrerequisitesMet,
  buildCoachPlatformCheckoutPrerequisitesSnapshot,
  type CoachPlatformCheckoutPrerequisitesSnapshot,
} from '@/lib/coachPlatformCheckoutPrerequisites'
import {
  fetchCoachBillingAddressFromStripe,
  persistCoachPlatformStripeBillingForCoach,
  type CoachBillingAddressFields,
} from '@/lib/stripeCoachPlatformBillingAddress'

export type LoadCoachPlatformCheckoutPrerequisitesResult =
  | { ok: true; complete: boolean; snapshot: CoachPlatformCheckoutPrerequisitesSnapshot }
  | { ok: false; error: string }

export type SaveCoachPlatformCheckoutPrerequisitesPayload = {
  firstName: string
  lastName: string
  billingFields: CoachBillingAddressFields
}

export type SaveCoachPlatformCheckoutPrerequisitesResult =
  | { ok: true }
  | { ok: false; error: string }

function revalidateCoachPlatformSubscriptionPaths(locale: string): void {
  revalidatePath(`/${locale}/dashboard/coach-platform-subscription`)
  revalidatePath(`/${locale}/dashboard/profile`)
  revalidatePath(`/${locale}/dashboard/athletes`)
  revalidatePath(`/${locale}/dashboard`)
}

function parseBillingFields(body: CoachBillingAddressFields): {
  ok: true
  fields: CoachBillingAddressFields
} | { ok: false } {
  const line1 = body.line1?.trim() ?? ''
  const line2 = body.line2?.trim() ?? ''
  const city = body.city?.trim() ?? ''
  const postalCode = body.postalCode?.trim() ?? ''
  const provinceRaw = body.provinceCode?.trim().toUpperCase() ?? ''
  if (!line1 || !city || !postalCode || !isCanadianProvinceCode(provinceRaw)) {
    return { ok: false }
  }
  return {
    ok: true,
    fields: { line1, line2, city, postalCode, provinceCode: provinceRaw },
  }
}

/** Charge prénom, nom et adresse Stripe pour le gate Checkout (coach connecté). */
export async function loadCoachPlatformCheckoutPrerequisitesForCoach(
  locale: string
): Promise<LoadCoachPlatformCheckoutPrerequisitesResult> {
  const tVal = await getTranslations({ locale, namespace: 'coachPlatform.validation' })

  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) {
    return { ok: false, error: tVal('notAuthenticated') }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, first_name, last_name, email')
    .eq('user_id', auth.user.id)
    .single()

  if (profile?.role !== 'coach') {
    return { ok: false, error: tVal('coachOnly') }
  }

  const { data: platformRow } = await supabase
    .from('coach_platform_subscriptions')
    .select('stripe_customer_id')
    .eq('coach_id', auth.user.id)
    .maybeSingle()

  const stripeCustomerId =
    typeof platformRow?.stripe_customer_id === 'string' ? platformRow.stripe_customer_id.trim() : ''

  let billingFields: CoachBillingAddressFields | null = null
  let billingLoadError = false

  const stripe = getStripeServer()
  if (stripe && stripeCustomerId.startsWith('cus_')) {
    const res = await fetchCoachBillingAddressFromStripe(stripe, stripeCustomerId)
    if (!res.ok) {
      billingLoadError = true
    } else {
      billingFields = res.fields
    }
  }

  const snapshot = buildCoachPlatformCheckoutPrerequisitesSnapshot({
    firstName: profile.first_name,
    lastName: profile.last_name,
    billingFields,
    billingLoadError,
  })

  const complete =
    !billingLoadError &&
    areCoachPlatformCheckoutPrerequisitesMet(profile.first_name, profile.last_name, billingFields)

  return { ok: true, complete, snapshot }
}

export async function saveCoachPlatformCheckoutPrerequisites(
  locale: string,
  payload: SaveCoachPlatformCheckoutPrerequisitesPayload
): Promise<SaveCoachPlatformCheckoutPrerequisitesResult> {
  const t = await getTranslations({ locale, namespace: 'coachMsaSubscription.checkoutPrerequisites' })
  const tBillVal = await getTranslations({ locale, namespace: 'coachMsaSubscription.billingAddress.validation' })
  const tVal = await getTranslations({ locale, namespace: 'coachPlatform.validation' })

  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) {
    return { ok: false, error: tVal('notAuthenticated') }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('user_id', auth.user.id)
    .single()

  if (profile?.role !== 'coach') {
    return { ok: false, error: tBillVal('coachOnly') }
  }

  if (!profile.email?.trim()) {
    return { ok: false, error: tBillVal('missingEmail') }
  }

  const firstName = payload.firstName?.trim() ?? ''
  const lastName = payload.lastName?.trim() ?? ''

  if (!firstName) {
    return { ok: false, error: t('validation.firstNameRequired') }
  }
  if (!lastName) {
    return { ok: false, error: t('validation.lastNameRequired') }
  }

  const parsedBilling = parseBillingFields(payload.billingFields)
  if (!parsedBilling.ok) {
    if (!payload.billingFields.line1?.trim()) {
      return { ok: false, error: tBillVal('line1Required') }
    }
    if (!payload.billingFields.city?.trim()) {
      return { ok: false, error: tBillVal('cityRequired') }
    }
    if (!payload.billingFields.postalCode?.trim()) {
      return { ok: false, error: tBillVal('postalRequired') }
    }
    return { ok: false, error: tBillVal('provinceRequired') }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ first_name: firstName, last_name: lastName })
    .eq('user_id', auth.user.id)

  if (profileError) {
    logger.error('saveCoachPlatformCheckoutPrerequisites: profile update failed', profileError, {
      coachId: auth.user.id,
    })
    return { ok: false, error: t('errors.profileUpdateFailed') }
  }

  const stripe = getStripeServer()
  if (!stripe) {
    logger.error('saveCoachPlatformCheckoutPrerequisites: Stripe not configured')
    return { ok: false, error: t('errors.stripeUnavailable') }
  }

  const { data: platformRow, error: rowError } = await supabase
    .from('coach_platform_subscriptions')
    .select('*')
    .eq('coach_id', auth.user.id)
    .maybeSingle()

  if (rowError) {
    logger.error('saveCoachPlatformCheckoutPrerequisites: select coach_platform_subscriptions failed', rowError, {
      coachId: auth.user.id,
    })
    return { ok: false, error: t('errors.saveFailed') }
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
    firstName,
    lastName,
    billingBody: parsedBilling.fields,
  })

  if (!persist.ok) {
    if (persist.reason === 'missing_email') {
      return { ok: false, error: tBillVal('missingEmail') }
    }
    if (persist.reason === 'persist_failed') {
      return { ok: false, error: t('errors.persistFailed') }
    }
    if (persist.reason === 'stripe_customer_failed') {
      return { ok: false, error: t('errors.stripeCustomerFailed') }
    }
    return { ok: false, error: t('errors.saveFailed') }
  }

  revalidateCoachPlatformSubscriptionPaths(locale)
  return { ok: true }
}

/** Évalue les prérequis pour le garde serveur Checkout (sans créer de customer). */
export async function evaluateCoachPlatformCheckoutPrerequisitesForCoach(
  supabase: Awaited<ReturnType<typeof createClient>>,
  stripe: NonNullable<ReturnType<typeof getStripeServer>>,
  coachId: string,
  profile: { first_name: string | null; last_name: string | null }
): Promise<boolean> {
  const { data: platformRow } = await supabase
    .from('coach_platform_subscriptions')
    .select('stripe_customer_id')
    .eq('coach_id', coachId)
    .maybeSingle()

  const stripeCustomerId =
    typeof platformRow?.stripe_customer_id === 'string' ? platformRow.stripe_customer_id.trim() : ''

  if (!stripeCustomerId.startsWith('cus_')) {
    return false
  }

  const res = await fetchCoachBillingAddressFromStripe(stripe, stripeCustomerId)
  if (!res.ok) {
    return false
  }

  return areCoachPlatformCheckoutPrerequisitesMet(profile.first_name, profile.last_name, res.fields)
}

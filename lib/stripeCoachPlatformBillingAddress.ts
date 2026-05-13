import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'
import type { CoachPlatformSubscription } from '@/types/database'
import { isCanadianProvinceCode } from '@/lib/canadianProvinces'
import {
  appLocaleToStripePreferredLocales,
  ensureCoachPlatformStripeCustomerForCheckout,
  resolveExistingCoachPlatformStripeCustomerId,
} from '@/lib/stripeCoachPlatformCustomer'

export type CoachBillingAddressFields = {
  line1: string
  line2: string
  city: string
  postalCode: string
  provinceCode: string
}

const MAX_LEN = 500

function trimOrEmpty(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

function stripeAddressToFields(addr: Stripe.Address | null | undefined): CoachBillingAddressFields | null {
  if (!addr) return null
  const line1 = trimOrEmpty(addr.line1)
  const city = trimOrEmpty(addr.city)
  const postal = trimOrEmpty(addr.postal_code)
  const state = trimOrEmpty(addr.state).toUpperCase()
  if (!line1 && !city && !postal && !state) return null
  return {
    line1,
    line2: trimOrEmpty(addr.line2),
    city,
    postalCode: postal,
    provinceCode: isCanadianProvinceCode(state) ? state : '',
  }
}

export type FetchCoachBillingAddressResult =
  | { ok: true; fields: CoachBillingAddressFields | null }
  | { ok: false; error: 'retrieve_failed' }

/**
 * Lit l’adresse Stripe du customer plateforme coach (Customer.address).
 */
export async function fetchCoachBillingAddressFromStripe(
  stripe: Stripe,
  customerId: string | null | undefined
): Promise<FetchCoachBillingAddressResult> {
  const id = typeof customerId === 'string' ? customerId.trim() : ''
  if (!id.startsWith('cus_')) {
    return { ok: true, fields: null }
  }
  try {
    const customer = await stripe.customers.retrieve(id)
    if (customer.deleted) {
      return { ok: true, fields: null }
    }
    const fields = stripeAddressToFields(customer.address)
    return { ok: true, fields }
  } catch (e) {
    logger.error('fetchCoachBillingAddressFromStripe: retrieve failed', e instanceof Error ? e : undefined, {
      customerId: id,
    })
    return { ok: false, error: 'retrieve_failed' }
  }
}

export type SaveCoachBillingAddressStripeBody = {
  line1: string
  line2: string
  city: string
  postalCode: string
  provinceCode: string
}

/**
 * Met à jour Customer.address (pays forcé CA). Ligne 2 vide → chaîne vide côté Stripe pour effacer une valeur précédente.
 */
export async function updateStripeCustomerBillingAddress(
  stripe: Stripe,
  customerId: string,
  body: SaveCoachBillingAddressStripeBody
): Promise<{ ok: true } | { ok: false }> {
  const line1 = trimOrEmpty(body.line1).slice(0, MAX_LEN)
  const line2 = trimOrEmpty(body.line2).slice(0, MAX_LEN)
  const city = trimOrEmpty(body.city).slice(0, MAX_LEN)
  const postal = trimOrEmpty(body.postalCode).slice(0, MAX_LEN)
  const state = trimOrEmpty(body.provinceCode).toUpperCase()
  try {
    await stripe.customers.update(customerId, {
      address: {
        line1,
        line2: line2.length > 0 ? line2 : '',
        city,
        state,
        postal_code: postal,
        country: 'CA',
      },
    })
    return { ok: true }
  } catch (e) {
    logger.error('updateStripeCustomerBillingAddress: update failed', e instanceof Error ? e : undefined, {
      customerId,
    })
    return { ok: false }
  }
}

export async function persistCoachPlatformStripeCustomerId(
  admin: SupabaseClient,
  coachId: string,
  newCustomerId: string,
  existing: CoachPlatformSubscription | null
): Promise<{ ok: true } | { ok: false }> {
  const now = new Date().toISOString()
  const cid = newCustomerId.trim()

  if (!existing) {
    const { error } = await admin.from('coach_platform_subscriptions').insert({
      coach_id: coachId,
      stripe_customer_id: cid,
      stripe_subscription_id: null,
      status: 'none',
      current_period_end: null,
      updated_at: now,
    })
    if (error) {
      logger.error('persistCoachPlatformStripeCustomerId: insert failed', error, { coachId })
      return { ok: false }
    }
    return { ok: true }
  }

  const currentCus = typeof existing.stripe_customer_id === 'string' ? existing.stripe_customer_id.trim() : ''
  if (currentCus === cid) {
    return { ok: true }
  }

  const { error } = await admin
    .from('coach_platform_subscriptions')
    .update({
      stripe_customer_id: cid,
      updated_at: now,
    })
    .eq('coach_id', coachId)

  if (error) {
    logger.error('persistCoachPlatformStripeCustomerId: update failed', error, { coachId })
    return { ok: false }
  }
  return { ok: true }
}

/**
 * Résout le customer Stripe (id base ou ensure) puis persiste le `cus_` en base si nécessaire (admin).
 */
export async function resolveOrCreateCoachPlatformStripeCustomerId(params: {
  stripe: Stripe
  supabaseUser: SupabaseClient
  admin: SupabaseClient
  coachId: string
  email: string | null | undefined
  locale: string
  existingRow: CoachPlatformSubscription | null
  /** `Customer.name` (déjà formaté prénom + nom). Si défini, appliqué en create/update Stripe. */
  displayNameForStripe?: string
}): Promise<
  | { ok: true; customerId: string }
  | { ok: false; reason: 'missing_email' | 'stripe_customer_failed' | 'persist_failed' }
> {
  const { stripe, supabaseUser, admin, coachId, email, locale, existingRow, displayNameForStripe } = params

  let customerId = await resolveExistingCoachPlatformStripeCustomerId(stripe, supabaseUser, coachId)

  if (!customerId) {
    const ensured = await ensureCoachPlatformStripeCustomerForCheckout(
      stripe,
      supabaseUser,
      coachId,
      email,
      locale,
      displayNameForStripe
    )
    if (!ensured.ok) {
      return { ok: false, reason: ensured.reason }
    }
    customerId = ensured.customerId
  }

  const persist = await persistCoachPlatformStripeCustomerId(admin, coachId, customerId, existingRow)
  if (!persist.ok) {
    return { ok: false, reason: 'persist_failed' }
  }

  try {
    const patch: Stripe.CustomerUpdateParams = {
      preferred_locales: appLocaleToStripePreferredLocales(locale),
    }
    if (displayNameForStripe !== undefined) {
      patch.name = displayNameForStripe.length > 0 ? displayNameForStripe : ''
    }
    await stripe.customers.update(customerId, patch)
  } catch (e) {
    logger.warn('resolveOrCreateCoachPlatformStripeCustomerId: customer patch failed', {
      coachId,
      customerId,
      cause: e instanceof Error ? e.message : String(e),
    })
  }

  return { ok: true, customerId }
}

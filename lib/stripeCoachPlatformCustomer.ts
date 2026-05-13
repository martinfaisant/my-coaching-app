import type { SupabaseClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import { logger } from '@/lib/logger'

/** Locales app (`[locale]`) → Stripe Customer.preferred_locales */
export function appLocaleToStripePreferredLocales(locale: string): string[] {
  const normalized = locale.trim().toLowerCase()
  if (normalized === 'fr') return ['fr']
  return ['en']
}

/** Locales app → Stripe Checkout Session `locale` (page de paiement). */
export function appLocaleToStripeCheckoutLocale(locale: string): 'fr' | 'en' {
  const normalized = locale.trim().toLowerCase()
  if (normalized === 'fr') return 'fr'
  return 'en'
}

export type EnsureCoachPlatformStripeCustomerResult =
  | { ok: true; customerId: string }
  | { ok: false; reason: 'missing_email' | 'stripe_customer_failed' }

/**
 * Si une ligne `coach_platform_subscriptions` existe avec un `stripe_customer_id` valide,
 * aligne `preferred_locales` Stripe sur la langue profil (`fr` / `en`).
 * Ne lève pas : journalise uniquement (le profil est déjà enregistré).
 */
export async function syncCoachPlatformStripeCustomerPreferredLocalesIfPresent(
  stripe: Stripe,
  supabase: SupabaseClient,
  coachId: string,
  preferredLocale: 'fr' | 'en'
): Promise<void> {
  const { data: row, error } = await supabase
    .from('coach_platform_subscriptions')
    .select('stripe_customer_id')
    .eq('coach_id', coachId)
    .maybeSingle()

  if (error) {
    logger.error('syncCoachPlatformStripeCustomerPreferredLocalesIfPresent: select failed', error, {
      coachId,
    })
    return
  }

  const raw = row?.stripe_customer_id
  const customerId = typeof raw === 'string' ? raw.trim() : ''
  if (!customerId.startsWith('cus_')) {
    return
  }

  try {
    await stripe.customers.update(customerId, {
      preferred_locales: appLocaleToStripePreferredLocales(preferredLocale),
    })
  } catch (e) {
    logger.warn('syncCoachPlatformStripeCustomerPreferredLocalesIfPresent: customers.update failed', {
      coachId,
      stripeCustomerId: customerId,
      cause: e instanceof Error ? e.message : String(e),
    })
  }
}

/**
 * Résout ou crée le Customer Stripe coach, synchronise `preferred_locales` avec la locale portail.
 * Ordre : id en base → client Stripe même email + metadata `coach_id` → création.
 */
export async function ensureCoachPlatformStripeCustomerForCheckout(
  stripe: Stripe,
  supabase: SupabaseClient,
  coachId: string,
  email: string | null | undefined,
  locale: string
): Promise<EnsureCoachPlatformStripeCustomerResult> {
  const preferredLocales = appLocaleToStripePreferredLocales(locale)

  let customerId = await resolveExistingCoachPlatformStripeCustomerId(stripe, supabase, coachId)

  const emailTrimmed = typeof email === 'string' ? email.trim() : ''
  if (!customerId && emailTrimmed) {
    try {
      const list = await stripe.customers.list({ email: emailTrimmed, limit: 25 })
      const match = list.data.find((c) => c.metadata?.coach_id === coachId)
      if (match) {
        customerId = match.id
      }
    } catch (e) {
      logger.error('ensureCoachPlatformStripeCustomerForCheckout: customers.list failed', e instanceof Error ? e : undefined, {
        coachId,
      })
      return { ok: false, reason: 'stripe_customer_failed' }
    }
  }

  if (customerId) {
    try {
      await stripe.customers.update(customerId, { preferred_locales: preferredLocales })
    } catch (e) {
      logger.error('ensureCoachPlatformStripeCustomerForCheckout: customers.update failed', e instanceof Error ? e : undefined, {
        coachId,
        customerId,
      })
      return { ok: false, reason: 'stripe_customer_failed' }
    }
    return { ok: true, customerId }
  }

  if (!emailTrimmed) {
    return { ok: false, reason: 'missing_email' }
  }

  const localeKey = appLocaleToStripeCheckoutLocale(locale)
  try {
    const created = await stripe.customers.create(
      {
        email: emailTrimmed,
        preferred_locales: preferredLocales,
        metadata: { coach_id: coachId },
      },
      { idempotencyKey: `coach-platform-customer-${coachId}-${localeKey}` }
    )
    return { ok: true, customerId: created.id }
  } catch (e) {
    logger.error('ensureCoachPlatformStripeCustomerForCheckout: customers.create failed', e instanceof Error ? e : undefined, {
      coachId,
    })
    return { ok: false, reason: 'stripe_customer_failed' }
  }
}

/**
 * Renvoie un `cus_…` réutilisable pour Checkout si la ligne coach en base pointe encore
 * vers un Customer Stripe valide. Sinon `null` (résolution via liste e-mail / création dans `ensureCoachPlatformStripeCustomerForCheckout`).
 */
export async function resolveExistingCoachPlatformStripeCustomerId(
  stripe: Stripe,
  supabase: SupabaseClient,
  coachId: string
): Promise<string | null> {
  const { data: row, error } = await supabase
    .from('coach_platform_subscriptions')
    .select('stripe_customer_id')
    .eq('coach_id', coachId)
    .maybeSingle()

  if (error) {
    logger.error('resolveExistingCoachPlatformStripeCustomerId: select failed', error, { coachId })
    return null
  }

  const raw = row?.stripe_customer_id
  const customerId = typeof raw === 'string' ? raw.trim() : ''
  if (!customerId || !customerId.startsWith('cus_')) {
    return null
  }

  try {
    await stripe.customers.retrieve(customerId)
    return customerId
  } catch (e) {
    logger.warn(
      'Stripe customer from coach_platform_subscriptions invalid; ensureCoachPlatformStripeCustomerForCheckout will list or create',
      {
        coachId,
        stripeCustomerId: customerId,
        cause: e instanceof Error ? e.message : String(e),
      }
    )
    return null
  }
}

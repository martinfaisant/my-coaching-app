'use server'

import { headers } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/utils/supabase/server'
import { requireUser } from '@/lib/authHelpers'
import { getStripeServer } from '@/lib/stripeServer'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { logger } from '@/lib/logger'
import { fetchCoachPlatformAccessGranted } from '@/lib/coachPlatformSubscription'
import { resolveStripeCheckoutReturnBaseUrl } from '@/lib/checkoutReturnOrigin'
import { resolveCoachPlatformCheckoutReturnPath } from '@/lib/coachPlatformCheckoutReturnPath'
import { getCoachPlatformAllowedPriceIds } from '@/lib/stripeCoachPlatformPriceIds'
import { loadCoachPlatformCatalogForEnv } from '@/lib/stripeCoachPlatformCatalog'
import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'
import { getCoachPlatformSubscriptionTrialDays } from '@/lib/coachPlatformSubscriptionTrial'
import {
  appLocaleToStripeCheckoutLocale,
  ensureCoachPlatformStripeCustomerForCheckout,
  formatCoachPlatformStripeCustomerName,
} from '@/lib/stripeCoachPlatformCustomer'

export type CoachPlatformCheckoutResult = { ok: true; url: string } | { ok: false; error: string }

export type LoadCoachPlatformCatalogForCoachResult =
  | { ok: true; offers: CoachPlatformCatalogOffer[]; subscriptionTrialDays: number }
  | { ok: false; error: string }

/** Catalogue offres plateforme (Stripe) pour le coach connecté — utilisé par la modale souscription. */
export async function loadCoachPlatformCatalogForCoach(
  locale: string
): Promise<LoadCoachPlatformCatalogForCoachResult> {
  const tSub = await getTranslations({ locale, namespace: 'coachMsaSubscription' })
  const tVal = await getTranslations({ locale, namespace: 'coachPlatform.validation' })

  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) {
    return { ok: false, error: tVal('notAuthenticated') }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', auth.user.id).single()
  if (profile?.role !== 'coach') {
    return { ok: false, error: tVal('coachOnly') }
  }

  const catalog = await loadCoachPlatformCatalogForEnv()
  if (catalog.error === 'stripe_unavailable' || catalog.error === 'catalog_load_failed') {
    return { ok: false, error: tSub('errors.catalogUnavailable') }
  }
  return { ok: true, offers: catalog.offers, subscriptionTrialDays: catalog.subscriptionTrialDays }
}

export type CreateCoachPlatformCheckoutOptions = {
  /** Price Stripe autorisé (whitelist env). Si absent : premier ID autorisé. */
  priceId?: string
  /** Chemin dashboard sans host (ex. /dashboard/athletes). Filtré contre une liste blanche. */
  returnPath?: string
}

export async function createCoachPlatformCheckoutSession(
  locale: string,
  options?: CreateCoachPlatformCheckoutOptions
): Promise<CoachPlatformCheckoutResult> {
  const t = await getTranslations({ locale, namespace: 'coachPlatform.validation' })
  const stripe = getStripeServer()
  const allowedPriceIds = getCoachPlatformAllowedPriceIds()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL

  if (!stripe) {
    logger.error('createCoachPlatformCheckoutSession: STRIPE_SECRET_KEY manquant')
    return { ok: false, error: t('stripeNotConfigured') }
  }
  if (allowedPriceIds.length === 0) {
    logger.error('createCoachPlatformCheckoutSession: aucun STRIPE_COACH_PLATFORM_PRICE_ID(S)')
    return { ok: false, error: t('priceNotConfigured') }
  }
  if (!siteUrl) {
    logger.error('createCoachPlatformCheckoutSession: NEXT_PUBLIC_SITE_URL / NEXT_PUBLIC_APP_URL manquant')
    return { ok: false, error: t('siteUrlMissing') }
  }

  const requestedPrice = options?.priceId?.trim()
  const priceId =
    requestedPrice && allowedPriceIds.includes(requestedPrice)
      ? requestedPrice
      : !requestedPrice
        ? allowedPriceIds[0]
        : null

  if (!priceId) {
    return { ok: false, error: t('invalidPriceId') }
  }

  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) {
    return { ok: false, error: t('notAuthenticated') }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email, first_name, last_name')
    .eq('user_id', auth.user.id)
    .single()
  if (profile?.role !== 'coach') {
    return { ok: false, error: t('coachOnly') }
  }

  const returnPath = resolveCoachPlatformCheckoutReturnPath(options?.returnPath)

  const headerList = await headers()
  const base = resolveStripeCheckoutReturnBaseUrl(headerList, siteUrl)
  const successPath = pathWithLocale(
    locale,
    `${returnPath}?stripe=success&session_id={CHECKOUT_SESSION_ID}`
  )
  const successUrl = `${base}${successPath}`
  const cancelUrl = `${base}${pathWithLocale(locale, `${returnPath}?stripe=canceled`)}`

  const idempotencyKey = `coach-platform-checkout-${auth.user.id}-${Math.floor(Date.now() / 10000)}`

  const displayNameForStripe = formatCoachPlatformStripeCustomerName(profile.first_name, profile.last_name)

  const customerRes = await ensureCoachPlatformStripeCustomerForCheckout(
    stripe,
    supabase,
    auth.user.id,
    profile.email,
    locale,
    displayNameForStripe
  )
  if (!customerRes.ok) {
    if (customerRes.reason === 'missing_email') {
      return { ok: false, error: t('missingEmailForCheckout') }
    }
    return { ok: false, error: t('stripeCustomerPrepareFailed') }
  }

  const trialDays = getCoachPlatformSubscriptionTrialDays()
  const subscriptionData = {
    metadata: { coach_id: auth.user.id },
    ...(trialDays > 0 ? { trial_period_days: trialDays } : {}),
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create(
      {
        mode: 'subscription',
        customer: customerRes.customerId,
        locale: appLocaleToStripeCheckoutLocale(locale),
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { coach_id: auth.user.id },
        subscription_data: subscriptionData,
        client_reference_id: auth.user.id,
      },
      { idempotencyKey }
    )
    if (!checkoutSession.url) {
      return { ok: false, error: t('noCheckoutUrl') }
    }
    return { ok: true, url: checkoutSession.url }
  } catch (e) {
    logger.error('createCoachPlatformCheckoutSession failed', e instanceof Error ? e : undefined, {
      coachId: auth.user.id,
    })
    return { ok: false, error: t('checkoutFailed') }
  }
}

export type VerifyCoachPlatformCheckoutResult =
  | { ok: true; accessGranted: boolean }
  | { ok: false; error: string }

/** Après retour Stripe : vérifie la session Checkout et l’état d’accès plateforme (coach connecté uniquement). */
export async function verifyCoachPlatformCheckoutSession(
  checkoutSessionId: string,
  locale: string
): Promise<VerifyCoachPlatformCheckoutResult> {
  const t = await getTranslations({ locale, namespace: 'coachPlatform.verify' })
  const stripe = getStripeServer()
  if (!stripe) {
    return { ok: false, error: t('stripeUnavailable') }
  }

  const supabase = await createClient()
  const auth = await requireUser(supabase)
  if ('error' in auth) {
    return { ok: false, error: t('notAuthenticated') }
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', auth.user.id).single()
  if (profile?.role !== 'coach') {
    return { ok: false, error: t('coachOnly') }
  }

  const trimmedId = checkoutSessionId.trim()
  if (!trimmedId.startsWith('cs_')) {
    return { ok: false, error: t('invalidSession') }
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(trimmedId)
    const ownerId = session.metadata?.coach_id ?? session.client_reference_id ?? null
    if (ownerId !== auth.user.id) {
      return { ok: false, error: t('sessionNotOwned') }
    }
    if (session.mode !== 'subscription') {
      return { ok: false, error: t('invalidSession') }
    }
    if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
      return { ok: false, error: t('paymentIncomplete') }
    }

    const accessGranted = await fetchCoachPlatformAccessGranted(supabase, auth.user.id)
    return { ok: true, accessGranted }
  } catch (e) {
    logger.error('verifyCoachPlatformCheckoutSession failed', e instanceof Error ? e : undefined, {
      coachId: auth.user.id,
    })
    return { ok: false, error: t('retrieveFailed') }
  }
}

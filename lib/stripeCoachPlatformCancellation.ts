import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getStripeServer } from '@/lib/stripeServer'
import { logger } from '@/lib/logger'
import { upsertCoachPlatformSubscriptionFromStripe } from '@/lib/coachPlatformSubscriptionSync'
import type { CoachPlatformSubscription } from '@/types/database'

export type CoachPlatformRefundPreview = {
  amountMajor: number
  currency: string
}

const ZERO_DECIMAL = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf',
])

function amountMajorFromMinor(amount: number, currency: string): number {
  const c = currency.toLowerCase()
  if (ZERO_DECIMAL.has(c)) return amount
  return amount / 100
}

/**
 * Montant de crédit / remboursement depuis une preview facture Stripe uniquement (pas de calcul local).
 */
export function extractRefundPreviewFromStripeInvoice(
  invoice: Stripe.Invoice
): CoachPlatformRefundPreview | null {
  const currency = (invoice.currency ?? 'eur').toUpperCase()

  if (typeof invoice.total === 'number' && invoice.total < 0) {
    return {
      amountMajor: amountMajorFromMinor(Math.abs(invoice.total), currency),
      currency,
    }
  }

  const lines = invoice.lines?.data ?? []
  let creditMinor = 0
  for (const line of lines) {
    const amount = line.amount ?? 0
    if (amount < 0) creditMinor += Math.abs(amount)
  }
  if (creditMinor > 0) {
    return {
      amountMajor: amountMajorFromMinor(creditMinor, currency),
      currency,
    }
  }

  return null
}

export async function previewCoachPlatformImmediateCancelRefund(
  subscriptionId: string,
  customerId: string
): Promise<CoachPlatformRefundPreview | null> {
  const stripe = getStripeServer()
  if (!stripe) return null

  try {
    const cancelAt = Math.floor(Date.now() / 1000)
    const preview = await stripe.invoices.createPreview({
      customer: customerId,
      subscription: subscriptionId,
      subscription_details: {
        cancel_at: cancelAt,
        proration_behavior: 'create_prorations',
      },
    })
    return extractRefundPreviewFromStripeInvoice(preview)
  } catch (e) {
    logger.warn('previewCoachPlatformImmediateCancelRefund failed', {
      subscriptionId,
      message: e instanceof Error ? e.message : String(e),
    })
    return null
  }
}

export async function scheduleCoachPlatformSubscriptionEndAtPeriodEnd(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripeServer()
  if (!stripe) return null
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
}

export async function resumeCoachPlatformSubscriptionRenewal(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripeServer()
  if (!stripe) return null
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: false })
}

export async function cancelCoachPlatformSubscriptionImmediately(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const stripe = getStripeServer()
  if (!stripe) return null
  return stripe.subscriptions.cancel(subscriptionId, { prorate: true })
}

export async function fetchCoachPlatformOpenInvoicePayUrl(
  customerId: string,
  subscriptionId: string | null
): Promise<string | null> {
  const stripe = getStripeServer()
  if (!stripe) return null

  try {
    const openInvoices = await stripe.invoices.list({
      customer: customerId,
      status: 'open',
      limit: 5,
    })
    const withUrl = openInvoices.data.find((inv) => inv.hosted_invoice_url)
    if (withUrl?.hosted_invoice_url) return withUrl.hosted_invoice_url

    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['latest_invoice'],
      })
      const latest = sub.latest_invoice
      if (latest && typeof latest === 'object' && latest.hosted_invoice_url) {
        return latest.hosted_invoice_url
      }
    }
  } catch (e) {
    logger.error(
      'fetchCoachPlatformOpenInvoicePayUrl failed',
      e instanceof Error ? e : undefined,
      { customerId, subscriptionId }
    )
  }
  return null
}

export async function syncCoachPlatformSubscriptionAfterStripeMutation(
  admin: SupabaseClient,
  sub: Stripe.Subscription
): Promise<void> {
  await upsertCoachPlatformSubscriptionFromStripe(admin, sub)
}

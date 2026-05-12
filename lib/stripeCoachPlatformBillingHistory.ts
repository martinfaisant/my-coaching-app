import type Stripe from 'stripe'
import { logger } from '@/lib/logger'
import { getStripeServer } from '@/lib/stripeServer'

export type CoachPlatformInvoiceRow = {
  id: string
  created: number
  label: string
  amountPaidMajor: number
  currency: string
  status: string | null
  invoicePdfUrl: string | null
  hostedInvoiceUrl: string | null
}

export type CoachPlatformFailedPaymentRow = {
  id: string
  created: number
  amountMajor: number
  currency: string
  failureMessage: string | null
}

export type CoachPlatformRefundRow = {
  id: string
  created: number
  amountMajor: number
  currency: string
  status: string | null
  description: string | null
}

export type CoachPlatformBillingHistory = {
  invoices: CoachPlatformInvoiceRow[]
  failedPayments: CoachPlatformFailedPaymentRow[]
  refunds: CoachPlatformRefundRow[]
}

function amountMajorFromMinor(amount: number | null | undefined, currency: string): number {
  if (amount == null) return 0
  const zeroDecimal = ['bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf']
  const c = currency.toLowerCase()
  if (zeroDecimal.includes(c)) return amount
  return amount / 100
}

export async function fetchCoachPlatformBillingHistory(
  customerId: string | null | undefined
): Promise<{ data: CoachPlatformBillingHistory | null; error: string | null }> {
  if (!customerId?.trim()) {
    return { data: { invoices: [], failedPayments: [], refunds: [] }, error: null }
  }

  const stripe = getStripeServer()
  if (!stripe) {
    return { data: null, error: 'stripe_unavailable' }
  }

  try {
    const [invoiceList, chargeList] = await Promise.all([
      stripe.invoices.list({ customer: customerId, limit: 40 }),
      stripe.charges.list({ customer: customerId, limit: 100, expand: ['data.refunds'] }),
    ])

    const invoices: CoachPlatformInvoiceRow[] = (invoiceList.data ?? []).map((inv: Stripe.Invoice) => {
      const currency = (inv.currency ?? 'eur').toUpperCase()
      const amountPaid = inv.amount_paid ?? 0
      return {
        id: inv.id ?? inv.number ?? '',
        created: inv.created,
        label: inv.description ?? inv.lines?.data?.[0]?.description ?? '—',
        amountPaidMajor: amountMajorFromMinor(amountPaid, inv.currency ?? 'eur'),
        currency,
        status: inv.status,
        invoicePdfUrl: inv.invoice_pdf ?? null,
        hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
      }
    })

    const failedPayments: CoachPlatformFailedPaymentRow[] = []
    const refunds: CoachPlatformRefundRow[] = []

    for (const charge of chargeList.data ?? []) {
      const currency = (charge.currency ?? 'eur').toUpperCase()
      if (charge.status === 'failed') {
        failedPayments.push({
          id: charge.id,
          created: charge.created,
          amountMajor: amountMajorFromMinor(charge.amount, charge.currency ?? 'eur'),
          currency,
          failureMessage: charge.failure_message ?? charge.outcome?.seller_message ?? null,
        })
      }
      const refundList = charge.refunds?.data ?? []
      for (const rf of refundList) {
        refunds.push({
          id: rf.id,
          created: rf.created,
          amountMajor: amountMajorFromMinor(rf.amount, charge.currency ?? 'eur'),
          currency,
          status: rf.status,
          description: rf.description ?? rf.reason ?? null,
        })
      }
    }

    invoices.sort((a, b) => b.created - a.created)
    failedPayments.sort((a, b) => b.created - a.created)
    refunds.sort((a, b) => b.created - a.created)

    return { data: { invoices, failedPayments, refunds }, error: null }
  } catch (e) {
    logger.error(
      'fetchCoachPlatformBillingHistory failed',
      e instanceof Error ? e : undefined,
      { customerId }
    )
    return { data: null, error: 'history_load_failed' }
  }
}

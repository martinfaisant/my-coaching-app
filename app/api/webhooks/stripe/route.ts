import Stripe from 'stripe'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { getStripeServer } from '@/lib/stripeServer'
import { createAdminClient } from '@/utils/supabase/server'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

function coachIdFromSubscription(sub: Stripe.Subscription): string | null {
  const m = sub.metadata?.coach_id
  if (m && typeof m === 'string' && m.length > 0) return m
  return null
}

async function upsertCoachPlatformFromStripeSubscription(sub: Stripe.Subscription) {
  const coachId = coachIdFromSubscription(sub)
  if (!coachId) {
    logger.warn('Stripe webhook: subscription sans metadata coach_id', { subscriptionId: sub.id })
    return
  }
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null
  const supabase = createAdminClient()
  const currentPeriodEnd =
    typeof sub.current_period_end === 'number'
      ? new Date(sub.current_period_end * 1000).toISOString()
      : null
  const { error } = await supabase.from('coach_platform_subscriptions').upsert(
    {
      coach_id: coachId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_end: currentPeriodEnd,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'coach_id' }
  )
  if (error) {
    logger.error('Stripe webhook: upsert coach_platform_subscriptions failed', error, {
      coachId,
      subscriptionId: sub.id,
    })
  }
}

export async function POST(request: Request) {
  const stripe = getStripeServer()
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!stripe || !secret) {
    logger.error('Stripe webhook: configuration manquante')
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 })
  }

  const body = await request.text()
  const headerList = await headers()
  const sig = headerList.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Signature absente' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret)
  } catch (err) {
    logger.error('Stripe webhook: signature invalide', err instanceof Error ? err : undefined)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode === 'subscription' && session.subscription) {
          const subId =
            typeof session.subscription === 'string' ? session.subscription : session.subscription.id
          const sub = await stripe.subscriptions.retrieve(subId)
          await upsertCoachPlatformFromStripeSubscription(sub)
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await upsertCoachPlatformFromStripeSubscription(sub)
        break
      }
      default:
        break
    }
  } catch (err) {
    logger.error('Stripe webhook: traitement événement', err instanceof Error ? err : undefined, {
      type: event.type,
    })
    return NextResponse.json({ error: 'Traitement webhook' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

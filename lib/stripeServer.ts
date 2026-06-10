import Stripe from 'stripe'

let stripeSingleton: Stripe | null = null

export function getStripeServer(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!stripeSingleton) {
    stripeSingleton = new Stripe(key, { typescript: true })
  }
  return stripeSingleton
}

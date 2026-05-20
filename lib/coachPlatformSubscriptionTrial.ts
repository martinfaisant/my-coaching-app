/**
 * Essai d’abonnement plateforme coach (Stripe Checkout) — scénario A : variable d’environnement.
 * @see README.md — `COACH_PLATFORM_SUBSCRIPTION_TRIAL_DAYS`
 */

/** Plafond aligné sur les limites usuelles Stripe pour `trial_period_days`. */
const MAX_TRIAL_DAYS = 730

export function getCoachPlatformSubscriptionTrialDays(): number {
  const raw = process.env.COACH_PLATFORM_SUBSCRIPTION_TRIAL_DAYS?.trim()
  if (!raw) return 0
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n <= 0) return 0
  return Math.min(Math.floor(n), MAX_TRIAL_DAYS)
}

/**
 * Jours entiers restants jusqu’à la fin d’essai (arrondi supérieur sur la différence d’instantanés).
 * Retourne `0` si la date est passée ou invalide.
 */
export function computeCoachPlatformTrialRemainingDays(trialEndIso: string, nowMs: number = Date.now()): number {
  const end = new Date(trialEndIso).getTime()
  if (Number.isNaN(end)) return 0
  const diff = end - nowMs
  if (diff <= 0) return 0
  return Math.ceil(diff / 86_400_000)
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { verifyCoachPlatformCheckoutSession } from '@/app/[locale]/dashboard/athletes/coachPlatformActions'

type Phase = 'loading' | 'pending' | 'done' | null

/**
 * Après Checkout Stripe : ?stripe=success&session_id=cs_…
 * Vérifie la session côté serveur ; si accès pas encore actif (webhook), propose Rafraîchir ; sinon erreur → ?stripe=error.
 */
export function CoachPlatformCheckoutVerification() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations('coachPlatform')

  const stripe = searchParams.get('stripe')
  const sessionId = searchParams.get('session_id')

  const [phase, setPhase] = useState<Phase>(null)

  const goStripeError = useCallback(() => {
    router.replace(`${pathname}?stripe=error`)
  }, [router, pathname])

  const goSuccessClean = useCallback(() => {
    router.replace(`${pathname}?stripe=success`)
  }, [router, pathname])

  useEffect(() => {
    if (stripe !== 'success' || !sessionId?.trim()) {
      setPhase(null)
      return
    }

    let cancelled = false
    setPhase('loading')

    void verifyCoachPlatformCheckoutSession(sessionId.trim(), locale).then((result) => {
      if (cancelled) return
      if (!result.ok) {
        goStripeError()
        setPhase(null)
        return
      }
      if (result.accessGranted) {
        setPhase('done')
        goSuccessClean()
        return
      }
      setPhase('pending')
    })

    return () => {
      cancelled = true
    }
  }, [stripe, sessionId, locale, goStripeError, goSuccessClean])

  useEffect(() => {
    if (phase !== 'pending') return
    const id = window.setTimeout(() => {
      router.refresh()
    }, 4000)
    return () => window.clearTimeout(id)
  }, [phase, router])

  if (stripe !== 'success' || !sessionId?.trim()) return null

  if (phase === 'done') return null

  if (phase === 'loading' || phase === null) {
    return (
      <div className="mb-6 rounded-xl border border-palette-olive/40 bg-section p-4">
        <p className="text-sm text-stone-800">{t('stripeVerifying')}</p>
      </div>
    )
  }

  if (phase === 'pending') {
    return (
      <div className="mb-6 rounded-xl border border-palette-olive/40 bg-section p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-stone-800 flex-1">{t('stripeReturnPendingWebhook')}</p>
        <Button type="button" variant="primary" className="shrink-0" onClick={() => router.refresh()}>
          {t('stripeRefreshCta')}
        </Button>
      </div>
    )
  }

  return null
}

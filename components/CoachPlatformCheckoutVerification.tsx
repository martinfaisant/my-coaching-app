'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter, usePathname } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { createClient } from '@/utils/supabase/client'
import { verifyCoachPlatformCheckoutSession } from '@/app/[locale]/dashboard/athletes/coachPlatformActions'

type VerifyPhase = 'loading' | 'pending' | 'done'

type InnerProps = {
  sessionId: string
  locale: string
  router: ReturnType<typeof useRouter>
  goStripeError: () => void
  goSuccessClean: () => void
  t: (key: string) => string
}

function CoachPlatformCheckoutVerificationInner({
  sessionId,
  locale,
  router,
  goStripeError,
  goSuccessClean,
  t,
}: InnerProps) {
  const [phase, setPhase] = useState<VerifyPhase>('loading')

  useEffect(() => {
    let cancelled = false
    const supabase = createClient()

    void (async () => {
      let {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        const { data: refreshed } = await supabase.auth.refreshSession()
        session = refreshed.session
      }
      if (cancelled) return
      if (!session) {
        router.replace(locale === 'en' ? '/en/login' : '/login')
        return
      }

      const result = await verifyCoachPlatformCheckoutSession(sessionId, locale)
      if (cancelled) return
      if (!result.ok) {
        goStripeError()
        return
      }
      if (result.accessGranted) {
        setPhase('done')
        goSuccessClean()
        return
      }
      setPhase('pending')
    })()

    return () => {
      cancelled = true
    }
  }, [sessionId, locale, router, goStripeError, goSuccessClean])

  useEffect(() => {
    if (phase !== 'pending') return
    const id = window.setTimeout(() => {
      router.refresh()
    }, 4000)
    return () => window.clearTimeout(id)
  }, [phase, router])

  if (phase === 'done') return null

  if (phase === 'loading') {
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
  const sessionId = searchParams.get('session_id')?.trim()

  const goStripeError = useCallback(() => {
    router.replace(`${pathname}?stripe=error`)
  }, [router, pathname])

  const goSuccessClean = useCallback(() => {
    router.replace(`${pathname}?stripe=success`)
  }, [router, pathname])

  if (stripe !== 'success' || !sessionId) return null

  return (
    <CoachPlatformCheckoutVerificationInner
      key={sessionId}
      sessionId={sessionId}
      locale={locale}
      router={router}
      goStripeError={goStripeError}
      goSuccessClean={goSuccessClean}
      t={t}
    />
  )
}

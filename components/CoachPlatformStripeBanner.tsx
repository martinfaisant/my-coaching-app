'use client'

import { useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/Button'

type StripeFlash = 'success' | 'canceled' | 'error'

export function CoachPlatformStripeBanner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const t = useTranslations('coachPlatform')
  const [dismissed, setDismissed] = useState(false)

  const variant = useMemo((): StripeFlash | null => {
    const v = searchParams.get('stripe')
    if (v === 'success' || v === 'canceled' || v === 'error') return v
    return null
  }, [searchParams])

  const sessionId = searchParams.get('session_id')

  const clearQuery = useCallback(() => {
    const url = new URL(window.location.href)
    url.searchParams.delete('stripe')
    url.searchParams.delete('session_id')
    router.replace(url.pathname + (url.search || ''))
    setDismissed(true)
  }, [router])

  if (dismissed || !variant) return null

  // Phase vérification gérée par CoachPlatformCheckoutVerification (évite double message)
  if (variant === 'success' && sessionId) return null

  const boxClass =
    variant === 'success'
      ? 'border-palette-olive/40 bg-section'
      : variant === 'error'
        ? 'border-palette-danger/30 bg-palette-danger-light'
        : 'border-stone-200 bg-white'

  return (
    <div
      className={`mb-6 rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${boxClass}`}
      role={variant === 'error' ? 'alert' : undefined}
    >
      <p className="text-sm text-stone-800 flex-1">
        {variant === 'success' && t('stripeReturnSuccess')}
        {variant === 'canceled' && t('stripeReturnCanceled')}
        {variant === 'error' && t('stripeReturnError')}
      </p>
      <button type="button" onClick={clearQuery} className="text-sm text-stone-600 underline shrink-0 text-left sm:text-right">
        {t('dismissBanner')}
      </button>
    </div>
  )
}

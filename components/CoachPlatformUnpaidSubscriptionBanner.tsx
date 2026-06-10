'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { isError } from '@/lib/errors'
import { getCoachPlatformPayInvoiceUrlAction } from '@/app/[locale]/dashboard/coach-platform-subscription/coachPlatformCancellationActions'

type CoachPlatformUnpaidSubscriptionBannerProps = {
  locale: string
}

export function CoachPlatformUnpaidSubscriptionBanner({ locale }: CoachPlatformUnpaidSubscriptionBannerProps) {
  const t = useTranslations('coachMsaSubscription.cancellation.unpaid')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePay = async () => {
    setLoading(true)
    setErrorMessage(null)
    const result = await getCoachPlatformPayInvoiceUrlAction(locale)
    setLoading(false)
    if (isError(result)) {
      setErrorMessage(result.error)
      return
    }
    window.location.href = result.data.url
  }

  return (
    <section className="mb-8" aria-labelledby="coach-msa-unpaid-heading">
      <h2 id="coach-msa-unpaid-heading" className="sr-only">
        {t('sectionTitle')}
      </h2>
      <div className="w-full rounded-2xl border border-palette-danger/30 bg-palette-danger-light p-6">
        <span className="inline-flex rounded-full border border-stone-300 bg-white px-2.5 py-0.5 text-xs font-semibold text-stone-800 mb-2">
          {t('badge')}
        </span>
        <p className="text-sm text-stone-800 font-medium">{t('title')}</p>
        <p className="text-sm text-stone-600 mt-2">{t('body')}</p>
        <Button
          type="button"
          variant="primary"
          className="mt-4 w-full sm:w-auto"
          disabled={loading}
          onClick={() => void handlePay()}
        >
          {loading ? '…' : t('payCta')}
        </Button>
        {errorMessage ? (
          <p className="text-sm text-palette-danger mt-3" role="alert">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </section>
  )
}

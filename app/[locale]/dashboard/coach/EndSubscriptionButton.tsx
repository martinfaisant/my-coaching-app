'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { isError } from '@/lib/errors'
import { endSubscription } from './actions'

type Props = {
  subscriptionId: string
  isMonthly: boolean
  endDateFormatted: string | null
  locale: string
}

export function EndSubscriptionButton({
  subscriptionId,
  isMonthly,
  endDateFormatted,
  locale,
}: Props) {
  const t = useTranslations('myCoach.subscriptionEnd')
  const tButton = useTranslations('myCoach.subscription')
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setErrorMessage(null)
    const result = await endSubscription(subscriptionId, locale)
    setLoading(false)
    if (isError(result)) {
      setErrorMessage(result.error)
      return
    }
    setIsOpen(false)
    const data = result.data
    if (data.immediate) {
      // Full navigation to avoid stale cache (profile.coach_id must be refetched)
      window.location.href = `/${locale}/dashboard`
      return
    }
    router.refresh()
  }

  return (
    <>
      <Button
        type="button"
        variant="muted"
        onClick={() => {
          setErrorMessage(null)
          setIsOpen(true)
        }}
      >
        {tButton('endButton')}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !loading && setIsOpen(false)}
        title={t('modalTitle')}
        size="md"
        disableOverlayClose={loading}
        disableEscapeClose={loading}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="muted"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? '…' : t('confirm')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-stone-700">{t('consequences')}</p>
          {isMonthly && endDateFormatted && (
            <p className="text-sm text-stone-700 font-medium">
              {t('monthlyActiveUntil', { date: endDateFormatted })}
            </p>
          )}
          {errorMessage && (
            <p className="text-sm text-palette-danger" role="alert">
              {errorMessage}
            </p>
          )}
        </div>
      </Modal>
    </>
  )
}

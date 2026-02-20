'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { isError } from '@/lib/errors'
import { cancelSubscriptionCancellation } from './actions'

type Props = {
  subscriptionId: string
  locale: string
  /** Called after successful cancellation (e.g. to close parent modal). */
  onSuccess?: () => void
}

export function CancelCancellationButton({ subscriptionId, locale, onSuccess }: Props) {
  const t = useTranslations('myCoach.cancelCancellation')
  const tButton = useTranslations('myCoach.subscription')
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setErrorMessage(null)
    const result = await cancelSubscriptionCancellation(subscriptionId, locale)
    setLoading(false)
    if (isError(result)) {
      setErrorMessage(result.error)
      return
    }
    setIsOpen(false)
    router.refresh()
    onSuccess?.()
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
        {tButton('cancelCancellationButton')}
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
              variant="primary"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? '…' : t('confirm')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-stone-700">{t('modalBody')}</p>
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

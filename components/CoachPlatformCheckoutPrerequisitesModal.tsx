'use client'

import { useId, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { createCoachPlatformCheckoutSession } from '@/app/[locale]/dashboard/athletes/coachPlatformActions'
import {
  loadCoachPlatformCheckoutPrerequisitesForCoach,
  saveCoachPlatformCheckoutPrerequisites,
} from '@/app/[locale]/dashboard/coach-platform-subscription/coachPlatformCheckoutPrerequisitesActions'
import {
  CoachPlatformCheckoutPrerequisitesForm,
  getCoachPlatformCheckoutPrerequisitesFormPayload,
} from '@/components/CoachPlatformCheckoutPrerequisitesForm'
import type { CoachPlatformCheckoutPrerequisitesSnapshot } from '@/lib/coachPlatformCheckoutPrerequisites'

type CoachPlatformCheckoutPrerequisitesModalProps = {
  isOpen: boolean
  onClose: () => void
  priceId: string | null
  initialSnapshot: CoachPlatformCheckoutPrerequisitesSnapshot | null
}

export function CoachPlatformCheckoutPrerequisitesModal({
  isOpen,
  onClose,
  priceId,
  initialSnapshot,
}: CoachPlatformCheckoutPrerequisitesModalProps) {
  const t = useTranslations('coachMsaSubscription.checkoutPrerequisites')
  const locale = useLocale()
  const pathname = usePathname()
  const formId = useId()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [pendingPhase, setPendingPhase] = useState<'saving' | 'redirecting' | null>(null)
  const [snapshot, setSnapshot] = useState<CoachPlatformCheckoutPrerequisitesSnapshot | null>(initialSnapshot)
  const [billingLoadError, setBillingLoadError] = useState(false)
  const [openSyncKey, setOpenSyncKey] = useState({ isOpen, initialSnapshot })

  if (isOpen !== openSyncKey.isOpen || initialSnapshot !== openSyncKey.initialSnapshot) {
    setOpenSyncKey({ isOpen, initialSnapshot })
    if (isOpen) {
      if (initialSnapshot) {
        setSnapshot(initialSnapshot)
        setBillingLoadError(initialSnapshot.billingLoadError)
      }
      setError(null)
      setPendingPhase(null)
    }
  }

  const handleRetryLoad = () => {
    setError(null)
    startTransition(async () => {
      const result = await loadCoachPlatformCheckoutPrerequisitesForCoach(locale)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSnapshot(result.snapshot)
      setBillingLoadError(result.snapshot.billingLoadError)
    })
  }

  const handleSaveAndContinue = () => {
    if (!priceId) return
    const form = document.getElementById(formId) as HTMLFormElement | null
    if (!form) return

    setError(null)
    const payload = getCoachPlatformCheckoutPrerequisitesFormPayload(form)

    startTransition(async () => {
      setPendingPhase('saving')
      const save = await saveCoachPlatformCheckoutPrerequisites(locale, payload)
      if (!save.ok) {
        setPendingPhase(null)
        setError(save.error)
        return
      }

      setPendingPhase('redirecting')
      const checkout = await createCoachPlatformCheckoutSession(locale, {
        priceId,
        returnPath: pathname,
      })
      setPendingPhase(null)
      if (!checkout.ok) {
        setError(checkout.error)
        return
      }
      window.location.href = checkout.url
    })
  }

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end w-full">
      <Button
        type="button"
        variant="muted"
        className="w-full sm:w-auto"
        disabled={isPending}
        onClick={() => {
          if (!isPending) onClose()
        }}
      >
        {t('cancel')}
      </Button>
      <Button
        type="button"
        variant="primary"
        className="w-full sm:w-auto"
        disabled={isPending || billingLoadError || !priceId}
        loading={isPending}
        loadingText={pendingPhase === 'redirecting' ? t('redirecting') : t('saving')}
        onClick={handleSaveAndContinue}
      >
        {t('saveAndContinue')}
      </Button>
    </div>
  )

  if (!snapshot) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isPending) onClose()
      }}
      size="md"
      title={t('modalTitle')}
      titleWrap
      disableOverlayClose={isPending}
      disableEscapeClose={isPending}
      footer={footer}
      contentClassName="max-h-[min(70vh,32rem)] overflow-y-auto"
    >
      <div className="px-6 py-4">
        <CoachPlatformCheckoutPrerequisitesForm
          formId={formId}
          initialSnapshot={snapshot}
          error={error}
          isPending={isPending}
          pendingPhase={pendingPhase}
          onRetryLoad={handleRetryLoad}
          billingLoadError={billingLoadError}
        />
      </div>
    </Modal>
  )
}

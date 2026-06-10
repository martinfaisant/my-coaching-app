'use client'

import { useEffect, useId, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { createCoachPlatformCheckoutSession, loadCoachPlatformCatalogForCoach } from '@/app/[locale]/dashboard/athletes/coachPlatformActions'
import {
  loadCoachPlatformCheckoutPrerequisitesForCoach,
  saveCoachPlatformCheckoutPrerequisites,
} from '@/app/[locale]/dashboard/coach-platform-subscription/coachPlatformCheckoutPrerequisitesActions'
import { CoachPlatformOfferGrid } from '@/components/CoachPlatformOfferGrid'
import {
  CoachPlatformCheckoutPrerequisitesForm,
  getCoachPlatformCheckoutPrerequisitesFormPayload,
} from '@/components/CoachPlatformCheckoutPrerequisitesForm'
import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'
import type { CoachPlatformCheckoutPrerequisitesSnapshot } from '@/lib/coachPlatformCheckoutPrerequisites'

type CoachPlatformSubscribeOffersModalProps = {
  isOpen: boolean
  onClose: () => void
  /** Texte ou paragraphe optionnel au-dessus de la grille (ex. contexte « Accepter une demande ») */
  introSlot?: React.ReactNode
}

type ModalStep = 'offers' | 'prerequisites'

export function CoachPlatformSubscribeOffersModal({
  isOpen,
  onClose,
  introSlot,
}: CoachPlatformSubscribeOffersModalProps) {
  const t = useTranslations('coachMsaOffers')
  const tPrereq = useTranslations('coachMsaSubscription.checkoutPrerequisites')
  const locale = useLocale()
  const pathname = usePathname()
  const formId = useId()
  const [step, setStep] = useState<ModalStep>('offers')
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [offers, setOffers] = useState<CoachPlatformCatalogOffer[]>([])
  const [subscriptionTrialDays, setSubscriptionTrialDays] = useState(0)
  const [trialEligible, setTrialEligible] = useState(true)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [prerequisitesError, setPrerequisitesError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [pendingPriceId, setPendingPriceId] = useState<string | null>(null)
  const [pendingPhase, setPendingPhase] = useState<'saving' | 'redirecting' | null>(null)
  const [prerequisitesSnapshot, setPrerequisitesSnapshot] =
    useState<CoachPlatformCheckoutPrerequisitesSnapshot | null>(null)
  const [billingLoadError, setBillingLoadError] = useState(false)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (!isOpen) {
      setStep('offers')
      setPrerequisitesSnapshot(null)
      setPrerequisitesError(null)
      setPendingPhase(null)
      setBillingLoadError(false)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      return
    }

    let cancelled = false

    void (async () => {
      await Promise.resolve()
      if (cancelled) return
      setLoadState('loading')
      setCatalogError(null)
      setCheckoutError(null)
      setSubscriptionTrialDays(0)
      setTrialEligible(true)

      const result = await loadCoachPlatformCatalogForCoach(locale)
      if (cancelled) return
      if (!result.ok) {
        setCatalogError(result.error)
        setLoadState('error')
        return
      }
      setOffers(result.offers)
      setSubscriptionTrialDays(result.subscriptionTrialDays)
      setTrialEligible(result.trialEligible)
      setLoadState('ready')
    })()

    return () => {
      cancelled = true
    }
  }, [isOpen, locale])

  const redirectToCheckout = async (priceId: string) => {
    const result = await createCoachPlatformCheckoutSession(locale, { priceId, returnPath: pathname })
    if (!result.ok) {
      return { ok: false as const, error: result.error }
    }
    window.location.href = result.url
    return { ok: true as const }
  }

  const handleSubscribe = (priceId: string) => {
    setCheckoutError(null)
    setPendingPriceId(priceId)
    startTransition(async () => {
      const prereq = await loadCoachPlatformCheckoutPrerequisitesForCoach(locale)
      if (!prereq.ok) {
        setCheckoutError(prereq.error)
        setPendingPriceId(null)
        return
      }
      if (prereq.complete) {
        const checkout = await redirectToCheckout(priceId)
        setPendingPriceId(null)
        if (!checkout.ok) {
          setCheckoutError(checkout.error)
        }
        return
      }
      setPrerequisitesSnapshot(prereq.snapshot)
      setBillingLoadError(prereq.snapshot.billingLoadError)
      setPrerequisitesError(null)
      setStep('prerequisites')
      setPendingPriceId(priceId)
    })
  }

  const handleRetryLoadPrerequisites = () => {
    setPrerequisitesError(null)
    startTransition(async () => {
      const result = await loadCoachPlatformCheckoutPrerequisitesForCoach(locale)
      if (!result.ok) {
        setPrerequisitesError(result.error)
        return
      }
      setPrerequisitesSnapshot(result.snapshot)
      setBillingLoadError(result.snapshot.billingLoadError)
    })
  }

  const handleSaveAndContinue = () => {
    if (!pendingPriceId) return
    const form = document.getElementById(formId) as HTMLFormElement | null
    if (!form) return

    setPrerequisitesError(null)
    const payload = getCoachPlatformCheckoutPrerequisitesFormPayload(form)

    startTransition(async () => {
      setPendingPhase('saving')
      const save = await saveCoachPlatformCheckoutPrerequisites(locale, payload)
      if (!save.ok) {
        setPendingPhase(null)
        setPrerequisitesError(save.error)
        return
      }

      setPendingPhase('redirecting')
      const checkout = await redirectToCheckout(pendingPriceId)
      setPendingPhase(null)
      if (!checkout.ok) {
        setPrerequisitesError(checkout.error)
      }
    })
  }

  const footer =
    step === 'prerequisites' ? (
      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end w-full">
        <Button
          type="button"
          variant="muted"
          className="w-full sm:w-auto"
          disabled={isPending}
          onClick={() => {
            if (!isPending) {
              setStep('offers')
              setPrerequisitesError(null)
              setPendingPhase(null)
            }
          }}
        >
          {tPrereq('backToOffers')}
        </Button>
        <Button
          type="button"
          variant="primary"
          className="w-full sm:w-auto"
          disabled={isPending || billingLoadError}
          loading={isPending}
          loadingText={pendingPhase === 'redirecting' ? tPrereq('redirecting') : tPrereq('saving')}
          onClick={handleSaveAndContinue}
        >
          {tPrereq('saveAndContinue')}
        </Button>
      </div>
    ) : (
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
          {t('close')}
        </Button>
      </div>
    )

  const modalTitle = step === 'prerequisites' ? tPrereq('modalTitle') : t('modalTitle')

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isPending) onClose()
      }}
      size="3xl"
      title={modalTitle}
      titleWrap
      disableOverlayClose={isPending}
      disableEscapeClose={isPending}
      footer={footer}
      contentClassName="max-h-[min(70vh,32rem)] overflow-y-auto"
    >
      <div className="px-6 py-4 space-y-4">
        {step === 'offers' ? (
          <>
            {introSlot ? <div className="text-sm text-stone-600 space-y-2">{introSlot}</div> : (
              <p className="text-sm text-stone-600">{t('modalIntroDefault')}</p>
            )}

            {loadState === 'loading' ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3" aria-busy="true">
                <div
                  className="h-8 w-8 rounded-full border-2 border-stone-200 border-t-palette-forest-dark animate-spin"
                  aria-hidden
                />
                <p className="text-sm text-stone-600">{t('loading')}</p>
              </div>
            ) : null}

            {loadState === 'error' && catalogError ? (
              <p className="text-sm text-palette-danger" role="alert">
                {catalogError}
              </p>
            ) : null}

            {loadState === 'ready' && offers.length === 0 ? (
              <p className="text-sm text-stone-500">{t('noOffers')}</p>
            ) : null}

            {loadState === 'ready' && offers.length > 0 ? (
              <CoachPlatformOfferGrid
                offers={offers}
                subscriptionTrialDays={subscriptionTrialDays}
                trialEligible={trialEligible}
                pendingPriceId={pendingPriceId}
                isPending={isPending && step === 'offers'}
                error={checkoutError}
                onSubscribe={handleSubscribe}
              />
            ) : null}
          </>
        ) : null}

        {step === 'prerequisites' && prerequisitesSnapshot ? (
          <CoachPlatformCheckoutPrerequisitesForm
            formId={formId}
            initialSnapshot={prerequisitesSnapshot}
            error={prerequisitesError}
            isPending={isPending}
            pendingPhase={pendingPhase}
            onRetryLoad={handleRetryLoadPrerequisites}
            billingLoadError={billingLoadError}
          />
        ) : null}
      </div>
    </Modal>
  )
}

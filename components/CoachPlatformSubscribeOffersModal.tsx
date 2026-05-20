'use client'

import { useEffect, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname } from '@/i18n/navigation'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { createCoachPlatformCheckoutSession, loadCoachPlatformCatalogForCoach } from '@/app/[locale]/dashboard/athletes/coachPlatformActions'
import { CoachPlatformOfferGrid } from '@/components/CoachPlatformOfferGrid'
import type { CoachPlatformCatalogOffer } from '@/lib/stripeCoachPlatformCatalog'

type CoachPlatformSubscribeOffersModalProps = {
  isOpen: boolean
  onClose: () => void
  /** Texte ou paragraphe optionnel au-dessus de la grille (ex. contexte « Accepter une demande ») */
  introSlot?: React.ReactNode
}

export function CoachPlatformSubscribeOffersModal({
  isOpen,
  onClose,
  introSlot,
}: CoachPlatformSubscribeOffersModalProps) {
  const t = useTranslations('coachMsaOffers')
  const locale = useLocale()
  const pathname = usePathname()
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [offers, setOffers] = useState<CoachPlatformCatalogOffer[]>([])
  const [subscriptionTrialDays, setSubscriptionTrialDays] = useState(0)
  const [catalogError, setCatalogError] = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [pendingPriceId, setPendingPriceId] = useState<string | null>(null)

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

      const result = await loadCoachPlatformCatalogForCoach(locale)
      if (cancelled) return
      if (!result.ok) {
        setCatalogError(result.error)
        setLoadState('error')
        return
      }
      setOffers(result.offers)
      setSubscriptionTrialDays(result.subscriptionTrialDays)
      setLoadState('ready')
    })()

    return () => {
      cancelled = true
    }
  }, [isOpen, locale])

  const handleSubscribe = (priceId: string) => {
    setCheckoutError(null)
    setPendingPriceId(priceId)
    startTransition(async () => {
      const result = await createCoachPlatformCheckoutSession(locale, { priceId, returnPath: pathname })
      setPendingPriceId(null)
      if (!result.ok) {
        setCheckoutError(result.error)
        return
      }
      window.location.href = result.url
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
        {t('close')}
      </Button>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isPending) onClose()
      }}
      size="3xl"
      title={t('modalTitle')}
      titleWrap
      disableOverlayClose={isPending}
      disableEscapeClose={isPending}
      footer={footer}
      contentClassName="max-h-[min(70vh,32rem)] overflow-y-auto"
    >
      <div className="px-6 py-4 space-y-4">
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
            pendingPriceId={pendingPriceId}
            isPending={isPending}
            error={checkoutError}
            onSubscribe={handleSubscribe}
          />
        ) : null}
      </div>
    </Modal>
  )
}

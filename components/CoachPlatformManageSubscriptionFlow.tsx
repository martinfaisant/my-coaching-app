'use client'

import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { isError, type ApiResult } from '@/lib/errors'
import type { CoachPlatformBillingPeriod } from '@/lib/coachPlatformSubscriptionDisplay'
import type { CoachPlatformRefundPreview } from '@/lib/stripeCoachPlatformCancellation'
import { formatMoneyAmount } from '@/lib/formatMoney'
import {
  cancelCoachPlatformSubscriptionImmediatelyAction,
  previewCoachPlatformImmediateCancelRefundAction,
  resumeCoachPlatformSubscriptionAction,
  scheduleCoachPlatformSubscriptionEndAction,
} from '@/app/[locale]/dashboard/coach-platform-subscription/coachPlatformCancellationActions'

type CancelChoice = 'end_of_period' | 'immediate'

type FlowStep =
  | 'closed'
  | 'choose'
  | 'confirmSchedule'
  | 'confirmImmediate'
  | 'confirmTrial'
  | 'confirmAnnual'
  | 'confirmResume'

export type CoachPlatformManageSubscriptionFlowProps = {
  locale: string
  status: 'active' | 'trialing'
  billingPeriod: CoachPlatformBillingPeriod
  periodEndLabel: string | null
  children: (handlers: { onManage: () => void; onResumeScheduledEnd: () => void }) => React.ReactNode
}

export function CoachPlatformManageSubscriptionFlow({
  locale,
  status,
  billingPeriod,
  periodEndLabel,
  children,
}: CoachPlatformManageSubscriptionFlowProps) {
  const t = useTranslations('coachMsaSubscription.cancellation')
  const router = useRouter()
  const [step, setStep] = useState<FlowStep>('closed')
  const [choice, setChoice] = useState<CancelChoice | null>(null)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [refundPreview, setRefundPreview] = useState<CoachPlatformRefundPreview | null>(null)
  const [refundLoading, setRefundLoading] = useState(false)

  const close = useCallback(() => {
    if (loading) return
    setStep('closed')
    setChoice(null)
    setErrorMessage(null)
    setRefundPreview(null)
  }, [loading])

  const onManage = useCallback(() => {
    setErrorMessage(null)
    if (status === 'trialing') {
      setStep('confirmTrial')
      return
    }
    if (billingPeriod === 'annual') {
      setStep('confirmAnnual')
      return
    }
    if (billingPeriod === 'monthly') {
      setStep('choose')
      return
    }
  }, [status, billingPeriod])

  const onResumeScheduledEnd = useCallback(() => {
    setErrorMessage(null)
    setStep('confirmResume')
  }, [])

  const loadRefundPreview = useCallback(async () => {
    setRefundLoading(true)
    const result = await previewCoachPlatformImmediateCancelRefundAction(locale)
    setRefundLoading(false)
    if (isError(result)) {
      setRefundPreview(null)
      return
    }
    setRefundPreview(result.data)
  }, [locale])

  const handleContinueFromChoose = async () => {
    if (!choice) return
    setErrorMessage(null)
    if (choice === 'end_of_period') {
      setStep('confirmSchedule')
      return
    }
    setStep('confirmImmediate')
    void loadRefundPreview()
  }

  const formatRefund = (preview: CoachPlatformRefundPreview) =>
    formatMoneyAmount(locale, preview.amountMajor, preview.currency)

  const runAction = async (action: () => Promise<ApiResult<unknown>>) => {
    setLoading(true)
    setErrorMessage(null)
    const result = await action()
    setLoading(false)
    if (isError(result)) {
      setErrorMessage(result.error)
      return
    }
    close()
    router.refresh()
  }

  const footerActions = (secondaryLabel: string, primaryLabel: string, onPrimary: () => void, primaryVariant: 'primary' | 'danger' = 'primary') => (
    <div className="flex items-center justify-end gap-3">
      <Button type="button" variant="muted" onClick={close} disabled={loading}>
        {secondaryLabel}
      </Button>
      <Button
        type="button"
        variant={primaryVariant}
        onClick={onPrimary}
        disabled={loading}
      >
        {loading ? '…' : primaryLabel}
      </Button>
    </div>
  )

  return (
    <>
      {children({ onManage, onResumeScheduledEnd })}

      {/* Mensuel — choix */}
      <Modal
        isOpen={step === 'choose'}
        onClose={close}
        title={t('choose.title')}
        size="md"
        disableOverlayClose={loading}
        disableEscapeClose={loading}
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="muted" onClick={close} disabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={() => void handleContinueFromChoose()}
              disabled={loading || choice == null}
            >
              {t('choose.continue')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4 space-y-3">
          <label
            className={`block rounded-xl border p-4 cursor-pointer ${
              choice === 'end_of_period'
                ? 'border-2 border-palette-forest-dark bg-stone-50'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex gap-3">
              <input
                type="radio"
                name="cancelChoice"
                className="mt-1 accent-palette-forest-dark"
                checked={choice === 'end_of_period'}
                onChange={() => setChoice('end_of_period')}
              />
              <div>
                <p className="text-sm font-semibold text-stone-900">{t('choose.endOfPeriodTitle')}</p>
                <p className="text-xs text-stone-500 mt-1">
                  {periodEndLabel ? t('choose.endOfPeriodHint', { date: periodEndLabel }) : t('choose.endOfPeriodHintGeneric')}
                </p>
              </div>
            </div>
          </label>
          <label
            className={`block rounded-xl border p-4 cursor-pointer ${
              choice === 'immediate'
                ? 'border-2 border-palette-forest-dark bg-stone-50'
                : 'border-stone-200 hover:border-stone-300'
            }`}
          >
            <div className="flex gap-3">
              <input
                type="radio"
                name="cancelChoice"
                className="mt-1"
                checked={choice === 'immediate'}
                onChange={() => setChoice('immediate')}
              />
              <div>
                <p className="text-sm font-semibold text-stone-900">{t('choose.immediateTitle')}</p>
                <p className="text-xs text-stone-500 mt-1">{t('choose.immediateHint')}</p>
              </div>
            </div>
          </label>
          {errorMessage ? (
            <p className="text-sm text-palette-danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </Modal>

      {/* Fin de période */}
      <Modal
        isOpen={step === 'confirmSchedule'}
        onClose={close}
        title={t('confirmSchedule.title')}
        size="md"
        disableOverlayClose={loading}
        disableEscapeClose={loading}
        footer={footerActions(
          t('common.cancel'),
          t('confirmSchedule.confirm'),
          () => void runAction(() => scheduleCoachPlatformSubscriptionEndAction(locale))
        )}
      >
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-stone-700 leading-relaxed">
            {periodEndLabel
              ? t('confirmSchedule.body', { date: periodEndLabel })
              : t('confirmSchedule.bodyGeneric')}
          </p>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
            {t('confirmSchedule.infoBox')}
          </div>
          {errorMessage ? (
            <p className="text-sm text-palette-danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </Modal>

      {/* Immédiat */}
      <Modal
        isOpen={step === 'confirmImmediate'}
        onClose={close}
        title={t('confirmImmediate.title')}
        size="md"
        disableOverlayClose={loading}
        disableEscapeClose={loading}
        footer={footerActions(
          t('common.cancel'),
          t('confirmImmediate.confirm'),
          () => void runAction(() => cancelCoachPlatformSubscriptionImmediatelyAction(locale)),
          'danger'
        )}
      >
        <div className="px-6 py-4 space-y-3">
          <div className="rounded-lg bg-palette-danger-light border border-palette-danger/20 px-3 py-2.5 text-sm text-stone-800">
            <p className="font-medium text-palette-danger">{t('confirmImmediate.alertTitle')}</p>
            <p className="text-xs mt-1 text-stone-700">{t('confirmImmediate.alertBody')}</p>
          </div>
          {refundLoading ? (
            <p className="text-sm text-stone-500">{t('confirmImmediate.refundLoading')}</p>
          ) : refundPreview ? (
            <p className="text-sm text-stone-700">
              {t('confirmImmediate.refundWithAmount', { amount: formatRefund(refundPreview) })}
            </p>
          ) : (
            <p className="text-sm text-stone-700">{t('confirmImmediate.refundUnknown')}</p>
          )}
          {errorMessage ? (
            <p className="text-sm text-palette-danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </Modal>

      {/* Essai */}
      <Modal
        isOpen={step === 'confirmTrial'}
        onClose={close}
        title={t('confirmTrial.title')}
        size="md"
        disableOverlayClose={loading}
        disableEscapeClose={loading}
        footer={footerActions(
          t('common.cancel'),
          t('confirmTrial.confirm'),
          () => void runAction(() => scheduleCoachPlatformSubscriptionEndAction(locale))
        )}
      >
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-stone-700 leading-relaxed">
            {periodEndLabel
              ? t('confirmTrial.body', { date: periodEndLabel })
              : t('confirmTrial.bodyGeneric')}
          </p>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
            {t('confirmTrial.trialOnceBox')}
          </div>
          {errorMessage ? (
            <p className="text-sm text-palette-danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </Modal>

      {/* Annuel */}
      <Modal
        isOpen={step === 'confirmAnnual'}
        onClose={close}
        title={t('confirmAnnual.title')}
        size="md"
        disableOverlayClose={loading}
        disableEscapeClose={loading}
        footer={footerActions(
          t('common.cancel'),
          t('confirmAnnual.confirm'),
          () => void runAction(() => scheduleCoachPlatformSubscriptionEndAction(locale))
        )}
      >
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-stone-700 leading-relaxed">
            {periodEndLabel
              ? t('confirmAnnual.body', { date: periodEndLabel })
              : t('confirmAnnual.bodyGeneric')}
          </p>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-xs text-stone-600">
            {t('confirmAnnual.infoBox')}
          </div>
          {errorMessage ? (
            <p className="text-sm text-palette-danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </Modal>

      {/* Reprise */}
      <Modal
        isOpen={step === 'confirmResume'}
        onClose={close}
        title={t('confirmResume.title')}
        size="md"
        disableOverlayClose={loading}
        disableEscapeClose={loading}
        footer={footerActions(
          t('common.close'),
          t('confirmResume.confirm'),
          () => void runAction(() => resumeCoachPlatformSubscriptionAction(locale))
        )}
      >
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-stone-700 leading-relaxed">{t('confirmResume.body')}</p>
          {errorMessage ? (
            <p className="text-sm text-palette-danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
      </Modal>
    </>
  )
}

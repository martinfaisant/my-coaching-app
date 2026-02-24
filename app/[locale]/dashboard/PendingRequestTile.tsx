'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Badge } from '@/components/Badge'
import { AvatarImage } from '@/components/AvatarImage'
import { Modal } from '@/components/Modal'
import { useOpenChat } from '@/contexts/OpenChatContext'
import { getInitials } from '@/lib/stringUtils'
import { respondToCoachRequest } from '@/app/[locale]/dashboard/actions'
import type { PendingRequestWithAthlete } from '@/app/[locale]/dashboard/actions'

type PendingRequestTileProps = {
  request: PendingRequestWithAthlete
}

function formatOfferPrice(
  request: PendingRequestWithAthlete,
  t: (key: string) => string
): string {
  if (request.offer_price === null || (request.offer_price_type === 'free') || request.offer_price === 0) {
    return t('pendingRequests.free')
  }
  if (request.offer_price_type === 'monthly') {
    return `${request.offer_price}€${t('pendingRequests.perMonth')}`
  }
  return `${request.offer_price}€`
}

export function PendingRequestTile({ request }: PendingRequestTileProps) {
  const [isPending, startTransition] = useTransition()
  const [confirmModal, setConfirmModal] = useState<'decline' | 'accept' | null>(null)
  const router = useRouter()
  const locale = useLocale()
  const t = useTranslations('athletes')
  const tCoach = useTranslations('coachRequests')
  const tCommon = useTranslations('common')
  const { openChatWithAthlete } = useOpenChat()

  const name = request.athlete_name || request.athlete_email || '—'
  const sportValues = (request.sport_practiced || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)

  const handleRespond = (accept: boolean) => {
    startTransition(async () => {
      const result = await respondToCoachRequest(request.id, accept, locale)
      if (result.error) {
        alert(result.error)
        return
      }
      setConfirmModal(null)
      router.refresh()
    })
  }

  const offerLine = request.offer_title
    ? `${request.offer_title} — ${formatOfferPrice(request, t)}`
    : null

  return (
    <li className="rounded-lg border border-l-4 border-l-palette-amber border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <AvatarImage
            src={request.athlete_avatar_url}
            initials={getInitials(name)}
            className="w-12 h-12 flex-shrink-0 rounded-full"
          />
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-stone-900">{name}</div>
            <div className="text-xs text-stone-500 mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-1">
              {sportValues.map((sport) => (
                <Badge
                  key={sport}
                  sport={sport as Parameters<typeof Badge>[0]['sport']}
                />
              ))}
              {offerLine && (
                <>
                  {sportValues.length > 0 && <span className="font-bold">·</span>}
                  <span>{offerLine}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="hidden sm:flex flex-wrap gap-2 shrink-0 sm:ml-auto">
          <Button
            type="button"
            variant="secondary"
            onClick={() => openChatWithAthlete(request.athlete_id)}
            className="whitespace-nowrap"
          >
            {t('pendingRequests.chat')}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => setConfirmModal('decline')}
            disabled={isPending}
          >
            {tCoach('decline')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => setConfirmModal('accept')}
            disabled={isPending}
          >
            {tCoach('accept')}
          </Button>
        </div>
      </div>
      {request.coaching_need && (
        <p className="text-sm text-stone-600 italic mt-2 pt-2 border-t border-stone-100 w-full whitespace-pre-wrap break-words">
          &quot;{request.coaching_need}&quot;
        </p>
      )}
      <div className="flex flex-col gap-2 mt-2 sm:hidden">
        <Button
          type="button"
          variant="secondary"
          onClick={() => openChatWithAthlete(request.athlete_id)}
          className="w-full"
        >
          {t('pendingRequests.chat')}
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="danger"
            onClick={() => setConfirmModal('decline')}
            disabled={isPending}
            className="flex-1"
          >
            {tCoach('decline')}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => setConfirmModal('accept')}
            disabled={isPending}
            className="flex-1"
          >
            {tCoach('accept')}
          </Button>
        </div>
      </div>

      <Modal
        isOpen={confirmModal === 'decline'}
        onClose={() => setConfirmModal(null)}
        size="sm"
        title={tCoach('confirmDeclineTitle')}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="muted"
              className="flex-1"
              onClick={() => setConfirmModal(null)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              disabled={isPending}
              onClick={() => handleRespond(false)}
            >
              {tCoach('decline')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4">
          <p className="text-sm text-stone-600">{tCoach('confirmDeclineBody')}</p>
        </div>
      </Modal>

      <Modal
        isOpen={confirmModal === 'accept'}
        onClose={() => setConfirmModal(null)}
        size="sm"
        title={tCoach('confirmAcceptTitle')}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="muted"
              className="flex-1"
              onClick={() => setConfirmModal(null)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              disabled={isPending}
              onClick={() => handleRespond(true)}
            >
              {tCoach('accept')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4">
          <p className="text-sm text-stone-600">{tCoach('confirmAcceptBody')}</p>
        </div>
      </Modal>
    </li>
  )
}

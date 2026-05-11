'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { respondToCoachRequest } from './actions'

export function RespondToRequestButtons({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition()
  const [respondError, setRespondError] = useState<string | null>(null)
  const router = useRouter()
  const t = useTranslations('coachRequests')
  const locale = useLocale()

  const handleRespond = (accept: boolean) => {
    setRespondError(null)
    startTransition(async () => {
      const result = await respondToCoachRequest(requestId, accept, locale)
      if (result.error) {
        setRespondError(result.error)
        return
      }
      setRespondError(null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-2 shrink-0">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="muted"
          onClick={() => handleRespond(false)}
          disabled={isPending}
        >
          {t('decline')}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => handleRespond(true)}
          disabled={isPending}
        >
          {t('accept')}
        </Button>
      </div>
      {respondError ? (
        <p className="max-w-xs text-right text-sm text-palette-danger" role="alert">
          {respondError}
        </p>
      ) : null}
    </div>
  )
}

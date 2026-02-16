'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { respondToCoachRequest } from './actions'

export function RespondToRequestButtons({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const t = useTranslations('coachRequests')
  const locale = useLocale()

  const handleRespond = (accept: boolean) => {
    startTransition(async () => {
      const result = await respondToCoachRequest(requestId, accept, locale)
      if (result.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2 shrink-0">
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
  )
}

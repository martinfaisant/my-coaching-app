'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { respondToCoachRequest } from './actions'

export function RespondToRequestButtons({ requestId }: { requestId: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleRespond = (accept: boolean) => {
    startTransition(async () => {
      const result = await respondToCoachRequest(requestId, accept)
      if (result.error) {
        alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        type="button"
        onClick={() => handleRespond(false)}
        disabled={isPending}
        className="rounded-lg border-2 border-palette-forest-dark px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
      >
        Refuser
      </button>
      <button
        type="button"
        onClick={() => handleRespond(true)}
        disabled={isPending}
        className="rounded-lg bg-palette-forest-dark px-3 py-2 text-sm font-medium text-white border-2 border-palette-olive hover:bg-palette-olive transition-colors disabled:opacity-50"
      >
        Accepter
      </button>
    </div>
  )
}

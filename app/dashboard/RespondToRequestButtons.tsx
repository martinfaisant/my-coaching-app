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
        className="rounded-lg border border-stone-200border-stone-700 px-3 py-2 text-sm font-medium text-stone-700text-stone-300 hover:bg-stone-50hover:bg-palette-olive transition-colors disabled:opacity-50"
      >
        Refuser
      </button>
      <button
        type="button"
        onClick={() => handleRespond(true)}
        disabled={isPending}
        className="rounded-lg bg-stone-900bg-white px-3 py-2 text-sm font-medium text-whitetext-stone-900 hover:bg-palette-olivehover:bg-stone-100 transition-colors disabled:opacity-50"
      >
        Accepter
      </button>
    </div>
  )
}

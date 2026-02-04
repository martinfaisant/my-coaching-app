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
        className="rounded-xl border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
      >
        Refuser
      </button>
      <button
        type="button"
        onClick={() => handleRespond(true)}
        disabled={isPending}
        className="rounded-xl bg-slate-900 dark:bg-white px-3 py-2 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition disabled:opacity-50"
      >
        Accepter
      </button>
    </div>
  )
}

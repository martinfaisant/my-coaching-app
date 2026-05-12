'use client'

import { useState, useCallback } from 'react'
import { ChatModule } from '@/components/ChatModule'
import { OpenChatContextProvider } from '@/contexts/OpenChatContext'
import type { ChatRoleResult } from '@/app/[locale]/actions/chat'

type DashboardChatWrapperProps = {
  children: React.ReactNode
  initialChatRole: ChatRoleResult | null
  /** Bandeaux / vérif Stripe coach (au-dessus du contenu page, scroll commun). */
  coachStripeSlot?: React.ReactNode
}

export function DashboardChatWrapper({
  children,
  initialChatRole,
  coachStripeSlot,
}: DashboardChatWrapperProps) {
  const [preselectedAthleteId, setPreselectedAthleteId] = useState<string | null>(null)
  const openChatWithAthlete = useCallback((athleteId: string) => {
    setPreselectedAthleteId(athleteId)
  }, [])

  return (
    <OpenChatContextProvider openChatWithAthlete={openChatWithAthlete}>
      <div className="flex-1 min-w-0 min-h-0 overflow-y-auto flex flex-col">
        {coachStripeSlot}
        {children}
      </div>
      <ChatModule
        initialChatRole={initialChatRole}
        openWithAthleteId={preselectedAthleteId}
        onOpenWithAthleteHandled={() => setPreselectedAthleteId(null)}
      />
    </OpenChatContextProvider>
  )
}

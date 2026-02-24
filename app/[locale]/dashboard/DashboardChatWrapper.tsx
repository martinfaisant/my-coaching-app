'use client'

import { useState, useCallback } from 'react'
import { ChatModule } from '@/components/ChatModule'
import { OpenChatContextProvider } from '@/contexts/OpenChatContext'
import type { ChatRoleResult } from '@/app/[locale]/actions/chat'

type DashboardChatWrapperProps = {
  children: React.ReactNode
  initialChatRole: ChatRoleResult | null
}

export function DashboardChatWrapper({ children, initialChatRole }: DashboardChatWrapperProps) {
  const [preselectedAthleteId, setPreselectedAthleteId] = useState<string | null>(null)
  const openChatWithAthlete = useCallback((athleteId: string) => {
    setPreselectedAthleteId(athleteId)
  }, [])

  return (
    <OpenChatContextProvider openChatWithAthlete={openChatWithAthlete}>
      <div className="flex-1 min-w-0">
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

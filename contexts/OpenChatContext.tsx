'use client'

import { createContext, useContext, type ReactNode } from 'react'

export type OpenChatContextValue = {
  openChatWithAthlete: (athleteId: string) => void
}

const OpenChatContext = createContext<OpenChatContextValue | null>(null)

export function useOpenChat(): OpenChatContextValue {
  const ctx = useContext(OpenChatContext)
  if (!ctx) {
    throw new Error('useOpenChat must be used within OpenChatProvider')
  }
  return ctx
}

export function useOpenChatOptional(): OpenChatContextValue | null {
  return useContext(OpenChatContext)
}

/**
 * Provider that only exposes openChatWithAthlete.
 * The actual state (preselectedAthleteId) is held by the layout wrapper
 * that also renders ChatModule with openWithAthleteId.
 */
export function OpenChatContextProvider({
  children,
  openChatWithAthlete,
}: {
  children: ReactNode
  openChatWithAthlete: (athleteId: string) => void
}) {
  const value: OpenChatContextValue = { openChatWithAthlete }
  return (
    <OpenChatContext.Provider value={value}>
      {children}
    </OpenChatContext.Provider>
  )
}

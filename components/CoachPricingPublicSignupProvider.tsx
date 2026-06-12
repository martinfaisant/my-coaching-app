'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { LoginModal } from '@/components/LoginModal'

type CoachPricingPublicSignupContextValue = {
  openSignup: () => void
}

const CoachPricingPublicSignupContext = createContext<CoachPricingPublicSignupContextValue | null>(
  null
)

export function useCoachPricingPublicSignup(): CoachPricingPublicSignupContextValue {
  const ctx = useContext(CoachPricingPublicSignupContext)
  if (!ctx) {
    throw new Error('useCoachPricingPublicSignup must be used within CoachPricingPublicSignupProvider')
  }
  return ctx
}

type CoachPricingPublicSignupProviderProps = {
  children: ReactNode
}

export function CoachPricingPublicSignupProvider({ children }: CoachPricingPublicSignupProviderProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('signup')

  const openSignup = useCallback(() => {
    setModalMode('signup')
    setModalOpen(true)
  }, [])

  return (
    <CoachPricingPublicSignupContext.Provider value={{ openSignup }}>
      {children}
      <LoginModal
        isOpen={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onModeChange={setModalMode}
      />
    </CoachPricingPublicSignupContext.Provider>
  )
}

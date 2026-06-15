'use client'

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { LoginModal } from '@/components/LoginModal'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import { buildFindCoachDeepLink } from '@/lib/postAuthRedirect'
import { savePostAuthRedirect } from '@/app/[locale]/coaches/actions'

type GateContext = {
  coachName: string
  offerTitle: string
}

type PublicCoachAuthGateContextValue = {
  openGate: (coachId: string, coachName: string, offerId: string, offerTitle: string) => void
}

const PublicCoachAuthGateContext = createContext<PublicCoachAuthGateContextValue | null>(null)

export function usePublicCoachAuthGate(): PublicCoachAuthGateContextValue {
  const ctx = useContext(PublicCoachAuthGateContext)
  if (!ctx) {
    throw new Error('usePublicCoachAuthGate must be used within PublicCoachAuthGateProvider')
  }
  return ctx
}

type PublicCoachAuthGateProviderProps = {
  children: ReactNode
}

export function PublicCoachAuthGateProvider({ children }: PublicCoachAuthGateProviderProps) {
  const t = useTranslations('publicCoaches.gate')
  const locale = useLocale()
  const [gateOpen, setGateOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [loginMode, setLoginMode] = useState<'login' | 'signup'>('signup')
  const [redirectPath, setRedirectPath] = useState<string | null>(null)
  const [gateContext, setGateContext] = useState<GateContext | null>(null)

  const openGate = useCallback(
    (coachId: string, coachName: string, offerId: string, offerTitle: string) => {
      const path = buildFindCoachDeepLink(locale, coachId, offerId)
      setRedirectPath(path)
      setGateContext({ coachName, offerTitle })
      setGateOpen(true)
    },
    [locale]
  )

  const prepareRedirect = useCallback(async () => {
    if (redirectPath) {
      await savePostAuthRedirect(redirectPath)
    }
  }, [redirectPath])

  const openSignup = useCallback(async () => {
    await prepareRedirect()
    setGateOpen(false)
    setLoginMode('signup')
    setLoginOpen(true)
  }, [prepareRedirect])

  const openLogin = useCallback(async () => {
    await prepareRedirect()
    setGateOpen(false)
    setLoginMode('login')
    setLoginOpen(true)
  }, [prepareRedirect])

  return (
    <PublicCoachAuthGateContext.Provider value={{ openGate }}>
      {children}

      <Modal
        isOpen={gateOpen}
        onClose={() => setGateOpen(false)}
        title={t('title')}
        size="md"
        contentClassName="px-6 py-6"
      >
        <div className="space-y-5">
          <p className="text-sm text-stone-600 leading-relaxed">
            {t('description', {
              coachName: gateContext?.coachName ?? '',
              offerTitle: gateContext?.offerTitle ?? '',
            })}
          </p>
          <div className="flex flex-col gap-3 pt-1">
            <Button type="button" fullWidth onClick={() => void openSignup()}>
              {t('signupAthlete')}
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={() => void openLogin()}>
              {t('login')}
            </Button>
          </div>
        </div>
      </Modal>

      <LoginModal
        isOpen={loginOpen}
        mode={loginMode}
        onClose={() => setLoginOpen(false)}
        onModeChange={setLoginMode}
        redirectPath={redirectPath ?? undefined}
        defaultSignupRole="athlete"
        lockSignupRole
      />
    </PublicCoachAuthGateContext.Provider>
  )
}

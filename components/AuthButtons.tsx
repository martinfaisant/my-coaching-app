'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { LoginModal } from '@/components/LoginModal'
import { ArrowRight } from 'lucide-react'

interface AuthButtonsProps {
  variant?: 'default' | 'hero'
}

export function AuthButtons({ variant = 'default' }: AuthButtonsProps) {
  const t = useTranslations('auth')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('login')

  const openLogin = () => {
    setModalMode('login')
    setModalOpen(true)
  }

  const openSignup = () => {
    setModalMode('signup')
    setModalOpen(true)
  }

  if (variant === 'hero') {
    return (
      <>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={openSignup}
            className="group w-full sm:w-auto px-8 py-4 bg-palette-forest-dark text-white rounded-xl font-semibold text-lg hover:bg-palette-forest-default transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {t('startFree')}
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={openLogin}
            className="w-full sm:w-auto px-8 py-4 bg-white text-stone-900 rounded-xl font-semibold text-lg border-2 border-stone-200 hover:border-stone-300 transition-all duration-300"
          >
            {t('login')}
          </button>
        </div>

        <LoginModal
          isOpen={modalOpen}
          mode={modalMode}
          onClose={() => setModalOpen(false)}
          onModeChange={setModalMode}
        />
      </>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2.5">
        <Button variant="secondary" onClick={openLogin}>
          {t('login')}
        </Button>
        <Button variant="primary" onClick={openSignup}>
          {t('signup')}
        </Button>
      </div>

      <LoginModal
        isOpen={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onModeChange={setModalMode}
      />
    </>
  )
}

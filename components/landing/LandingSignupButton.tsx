'use client'

import { useState } from 'react'
import { LoginModal } from '@/components/LoginModal'

type LandingSignupButtonProps = {
  label: string
  className?: string
  fullWidth?: boolean
}

export function LandingSignupButton({
  label,
  className = '',
  fullWidth = false,
}: LandingSignupButtonProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'login' | 'signup'>('signup')

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setModalMode('signup')
          setModalOpen(true)
        }}
        className={`rounded-xl bg-palette-forest-dark px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-palette-olive ${
          fullWidth ? 'w-full' : ''
        } ${className}`.trim()}
      >
        {label}
      </button>

      <LoginModal
        isOpen={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onModeChange={setModalMode}
      />
    </>
  )
}

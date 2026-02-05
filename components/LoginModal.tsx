'use client'

import { useEffect } from 'react'
import { LoginForm } from './LoginForm'

export type AuthModalMode = 'login' | 'signup'

type LoginModalProps = {
  isOpen: boolean
  mode: AuthModalMode
  onClose: () => void
  onModeChange?: (mode: AuthModalMode) => void
}

export function LoginModal({ isOpen, mode, onClose, onModeChange }: LoginModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-palette-forest-dark/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-xl border border-stone-100">
        <LoginForm mode={mode} onModeChange={onModeChange} onClose={onClose} />
      </div>
    </div>
  )
}

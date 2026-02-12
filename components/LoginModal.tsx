'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { LoginForm } from './LoginForm'

export type AuthModalMode = 'login' | 'signup'

type LoginModalProps = {
  isOpen: boolean
  mode: AuthModalMode
  onClose: () => void
  onModeChange?: (mode: AuthModalMode) => void
}

export function LoginModal({ isOpen, mode, onClose, onModeChange }: LoginModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

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

  if (!isOpen || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm z-0"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Content */}
      <div
        className="relative z-50 w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-stone-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <LoginForm mode={mode} onModeChange={onModeChange} onClose={onClose} />
      </div>
    </div>,
    document.body
  )
}

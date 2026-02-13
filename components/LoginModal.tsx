'use client'

import { Modal } from './Modal'
import { LoginForm } from './LoginForm'

export type AuthModalMode = 'login' | 'signup'

type LoginModalProps = {
  isOpen: boolean
  mode: AuthModalMode
  onClose: () => void
  onModeChange?: (mode: AuthModalMode) => void
}

export function LoginModal({ isOpen, mode, onClose, onModeChange }: LoginModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" hideCloseButton>
      <LoginForm mode={mode} onModeChange={onModeChange} onClose={onClose} />
    </Modal>
  )
}

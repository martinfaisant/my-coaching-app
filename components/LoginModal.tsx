'use client'

import { Modal } from './Modal'
import { LoginForm } from './LoginForm'

export type AuthModalMode = 'login' | 'signup'

type LoginModalProps = {
  isOpen: boolean
  mode: AuthModalMode
  onClose: () => void
  onModeChange?: (mode: AuthModalMode) => void
  redirectPath?: string
  defaultSignupRole?: 'athlete' | 'coach'
  lockSignupRole?: boolean
}

export function LoginModal({
  isOpen,
  mode,
  onClose,
  onModeChange,
  redirectPath,
  defaultSignupRole,
  lockSignupRole,
}: LoginModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" hideCloseButton>
      <LoginForm
        mode={mode}
        onModeChange={onModeChange}
        onClose={onClose}
        redirectPath={redirectPath}
        defaultSignupRole={defaultSignupRole}
        lockSignupRole={lockSignupRole}
      />
    </Modal>
  )
}

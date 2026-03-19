'use client'

import { useState } from 'react'
import { EmailValidatedModal } from '@/components/EmailValidatedModal'

type HomeEmailConfirmedTriggerProps = {
  showEmailConfirmedModal: boolean
}

export function HomeEmailConfirmedTrigger({
  showEmailConfirmedModal,
}: HomeEmailConfirmedTriggerProps) {
  if (!showEmailConfirmedModal) return null

  return <HomeEmailConfirmedTriggerInner />
}

function HomeEmailConfirmedTriggerInner() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <EmailValidatedModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  )
}

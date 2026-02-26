'use client'

import { useState, useEffect } from 'react'
import { EmailValidatedModal } from '@/components/EmailValidatedModal'

type HomeEmailConfirmedTriggerProps = {
  showEmailConfirmedModal: boolean
}

export function HomeEmailConfirmedTrigger({
  showEmailConfirmedModal,
}: HomeEmailConfirmedTriggerProps) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (showEmailConfirmedModal) {
      setIsOpen(true)
    }
  }, [showEmailConfirmedModal])

  if (!showEmailConfirmedModal) return null

  return (
    <EmailValidatedModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
    />
  )
}

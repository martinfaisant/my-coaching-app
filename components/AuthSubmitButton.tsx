'use client'

import type { ComponentProps, ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/Button'

type AuthSubmitButtonProps = {
  children: ReactNode
  loadingText: string
  variant?: ComponentProps<typeof Button>['variant']
  fullWidth?: boolean
  disabled?: boolean
  className?: string
}

export function AuthSubmitButton({
  children,
  loadingText,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  className,
}: AuthSubmitButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      type="submit"
      variant={variant}
      fullWidth={fullWidth}
      disabled={disabled}
      loading={pending}
      loadingText={loadingText}
      className={className}
    >
      {children}
    </Button>
  )
}

'use client'

import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

type DrawerProps = {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  placement?: 'left' | 'right'
  /** Accessible label for the drawer panel */
  'aria-label'?: string
}

export function Drawer({
  isOpen,
  onClose,
  children,
  placement = 'left',
  'aria-label': ariaLabel = 'Menu',
}: DrawerProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleEscape])

  if (typeof document === 'undefined' || !isOpen) return null

  const panelClass =
    placement === 'left'
      ? 'left-0 top-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col'
      : 'right-0 top-0 h-full w-full max-w-sm bg-white shadow-xl flex flex-col'

  return createPortal(
    <>
      <div
        role="presentation"
        className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={`fixed z-50 ${panelClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>,
    document.body
  )
}

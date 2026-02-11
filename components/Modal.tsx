'use client'

import { useEffect, ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  titleId?: string
  /** Taille maximale de la modale (par défaut: 'md') */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Désactiver la fermeture au clic sur le backdrop */
  disableBackdropClose?: boolean
  /** Désactiver la fermeture avec Escape */
  disableEscapeClose?: boolean
  /** Classe personnalisée pour le contenu */
  contentClassName?: string
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-5xl',
  full: 'max-w-full',
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  titleId,
  size = 'md',
  disableBackdropClose = false,
  disableEscapeClose = false,
  contentClassName = '',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableEscapeClose) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose, disableEscapeClose])

  if (!isOpen || typeof document === 'undefined') return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-palette-forest-dark/50 backdrop-blur-sm z-[90]"
        onClick={disableBackdropClose ? undefined : onClose}
        aria-hidden="true"
      />
      {/* Modal Container */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        {/* Modal Content */}
        <div
          className={`relative w-full ${sizeClasses[size]} max-h-[90vh] bg-white rounded-xl shadow-xl border border-stone-100 overflow-hidden flex flex-col ${contentClassName}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  )
}

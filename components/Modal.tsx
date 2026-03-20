'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslations } from 'next-intl'
import { Button } from './Button'
import { IconClose } from './icons/IconClose'

/**
 * Modal — Composant modal réutilisable avec overlay, gestion Escape, scroll body.
 * 
 * Variantes de taille :
 * - sm: max-w-sm (384px) — Confirmations simples
 * - md: max-w-md (448px) — Par défaut, formulaires standards
 * - lg: max-w-lg (512px) — Formulaires étendus
 * - xl: max-w-xl (576px) — Contenu riche
 * - 2xl: max-w-2xl (672px) — Large contenu
 * - 3xl: max-w-3xl (768px) — Détails coach, galeries
 * - 4xl: max-w-4xl (896px) — Vues larges (détails coach complets)
 * - full: max-w-[95vw] — Plein écran (chat)
 * 
 * Alignement :
 * - center: Centré verticalement et horizontalement (par défaut)
 * - top: En haut de l'écran
 * - right: À droite de l'écran (pour chat, panels)
 *
 * Modale sur modale :
 * - layer (défaut 0) : niveau d'empilement. layer=1 pour une modale ouverte au-dessus d'une autre
 *   (overlay et contenu passent au-dessus avec z-index 190/200).
 */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full' | 'workout'
export type ModalAlignment = 'center' | 'top' | 'right'

const Z_OVERLAY_BASE = 90
const Z_CONTAINER_BASE = 100
const Z_LAYER_STEP = 100

type ModalProps = {
  isOpen: boolean
  onClose: () => void
  /** Niveau d'empilement pour modale sur modale (0 = défaut, 1 = au-dessus d'une autre modale) */
  layer?: number
  /** Taille de la modale (défaut: md) */
  size?: ModalSize
  /** Alignement de la modale (défaut: center) */
  alignment?: ModalAlignment
  /** Titre affiché dans le header */
  title?: string
  /** Icône optionnelle dans le header (à gauche du titre) */
  icon?: React.ReactNode
  /** Si true, l'icône est rendue telle quelle (sans wrapper rond). Pour tuile sport en lecture seule. */
  iconRaw?: boolean
  /** Si true, le titre peut passer sur plusieurs lignes (petit écran). Désactive truncate. */
  titleWrap?: boolean
  /** Contenu additionnel à droite du header */
  headerRight?: React.ReactNode
  /** Masquer le bouton de fermeture (X) */
  hideCloseButton?: boolean
  /** Désactiver la fermeture au clic sur overlay */
  disableOverlayClose?: boolean
  /** Désactiver la fermeture avec Escape */
  disableEscapeClose?: boolean
  /** Footer personnalisé (boutons d'action) */
  footer?: React.ReactNode
  /** Bloc fixe entre le corps scrollable et le footer (ex. bandeau infos) */
  preFooter?: React.ReactNode
  /** Classes CSS additionnelles pour le contenu */
  className?: string
  /** Classes CSS pour le conteneur interne */
  contentClassName?: string
  /** ID pour aria-labelledby */
  titleId?: string
  children: React.ReactNode
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  full: 'max-w-[95vw]',
  /** Modales entraînement : 560px + 15 % ≈ 644px */
  workout: 'max-w-[40.25rem]',
}

const ALIGNMENT_CLASSES: Record<ModalAlignment, string> = {
  center: 'items-center justify-center',
  top: 'items-start justify-center pt-8',
  right: 'items-center justify-end',
}

export function Modal({
  isOpen,
  onClose,
  layer = 0,
  size = 'md',
  alignment = 'center',
  title,
  icon,
  iconRaw = false,
  titleWrap = false,
  headerRight,
  hideCloseButton = false,
  disableOverlayClose = false,
  disableEscapeClose = false,
  footer,
  preFooter,
  className = '',
  contentClassName = '',
  titleId = 'modal-title',
  children,
}: ModalProps) {
  const t = useTranslations('common')
  const zOverlay = Z_OVERLAY_BASE + layer * Z_LAYER_STEP
  const zContainer = Z_CONTAINER_BASE + layer * Z_LAYER_STEP
  
  // Gestion Escape + overflow body
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

  if (!isOpen) return null

  const handleOverlayClick = () => {
    if (!disableOverlayClose) {
      onClose()
    }
  }

  const sizeClass = SIZE_CLASSES[size]
  const alignmentClass = ALIGNMENT_CLASSES[alignment]

  const modalContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm"
        style={{ zIndex: zOverlay }}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Container */}
      <div
        className={`fixed inset-0 flex p-4 ${alignmentClass}`}
        style={{ zIndex: zContainer }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
      >
        {/* Contenu */}
        <div
          className={`relative w-full ${sizeClass} max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden ${className}`}
        >
          {/* Header (si titre ou headerRight fournis) */}
          {(title || headerRight || !hideCloseButton) && (
            <div className="shrink-0 px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between gap-3">
              <div className={`flex items-center gap-3 min-w-0 ${titleWrap ? 'flex-wrap' : ''}`}>
                {icon && (
                  iconRaw ? (
                    <span className="shrink-0">{icon}</span>
                  ) : (
                    <div className="p-2 bg-palette-forest-dark/10 rounded-full text-palette-forest-dark shrink-0">
                      {icon}
                    </div>
                  )
                )}
                {title && (
                  <h2
                    id={titleId}
                    className={`text-lg font-bold text-stone-900 ${titleWrap ? 'break-words min-w-0' : 'truncate'}`}
                  >
                    {title}
                  </h2>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {headerRight}
                {!hideCloseButton && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    aria-label={t('close')}
                  >
                    <IconClose className="w-5 h-5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Corps scrollable */}
          <div className={`flex-1 overflow-y-auto min-h-0 ${contentClassName}`}>
            {children}
          </div>

          {preFooter ? (
            <div className="shrink-0 border-t border-stone-200 bg-stone-50/95 px-4 py-2.5">{preFooter}</div>
          ) : null}

          {/* Footer (si fourni) */}
          {footer && (
            <div className="shrink-0 px-6 py-4 border-t border-stone-100 bg-stone-50/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  )

  // Render dans body avec portal
  if (typeof document === 'undefined') return null
  return createPortal(modalContent, document.body)
}

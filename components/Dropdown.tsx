'use client'

import { useState, useRef, useEffect } from 'react'
import { Check } from 'lucide-react'
import { FORM_BASE_CLASSES } from '@/lib/formStyles'

/**
 * Menu déroulant : label au-dessus, bouton trigger (style Input), panneau d’options.
 * États des options alignés sur la sidebar (ChatConversationSidebar) : sélectionné = vert plein, non sélectionné = stone + hover vert.
 */

export type DropdownOption = {
  value: string
  label: string
}

export type DropdownProps = {
  /** Id du trigger (accessibilité) */
  id: string
  /** Label affiché au-dessus du trigger (vide ou masqué si hideLabel) */
  label: string
  /** Options du menu (value + label affiché) */
  options: DropdownOption[]
  /** Valeur sélectionnée (doit correspondre à une option.value) */
  value: string
  /** Appelé au clic sur une option */
  onChange: (value: string) => void
  /** Label pour le listbox (accessibilité) */
  ariaLabel?: string
  /** Largeur minimale du trigger et du panneau (ex. "200px") */
  minWidth?: string
  /** Classes additionnelles sur le conteneur */
  className?: string
  /** Masquer le label (ex. pour intégration dans un en-tête de calendrier) */
  hideLabel?: boolean
  /** Classes additionnelles sur le label (ex. text-xs pour un bloc plus compact) */
  labelClassName?: string
  /** Texte affiché dans le trigger à la place du label de l'option (ex. code langue "FR") */
  valueDisplay?: string
  /** Contenu rendu avant le label dans le trigger (ex. icône globe) */
  triggerPrefix?: React.ReactNode
  /** Afficher une coche sur l'option sélectionnée dans le menu */
  showCheckmark?: boolean
  /** Classes additionnelles sur le bouton trigger (ex. text-sm font-medium text-stone-700 pour aligner sur un bouton secondaire) */
  triggerClassName?: string
  /** Classes additionnelles sur chaque option du panneau (ex. text-xs py-2 px-3 pour un panneau compact) */
  optionClassName?: string
}

const OPTION_SELECTED =
  'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
const OPTION_UNSELECTED =
  'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'

export function Dropdown({
  id,
  label,
  options,
  value,
  onChange,
  ariaLabel,
  minWidth = '200px',
  className = '',
  hideLabel = false,
  valueDisplay,
  triggerPrefix,
  showCheckmark = false,
  triggerClassName = '',
  labelClassName = '',
  optionClassName = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const selectedOption = options.find((o) => o.value === value)
  const displayLabel = valueDisplay ?? selectedOption?.label ?? value

  return (
    <div className={`relative inline-block ${className}`.trim()} ref={ref}>
      {!hideLabel && (
        <label
          className={`block text-sm font-medium text-stone-700 mb-2 ${labelClassName}`.trim()}
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <button
        id={id}
        type="button"
        className={`flex items-center justify-between gap-2 w-full cursor-pointer ${FORM_BASE_CLASSES} ${triggerClassName}`.trim()}
        style={{ minWidth }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ?? label}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="flex items-center gap-2 min-w-0">
          {triggerPrefix}
          <span className="truncate">{displayLabel}</span>
        </span>
        <svg
          className={`w-4 h-4 text-stone-500 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div
          className="absolute right-0 left-0 z-10 mt-1 py-1 px-1 rounded-lg border border-stone-300 bg-white shadow-lg min-w-[200px] max-h-64 overflow-y-auto"
          style={{ minWidth }}
          role="listbox"
          aria-label={ariaLabel ?? label}
        >
          {options.map((option) => {
            const isSelected = value === option.value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={`w-full flex items-center justify-between gap-2 text-left rounded-lg cursor-pointer transition-all duration-300 ${
                  optionClassName || 'px-4 py-2.5'
                } ${isSelected ? OPTION_SELECTED : OPTION_UNSELECTED}`}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
              >
                {option.label}
                {showCheckmark && isSelected && (
                  <Check className="w-4 h-4 shrink-0" aria-hidden />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

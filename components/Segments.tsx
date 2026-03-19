'use client'

/**
 * Groupe de choix par segments (style offres coach : / Mois | Unique | Gratuit).
 * Réutilisable pour tout choix exclusif 2 à N options (type dispo/indispo, récurrence, etc.).
 */
import type { ReactNode } from 'react'

export type SegmentOption = {
  value: string
  label: ReactNode
}

export type SegmentsProps = {
  /** Options affichées (value + label). */
  options: SegmentOption[]
  /** Valeur sélectionnée (doit correspondre à une option.value). */
  value: string
  /** Appelé au changement de sélection. */
  onChange: (value: string) => void
  /** name pour les inputs radio (formulaires). */
  name: string
  /** Label pour le groupe (accessibilité). */
  ariaLabel?: string
  /** Taille : md = py-2 text-sm (défaut, offres), sm = py-1.5 text-xs (bloc récurrence). */
  size?: 'sm' | 'md'
  /** Classes additionnelles sur le conteneur. */
  className?: string
}

const SELECTED_CLASS =
  'bg-palette-forest-dark text-white border border-palette-forest-dark shadow-[0_2px_4px_-1px_rgba(98,126,89,0.25)]'
const UNSELECTED_CLASS = 'bg-white text-stone-600 border border-stone-200 hover:border-palette-forest-dark'

export function Segments({
  options,
  value,
  onChange,
  name,
  ariaLabel,
  size = 'md',
  className = '',
}: SegmentsProps) {
  const isSm = size === 'sm'
  const containerClass = `flex bg-stone-100 rounded-lg border border-stone-200 items-center ${isSm ? 'gap-2 p-1.5' : 'gap-1 p-1 min-h-[42px]'} ${className}`.trim()
  const optionInnerClass = isSm
    ? 'w-full px-4 py-2 rounded-md text-xs font-medium select-none transition-all text-center flex items-center justify-center min-h-[36px] whitespace-normal sm:whitespace-nowrap leading-tight'
    : 'w-full py-2 rounded-md text-sm font-medium select-none transition-all text-center flex items-center justify-center min-h-[42px] whitespace-normal sm:whitespace-nowrap leading-tight'

  return (
    <div className={containerClass} role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <label key={opt.value} className="flex-1 cursor-pointer flex items-center justify-center">
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="sr-only"
            />
            <div
              className={`${optionInnerClass} ${selected ? SELECTED_CLASS : UNSELECTED_CLASS}`}
            >
              {opt.label}
            </div>
          </label>
        )
      })}
    </div>
  )
}

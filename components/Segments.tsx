'use client'

/**
 * Groupe de choix par segments (offres coach, dispo, récurrence, onglets calendrier coach, etc.).
 * Conteneur blanc + bordure ; survol inactif aligné sur la nav dashboard (`hover:bg-stone-50` + `hover:text-palette-forest-dark`).
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
  /**
   * sm = text-xs (récurrence, petits blocs)
   * md = text-sm, min-h 42px (défaut, offres, stats)
   * lg = text-base font-bold (onglets sous calendrier coach : icône + libellé)
   */
  size?: 'sm' | 'md' | 'lg'
  /** Classes additionnelles sur le conteneur. */
  className?: string
}

const SELECTED_CLASS =
  'bg-palette-forest-dark text-white border border-palette-forest-dark shadow-[0_2px_4px_-1px_rgba(98,126,89,0.25)]'
const UNSELECTED_CLASS =
  'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-palette-forest-dark'

const FOCUS_RING_INNER = 'peer-focus-visible:ring-2 peer-focus-visible:ring-palette-forest-dark peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white'

export function Segments({
  options,
  value,
  onChange,
  name,
  ariaLabel,
  size = 'md',
  className = '',
}: SegmentsProps) {
  const containerClass =
    `flex min-w-0 rounded-lg border border-white bg-white items-center ${size === 'sm' ? 'gap-2 p-1.5' : 'gap-1 p-0.5'} ${size === 'md' ? 'min-h-[42px]' : ''} ${className}`.trim()

  const optionInnerClass =
    size === 'sm'
      ? `w-full px-4 py-2 rounded-md text-xs font-medium select-none transition-colors text-center flex items-center justify-center min-h-[36px] whitespace-normal sm:whitespace-nowrap leading-tight ${FOCUS_RING_INNER}`
      : size === 'lg'
        ? `w-full min-w-0 flex-1 px-3 py-2.5 rounded-md text-base font-bold select-none transition-colors flex items-center justify-center gap-2 whitespace-normal sm:whitespace-nowrap ${FOCUS_RING_INNER}`
        : `w-full py-2 rounded-md text-sm font-medium select-none transition-colors text-center flex items-center justify-center min-h-[42px] whitespace-normal sm:whitespace-nowrap leading-tight ${FOCUS_RING_INNER}`

  return (
    <div className={containerClass} role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <label
            key={opt.value === '' ? '__empty' : opt.value}
            className="relative flex min-w-0 flex-1 cursor-pointer items-center justify-center"
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={selected}
              onChange={() => onChange(opt.value)}
              className="peer sr-only"
            />
            <div className={`${optionInnerClass} ${selected ? SELECTED_CLASS : UNSELECTED_CLASS}`}>{opt.label}</div>
          </label>
        )
      })}
    </div>
  )
}

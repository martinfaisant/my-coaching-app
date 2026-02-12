'use client'

/**
 * Tuile sport cliquable et sélectionnable (profil coach, filtres, demande).
 * États : non sélectionné (hover bordure forest), sélectionné (fond forest, texte blanc).
 */
import type { SportType } from '@/lib/sportStyles'
import { SPORT_ICONS, SPORT_LABELS } from '@/lib/sportStyles'

const BASE_CLASSES =
  'px-4 py-2 rounded-full border text-sm font-medium select-none flex items-center gap-2 transition-all'
const UNSELECTED_CLASSES =
  'border-stone-200 bg-white text-stone-600 hover:border-palette-forest-dark'
const SELECTED_CLASSES =
  'border-palette-forest-dark bg-palette-forest-dark text-white shadow-[0_4px_6px_-1px_rgba(98,126,89,0.3)]'

type SportTileSelectableProps =
  | {
      /** Valeur du sport (ex. course_route, trail, velo) */
      value: string
      /** Mode formulaire : nom du champ et checked par défaut */
      name: string
      defaultChecked?: boolean
      disabled?: boolean
    }
  | {
      value: string
      selected: boolean
      onChange: () => void
      disabled?: boolean
    }

function isSportType(value: string): value is SportType {
  return value in SPORT_LABELS
}

export function SportTileSelectable(props: SportTileSelectableProps) {
  const { value, disabled = false } = props
  const sportKey = isSportType(value) ? value : ('course' as SportType)
  const Icon = SPORT_ICONS[sportKey]
  const label = SPORT_LABELS[sportKey] ?? value

  if ('name' in props) {
    const { name, defaultChecked } = props
    return (
      <label className="cursor-pointer">
        <input
          type="checkbox"
          name={name}
          value={value}
          defaultChecked={defaultChecked}
          disabled={disabled}
          className="hidden chip-checkbox"
        />
        <div
          className={`${BASE_CLASSES} ${UNSELECTED_CLASSES} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
          <span>{label}</span>
        </div>
      </label>
    )
  }

  const { selected, onChange } = props
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`${BASE_CLASSES} ${
        selected ? SELECTED_CLASSES : UNSELECTED_CLASSES
      } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />
      <span>{label}</span>
    </button>
  )
}

'use client'

/**
 * Tuile sport cliquable et sélectionnable (profil coach, filtres, demande).
 * États : non sélectionné (hover bordure forest), sélectionné (fond forest, texte blanc).
 */
import type { SportType } from '@/lib/sportStyles'
import { SPORT_ICONS } from '@/lib/sportStyles'
import { useSportLabel } from '@/lib/hooks/useSportLabel'

const BASE_CLASSES =
  'px-4 py-2 rounded-full border text-sm font-medium select-none flex items-center gap-2 transition-all'
const UNSELECTED_CLASSES =
  'border-stone-200 bg-white text-stone-600 hover:border-palette-forest-dark'
const SELECTED_CLASSES =
  'border-palette-forest-dark bg-palette-forest-dark text-white shadow-palette-forest'

type SportTileSelectableProps =
  | {
      /** Valeur du sport (ex. course_route, trail, velo) */
      value: string
      /** Mode formulaire : nom du champ et checked par défaut */
      name: string
      defaultChecked?: boolean
      /** En mode contrôlé : état coché et callback au changement (pour mise à jour dynamique des tuiles volume). */
      checked?: boolean
      onChange?: (checked: boolean) => void
      disabled?: boolean
    }
  | {
      value: string
      selected: boolean
      onChange: () => void
      disabled?: boolean
    }

function isSportType(value: string): value is SportType {
  return value in SPORT_ICONS
}

export function SportTileSelectable(props: SportTileSelectableProps) {
  const { value, disabled = false } = props
  const getSportLabel = useSportLabel()
  const sportKey = isSportType(value) ? value : ('course' as SportType)
  const Icon = SPORT_ICONS[sportKey]
  const label = getSportLabel(sportKey)

  if ('name' in props) {
    const { name, defaultChecked, checked, onChange } = props
    const isControlled = checked !== undefined && onChange !== undefined
    const selected = isControlled ? checked : defaultChecked
    return (
      <label className="cursor-pointer">
        <input
          type="checkbox"
          name={name}
          value={value}
          {...(isControlled
            ? { checked, onChange: (e) => onChange(e.target.checked) }
            : { defaultChecked })}
          disabled={disabled}
          className="hidden chip-checkbox"
        />
        <div
          className={`${BASE_CLASSES} ${selected ? SELECTED_CLASSES : UNSELECTED_CLASSES} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
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

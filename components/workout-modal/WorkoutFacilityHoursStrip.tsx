'use client'

import { useTranslations } from 'next-intl'
import { IconBuilding } from '@/components/icons/IconBuilding'
import type { WorkoutFacilityDisplayLine } from '@/lib/workoutFacilityHours'

type Props = {
  lines: WorkoutFacilityDisplayLine[]
  ariaLabel: string
  /** compact = en-tête modale ; default = espacement lecture */
  variant?: 'compact' | 'default'
}

/**
 * Une ligne par installation : icône bâtiment (commune) · nom · horaires (ou Fermé).
 * En-tête coach modale workout (sous la date) ou usage autonome.
 */
export function WorkoutFacilityHoursStrip({ lines, ariaLabel, variant = 'default' }: Props) {
  const tHours = useTranslations('facilities.hours')
  const compact = variant === 'compact'

  if (lines.length === 0) return null

  return (
    <div
      className={compact ? 'space-y-1 w-full min-w-0' : 'space-y-1.5'}
      role="region"
      aria-label={ariaLabel}
    >
      {lines.map((line, idx) => (
        <div
          key={`${line.facilityName}-${line.facilityType}-${idx}`}
          className={`flex items-start gap-2 min-w-0 ${compact ? 'text-xs leading-snug' : 'text-sm leading-5'} text-stone-600`}
        >
          <IconBuilding
            className={`shrink-0 text-stone-500 ${compact ? 'h-3.5 w-3.5 mt-0.5' : 'h-4 w-4 mt-0.5'}`}
          />
          <p className="min-w-0">
            <span className="font-semibold text-stone-900">{line.facilityName}</span>
            <span className="text-stone-400" aria-hidden>
              {' '}
              ·{' '}
            </span>
            {line.kind === 'closed' ? (
              <span>{tHours('closed')}</span>
            ) : (
              <span className="break-words">{line.slotsLabel}</span>
            )}
          </p>
        </div>
      ))}
    </div>
  )
}

'use client'

import { useMemo } from 'react'
import { Button } from './Button'

type WeekSelectorProps = {
  dateRangeLabel: string
  onNavigate: (offset: number) => void
  isAnimating: boolean
  /** Dernier jour de la 1ère semaine (ex. "9 févr.") affiché à droite du chevron gauche */
  prevWeekLastDayLabel?: string
  /** Dernier jour de la 3e semaine (ex. "29 févr.") affiché à droite du chevron droit */
  nextWeekFirstDayLabel?: string
  /** Aria-label for previous week button (passed from parent to avoid useTranslations in this component). */
  prevWeekAriaLabel?: string
  /** Aria-label for next week button (passed from parent to avoid useTranslations in this component). */
  nextWeekAriaLabel?: string
}

export function WeekSelector({
  dateRangeLabel,
  onNavigate,
  isAnimating,
  prevWeekLastDayLabel,
  nextWeekFirstDayLabel,
  prevWeekAriaLabel = 'Semaine précédente',
  nextWeekAriaLabel = 'Semaine suivante',
}: WeekSelectorProps) {
  const { startLabel, endLabel, hasTwoParts } = useMemo(() => {
    // Robustesse : certains libellés peuvent contenir des espaces non standards (ex. NBSP),
    // et on veut toujours pouvoir séparer "start … end" (au/to/–/-).
    const normalized = dateRangeLabel.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim()
    const match = normalized.match(/^(.+?)\s*(?:au|to|–|—|-)\s*(.+)$/i)
    if (match) {
      const start = match[1] ?? normalized
      const end = match[2] ?? ''
      return { startLabel: start, endLabel: end, hasTwoParts: end.length > 0 }
    }
    return { startLabel: normalized, endLabel: '', hasTwoParts: false }
  }, [dateRangeLabel])

  return (
    <div className="flex items-center gap-2 lg:gap-3 bg-stone-50 p-1.5 rounded-xl border border-stone-200 shadow-sm min-w-0 w-fit">
      <Button
        type="button"
        variant="ghost"
        onClick={() => onNavigate(-1)}
        disabled={isAnimating}
        className="p-1.5 min-h-10 w-10 min-[400px]:w-[80px] min-[400px]:justify-center hover:bg-white text-stone-500 hover:text-palette-forest-dark shadow-sm flex items-center gap-1.5 shrink-0"
        aria-label={prevWeekAriaLabel}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-7-7 7-7" />
        </svg>
        {/* Masqué en dessous de 400px pour que le sélecteur tienne sur les écrans étroits. */}
        {prevWeekLastDayLabel != null && prevWeekLastDayLabel !== '' && (
          <span className="text-xs text-stone-600 truncate max-w-[52px] hidden min-[400px]:inline">{prevWeekLastDayLabel}</span>
        )}
      </Button>
      {/* Largeur fixe pour que la longueur du sélecteur ne varie pas au changement de semaine. */}
      <div className="w-[80px] lg:w-[150px] px-1 lg:px-2 py-0.5 flex flex-col lg:flex-row items-center justify-center text-center select-none shrink-0">
        {/* Deux lignes en dessous de lg quand le label contient " – ". */}
        {hasTwoParts && (
          <>
            <span className="lg:hidden block text-xs font-bold text-stone-800 leading-tight truncate max-w-full">{startLabel}</span>
            <span className="lg:hidden block text-xs font-bold text-stone-800 leading-tight truncate max-w-full">{endLabel}</span>
          </>
        )}
        {/* Une ligne : à partir de lg (1024px), ou en dessous si format sans séparateur. */}
        <span className={hasTwoParts ? 'hidden lg:block text-sm font-bold text-stone-800 truncate max-w-full' : 'text-sm font-bold text-stone-800 truncate max-w-full'}>{dateRangeLabel}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onNavigate(1)}
        disabled={isAnimating}
        className="p-1.5 min-h-10 w-10 min-[400px]:w-[80px] min-[400px]:justify-center hover:bg-white text-stone-500 hover:text-palette-forest-dark shadow-sm flex items-center gap-1.5 shrink-0"
        aria-label={nextWeekAriaLabel}
      >
        {/* Masqué en dessous de 400px pour que le sélecteur tienne sur les écrans étroits. */}
        {nextWeekFirstDayLabel != null && nextWeekFirstDayLabel !== '' && (
          <span className="text-xs text-stone-600 truncate max-w-[52px] hidden min-[400px]:inline">{nextWeekFirstDayLabel}</span>
        )}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Button>
    </div>
  )
}

'use client'

import { Button } from './Button'

type WeekSelectorProps = {
  dateRangeLabel: string
  onNavigate: (offset: number) => void
  isAnimating: boolean
}

export function WeekSelector({ dateRangeLabel, onNavigate, isAnimating }: WeekSelectorProps) {
  return (
    <div className="flex items-center gap-3 bg-stone-50 p-1.5 rounded-xl border border-stone-200 shadow-sm">
      <Button
        type="button"
        variant="ghost"
        onClick={() => onNavigate(-1)}
        disabled={isAnimating}
        className="p-1.5 min-w-10 min-h-10 hover:bg-white text-stone-500 hover:text-palette-forest-dark shadow-sm"
        aria-label="Semaine précédente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-7-7 7-7" />
        </svg>
      </Button>
      <div className="px-2 text-sm font-bold text-stone-800 select-none w-[200px] text-center shrink-0">
        {dateRangeLabel}
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={() => onNavigate(1)}
        disabled={isAnimating}
        className="p-1.5 min-w-10 min-h-10 hover:bg-white text-stone-500 hover:text-palette-forest-dark shadow-sm"
        aria-label="Semaine suivante"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Button>
    </div>
  )
}

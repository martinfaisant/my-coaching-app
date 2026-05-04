'use client'

import { useMemo } from 'react'
import { useLocale } from 'next-intl'
import { Button } from './Button'

type MonthSelectorProps = {
  year: number
  monthIndex: number
  onPrevMonth: () => void
  onNextMonth: () => void
  isAnimating: boolean
  prevMonthAriaLabel: string
  nextMonthAriaLabel: string
}

export function MonthSelector({
  year,
  monthIndex,
  onPrevMonth,
  onNextMonth,
  isAnimating,
  prevMonthAriaLabel,
  nextMonthAriaLabel,
}: MonthSelectorProps) {
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'

  const monthYearLabel = useMemo(() => {
    const d = new Date(year, monthIndex, 1)
    const formatted = new Intl.DateTimeFormat(localeTag, { month: 'long', year: 'numeric' }).format(d)
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }, [year, monthIndex, localeTag])

  return (
    <div className="flex items-center gap-2 lg:gap-3 bg-stone-50 p-1.5 rounded-xl border border-stone-200 shadow-sm min-w-0 w-fit">
      <Button
        type="button"
        variant="ghost"
        onClick={onPrevMonth}
        disabled={isAnimating}
        className="p-1.5 min-h-10 min-w-10 flex items-center justify-center hover:bg-white text-stone-500 hover:text-palette-forest-dark shadow-sm shrink-0"
        aria-label={prevMonthAriaLabel}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-7-7 7-7" />
        </svg>
      </Button>
      <div className="w-[120px] lg:w-[160px] px-1 lg:px-2 py-0.5 flex items-center justify-center text-center select-none shrink-0">
        <span className="text-sm font-bold text-stone-800 truncate max-w-full">{monthYearLabel}</span>
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onNextMonth}
        disabled={isAnimating}
        className="p-1.5 min-h-10 min-w-10 flex items-center justify-center hover:bg-white text-stone-500 hover:text-palette-forest-dark shadow-sm shrink-0"
        aria-label={nextMonthAriaLabel}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </Button>
    </div>
  )
}

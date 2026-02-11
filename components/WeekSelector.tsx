'use client'

type WeekSelectorProps = {
  dateRangeLabel: string
  onNavigate: (offset: number) => void
  isAnimating: boolean
  onToday?: () => void
}

export function WeekSelector({ dateRangeLabel, onNavigate, isAnimating, onToday }: WeekSelectorProps) {
  return (
    <div className="flex items-center gap-3 bg-stone-50 p-1.5 rounded-xl border border-stone-200 shadow-sm">
      <button
        type="button"
        onClick={() => onNavigate(-1)}
        disabled={isAnimating}
        className="p-1.5 hover:bg-white rounded-lg text-stone-500 hover:text-[#627e59] transition-colors shadow-sm disabled:opacity-60 disabled:pointer-events-none"
        aria-label="Semaine précédente"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-7-7 7-7" />
        </svg>
      </button>
      <div className="px-2 text-sm font-bold text-stone-800 select-none w-[200px] text-center shrink-0">
        {dateRangeLabel}
      </div>
      <button
        type="button"
        onClick={() => onNavigate(1)}
        disabled={isAnimating}
        className="p-1.5 hover:bg-white rounded-lg text-stone-500 hover:text-[#627e59] transition-colors shadow-sm disabled:opacity-60 disabled:pointer-events-none"
        aria-label="Semaine suivante"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
      {onToday && (
        <>
          <div className="w-px h-4 bg-stone-300 mx-1"></div>
          <button
            type="button"
            onClick={onToday}
            className="text-xs font-bold uppercase text-[#627e59] hover:bg-[#627e59]/10 px-2 py-1 rounded transition-colors"
          >
            Auj.
          </button>
        </>
      )}
    </div>
  )
}

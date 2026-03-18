export default function CalendarLoading() {
  return (
    <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
      {/* Header sticky (même chrome que AthleteCalendarPage) */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:h-20 px-4 md:px-6 lg:px-8 py-4 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-stone-200" />
          <div className="h-6 w-28 bg-stone-200 rounded" />
        </div>
        <div className="flex justify-center w-full md:w-auto md:flex-none">
          <div className="h-10 w-56 bg-stone-200 rounded-xl" />
        </div>
      </header>

      {/* Zone scrollable (alignée avec CalendarViewWithNavigation) */}
      <div className="flex-1 overflow-auto min-w-0 px-6 lg:px-8 py-6 animate-pulse">
        <div className="min-w-0 overflow-x-auto overflow-y-hidden">
          <div className="space-y-8 min-w-[800px]">
            {/* Semaine 1 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-32 bg-stone-200 rounded" />
                <div className="h-3 w-24 bg-stone-200 rounded" />
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="min-h-[120px] rounded-lg bg-stone-100 border border-stone-200" />
                ))}
              </div>
            </div>

            {/* Semaine 2 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-40 bg-stone-200 rounded" />
                <div className="h-3 w-28 bg-stone-200 rounded" />
              </div>
              <div className="grid grid-cols-7 gap-3">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="min-h-[160px] rounded-xl bg-stone-100 border border-stone-200" />
                ))}
              </div>
            </div>

            {/* Semaine 3 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-4 w-28 bg-stone-200 rounded" />
                <div className="h-3 w-24 bg-stone-200 rounded" />
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="min-h-[120px] rounded-lg bg-stone-100 border border-stone-200" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

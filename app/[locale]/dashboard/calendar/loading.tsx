export default function CalendarLoading() {
  return (
    <div className="px-6 lg:px-8 pt-6 pb-24 animate-pulse">
      <div className="space-y-8">
          {/* Semaine 1 */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-32 bg-stone-200 rounded" />
              <div className="h-3 w-24 bg-stone-200 rounded" />
            </div>
            <div className="grid grid-cols-7 gap-2 min-w-[800px]">
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
            <div className="grid grid-cols-7 gap-3 min-w-[800px]">
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
            <div className="grid grid-cols-7 gap-2 min-w-[800px]">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="min-h-[120px] rounded-lg bg-stone-100 border border-stone-200" />
              ))}
            </div>
          </div>
        </div>
    </div>
  )
}

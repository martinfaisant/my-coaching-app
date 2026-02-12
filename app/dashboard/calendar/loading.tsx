export default function CalendarLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 animate-pulse">
      <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
        <div className="h-6 w-36 bg-stone-200 rounded" />
        <div className="flex items-center gap-3 bg-stone-100 p-1 rounded-lg">
          <div className="h-8 w-8 bg-stone-200 rounded-md" />
          <div className="h-4 w-28 bg-stone-200 rounded" />
          <div className="h-8 w-8 bg-stone-200 rounded-md" />
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
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
    </main>
  )
}

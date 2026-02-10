export default function CalendarLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      {/* Header skeleton */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
        <div>
          <div className="h-7 w-40 bg-stone-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex items-center gap-3 bg-stone-50 p-1.5 rounded-xl border border-stone-200 shadow-sm">
          <div className="w-7 h-7 bg-stone-200 rounded-lg animate-pulse" />
          <div className="h-5 w-32 bg-stone-200 rounded animate-pulse" />
          <div className="w-7 h-7 bg-stone-200 rounded-lg animate-pulse" />
        </div>
      </header>

      {/* Calendar skeleton */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {/* Week 1 - Condensed */}
          <div className="space-y-2">
            <div className="h-5 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="min-h-24 rounded-lg border border-stone-200 bg-white p-2">
                  <div className="h-4 w-12 bg-stone-200 rounded mb-2 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-12 bg-stone-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Week 2 - Detailed */}
          <div className="space-y-2">
            <div className="h-5 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="min-h-32 rounded-lg border border-stone-200 bg-white p-3">
                  <div className="h-5 w-16 bg-stone-200 rounded mb-3 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-16 bg-stone-100 rounded animate-pulse" />
                    <div className="h-16 bg-stone-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
            {/* Weekly totals skeleton */}
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-5">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-20 bg-stone-200 rounded animate-pulse" />
                    <div className="h-6 w-16 bg-stone-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Week 3 - Condensed */}
          <div className="space-y-2">
            <div className="h-5 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="min-h-24 rounded-lg border border-stone-200 bg-white p-2">
                  <div className="h-4 w-12 bg-stone-200 rounded mb-2 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-12 bg-stone-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

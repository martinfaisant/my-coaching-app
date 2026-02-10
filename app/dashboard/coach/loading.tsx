export default function MonCoachLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 animate-pulse">
      <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
        <div className="h-7 w-28 bg-stone-200 rounded" />
      </header>

      {/* ZONE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
        {/* Carte coach */}
        <div className="rounded-2xl border border-stone-200 bg-section p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-12 bg-stone-200 rounded" />
              <div className="h-5 w-40 bg-stone-200 rounded" />
            </div>
            <div className="w-16 h-16 rounded-xl bg-stone-200 shrink-0" />
          </div>
          <div>
            <div className="h-3 w-28 bg-stone-200 rounded mb-1" />
            <div className="h-4 w-48 bg-stone-200 rounded" />
          </div>
          <div>
            <div className="h-3 w-24 bg-stone-200 rounded mb-1" />
            <div className="h-4 w-full bg-stone-200 rounded" />
          </div>
          <div>
            <div className="h-3 w-20 bg-stone-200 rounded mb-1" />
            <div className="h-16 w-full bg-stone-200 rounded" />
          </div>
          <div className="pt-4 border-t border-stone-200">
            <div className="h-3 w-32 bg-stone-200 rounded mb-3" />
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-stone-200 rounded" />
              <div className="h-8 w-8 bg-stone-200 rounded" />
              <div className="h-8 w-8 bg-stone-200 rounded" />
              <div className="h-8 w-8 bg-stone-200 rounded" />
              <div className="h-8 w-8 bg-stone-200 rounded" />
            </div>
            <div className="mt-3 h-10 w-28 bg-stone-200 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  )
}

export default function DevicesLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 animate-pulse">
      <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
        <div className="h-7 w-56 bg-stone-200 rounded" />
      </header>

      {/* ZONE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
        {/* Bloc Strava */}
        <div className="rounded-xl border border-stone-200 bg-section overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-stone-200" />
              <div className="space-y-1">
                <div className="h-5 w-24 bg-stone-200 rounded" />
                <div className="h-3 w-40 bg-stone-200 rounded" />
              </div>
            </div>
            <div className="h-10 w-36 bg-stone-200 rounded-lg" />
          </div>
          <div className="h-px bg-stone-200" />
          <div className="space-y-2">
            <div className="h-3 w-48 bg-stone-200 rounded" />
            <div className="h-3 w-full bg-stone-200 rounded" />
          </div>
        </div>
      </div>
    </main>
  )
}

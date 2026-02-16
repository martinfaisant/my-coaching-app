export default function ObjectifsLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 animate-pulse">
      <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
        <div className="h-7 w-32 bg-stone-200 rounded" />
      </header>

      {/* ZONE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
        {/* Tableau objectifs */}
        <div className="rounded-xl border border-stone-200 bg-section overflow-hidden">
          <div className="border-b border-stone-200 px-4 py-3 flex gap-4">
            <div className="h-3 w-16 bg-stone-200 rounded" />
            <div className="h-3 w-24 bg-stone-200 rounded" />
            <div className="h-3 w-20 bg-stone-200 rounded" />
          </div>
          <div className="divide-y divide-stone-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-4 py-4 flex gap-4 items-center">
                <div className="h-4 w-20 bg-stone-200 rounded" />
                <div className="h-4 w-28 bg-stone-200 rounded flex-1" />
                <div className="h-4 w-16 bg-stone-200 rounded" />
                <div className="h-6 w-20 bg-stone-200 rounded-full" />
              </div>
            ))}
          </div>
          <div className="px-4 py-4 border-t border-stone-100">
            <div className="h-10 w-full bg-stone-200 rounded-lg" />
          </div>
        </div>
      </div>
    </main>
  )
}

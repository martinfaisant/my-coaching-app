export default function OffersLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 animate-pulse">
      <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white/80 backdrop-blur-md border-b border-stone-100 z-10">
        <div className="h-7 w-28 bg-stone-200 rounded" />
      </header>
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">

        {/* Formulaire offres (3 blocs) */}
        <div className="mt-8 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-stone-200 bg-section p-6 space-y-4">
              <div className="h-4 w-32 bg-stone-200 rounded" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-stone-200 rounded" />
                  <div className="h-10 w-full bg-stone-200 rounded-xl" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-stone-200 rounded" />
                  <div className="h-10 w-full bg-stone-200 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="h-3 w-24 bg-stone-200 rounded" />
                <div className="h-20 w-full bg-stone-200 rounded-xl" />
              </div>
            </div>
          ))}
          <div className="h-11 w-28 bg-stone-200 rounded-lg" />
        </div>
      </div>
    </main>
  )
}

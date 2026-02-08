export default function OffersLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="h-4 w-32 bg-stone-200 rounded" />
          <div className="h-9 w-24 bg-stone-200 rounded-lg" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-7 w-24 bg-stone-200 rounded" />
        <div className="mt-1 h-4 w-72 bg-stone-200 rounded" />

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
      </main>
    </div>
  )
}

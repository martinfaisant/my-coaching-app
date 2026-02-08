export default function ObjectifsLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="h-4 w-32 bg-stone-200 rounded" />
          <div className="h-9 w-24 bg-stone-200 rounded-lg" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-7 w-36 bg-stone-200 rounded" />
        <div className="mt-1 h-4 w-80 bg-stone-200 rounded" />

        {/* Tableau objectifs */}
        <div className="mt-8 rounded-xl border border-stone-200 bg-section overflow-hidden">
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
      </main>
    </div>
  )
}

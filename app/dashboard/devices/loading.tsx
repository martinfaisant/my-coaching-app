export default function DevicesLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="h-4 w-32 bg-stone-200 rounded" />
          <div className="h-9 w-24 bg-stone-200 rounded-lg" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-7 w-56 bg-stone-200 rounded" />
        <div className="mt-1 h-4 w-full max-w-md bg-stone-200 rounded mb-8" />

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
      </main>
    </div>
  )
}

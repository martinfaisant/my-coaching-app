export default function CoachSubscriptionsLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 animate-pulse">
      {/* Skeleton PageHeader (aligné DashboardPageShell) */}
      <header className="flex items-center justify-between gap-4 px-6 lg:px-8 py-4 border-b border-stone-200/50 bg-white/80 shrink-0">
        <div className="h-7 w-48 bg-stone-200 rounded" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 space-y-10">
        {/* Section Actives */}
        <section>
          <div className="h-6 w-32 bg-stone-200 rounded mb-4" />
          <ul className="space-y-4">
            {[1, 2, 3].map((i) => (
              <li
                key={i}
                className="rounded-lg border border-l-4 border-stone-200 border-l-palette-forest-dark bg-white shadow-sm p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-5 w-36 bg-stone-200 rounded" />
                  <div className="h-4 w-56 bg-stone-100 rounded" />
                  <div className="h-3 w-64 bg-stone-100 rounded" />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="h-5 w-20 bg-stone-200 rounded" />
                  <div className="h-9 w-24 bg-stone-200 rounded-lg" />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Section Résiliation en cours */}
        <section>
          <div className="h-6 w-44 bg-stone-200 rounded mb-4" />
          <ul className="space-y-4">
            {[1, 2].map((i) => (
              <li
                key={i}
                className="rounded-lg border border-l-4 border-stone-200 border-l-palette-amber bg-white shadow-sm p-4 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-5 w-32 bg-stone-200 rounded" />
                  <div className="h-4 w-48 bg-stone-100 rounded" />
                  <div className="h-3 w-56 bg-stone-100 rounded" />
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="h-5 w-20 bg-stone-200 rounded" />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Section Historique */}
        <section>
          <div className="h-6 w-24 bg-stone-200 rounded mb-2" />
          <div className="h-4 w-full max-w-md bg-stone-100 rounded mb-4" />
          <ul className="space-y-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="rounded-lg border border-stone-200 bg-white p-4 border-l-4 border-l-stone-300">
                <div className="h-4 w-40 bg-stone-200 rounded mb-2" />
                <div className="h-4 w-52 bg-stone-200 rounded mb-1" />
                <div className="h-3 w-32 bg-stone-100 rounded mt-2" />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  )
}

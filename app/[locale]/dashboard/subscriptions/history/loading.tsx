export default function SubscriptionHistoryLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 animate-pulse">
      {/* Skeleton PageHeader (aligné DashboardPageShell) */}
      <header className="flex items-center justify-between gap-4 px-6 lg:px-8 py-4 border-b border-stone-200/50 bg-white/80 shrink-0">
        <div className="h-7 w-56 bg-stone-200 rounded" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
        {/* Liste TileCard : coach + titre offre + description + période (style subscriptionHistory) */}
        <ul className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <li key={i} className="rounded-lg border border-stone-200 bg-white p-4 border-l-4 border-l-stone-300">
              <div className="h-4 w-36 bg-stone-200 rounded mb-2" />
              <div className="h-4 w-48 bg-stone-200 rounded mb-1" />
              <div className="h-3 w-full max-w-md bg-stone-100 rounded mt-1" />
              <div className="h-3 w-32 bg-stone-100 rounded mt-2" />
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}

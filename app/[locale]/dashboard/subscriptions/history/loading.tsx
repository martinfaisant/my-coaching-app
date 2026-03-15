export default function SubscriptionHistoryLoading() {
  return (
    <div className="px-6 lg:px-8 pt-6 pb-24 animate-pulse">
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
  )
}

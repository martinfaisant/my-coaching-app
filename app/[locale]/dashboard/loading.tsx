export default function DashboardLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 animate-pulse">
      {/* Skeleton PageHeader */}
      <div className="shrink-0 px-6 lg:px-8 h-20 flex items-center justify-between border-b border-stone-100 bg-stone-50/50">
        <div className="h-7 w-56 bg-stone-200 rounded" />
        <div className="h-10 w-32 bg-stone-200 rounded-lg" />
      </div>
      
      {/* Skeleton content */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 space-y-6">
        {/* Hero card */}
        <div className="bg-gradient-to-r from-palette-forest-dark to-palette-olive rounded-2xl p-8">
          <div className="h-8 w-64 bg-white/20 rounded mb-3" />
          <div className="h-5 w-96 bg-white/15 rounded" />
        </div>
        
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="h-4 w-24 bg-stone-200 rounded mb-4" />
              <div className="h-8 w-16 bg-stone-200 rounded mb-2" />
              <div className="h-3 w-32 bg-stone-100 rounded" />
            </div>
          ))}
        </div>
        
        {/* Content blocks */}
        <div className="space-y-4">
          <div className="h-64 bg-white rounded-xl border border-stone-200" />
          <div className="h-48 bg-white rounded-xl border border-stone-200" />
        </div>
      </div>
    </main>
  )
}

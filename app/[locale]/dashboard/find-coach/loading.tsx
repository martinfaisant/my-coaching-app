export default function FindCoachLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 animate-pulse">
      <header className="flex items-center justify-between gap-4 px-6 lg:px-8 py-4 border-b border-stone-200/50 bg-white/80 shrink-0">
        <div className="h-7 w-56 bg-stone-200 rounded" />
      </header>

      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-20 bg-stone-200 rounded" />
            <div className="h-9 w-24 bg-stone-200 rounded-lg" />
          </div>
          <div className="mb-4">
            <div className="h-3 w-28 bg-stone-100 rounded mb-2" />
            <div className="h-10 w-full bg-stone-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="h-3 w-24 bg-stone-100 rounded mb-2" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="h-9 w-20 bg-stone-200 rounded-full" />
                ))}
              </div>
            </div>
            <div>
              <div className="h-3 w-28 bg-stone-100 rounded mb-2" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="h-9 w-16 bg-stone-200 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-6 w-24 bg-stone-200 rounded" />
          <div className="h-5 w-8 bg-stone-200 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-stone-200 shrink-0" />
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="h-5 w-32 bg-stone-200 rounded" />
                      <div className="h-4 w-16 bg-stone-100 rounded" />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  <div className="h-6 w-14 bg-stone-200 rounded-full" />
                  <div className="h-6 w-16 bg-stone-200 rounded-full" />
                  <div className="h-6 w-12 bg-stone-200 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-stone-100 rounded" />
                  <div className="h-3 w-11/12 bg-stone-100 rounded" />
                  <div className="h-3 w-2/3 bg-stone-100 rounded" />
                </div>
                <div className="mt-4">
                  <div className="h-3 w-28 bg-stone-100 rounded mb-2" />
                  <div className="space-y-1">
                    <div className="h-4 w-40 bg-stone-200 rounded" />
                    <div className="h-4 w-36 bg-stone-200 rounded" />
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-stone-100 bg-stone-50">
                <div className="h-10 w-full bg-stone-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

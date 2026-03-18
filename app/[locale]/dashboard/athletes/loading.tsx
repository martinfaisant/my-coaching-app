import { DashboardPageShell } from '@/components/DashboardPageShell'

export default function CoachAthletesLoading() {
  return (
    <DashboardPageShell>
      <div className="space-y-8 animate-pulse">
      <section>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="h-5 w-40 bg-stone-200 rounded" />
            <div className="h-10 w-full sm:w-64 bg-stone-200 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-stone-200 shrink-0" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="h-5 w-28 bg-stone-200 rounded" />
                        <div className="h-4 w-36 bg-stone-100 rounded" />
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="h-6 w-14 bg-stone-200 rounded-full" />
                    <div className="h-6 w-16 bg-stone-200 rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm flex-1">
                    <div>
                      <div className="h-3 w-20 bg-stone-100 rounded mb-1" />
                      <div className="h-4 w-24 bg-stone-200 rounded" />
                    </div>
                    <div>
                      <div className="h-3 w-24 bg-stone-100 rounded mb-1" />
                      <div className="h-4 w-20 bg-stone-200 rounded" />
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-200" />
                        <div className="h-3 w-12 bg-stone-100 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-stone-100 bg-stone-50">
                  <div className="h-9 w-28 bg-stone-200 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
      </section>
      </div>
    </DashboardPageShell>
  )
}

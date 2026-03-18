import { DashboardPageShell } from '@/components/DashboardPageShell'

export default function ObjectifsLoading() {
  return (
    <DashboardPageShell>
      <div className="mb-4 animate-pulse">
        <div className="h-10 w-full bg-white rounded-2xl border border-stone-200 shadow-sm flex items-center px-6">
          <div className="h-6 w-40 bg-stone-200 rounded" />
        </div>
      </div>

      <div className="animate-pulse">
        <div className="rounded-xl border border-stone-200 bg-section overflow-hidden">
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
      </div>
    </DashboardPageShell>
  )
}

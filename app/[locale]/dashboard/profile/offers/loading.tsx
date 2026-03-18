import { DashboardPageShell } from '@/components/DashboardPageShell'

export default function OffersLoading() {
  return (
    <DashboardPageShell>
      <div className="animate-pulse">
        <div className="space-y-6">
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
      </div>
    </DashboardPageShell>
  )
}

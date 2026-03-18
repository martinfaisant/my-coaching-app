import { DashboardPageShell } from '@/components/DashboardPageShell'

export default function DevicesLoading() {
  return (
    <DashboardPageShell>
      <div className="animate-pulse">
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
      </div>
    </DashboardPageShell>
  )
}

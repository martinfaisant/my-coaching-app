import { DashboardPageShell } from '@/components/DashboardPageShell'

export default function CoachingSettingsLoading() {
  return (
    <DashboardPageShell>
      <div className="max-w-xl w-full mx-auto space-y-4 animate-pulse">
        <div className="hidden md:block h-7 w-56 bg-stone-200 rounded-lg" />
        <div className="rounded-2xl border border-stone-200 overflow-hidden">
          <div className="h-10 bg-stone-100 border-b border-stone-200" />
          <div className="p-4 space-y-3 bg-white">
            <div className="h-4 w-full bg-stone-100 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 bg-stone-100 rounded-xl" />
              ))}
            </div>
            <div className="h-11 bg-stone-200 rounded-xl" />
          </div>
        </div>
      </div>
    </DashboardPageShell>
  )
}

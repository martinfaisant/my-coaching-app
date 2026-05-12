import { DashboardPageShell } from '@/components/DashboardPageShell'

export default function CoachPlatformSubscriptionLoading() {
  return (
    <DashboardPageShell>
      <div className="space-y-6 animate-pulse max-w-3xl">
        <div className="h-7 w-72 bg-stone-200 rounded-lg" />
        <div className="h-28 w-full bg-stone-100 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="h-40 bg-stone-100 rounded-xl border border-stone-200" />
          <div className="h-40 bg-stone-100 rounded-xl border border-stone-200" />
        </div>
        <div className="h-48 w-full bg-stone-100 rounded-xl" />
      </div>
    </DashboardPageShell>
  )
}

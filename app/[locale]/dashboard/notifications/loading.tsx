import { DashboardPageShell } from '@/components/DashboardPageShell'

export default function CoachNotificationsLoading() {
  return (
    <DashboardPageShell>
      <div className="max-w-xl w-full mx-auto space-y-4 animate-pulse">
        <div className="hidden md:block h-7 w-48 bg-stone-200 rounded-lg" />
        <div className="rounded-2xl border border-stone-200 overflow-hidden">
          <div className="h-10 bg-stone-100 border-b border-stone-200" />
          <div className="h-20 bg-white" />
        </div>
      </div>
    </DashboardPageShell>
  )
}

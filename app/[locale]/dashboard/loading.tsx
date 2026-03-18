import { DashboardPageShell } from '@/components/DashboardPageShell'

export default function DashboardLoading() {
  return (
    <DashboardPageShell>
      <div className="animate-pulse">
        <div className="h-7 w-56 bg-stone-200 rounded" />
      </div>
    </DashboardPageShell>
  )
}

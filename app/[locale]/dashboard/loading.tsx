export default function DashboardLoading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 animate-pulse">
      <header className="flex items-center justify-between gap-4 px-6 lg:px-8 py-4 border-b border-stone-200/50 bg-white/80 shrink-0">
        <div className="h-7 w-56 bg-stone-200 rounded" />
      </header>
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6" />
    </main>
  )
}

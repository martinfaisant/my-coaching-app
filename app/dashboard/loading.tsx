export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-palette-forest-dark border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-500">Chargement...</p>
      </div>
    </div>
  )
}

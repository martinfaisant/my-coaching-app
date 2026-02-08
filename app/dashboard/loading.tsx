export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">
          Coach Pro
        </h1>
        <div className="w-48 h-1 bg-stone-200 rounded-full overflow-hidden">
          <div
            className="h-full w-1/3 bg-[#627e59] rounded-full animate-loading-bar"
          />
        </div>
      </div>
    </div>
  )
}

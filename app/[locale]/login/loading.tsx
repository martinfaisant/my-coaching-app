export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-200 p-4 animate-pulse">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border-2 border-palette-forest-dark overflow-hidden">
          <div className="p-8 sm:p-10 space-y-6">
            <div className="text-center space-y-2">
              <div className="h-8 w-32 bg-stone-200 rounded mx-auto" />
              <div className="h-4 w-48 bg-stone-200 rounded mx-auto" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-12 bg-stone-200 rounded" />
              <div className="h-12 w-full bg-stone-200 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-stone-200 rounded" />
              <div className="h-12 w-full bg-stone-200 rounded-xl" />
            </div>
            <div className="h-12 w-full bg-stone-200 rounded-xl" />
            <div className="h-px bg-stone-200" />
            <div className="h-4 w-40 bg-stone-200 rounded mx-auto" />
            <div className="flex gap-2">
              <div className="h-10 flex-1 bg-stone-200 rounded-lg" />
              <div className="h-10 flex-1 bg-stone-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

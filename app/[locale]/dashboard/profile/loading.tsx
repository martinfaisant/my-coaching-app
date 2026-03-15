export default function ProfileLoading() {
  return (
    <div className="px-6 lg:px-8 pt-6 pb-24 animate-pulse">
      {/* Formulaire profil : avatar + champs */}
      <div className="rounded-2xl border border-stone-200 bg-section overflow-hidden">
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-stone-200 shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-24 bg-stone-200 rounded" />
                <div className="h-10 w-full bg-stone-200 rounded-xl" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-16 bg-stone-200 rounded" />
              <div className="h-10 w-full bg-stone-200 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-3 w-28 bg-stone-200 rounded" />
              <div className="flex gap-2 flex-wrap">
                <div className="h-8 w-20 bg-stone-200 rounded-full" />
                <div className="h-8 w-16 bg-stone-200 rounded-full" />
                <div className="h-8 w-24 bg-stone-200 rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 w-20 bg-stone-200 rounded" />
              <div className="h-24 w-full bg-stone-200 rounded-xl" />
            </div>
            <div className="pt-4">
              <div className="h-11 w-32 bg-stone-200 rounded-lg" />
            </div>
          </div>
        </div>
    </div>
  )
}

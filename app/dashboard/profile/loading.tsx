export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="h-4 w-32 bg-stone-200 rounded" />
          <div className="h-9 w-24 bg-stone-200 rounded-lg" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        <div className="h-7 w-40 bg-stone-200 rounded" />

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
      </main>
    </div>
  )
}

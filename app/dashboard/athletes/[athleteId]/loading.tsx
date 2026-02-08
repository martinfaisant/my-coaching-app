export default function AthleteCalendarLoading() {
  return (
    <div className="min-h-screen bg-stone-50 animate-pulse">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="h-4 w-36 bg-stone-200 rounded" />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-28">
        {/* Barre titre + navigation semaine */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="h-6 w-64 bg-stone-200 rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-stone-200 rounded-lg" />
            <div className="h-9 w-32 bg-stone-200 rounded-lg" />
            <div className="h-9 w-9 bg-stone-200 rounded-lg" />
          </div>
        </div>

        {/* Grille calendrier (3 semaines, 7 jours) */}
        <div className="rounded-xl border border-stone-200 bg-white overflow-hidden mb-6">
          <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((_, i) => (
              <div key={i} className="p-2 text-center">
                <div className="h-3 w-8 bg-stone-200 rounded mx-auto" />
              </div>
            ))}
          </div>
          <div className="divide-y divide-stone-100">
            {[1, 2, 3].map((week) => (
              <div key={week} className="grid grid-cols-7 min-h-[100px]">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <div key={day} className="p-2 border-r border-stone-100 last:border-r-0">
                    <div className="h-4 w-6 bg-stone-200 rounded mb-2" />
                    <div className="space-y-1">
                      <div className="h-8 w-full bg-stone-100 rounded" />
                      <div className="h-8 w-3/4 bg-stone-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Section Objectifs de l'athlète */}
        <section className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-100 bg-stone-50/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-stone-200" />
            <div className="h-5 w-48 bg-stone-200 rounded" />
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-full">
              <div className="border-b border-stone-100 px-6 py-3 flex gap-8">
                <div className="h-3 w-12 bg-stone-200 rounded" />
                <div className="h-3 w-16 bg-stone-200 rounded" />
                <div className="h-3 w-14 bg-stone-200 rounded" />
                <div className="h-3 w-10 bg-stone-200 rounded" />
              </div>
              <div className="divide-y divide-stone-100">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="px-6 py-4 flex gap-8">
                    <div className="h-4 w-24 bg-stone-200 rounded" />
                    <div className="h-4 w-28 bg-stone-200 rounded" />
                    <div className="h-4 w-16 bg-stone-200 rounded" />
                    <div className="h-6 w-20 bg-stone-200 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

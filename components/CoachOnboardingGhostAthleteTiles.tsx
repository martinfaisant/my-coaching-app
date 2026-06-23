function GhostAthleteTile({ className = '' }: { className?: string }) {
  return (
    <article
      className={`bg-white/80 rounded-2xl border border-dashed border-stone-300 flex flex-col overflow-hidden h-full opacity-55 ${className}`}
      aria-hidden="true"
    >
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-stone-200 ring-2 ring-stone-100 shrink-0" />
            <div className="space-y-2 min-w-0">
              <div className="h-4 w-28 bg-stone-200 rounded" />
              <div className="h-3 w-24 bg-stone-100 rounded" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-16 bg-stone-100 rounded-full" />
          <div className="h-6 w-14 bg-stone-100 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm flex-1">
          <div className="space-y-1">
            <div className="h-3 w-20 bg-stone-100 rounded" />
            <div className="h-4 w-24 bg-stone-200 rounded" />
          </div>
          <div className="space-y-1">
            <div className="h-3 w-24 bg-stone-100 rounded" />
            <div className="h-4 w-20 bg-stone-200 rounded" />
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-stone-200" />
              <div className="h-3 w-12 bg-stone-100 rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-stone-100 bg-stone-50/80">
        <div className="h-3 w-28 bg-stone-200 rounded ml-auto" />
      </div>
    </article>
  )
}

/** Tuiles fantômes alignées sur AthleteTile — preview non interactive pour l'onboarding coach. */
export function CoachOnboardingGhostAthleteTiles() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pointer-events-none select-none">
      <GhostAthleteTile />
      <GhostAthleteTile className="hidden sm:flex" />
      <GhostAthleteTile className="hidden xl:flex" />
    </div>
  )
}

/**
 * Skeletons alignés sur la mise en page réelle : zone courbe (marges type Nivo) + encart volume annuel.
 */

const PLOT_CONTAINER =
  'relative h-[min(400px,50vh)] w-full min-h-[280px] overflow-hidden rounded-lg border border-stone-100 bg-stone-50/80'

type AthleteStatsChartPlotSkeletonProps =
  | { decorative?: false; 'aria-label': string }
  | { decorative: true }

/** Zone courbe seule (même hauteur / marges visuelles que le ResponsiveLine). */
export function AthleteStatsChartPlotSkeleton(props: AthleteStatsChartPlotSkeletonProps) {
  const decorative = props.decorative === true
  const ariaLabel = !decorative ? props['aria-label'] : undefined

  return (
    <div
      className={PLOT_CONTAINER}
      {...(decorative
        ? { 'aria-hidden': true as const }
        : {
            role: 'status' as const,
            'aria-busy': true as const,
            'aria-live': 'polite' as const,
            'aria-label': ariaLabel,
          })}
    >
      <div className="flex h-full gap-0 pl-1 pr-2 pt-2">
        <div className="flex w-14 shrink-0 flex-col justify-between pb-14 pt-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-2 w-6 animate-pulse rounded bg-stone-200/90" />
          ))}
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1">
            <svg
              className="absolute inset-0 h-full w-full text-stone-200"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              {[22, 44, 66, 88].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="100"
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.35"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <path
                d="M 2,78 C 18,72 28,38 42,52 S 62,22 78,35 S 92,18 98,28"
                fill="none"
                stroke="currentColor"
                className="text-stone-300/90"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 2,85 C 20,70 35,60 50,68 S 72,48 88,55 S 95,45 98,50"
                fill="none"
                stroke="currentColor"
                className="text-stone-200"
                strokeWidth="0.9"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="absolute inset-0 animate-pulse bg-gradient-to-t from-white/0 via-white/0 to-white/30" aria-hidden />
          </div>
          <div className="mt-1 flex h-12 shrink-0 items-start justify-between gap-0.5 px-0.5 pt-1" aria-hidden>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-2 w-4 max-w-[8%] flex-1 animate-pulse rounded-sm bg-stone-200/80" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

type AthleteStatsAnnualPanelSkeletonProps = {
  rowCount: number
}

function AthleteStatsAnnualPanelSkeleton({ rowCount }: AthleteStatsAnnualPanelSkeletonProps) {
  const n = Math.min(Math.max(rowCount, 1), 3)
  return (
    <div
      className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"
      aria-hidden
    >
      <div className="h-4 w-36 max-w-[55%] animate-pulse rounded bg-stone-200" />
      <ul className="mt-3 space-y-2.5">
        {Array.from({ length: n }).map((_, i) => (
          <li
            key={i}
            className="flex items-center justify-between gap-3 border-b border-stone-200/80 pb-2 last:border-0"
          >
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-stone-200 animate-pulse" />
              <span className="h-3.5 w-24 animate-pulse rounded bg-stone-200/90" />
            </span>
            <span className="h-3.5 w-16 shrink-0 animate-pulse rounded bg-stone-200/90" />
          </li>
        ))}
      </ul>
    </div>
  )
}

type AthleteStatsChartFullSkeletonProps = {
  annualRowCount: number
  statusMessage: string
}

/** Graphe + encart annuel (ex. chargement global page stats). */
export function AthleteStatsChartFullSkeleton({
  annualRowCount,
  statusMessage,
}: AthleteStatsChartFullSkeletonProps) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <p className="text-center text-sm font-medium text-stone-600">{statusMessage}</p>
      <div className="space-y-4">
        <AthleteStatsChartPlotSkeleton decorative />
        <AthleteStatsAnnualPanelSkeleton rowCount={annualRowCount} />
      </div>
    </div>
  )
}

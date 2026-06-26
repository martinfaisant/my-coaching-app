type StepVisualVariant = 'profile' | 'offer' | 'requests'
type StepVisualState = 'current' | 'done' | 'upcoming'

type CoachOnboardingStepVisualProps = {
  variant: StepVisualVariant
  state: StepVisualState
  /** Ex. « 45 € / mois » — décoratif, i18n côté appelant */
  offerPriceSampleLabel?: string
  /** Sous-texte visuel demande (étape 3 active) */
  requestPlaceholderLabel?: string
  className?: string
}

const wrapperBase = 'shrink-0 pointer-events-none select-none'

function ProfileVisual({ state }: { state: StepVisualState }) {
  if (state === 'done') {
    return (
      <div className="w-36 rounded-xl border border-palette-forest-dark/20 bg-white p-3 opacity-80">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-palette-olive/30 shrink-0" />
          <div className="h-2 flex-1 bg-stone-200 rounded" />
        </div>
        <div className="flex gap-1">
          <div className="h-3 w-10 rounded-full bg-palette-forest-dark/15" />
          <div className="h-3 w-8 rounded-full bg-palette-olive/15" />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full sm:w-44 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-2.5">
        <div className="w-9 h-9 rounded-full bg-palette-olive/25 ring-2 ring-stone-100 shrink-0" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="h-2.5 w-full bg-stone-200 rounded" />
          <div className="h-2 w-2/3 bg-stone-100 rounded" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-2.5">
        <div className="h-4 w-12 rounded-full bg-palette-forest-dark/10 border border-palette-forest-dark/15" />
        <div className="h-4 w-10 rounded-full bg-palette-olive/10 border border-palette-olive/15" />
      </div>
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-stone-100 rounded" />
        <div className="h-1.5 w-11/12 bg-stone-100 rounded" />
        <div className="h-1.5 w-3/4 bg-stone-100 rounded" />
      </div>
    </div>
  )
}

function OfferVisual({
  state,
  offerPriceSampleLabel,
}: {
  state: StepVisualState
  offerPriceSampleLabel: string
}) {
  if (state === 'done') {
    return (
      <div className="w-44 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
        <div className="h-2.5 w-20 bg-stone-200 rounded mb-2" />
        <div className="text-[10px] font-bold text-palette-forest-dark bg-palette-forest-dark/10 border border-palette-forest-dark/20 rounded px-2 py-0.5 inline-block mb-2">
          {offerPriceSampleLabel}
        </div>
        <div className="h-1.5 w-full bg-stone-100 rounded" />
      </div>
    )
  }

  return (
    <div className="w-full sm:w-44 rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="h-2.5 w-20 bg-stone-200 rounded" />
        <div className="h-4 w-4 rounded bg-palette-amber/20 shrink-0" />
      </div>
      <div className="inline-flex items-center rounded-md bg-palette-forest-dark/10 border border-palette-forest-dark/20 px-2 py-0.5 mb-2.5">
        <span className="text-[10px] font-bold text-palette-forest-dark">{offerPriceSampleLabel}</span>
      </div>
      <div className="space-y-1">
        <div className="h-1.5 w-full bg-stone-100 rounded" />
        <div className="h-1.5 w-4/5 bg-stone-100 rounded" />
      </div>
      <div className="mt-2.5 pt-2 border-t border-stone-100">
        <div className="h-5 w-16 bg-palette-forest-dark/15 rounded-md ml-auto" />
      </div>
    </div>
  )
}

function GhostAthleteMicroCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-dashed border-stone-300 bg-white/70 p-2.5 ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-6 h-6 rounded-full bg-stone-200 shrink-0" />
        <div className="h-2 flex-1 bg-stone-200 rounded" />
      </div>
      <div className="h-1.5 w-full bg-stone-100 rounded mb-1" />
      <div className="h-1.5 w-2/3 bg-stone-100 rounded" />
    </div>
  )
}

function GhostAthleteMicroCardAlt({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-xl border border-dashed border-stone-300 bg-white/70 p-2.5 ${className}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-6 h-6 rounded-full bg-stone-200 shrink-0" />
        <div className="h-2 flex-1 bg-stone-200 rounded" />
      </div>
      <div className="h-1.5 w-full bg-stone-100 rounded mb-1" />
      <div className="h-1.5 w-1/2 bg-stone-100 rounded" />
    </div>
  )
}

function RequestsVisual({
  state,
  requestPlaceholderLabel,
}: {
  state: StepVisualState
  requestPlaceholderLabel?: string
}) {
  const isMuted = state === 'upcoming'

  return (
    <div
      className={`w-full md:w-64 lg:w-72 shrink-0 space-y-2 ${isMuted ? 'opacity-45 grayscale-[0.3]' : ''}`}
    >
      <div className="rounded-lg border border-l-4 border-l-palette-amber border-stone-200 bg-white p-2.5 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-stone-200 shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-2 w-16 bg-stone-200 rounded" />
            <div className="h-1.5 w-24 bg-stone-100 rounded" />
          </div>
        </div>
        {requestPlaceholderLabel && state === 'current' ? (
          <p className="text-[10px] text-stone-400 mt-2 italic">{requestPlaceholderLabel}</p>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <GhostAthleteMicroCard />
        <GhostAthleteMicroCardAlt className="hidden sm:block" />
      </div>
    </div>
  )
}

/** Mini-visuels onboarding — alignés sur MOCKUP_US_COACH_ONB_01_CHECKLIST.html */
export function CoachOnboardingStepVisual({
  variant,
  state,
  offerPriceSampleLabel = '',
  requestPlaceholderLabel,
  className = '',
}: CoachOnboardingStepVisualProps) {
  return (
    <div className={`${wrapperBase} mx-auto lg:mx-0 ${className}`} aria-hidden="true">
      {variant === 'profile' && <ProfileVisual state={state} />}
      {variant === 'offer' && (
        <OfferVisual state={state} offerPriceSampleLabel={offerPriceSampleLabel} />
      )}
      {variant === 'requests' && (
        <RequestsVisual state={state} requestPlaceholderLabel={requestPlaceholderLabel} />
      )}
    </div>
  )
}

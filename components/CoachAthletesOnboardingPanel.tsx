import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { CoachOnboardingGhostAthleteTiles } from '@/components/CoachOnboardingGhostAthleteTiles'
import { CoachOnboardingStepVisual } from '@/components/CoachOnboardingStepVisual'

type CoachAthletesOnboardingPanelProps = {
  locale: string
  isProfileComplete: boolean
  hasPublishedOffer: boolean
}

const ctaLinkClassName =
  'inline-flex justify-center rounded-lg bg-palette-forest-dark px-4 py-2.5 text-sm font-medium text-white hover:bg-palette-olive transition-colors focus:outline-none focus:ring-2 focus:ring-palette-olive focus:ring-offset-2 shrink-0 w-full sm:w-auto'

function StepCheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function CompletedStepBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="w-8 h-8 rounded-full bg-palette-forest-dark text-white flex items-center justify-center shrink-0"
      aria-hidden
    >
      {children}
    </span>
  )
}

function PendingStepBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="w-8 h-8 rounded-full border-2 border-palette-forest-dark flex items-center justify-center shrink-0 text-palette-forest-dark font-bold text-sm"
      aria-hidden
    >
      {children}
    </span>
  )
}

function UpcomingStepBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="w-8 h-8 rounded-full border-2 border-dashed border-stone-300 flex items-center justify-center shrink-0 text-stone-400"
      aria-hidden
    >
      {children}
    </span>
  )
}

export async function CoachAthletesOnboardingPanel({
  locale,
  isProfileComplete,
  hasPublishedOffer,
}: CoachAthletesOnboardingPanelProps) {
  const t = await getTranslations({ locale, namespace: 'athletes' })
  const isReady = isProfileComplete && hasPublishedOffer
  const remainingSteps = Number(!isProfileComplete) + Number(!hasPublishedOffer)

  const panelTitle = isReady ? t('onboarding.panel.titleReady') : t('onboarding.panel.titleInProgress')
  const panelSubtitle = isReady
    ? t('onboarding.panel.subtitleReady')
    : remainingSteps === 1
      ? t('onboarding.panel.subtitleOneStepLeft')
      : t('onboarding.panel.subtitleInProgress')
  const offerPriceSampleLabel = t('onboarding.stepVisual.offerPriceSample')

  return (
    <section className="mb-8 rounded-2xl border border-stone-200 bg-section shadow-sm overflow-hidden">
      <div className="p-6 md:p-8 border-b border-stone-200/80">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">{panelTitle}</h2>
            <p className="text-sm text-stone-600 mt-1">{panelSubtitle}</p>
          </div>
          {isReady ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20 px-3 py-1 text-xs font-bold uppercase tracking-wide shrink-0">
              <StepCheckIcon />
              {t('onboarding.panel.progressDone')}
            </span>
          ) : null}
        </div>
      </div>

      {isReady ? (
        <>
          <ol className="divide-y divide-stone-200/80">
            <li className="p-4 md:px-8 flex items-center gap-4">
              <CompletedStepBadge>
                <StepCheckIcon />
              </CompletedStepBadge>
              <span className="font-medium text-stone-800 flex-1">{t('onboarding.stepProfile.doneLabel')}</span>
              <CoachOnboardingStepVisual
                variant="profile"
                state="done"
                className="!mx-0"
              />
            </li>
            <li className="p-4 md:px-8 flex items-center gap-4">
              <CompletedStepBadge>
                <StepCheckIcon />
              </CompletedStepBadge>
              <span className="font-medium text-stone-800 flex-1">{t('onboarding.stepOffer.doneLabel')}</span>
              <CoachOnboardingStepVisual
                variant="offer"
                state="done"
                offerPriceSampleLabel={offerPriceSampleLabel}
                className="!mx-0"
              />
            </li>
            <li className="p-5 md:p-6 md:px-8 bg-white/40">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <PendingStepBadge>3</PendingStepBadge>
                  <div>
                    <p className="font-semibold text-stone-900">{t('onboarding.stepRequests.waitingTitle')}</p>
                    <p className="text-sm text-stone-500 mt-1">{t('onboarding.stepRequests.waitingDescription')}</p>
                  </div>
                </div>
                <CoachOnboardingStepVisual
                  variant="requests"
                  state="current"
                  offerPriceSampleLabel={offerPriceSampleLabel}
                  requestPlaceholderLabel={t('onboarding.stepRequests.requestPlaceholder')}
                  className="!mx-0 w-full lg:w-auto"
                />
              </div>
            </li>
          </ol>
          <div className="p-6 md:p-8 border-t border-stone-200/80 space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {t('onboarding.preview.athletesTitle')}
              </p>
              <p className="text-sm text-stone-600 mt-1">{t('onboarding.preview.athletesDescription')}</p>
            </div>
            <CoachOnboardingGhostAthleteTiles />
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link
                href="/dashboard/profile"
                className="text-sm font-medium text-palette-forest-dark hover:text-palette-olive underline-offset-2 hover:underline"
              >
                {t('onboarding.links.editProfile')}
              </Link>
              <span className="text-stone-300" aria-hidden>
                ·
              </span>
              <Link
                href="/dashboard/profile/offers"
                className="text-sm font-medium text-palette-forest-dark hover:text-palette-olive underline-offset-2 hover:underline"
              >
                {t('onboarding.links.manageOffers')}
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <ol className="divide-y divide-stone-200/80">
            <li className="p-5 md:p-6 md:px-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {isProfileComplete ? (
                    <CompletedStepBadge>
                      <StepCheckIcon />
                    </CompletedStepBadge>
                  ) : (
                    <PendingStepBadge>1</PendingStepBadge>
                  )}
                  <div>
                    <p className="font-semibold text-stone-900">{t('onboarding.stepProfile.title')}</p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {isProfileComplete
                        ? t('onboarding.stepProfile.done')
                        : t('onboarding.stepProfile.description')}
                    </p>
                  </div>
                </div>
                <CoachOnboardingStepVisual
                  variant="profile"
                  state={isProfileComplete ? 'done' : 'current'}
                  offerPriceSampleLabel={offerPriceSampleLabel}
                />
                {!isProfileComplete ? (
                  <Link href="/dashboard/profile" className={ctaLinkClassName}>
                    {t('onboarding.stepProfile.button')}
                  </Link>
                ) : null}
              </div>
            </li>

            <li className="p-5 md:p-6 md:px-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {hasPublishedOffer ? (
                    <CompletedStepBadge>
                      <StepCheckIcon />
                    </CompletedStepBadge>
                  ) : (
                    <PendingStepBadge>2</PendingStepBadge>
                  )}
                  <div>
                    <p className="font-semibold text-stone-900">{t('onboarding.stepOffer.title')}</p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {hasPublishedOffer
                        ? t('onboarding.stepOffer.done')
                        : t('onboarding.stepOffer.description')}
                    </p>
                  </div>
                </div>
                <CoachOnboardingStepVisual
                  variant="offer"
                  state={hasPublishedOffer ? 'done' : 'current'}
                  offerPriceSampleLabel={offerPriceSampleLabel}
                />
                {!hasPublishedOffer ? (
                  <Link href="/dashboard/profile/offers" className={ctaLinkClassName}>
                    {t('onboarding.stepOffer.button')}
                  </Link>
                ) : null}
              </div>
            </li>

            <li className="p-5 md:p-6 md:px-8 bg-white/30">
              <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <UpcomingStepBadge>3</UpcomingStepBadge>
                  <div>
                    <p className="font-semibold text-stone-700">{t('onboarding.stepRequests.title')}</p>
                    <p className="text-sm text-stone-500 mt-0.5">{t('onboarding.stepRequests.description')}</p>
                  </div>
                </div>
                <CoachOnboardingStepVisual variant="requests" state="upcoming" />
              </div>
            </li>
          </ol>

          <div className="p-5 md:p-8 border-t border-stone-200/80 bg-white/40">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">
              {t('onboarding.preview.athletesTitle')}
            </p>
            <p className="text-sm text-stone-600 mb-4">{t('onboarding.preview.athletesDescription')}</p>
            <CoachOnboardingGhostAthleteTiles />
          </div>
        </>
      )}
    </section>
  )
}

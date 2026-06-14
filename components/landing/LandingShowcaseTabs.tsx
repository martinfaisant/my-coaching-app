'use client'

import { useCallback, useState, type KeyboardEvent } from 'react'
import { useTranslations } from 'next-intl'
import {
  LANDING_SHOWCASE_TABS,
  type LandingShowcaseTabId,
} from '@/lib/landingConfig'
import {
  LANDING_TAB_BASE_CLASS,
  LANDING_TAB_SELECTED_CLASS,
  LANDING_TAB_UNSELECTED_CLASS,
} from '@/lib/landingTabStyles'
import { LandingScreenshotFrame } from '@/components/landing/LandingScreenshotFrame'
import { LandingSignupButton } from '@/components/landing/LandingSignupButton'
import { LandingPricingLinkClient } from '@/components/landing/LandingPricingLinkClient'

type LandingShowcaseTabsProps = {
  locale: string
}

export function LandingShowcaseTabs({ locale }: LandingShowcaseTabsProps) {
  const t = useTranslations('landing')
  const [activeTabId, setActiveTabId] = useState<LandingShowcaseTabId>(
    LANDING_SHOWCASE_TABS[0].id
  )

  const activeTab =
    LANDING_SHOWCASE_TABS.find((tab) => tab.id === activeTabId) ??
    LANDING_SHOWCASE_TABS[0]

  const handleTabKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
      const tabs = LANDING_SHOWCASE_TABS
      let nextIndex: number | null = null

      if (event.key === 'ArrowRight') {
        nextIndex = (index + 1) % tabs.length
      } else if (event.key === 'ArrowLeft') {
        nextIndex = (index - 1 + tabs.length) % tabs.length
      } else if (event.key === 'Home') {
        nextIndex = 0
      } else if (event.key === 'End') {
        nextIndex = tabs.length - 1
      }

      if (nextIndex !== null) {
        event.preventDefault()
        setActiveTabId(tabs[nextIndex].id)
        const tablist = event.currentTarget.closest('[role="tablist"]')
        const buttons = tablist?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        buttons?.[nextIndex]?.focus()
      }
    },
    []
  )

  const panelPrefix = `showcase.panels.${activeTab.id}` as const
  const ctaKey =
    activeTab.audience === 'athlete'
      ? (`${panelPrefix}.ctaAthlete` as const)
      : (`${panelPrefix}.ctaCoach` as const)
  const audienceLabelKey =
    activeTab.audience === 'athlete'
      ? 'showcase.audience.athlete'
      : 'showcase.audience.coach'

  return (
    <section className="bg-stone-50 py-16 lg:py-20" aria-labelledby="landing-showcase-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2
            id="landing-showcase-title"
            className="mb-3 text-3xl font-bold text-stone-900 sm:text-4xl"
          >
            {t('showcase.title')}
          </h2>
          <p className="text-stone-600">{t('showcase.subtitle')}</p>
        </div>

        <div className="-mx-4 mb-8 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
          <div
            className="flex min-w-max gap-2 sm:min-w-0 sm:flex-wrap sm:justify-center"
            role="tablist"
            aria-label={t('showcase.tabsAriaLabel')}
          >
            {LANDING_SHOWCASE_TABS.map((tab, index) => {
              const selected = tab.id === activeTabId
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  id={`landing-tab-${tab.id}`}
                  aria-selected={selected}
                  aria-controls={`landing-panel-${tab.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTabId(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={`${LANDING_TAB_BASE_CLASS} ${
                    selected ? LANDING_TAB_SELECTED_CLASS : LANDING_TAB_UNSELECTED_CLASS
                  }`}
                >
                  {t(`showcase.tabs.${tab.id}`)}
                </button>
              )
            })}
          </div>
        </div>

        <div
          className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm lg:p-10"
          role="tabpanel"
          id={`landing-panel-${activeTab.id}`}
          aria-labelledby={`landing-tab-${activeTab.id}`}
        >
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  activeTab.audience === 'athlete'
                    ? 'text-palette-forest-dark'
                    : 'text-palette-olive'
                }`}
              >
                {t(audienceLabelKey)}
              </span>
              <h3 className="mt-1 mb-2 text-2xl font-bold text-stone-900">
                {t(`${panelPrefix}.title`)}
              </h3>
              <p className="mb-6 text-stone-600">{t(`${panelPrefix}.description`)}</p>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                {activeTab.showPricingLink ? (
                  <LandingPricingLinkClient
                    locale={locale}
                    context="showcaseOffers"
                  />
                ) : null}
                <LandingSignupButton label={t(ctaKey)} />
              </div>
            </div>
            <LandingScreenshotFrame
              locale={locale}
              screenshotId={activeTab.screenshotId}
              alt={t(`showcase.screenshots.${activeTab.screenshotId}.alt`)}
              sizes="(max-width: 1024px) 100vw, 50vw"
              imageClassName={`object-cover object-top w-full rounded-lg ${
                activeTab.screenshotId === 'workout-create' ? 'max-h-[400px]' : ''
              }`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

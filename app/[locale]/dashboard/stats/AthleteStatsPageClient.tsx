'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { Segments } from '@/components/Segments'
import { Dropdown } from '@/components/Dropdown'
import { AthleteStatsVolumeChart } from '@/components/athlete/AthleteStatsVolumeChart'
import { AthleteStatsChartFullSkeleton } from '@/components/athlete/AthleteStatsChartSkeleton'
import { loadAthleteVolumeChartData, type AthleteVolumeChartPayload } from '@/app/[locale]/dashboard/stats/actions'
import {
  type AthleteStatsGranularity,
  type AthleteStatsMetric,
} from '@/lib/athleteStatsVolume'
import type { SportType } from '@/types/database'
import { SPORT_TRANSLATION_KEYS } from '@/lib/sportStyles'
import { isError } from '@/lib/errors'
import { logger } from '@/lib/logger'

const MAX_YEARS = 3
const YEAR_WINDOW = 4

type AthleteStatsPageClientProps = {
  initialPayload: AthleteVolumeChartPayload | null
  initialError: string | null
  defaultSport: SportType
}

export function AthleteStatsPageClient({
  initialPayload,
  initialError,
  defaultSport,
}: AthleteStatsPageClientProps) {
  const t = useTranslations('athleteStats')
  const tSports = useTranslations('sports')
  const locale = useLocale()

  const yearOptions = useMemo(() => {
    const y = new Date().getFullYear()
    return Array.from({ length: YEAR_WINDOW }, (_, i) => y - i)
  }, [])

  const [years, setYears] = useState<number[]>(() => {
    const y = new Date().getFullYear()
    return initialPayload?.years?.length ? [...initialPayload.years] : [y, y - 1]
  })
  const [sport, setSport] = useState<SportType>(defaultSport)
  const [granularity, setGranularity] = useState<AthleteStatsGranularity>(
    initialPayload?.granularity ?? 'week',
  )
  const [metric, setMetric] = useState<AthleteStatsMetric>(initialPayload?.metric ?? 'time')
  const [payload, setPayload] = useState<AthleteVolumeChartPayload | null>(initialPayload)
  const [error, setError] = useState<string | null>(initialError)
  const [pending, setPending] = useState(false)
  const [availableSports, setAvailableSports] = useState<SportType[]>(
    initialPayload?.availableSports?.length ? [...initialPayload.availableSports] : [defaultSport],
  )
  const statsFetchGenerationRef = useRef(0)

  const effectiveSport = useMemo(() => {
    if (availableSports.length === 0) return defaultSport
    return availableSports.includes(sport) ? sport : availableSports[0]!
  }, [availableSports, defaultSport, sport])

  const sportOptions = useMemo(
    () =>
      availableSports.map((s) => ({
        value: s,
        label: tSports(SPORT_TRANSLATION_KEYS[s] as 'course'),
      })),
    [availableSports, tSports],
  )

  const refresh = useCallback(() => {
    const generation = ++statsFetchGenerationRef.current
    setPending(true)
    setError(null)
    void loadAthleteVolumeChartData({
      years,
      sport: effectiveSport,
      granularity,
      metric,
      locale,
    })
      .then((result) => {
        if (generation !== statsFetchGenerationRef.current) return
        if (isError(result)) {
          setError(result.error)
          setPayload(null)
        } else {
          setError(null)
          setPayload(result.data)
          setAvailableSports(result.data.availableSports)
        }
        setPending(false)
      })
      .catch((e) => {
        if (generation !== statsFetchGenerationRef.current) return
        logger.error('loadAthleteVolumeChartData client', e instanceof Error ? e : new Error(String(e)))
        setError(t('errors.loadFailed'))
        setPayload(null)
        setPending(false)
      })
  }, [years, effectiveSport, granularity, metric, locale, t])

  const skipNextRefresh = useRef(true)
  useEffect(() => {
    if (skipNextRefresh.current) {
      skipNextRefresh.current = false
      return
    }
    let cancelled = false
    const frame = requestAnimationFrame(() => {
      if (!cancelled) refresh()
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
    }
  }, [years, effectiveSport, granularity, metric, locale, refresh])

  const toggleYear = (y: number) => {
    setYears((prev) => {
      if (prev.includes(y)) {
        const next = prev.filter((x) => x !== y)
        return next.length > 0 ? next : prev
      }
      if (prev.length >= MAX_YEARS) return prev
      return [...prev, y].sort((a, b) => b - a)
    })
  }

  return (
    <DashboardPageShell>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <h1 className="text-xl font-bold text-stone-800">{t('title')}</h1>

        <section
          className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"
          aria-label={t('filters.aria')}
        >
          <div className="flex flex-col gap-4">
            <div>
              <span className="block text-xs font-semibold uppercase tracking-wide text-stone-500 mb-2">
                {t('filters.years')}
              </span>
              <div className="flex flex-wrap gap-2">
                {yearOptions.map((y) => {
                  const checked = years.includes(y)
                  const disableCheck =
                    !checked && years.length >= MAX_YEARS
                  return (
                    <label
                      key={y}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                        checked
                          ? 'border-palette-forest-dark bg-palette-forest-dark/10'
                          : 'border-stone-200 bg-white'
                      } ${disableCheck ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="rounded border-stone-300 text-palette-forest-dark focus:ring-palette-forest-dark"
                        checked={checked}
                        disabled={disableCheck}
                        onChange={() => toggleYear(y)}
                      />
                      {y}
                    </label>
                  )
                })}
              </div>
              <p className="mt-1 text-xs text-stone-500">{t('filters.maxYearsHint', { max: MAX_YEARS })}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
              <div className="min-w-[200px] flex-1">
                <Dropdown
                  id="athlete-stats-sport"
                  label={t('filters.sport')}
                  labelClassName="!text-xs !font-semibold uppercase tracking-wide !text-stone-500"
                  options={sportOptions}
                  value={effectiveSport}
                  onChange={(v) => setSport(v as SportType)}
                  ariaLabel={t('filters.sport')}
                />
              </div>
              <div className="min-w-[200px] flex-1">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {t('filters.granularity')}
                </span>
                <Segments
                  name="granularity"
                  ariaLabel={t('filters.granularity')}
                  size="sm"
                  className="w-full"
                  value={granularity}
                  onChange={(v) => setGranularity(v as AthleteStatsGranularity)}
                  options={[
                    { value: 'week', label: t('filters.granularityWeek') },
                    { value: 'month', label: t('filters.granularityMonth') },
                  ]}
                />
              </div>
              <div className="min-w-[220px] flex-1">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {t('filters.metric')}
                </span>
                <Segments
                  name="metric"
                  ariaLabel={t('filters.metric')}
                  size="sm"
                  className="w-full"
                  value={metric}
                  onChange={(v) => setMetric(v as AthleteStatsMetric)}
                  options={[
                    { value: 'time', label: t('filters.metricTime') },
                    { value: 'distance', label: t('filters.metricDistance') },
                    { value: 'elevation', label: t('filters.metricElevation') },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-stone-800">{t('chart.sectionTitle')}</h2>

          {error && (
            <p className="mb-3 rounded-lg border border-palette-danger/40 bg-palette-danger/5 px-3 py-2 text-sm text-stone-800">
              {error}
            </p>
          )}

          <div className="relative">
            {pending ? (
              <AthleteStatsChartFullSkeleton
                annualRowCount={Math.min(Math.max(years.length, 1), MAX_YEARS)}
                statusMessage={t('chart.loading')}
              />
            ) : payload ? (
              <AthleteStatsVolumeChart
                series={payload.series}
                granularity={payload.granularity}
                metric={payload.metric}
                sport={effectiveSport}
              />
            ) : !error ? (
              <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-12 text-center text-sm text-stone-600">
                {t('chart.emptyNoData')}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </DashboardPageShell>
  )
}

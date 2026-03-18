'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { SearchInput } from '@/components/SearchInput'
import { Dropdown } from '@/components/Dropdown'
import { CoachAthleteTileWithModal } from '@/app/[locale]/dashboard/CoachAthleteTileWithModal'
import type { CoachSubscriptionRow } from '@/app/[locale]/dashboard/CoachSubscriptionDetailModal'
import type { AthleteTileNextGoal } from '@/components/AthleteTile'

/** Normalise une chaîne pour la recherche : NFD, suppression des diacritiques, minuscules, trim. e et é sont considérés identiques. */
function normalizeForSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim()
}

function displayNameMatches(displayName: string, query: string): boolean {
  const q = normalizeForSearch(query)
  if (!q) return true
  return normalizeForSearch(displayName).includes(q)
}

export type CoachAthleteTileItem = {
  displayName: string
  athlete: {
    displayName: string
    avatarUrl: string | null
  }
  subscription: CoachSubscriptionRow | null
  subscriptionTitle: string | null
  locale: string
  currentUserId?: string | null
  athleteHref: string
  practicedSports: string[]
  nextGoal: AthleteTileNextGoal | null
  plannedUntil?: string | null
  /** Date brute YYYY-MM-DD pour le tri (sans date = null) */
  plannedUntilRaw?: string | null
  isUpToDate: boolean
  labels: {
    nextGoal: string
    noGoal: string
    plannedUntil: string
    upToDate: string
    late: string
  }
  viewPlanningLabel: string
}

type Props = {
  athletes: CoachAthleteTileItem[]
  showDivider?: boolean
}

type SortMode = 'name_asc' | 'planned_until_asc'

/** Tri par nom A–Z. */
function sortByNameAsc(a: CoachAthleteTileItem, b: CoachAthleteTileItem): number {
  return (a.displayName ?? '').localeCompare(b.displayName ?? '', undefined, { sensitivity: 'base' })
}

/** Tri par date planifiée : sans date en premier, puis croissant (proche → loin). Ordre secondaire : displayName. */
function sortByPlannedUntilAsc(a: CoachAthleteTileItem, b: CoachAthleteTileItem): number {
  const rawA = a.plannedUntilRaw ?? ''
  const rawB = b.plannedUntilRaw ?? ''
  if (rawA !== rawB) {
    if (!rawA) return -1
    if (!rawB) return 1
    return rawA.localeCompare(rawB)
  }
  return (a.displayName ?? '').localeCompare(b.displayName ?? '')
}

const SORT_COMPARATORS: Record<SortMode, (a: CoachAthleteTileItem, b: CoachAthleteTileItem) => number> = {
  name_asc: sortByNameAsc,
  planned_until_asc: sortByPlannedUntilAsc,
}

const SORT_OPTIONS: { value: SortMode; labelKey: 'sortByNameAsc' | 'sortByPlannedDate' }[] = [
  { value: 'name_asc', labelKey: 'sortByNameAsc' },
  { value: 'planned_until_asc', labelKey: 'sortByPlannedDate' },
]

export function CoachAthletesListWithFilter({ athletes, showDivider = false }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortMode, setSortMode] = useState<SortMode>('planned_until_asc')
  const t = useTranslations('athletes')

  const filteredAthletes = useMemo(() => {
    const filtered = athletes.filter((a) => displayNameMatches(a.displayName, searchQuery))
    return [...filtered].sort(SORT_COMPARATORS[sortMode])
  }, [athletes, searchQuery, sortMode])

  const sortDropdownOptions = SORT_OPTIONS.map((o) => ({
    value: o.value,
    label: t(o.labelKey),
  }))

  return (
    <>
      {showDivider && <div className="border-t border-stone-200 my-8" />}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <h2 className="text-base font-semibold text-stone-900">
          {t('myAthletesWithCount', { count: athletes.length })}
        </h2>
        <div className="flex flex-wrap items-end gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-52 sm:min-w-[12rem]">
            <SearchInput
              placeholder={t('nameFilterPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('nameFilterPlaceholder')}
              className="text-sm py-2"
            />
          </div>
          <Dropdown
            id="athletes-sort-trigger"
            label={t('sortByLabel')}
            options={sortDropdownOptions}
            value={sortMode}
            onChange={(v) => setSortMode(v as SortMode)}
            ariaLabel={t('sortByLabel')}
            minWidth="180px"
            labelClassName="!text-xs !mb-1.5"
            triggerClassName="text-sm py-2"
          />
        </div>
      </div>
      {filteredAthletes.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6">
          <p className="text-stone-600 font-medium text-center">{t('noMatchForSearch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAthletes.map((item) => (
            <CoachAthleteTileWithModal
              key={item.athleteHref}
              athlete={item.athlete}
              subscription={item.subscription}
              subscriptionTitle={item.subscriptionTitle}
              locale={item.locale}
              currentUserId={item.currentUserId}
              athleteHref={item.athleteHref}
              practicedSports={item.practicedSports}
              nextGoal={item.nextGoal}
              plannedUntil={item.plannedUntil}
              isUpToDate={item.isUpToDate}
              labels={item.labels}
              viewPlanningLabel={item.viewPlanningLabel}
            />
          ))}
        </div>
      )}
    </>
  )
}

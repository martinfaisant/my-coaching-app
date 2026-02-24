'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/Input'
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

export function CoachAthletesListWithFilter({ athletes, showDivider = false }: Props) {
  const [searchQuery, setSearchQuery] = useState('')
  const t = useTranslations('athletes')

  const filteredAthletes = useMemo(
    () => athletes.filter((a) => displayNameMatches(a.displayName, searchQuery)),
    [athletes, searchQuery]
  )

  return (
    <>
      {showDivider && <div className="border-t border-stone-200 my-8" />}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h2 className="text-base font-semibold text-stone-900">
          {t('myAthletesWithCount', { count: athletes.length })}
        </h2>
        <div className="w-full sm:w-64">
          <Input
            type="search"
            placeholder={t('nameFilterPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('nameFilterPlaceholder')}
          />
        </div>
      </div>
      {filteredAthletes.length === 0 ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50 p-6">
          <p className="text-stone-600 font-medium text-center">{t('noMatchForSearch')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

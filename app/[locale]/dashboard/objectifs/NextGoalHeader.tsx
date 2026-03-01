'use client'

import { useTranslations } from 'next-intl'
import { getDaysUntil } from '@/lib/dateUtils'
import type { Goal } from '@/types/database'

type NextGoalHeaderProps = {
  goals: Goal[]
}

/**
 * Bloc « Prochain objectif » en haut à droite de la page Mes objectifs.
 * Calcule nextGoal et daysUntilNext côté client (fuseau local) pour être
 * cohérent avec le J-X affiché sur les tuiles.
 */
export function NextGoalHeader({ goals }: NextGoalHeaderProps) {
  const t = useTranslations('goals')

  const today = new Date().toISOString().slice(0, 10)
  const futureGoals = goals.filter(g => g.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const nextGoal = futureGoals.length > 0 ? futureGoals[0] : null
  const daysUntilNext = nextGoal ? getDaysUntil(nextGoal.date) : null

  if (daysUntilNext === null || !nextGoal) {
    return null
  }

  return (
    <div className="hidden sm:flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2">
      <div className="flex flex-col items-end">
        <span className="text-[10px] uppercase font-bold text-stone-400">{t('nextRace')}</span>
        <span className="text-sm font-bold text-palette-forest-dark">{nextGoal.race_name}</span>
      </div>
      <div className="w-px h-8 bg-stone-200"></div>
      <div className="text-center">
        <span className="block text-lg font-bold text-stone-800 leading-none">{t('daysUntil', { days: daysUntilNext })}</span>
      </div>
    </div>
  )
}

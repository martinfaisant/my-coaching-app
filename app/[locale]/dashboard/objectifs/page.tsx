import type { Metadata } from 'next'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/utils/supabase/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { ObjectifsTable } from './ObjectifsTable'
import type { Goal } from '@/types/database'
import { getDaysUntil } from '@/lib/dateUtils'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('goalsTitle')
  }
}

export default async function ObjectifsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'goals' })
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'athlete') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('athlete_id', current.id)
    .order('date', { ascending: true })

  const goalsList = (goals ?? []) as Goal[]
  const today = new Date().toISOString().slice(0, 10)
  const futureGoals = goalsList.filter(g => g.date >= today)
  const nextGoal = futureGoals.length > 0 ? futureGoals[0] : null
  const daysUntilNext = nextGoal ? getDaysUntil(nextGoal.date) : null

  return (
    <DashboardPageShell
      title={t('title')}
      rightContent={
        daysUntilNext !== null && nextGoal ? (
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
        ) : undefined
      }
    >
      <ObjectifsTable goals={goalsList} />
    </DashboardPageShell>
  )
}

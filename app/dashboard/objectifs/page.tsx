import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/PageHeader'
import { ObjectifsTable } from './ObjectifsTable'
import type { Goal } from '@/types/database'
import { getDaysUntil } from '@/lib/dateUtils'

export default async function ObjectifsPage() {
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
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      <PageHeader
        title="Mes Objectifs"
        rightContent={
          daysUntilNext !== null && nextGoal ? (
            <div className="hidden sm:flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2">
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-stone-400">Prochaine course</span>
                <span className="text-sm font-bold text-palette-forest-dark">{nextGoal.race_name}</span>
              </div>
              <div className="w-px h-8 bg-stone-200"></div>
              <div className="text-center">
                <span className="block text-lg font-bold text-stone-800 leading-none">J-{daysUntilNext}</span>
              </div>
            </div>
          ) : undefined
        }
      />

      {/* ZONE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
        <ObjectifsTable goals={goalsList} />
      </div>
    </main>
  )
}

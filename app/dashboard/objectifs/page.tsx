import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/PageHeader'
import { ObjectifsTable } from './ObjectifsTable'
import type { Goal } from '@/types/database'

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
    .order('date', { ascending: false })

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      <PageHeader title="Mes Objectifs" />

      {/* ZONE SCROLLABLE */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
        <ObjectifsTable goals={(goals ?? []) as Goal[]} />
      </div>
    </main>
  )
}

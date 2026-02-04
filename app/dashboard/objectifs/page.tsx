import Link from 'next/link'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
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
    <div className="min-h-screen bg-stone-50bg-stone-950">
      <header className="sticky top-0 z-40 border-b border-palette-forest-dark bg-stone-50/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600text-stone-400 hover:text-stone-900hover:text-white"
          >
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-xl font-semibold text-stone-900text-white">
          Mes objectifs
        </h1>
        <p className="mt-1 text-sm text-stone-500text-stone-400">
          Ajoutez vos objectifs de course (date, nom, distance, objectif principal ou secondaire).
        </p>

        <ObjectifsTable goals={(goals ?? []) as Goal[]} />
      </main>
    </div>
  )
}

import Link from 'next/link'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { ProfileMenu } from '@/components/ProfileMenu'
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
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-stone-200/50 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600 hover:text-stone-900"
          >
            ← Tableau de bord
          </Link>
          <ProfileMenu showObjectifsLink showCoachLink showDevicesLink />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-xl font-semibold text-stone-900">
          Mes objectifs
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Ajoutez vos objectifs de course (date, nom, distance, objectif principal ou secondaire).
        </p>

        <ObjectifsTable goals={(goals ?? []) as Goal[]} />
      </main>
    </div>
  )
}

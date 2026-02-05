import Link from 'next/link'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { OffersForm } from './OffersForm'

export default async function OffersPage() {
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'coach') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: offers } = await supabase
    .from('coach_offers')
    .select('*')
    .eq('coach_id', current.id)
    .order('display_order')

  return (
    <div className="min-h-screen bg-stone-50bg-stone-950">
      <header className="sticky top-0 z-40 border-b border-palette-forest-dark bg-stone-50/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-stone-600text-stone-400 hover:text-stone-900hover:text-white"
          >
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-xl font-semibold text-stone-900text-white">
          Mon offre
        </h1>
        <p className="mt-1 text-sm text-stone-500text-stone-400">
          Définissez jusqu'à 3 offres de coaching avec leurs tarifs.
        </p>

        <OffersForm offers={offers || []} />
      </main>
    </div>
  )
}

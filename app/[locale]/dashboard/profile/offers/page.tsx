import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { PageHeader } from '@/components/PageHeader'
import { OffersForm } from './OffersForm'

export default async function OffersPage() {
  const current = await getCurrentUserWithProfile()

  if (current.profile.role !== 'coach') {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: allOffers } = await supabase
    .from('coach_offers')
    .select('*')
    .eq('coach_id', current.id)

  // Offres pour les tuiles : published + drafts, tri par display_order uniquement (affichage comme aujourd'hui)
  const offers = (allOffers ?? [])
    .filter((o) => o.status === 'published' || o.status === 'draft')
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 3)
  const archivedOffers = (allOffers ?? [])
    .filter((o): o is typeof o & { status: 'archived'; archived_at: string } => o.status === 'archived')
    .sort(
      (a, b) =>
        new Date(b.archived_at).getTime() - new Date(a.archived_at).getTime()
    )

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      <OffersForm offers={offers} archivedOffers={archivedOffers} />
    </main>
  )
}

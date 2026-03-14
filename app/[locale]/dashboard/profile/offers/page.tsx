import { getCurrentUserWithProfile } from '@/utils/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
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
    <DashboardPageShell>
      <OffersForm offers={offers} archivedOffers={archivedOffers} />
    </DashboardPageShell>
  )
}

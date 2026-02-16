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
  const { data: offers } = await supabase
    .from('coach_offers')
    .select('*')
    .eq('coach_id', current.id)
    .order('display_order')

  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      <OffersForm offers={offers || []} />
    </main>
  )
}

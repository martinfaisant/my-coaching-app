import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/auth'
import { getTranslations } from 'next-intl/server'
import { DashboardPageShell } from '@/components/DashboardPageShell'
import { MembersList } from '../../../admin/members/MembersList'

export default async function DashboardAdminMembersPage() {
  await requireRole(['admin'])
  const t = await getTranslations('admin.members')

  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, email, first_name, last_name, role, coach_id, created_at')
    .order('created_at', { ascending: false })

  return (
    <DashboardPageShell>
      <h1 className="text-2xl font-semibold text-stone-900">
        {t('title')}
      </h1>
      <p className="mt-1 text-stone-500">
        {t('description')}
      </p>
      <MembersList profiles={profiles ?? []} />
    </DashboardPageShell>
  )
}

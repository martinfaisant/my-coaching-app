import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { requireRole } from '@/utils/auth'
import { MembersList } from './MembersList'

export default async function AdminMembersPage() {
  await requireRole(['admin'])

  const supabase = await createClient()
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, email, full_name, role, coach_id, created_at')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-stone-600 hover:text-stone-900"
            >
              ← Retour au tableau de bord
            </Link>
            <Link
              href="/dashboard/admin/design-system"
              className="text-sm font-medium text-stone-500 hover:text-palette-forest-dark"
            >
              Design System
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-stone-900">
          Gestion des membres
        </h1>
        <p className="mt-1 text-stone-500">
          Liste de tous les membres et modification des rôles.
        </p>

        <MembersList profiles={profiles ?? []} />
      </main>
    </div>
  )
}

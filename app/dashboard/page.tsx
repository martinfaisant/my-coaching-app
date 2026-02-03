import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { getCurrentUserWithProfile } from '@/utils/auth'
import type { Profile } from '@/types/database'

const ROLE_LABELS: Record<Profile['role'], string> = {
  athlete: 'Athlète',
  coach: 'Coach',
  admin: 'Administrateur',
}

export default async function DashboardPage() {
  const current = await getCurrentUserWithProfile()
  const supabase = await createClient()

  // Profils visibles selon le rôle : athlète = soi, coach = soi + ses athlètes, admin = tous (via page dédiée)
  let visibleProfiles: Profile[] = []

  if (current.profile.role === 'admin') {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    visibleProfiles = (data ?? []) as Profile[]
  } else if (current.profile.role === 'coach') {
    const { data: mine } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', current.id)
      .single()
    const { data: athletes } = await supabase
      .from('profiles')
      .select('*')
      .eq('coach_id', current.id)
      .order('email')
    const list = [mine, ...(athletes ?? [])].filter(Boolean) as Profile[]
    visibleProfiles = list
  } else {
    visibleProfiles = [current.profile as Profile]
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
            Tableau de bord
          </h1>
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <p className="text-slate-600 dark:text-slate-400">
            Bienvenue <strong className="text-slate-900 dark:text-white">{current.email}</strong>
            {' '}({ROLE_LABELS[current.profile.role]}).
          </p>

          {current.profile.role === 'admin' && (
            <Link
              href="/admin/members"
              className="mt-4 inline-flex items-center rounded-xl bg-slate-900 dark:bg-white px-4 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition"
            >
              Gérer les membres et les rôles
            </Link>
          )}
        </div>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {current.profile.role === 'admin'
              ? 'Tous les membres'
              : current.profile.role === 'coach'
                ? 'Mon profil et mes athlètes'
                : 'Mon profil'}
          </h2>
          <ul className="mt-4 space-y-3">
            {visibleProfiles.map((p) => (
              <li
                key={p.user_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
              >
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{p.email}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {ROLE_LABELS[p.role]}
                    {p.coach_id && ' (athlète)'}
                  </p>
                </div>
                {p.user_id === current.id && (
                  <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                    Vous
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}

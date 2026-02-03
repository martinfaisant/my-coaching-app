import Link from 'next/link'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage() {
  const current = await getCurrentUserWithProfile()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            ← Tableau de bord
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
          Mes informations
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Modifiez votre prénom et votre nom. L&apos;adresse email est affichée à titre d&apos;information.
        </p>

        <ProfileForm
          email={current.email}
          fullName={current.profile.full_name ?? ''}
        />
      </main>
    </div>
  )
}

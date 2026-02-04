import Link from 'next/link'
import { getCurrentUserWithProfile } from '@/utils/auth'
import { ProfileForm } from './ProfileForm'

export default async function ProfilePage() {
  const current = await getCurrentUserWithProfile()

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
          Mes informations
        </h1>
        <p className="mt-1 text-sm text-stone-500text-stone-400">
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

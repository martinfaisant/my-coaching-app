import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-950 dark:to-slate-900 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200/80 dark:border-slate-700/80 p-8 sm:p-10 max-w-lg w-full">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Bienvenue {user.email}
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Vous êtes connecté à votre espace.
        </p>
      </div>
    </div>
  )
}

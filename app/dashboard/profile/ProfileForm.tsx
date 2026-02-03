'use client'

import { useActionState } from 'react'
import { updateProfile, type ProfileFormState } from './actions'

function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = (fullName || '').trim().split(/\s+/)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

type ProfileFormProps = {
  email: string
  fullName: string
}

export function ProfileForm({ email, fullName }: ProfileFormProps) {
  const [state, action] = useActionState<ProfileFormState, FormData>(updateProfile, {})
  const { firstName, lastName } = parseFullName(fullName)

  return (
    <form action={action} className="mt-8 space-y-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Adresse email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          L&apos;email ne peut pas être modifié ici.
        </p>
      </div>

      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Prénom
        </label>
        <input
          id="first_name"
          name="first_name"
          type="text"
          defaultValue={firstName}
          placeholder="Votre prénom"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
          Nom
        </label>
        <input
          id="last_name"
          name="last_name"
          type="text"
          defaultValue={lastName}
          placeholder="Votre nom"
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
      </div>

      {(state?.error || state?.success) && (
        <p
          className={`text-sm ${state.error ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
          role="alert"
        >
          {state.error || state.success}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-slate-900 dark:bg-white px-4 py-3 text-sm font-medium text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition"
      >
        Enregistrer
      </button>
    </form>
  )
}

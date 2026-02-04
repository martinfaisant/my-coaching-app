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
    <form action={action} className="mt-8 space-y-5 rounded-xl border border-stone-100border-stone-800 bg-whitebg-palette-forest-dark/50 p-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
          Adresse email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          className="w-full px-4 py-2.5 rounded-lg border border-2 border-palette-forest-dark bg-stone-50 text-stone-600 cursor-not-allowed"
        />
        <p className="mt-1.5 text-xs text-white0text-stone-400">
          L&apos;email ne peut pas être modifié ici.
        </p>
      </div>

      <div>
        <label htmlFor="first_name" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
          Prénom
        </label>
        <input
          id="first_name"
          name="first_name"
          type="text"
          defaultValue={firstName}
          placeholder="Votre prénom"
          className="w-full px-4 py-2.5 rounded-lg border border-2 border-palette-forest-dark bg-whitebg-palette-forest-dark text-stone-900text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
        />
      </div>

      <div>
        <label htmlFor="last_name" className="block text-sm font-medium text-stone-700text-stone-300 mb-2">
          Nom
        </label>
        <input
          id="last_name"
          name="last_name"
          type="text"
          defaultValue={lastName}
          placeholder="Votre nom"
          className="w-full px-4 py-2.5 rounded-lg border border-2 border-palette-forest-dark bg-whitebg-palette-forest-dark text-stone-900text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
        />
      </div>

      {(state?.error || state?.success) && (
        <p
          className={`text-sm ${state.error ? 'text-red-600' : 'text-palette-forest-dark600text-palette-forest-dark400'}`}
          role="alert"
        >
          {state.error || state.success}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-palette-forest-dark px-4 py-2.5 text-sm font-medium text-white border-2 border-palette-olive hover:bg-palette-olive transition-colors"
      >
        Enregistrer
      </button>
    </form>
  )
}

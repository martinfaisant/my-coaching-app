'use client'

import { useActionState } from 'react'
import { updateProfile, type ProfileFormState } from './actions'
import type { Role } from '@/types/database'

function parseFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = (fullName || '').trim().split(/\s+/)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: '' }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

const COACHED_SPORTS_OPTIONS: { value: string; label: string }[] = [
  { value: 'course_route', label: 'Course à pied sur route' },
  { value: 'trail', label: 'Trail' },
  { value: 'triathlon', label: 'Triathlon' },
  { value: 'velo', label: 'Vélo' },
]

const LANGUAGES_OPTIONS: { value: string; label: string }[] = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'de', label: 'Deutsch' },
  { value: 'it', label: 'Italiano' },
  { value: 'pt', label: 'Português' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'zh', label: '中文' },
]

type ProfileFormProps = {
  email: string
  fullName: string
  role: Role
  coachedSports: string[]
  languages: string[]
  presentation: string
}

export function ProfileForm({
  email,
  fullName,
  role,
  coachedSports,
  languages,
  presentation,
}: ProfileFormProps) {
  const [state, action] = useActionState<ProfileFormState, FormData>(updateProfile, {})
  const { firstName, lastName } = parseFullName(fullName)
  const isCoach = role === 'coach'

  return (
    <form action={action} className="mt-8 space-y-8">
      <section className="space-y-6 rounded-2xl border border-stone-200 bg-section p-6 shadow-sm">
        <h2 className="text-base font-semibold text-stone-900">Mes informations</h2>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            readOnly
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-600 cursor-not-allowed"
          />
          <p className="mt-1 text-xs text-stone-500">L&apos;email ne peut pas être modifié ici.</p>
        </div>
        <div>
          <label htmlFor="first_name" className="block text-sm font-medium text-stone-700 mb-1.5">
            Prénom
          </label>
          <input
            id="first_name"
            name="first_name"
            type="text"
            defaultValue={firstName}
            placeholder="Votre prénom"
            className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
          />
        </div>
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium text-stone-700 mb-1.5">
            Nom
          </label>
          <input
            id="last_name"
            name="last_name"
            type="text"
            defaultValue={lastName}
            placeholder="Votre nom"
            className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
          />
        </div>
      </section>

      {isCoach && (
        <section className="space-y-6 rounded-2xl border border-stone-200 bg-section p-6 shadow-sm">
          <h2 className="text-base font-semibold text-stone-900">Ma pratique</h2>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Sports coachés
            </label>
            <div className="flex flex-wrap gap-3">
              {COACHED_SPORTS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="coached_sports"
                    value={opt.value}
                    defaultChecked={coachedSports.includes(opt.value)}
                    className="h-4 w-4 rounded border-stone-300 text-palette-forest-dark focus:ring-palette-olive"
                  />
                  <span className="text-sm text-stone-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Langues que je parle
            </label>
            <div className="flex flex-wrap gap-3">
              {LANGUAGES_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    name="languages"
                    value={opt.value}
                    defaultChecked={languages.includes(opt.value)}
                    className="h-4 w-4 rounded border-stone-300 text-palette-forest-dark focus:ring-palette-olive"
                  />
                  <span className="text-sm text-stone-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="presentation" className="block text-sm font-medium text-stone-700 mb-1.5">
              Présentation
            </label>
            <textarea
              id="presentation"
              name="presentation"
              rows={5}
              defaultValue={presentation}
              placeholder="Décrivez votre parcours, votre approche du coaching, vos spécialités..."
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent resize-y min-h-[120px]"
            />
          </div>
        </section>
      )}

      {(state?.error || state?.success) && (
        <p
          className={`text-sm ${state.error ? 'text-red-600' : 'text-palette-forest-dark'}`}
          role="alert"
        >
          {state.error || state.success}
        </p>
      )}

      <button
        type="submit"
        className="w-full rounded-lg bg-palette-forest-dark px-4 py-3 text-sm font-medium text-white hover:bg-palette-olive transition-colors focus:outline-none focus:ring-2 focus:ring-palette-olive focus:ring-offset-2"
      >
        Enregistrer
      </button>
    </form>
  )
}

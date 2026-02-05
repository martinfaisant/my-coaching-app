'use client'

import { useState, useEffect } from 'react'
import { useActionState } from 'react'
import { PrimaryButton } from '@/components/PrimaryButton'
import { createClient } from '@/utils/supabase/client'
import { updateProfile, checkCanDeleteAccount, deleteMyAccount, type ProfileFormState } from './actions'
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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteBlockReason, setDeleteBlockReason] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { firstName, lastName } = parseFullName(fullName)
  const isCoach = role === 'coach'

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isDeleting) setDeleteModalOpen(false)
    }
    if (deleteModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [deleteModalOpen, isDeleting])

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

      <PrimaryButton type="submit" fullWidth>
        Enregistrer
      </PrimaryButton>

      <div className="mt-2 pt-3 border-t border-stone-200">
        <button
          type="button"
          onClick={async () => {
            setDeleteBlockReason(null)
            setDeleteError(null)
            const result = await checkCanDeleteAccount()
            if (!result.canDelete) {
              setDeleteBlockReason(result.error ?? 'La suppression n\'est pas possible.')
              return
            }
            setDeleteModalOpen(true)
          }}
          className="w-full py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Supprimer mon compte
        </button>
        {deleteBlockReason && (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {deleteBlockReason}
          </p>
        )}
      </div>

      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <div
            className="absolute inset-0 bg-palette-forest-dark/50 backdrop-blur-sm"
            onClick={() => !isDeleting && setDeleteModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-stone-100">
            <div className="sticky top-0 flex justify-end p-3 bg-white rounded-t-xl z-10">
              <button
                type="button"
                onClick={() => !isDeleting && setDeleteModalOpen(false)}
                className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="px-8 pb-8">
              <h2 id="delete-account-title" className="text-xl font-semibold text-stone-900 mb-2">
                Supprimer mon compte
              </h2>
              <p className="text-sm text-stone-600 mb-8">
                Vous allez perdre toutes vos données. Cette action est irréversible. Êtes-vous sûr de vouloir supprimer votre compte ?
              </p>
              {deleteError && (
                <p className="text-sm text-red-600 mb-4" role="alert">{deleteError}</p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
                >
                  Retour
                </button>
                <PrimaryButton
                  type="button"
                  onClick={async () => {
                    setIsDeleting(true)
                    setDeleteError(null)
                    const result = await deleteMyAccount()
                    if (result.error) {
                      setDeleteError(result.error)
                      setIsDeleting(false)
                      return
                    }
                    await createClient().auth.signOut()
                    window.location.href = '/'
                  }}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Suppression...' : 'Confirmer'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

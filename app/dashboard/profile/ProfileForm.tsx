'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components/PrimaryButton'
import { createClient } from '@/utils/supabase/client'
import { updateProfile, checkCanDeleteAccount, deleteMyAccount, type ProfileFormState } from './actions'
import type { Role } from '@/types/database'
import { compressProfileImage } from '@/utils/imageCompress'

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
  avatarUrl: string
  coachedSports: string[]
  languages: string[]
  presentation: string
}

export function ProfileForm({
  email,
  fullName,
  role,
  avatarUrl,
  coachedSports,
  languages,
  presentation,
}: ProfileFormProps) {
  const router = useRouter()
  const [state, action] = useActionState<ProfileFormState, FormData>(updateProfile, {})
  const [avatarUrlState, setAvatarUrlState] = useState(avatarUrl)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteBlockReason, setDeleteBlockReason] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false)
  const isSubmittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const { firstName, lastName } = parseFullName(fullName)
  const isCoach = role === 'coach'

  // Valeurs initiales pour détecter les modifications
  const initialValuesRef = useRef({
    firstName,
    lastName,
    avatarUrl,
    coachedSports: [...coachedSports].sort(),
    languages: [...languages].sort(),
    presentation: presentation || '',
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Fonction pour vérifier les modifications
  const checkUnsavedChanges = useCallback(() => {
    const form = formRef.current
    if (!form) return false

    const currentFirstName = (form.querySelector('[name="first_name"]') as HTMLInputElement)?.value.trim() || ''
    const currentLastName = (form.querySelector('[name="last_name"]') as HTMLInputElement)?.value.trim() || ''
    const currentFullName = [currentFirstName, currentLastName].filter(Boolean).join(' ').trim()
    const initialFullName = [initialValuesRef.current.firstName, initialValuesRef.current.lastName].filter(Boolean).join(' ').trim()

    if (currentFullName !== initialFullName) return true
    if (avatarUrlState !== initialValuesRef.current.avatarUrl) return true

    if (isCoach) {
      const currentCoachedSports = Array.from(form.querySelectorAll<HTMLInputElement>('[name="coached_sports"]:checked'))
        .map((cb) => cb.value)
        .sort()
      if (JSON.stringify(currentCoachedSports) !== JSON.stringify(initialValuesRef.current.coachedSports)) return true

      const currentLanguages = Array.from(form.querySelectorAll<HTMLInputElement>('[name="languages"]:checked'))
        .map((cb) => cb.value)
        .sort()
      if (JSON.stringify(currentLanguages) !== JSON.stringify(initialValuesRef.current.languages)) return true

      const currentPresentation = (form.querySelector('[name="presentation"]') as HTMLTextAreaElement)?.value.trim() || ''
      if (currentPresentation !== initialValuesRef.current.presentation) return true
    }

    return false
  }, [isCoach, avatarUrlState])

  // Mettre à jour l'état des modifications
  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const updateUnsavedChanges = () => {
      setHasUnsavedChanges(checkUnsavedChanges())
    }

    // Écouter les changements dans tous les champs
    const inputs = form.querySelectorAll('input, textarea')
    inputs.forEach((input) => {
      input.addEventListener('input', updateUnsavedChanges)
      input.addEventListener('change', updateUnsavedChanges)
    })

    return () => {
      inputs.forEach((input) => {
        input.removeEventListener('input', updateUnsavedChanges)
        input.removeEventListener('change', updateUnsavedChanges)
      })
    }
  }, [checkUnsavedChanges])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setAvatarUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const blob = await compressProfileImage(file)
      const path = `${user.id}/avatar.jpg`
      const { error } = await supabase.storage.from('avatars').upload(path, blob, {
        contentType: 'image/jpeg',
        upsert: true,
      })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      // Ajouter un paramètre de cache-busting pour forcer le rechargement de l'image
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`
      setAvatarUrlState(urlWithCacheBust)
    } catch (err) {
      console.error(err)
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  // Réinitialiser les valeurs initiales après une sauvegarde réussie
  useEffect(() => {
    if (state?.success) {
      const form = formRef.current
      if (form) {
        const currentFirstName = (form.querySelector('[name="first_name"]') as HTMLInputElement)?.value.trim() || ''
        const currentLastName = (form.querySelector('[name="last_name"]') as HTMLInputElement)?.value.trim() || ''
        const currentCoachedSports = Array.from(form.querySelectorAll<HTMLInputElement>('[name="coached_sports"]:checked'))
          .map((cb) => cb.value)
          .sort()
        const currentLanguages = Array.from(form.querySelectorAll<HTMLInputElement>('[name="languages"]:checked'))
          .map((cb) => cb.value)
          .sort()
        const currentPresentation = (form.querySelector('[name="presentation"]') as HTMLTextAreaElement)?.value.trim() || ''
        
        initialValuesRef.current = {
          firstName: currentFirstName,
          lastName: currentLastName,
          avatarUrl: avatarUrlState,
          coachedSports: currentCoachedSports,
          languages: currentLanguages,
          presentation: currentPresentation,
        }
        setHasUnsavedChanges(false)
      }
    }
  }, [state?.success, avatarUrlState])

  // Intercepter la fermeture de page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isSubmittingRef.current && hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  // Réinitialiser le flag après la soumission
  useEffect(() => {
    if (state?.success || state?.error) {
      isSubmittingRef.current = false
    }
  }, [state])

  // Intercepter les clics sur les liens
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      if (isSubmittingRef.current) return
      
      const target = e.target as HTMLElement
      const link = target.closest('a')
      if (!link) return

      const href = link.getAttribute('href')
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return

      if (hasUnsavedChanges) {
        e.preventDefault()
        setPendingNavigation(href)
        setUnsavedChangesModalOpen(true)
      }
    }

    document.addEventListener('click', handleLinkClick, true)
    return () => document.removeEventListener('click', handleLinkClick, true)
  }, [hasUnsavedChanges])

  // Gérer la soumission du formulaire
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    isSubmittingRef.current = true
    // Laisser le formulaire se soumettre normalement
  }

  // Intercepter la navigation programmatique (bouton retour)
  useEffect(() => {
    const handlePopState = () => {
      if (hasUnsavedChanges && !isSubmittingRef.current) {
        const confirmed = window.confirm(
          'Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?'
        )
        if (!confirmed) {
          window.history.pushState(null, '', window.location.href)
        } else {
          setHasUnsavedChanges(false)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [hasUnsavedChanges])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (unsavedChangesModalOpen && !isSavingBeforeLeave) {
          setUnsavedChangesModalOpen(false)
          setPendingNavigation(null)
        } else if (deleteModalOpen && !isDeleting) {
          setDeleteModalOpen(false)
        }
      }
    }
    if (deleteModalOpen || unsavedChangesModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [deleteModalOpen, unsavedChangesModalOpen, isDeleting, isSavingBeforeLeave])

  const handleSaveAndLeave = async () => {
    if (!formRef.current) return
    setIsSavingBeforeLeave(true)
    const formData = new FormData(formRef.current)
    const result = await updateProfile({}, formData)
    setIsSavingBeforeLeave(false)
    
    if (!result.error) {
      setUnsavedChangesModalOpen(false)
      if (pendingNavigation) {
        router.push(pendingNavigation)
      }
      setPendingNavigation(null)
    }
  }

  const handleLeaveWithoutSaving = () => {
    setUnsavedChangesModalOpen(false)
    if (pendingNavigation) {
      router.push(pendingNavigation)
    }
    setPendingNavigation(null)
  }

  return (
    <>
      <form ref={formRef} action={action} onSubmit={handleFormSubmit} className="mt-8 space-y-8">
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
              Photo de profil
            </label>
            <input 
              type="hidden" 
              name="avatar_url" 
              value={avatarUrlState ? avatarUrlState.split('?')[0] : ''} 
            />
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-stone-200 flex items-center justify-center">
                {avatarUrlState ? (
                  <img 
                    src={avatarUrlState} 
                    alt="Photo de profil" 
                    className="w-full h-full object-cover"
                    key={avatarUrlState}
                  />
                ) : (
                  <span className="text-2xl font-bold text-stone-400">?</span>
                )}
              </div>
              <div>
                <label className="cursor-pointer inline-flex items-center rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    disabled={avatarUploading}
                    className="sr-only"
                  />
                  {avatarUploading ? 'Chargement...' : 'Choisir une photo'}
                </label>
              </div>
            </div>
          </div>

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

      {unsavedChangesModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-changes-title"
        >
          <div
            className="absolute inset-0 bg-palette-forest-dark/50 backdrop-blur-sm"
            onClick={() => !isSavingBeforeLeave && setUnsavedChangesModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-stone-100">
            <div className="sticky top-0 flex justify-end p-3 bg-white rounded-t-xl z-10">
              <button
                type="button"
                onClick={() => !isSavingBeforeLeave && setUnsavedChangesModalOpen(false)}
                className="p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-colors"
                aria-label="Fermer"
                disabled={isSavingBeforeLeave}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="px-8 pb-8">
              <h2 id="unsaved-changes-title" className="text-xl font-semibold text-stone-900 mb-2">
                Modifications non enregistrées
              </h2>
              <p className="text-sm text-stone-600 mb-8">
                Vous avez des modifications non enregistrées. Que souhaitez-vous faire ?
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleLeaveWithoutSaving}
                  disabled={isSavingBeforeLeave}
                  className="flex-1 py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
                >
                  Quitter sans enregistrer
                </button>
                <PrimaryButton
                  type="button"
                  onClick={handleSaveAndLeave}
                  disabled={isSavingBeforeLeave}
                  className="flex-1"
                >
                  {isSavingBeforeLeave ? 'Enregistrement...' : 'Enregistrer et quitter'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

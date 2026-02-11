'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'
import { useActionState } from 'react'
import { createPortal } from 'react-dom'
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

const COACHED_SPORTS_OPTIONS: { value: string; label: string; emoji: string }[] = [
  { value: 'triathlon', label: 'Triathlon', emoji: '🏊‍♂️' },
  { value: 'course_route', label: 'Course à pied', emoji: '🏃' },
  { value: 'trail', label: 'Trail', emoji: '⛰️' },
  { value: 'velo', label: 'Vélo', emoji: '🚴' },
]

/** Mêmes sports que pour les entraînements (tuiles profil athlète). */
const PRACTICED_SPORTS_OPTIONS: { value: string; label: string; emoji: string }[] = [
  { value: 'course', label: 'Course', emoji: '🏃' },
  { value: 'velo', label: 'Vélo', emoji: '🚴' },
  { value: 'natation', label: 'Natation', emoji: '🏊' },
  { value: 'musculation', label: 'Musculation', emoji: '💪' },
  { value: 'trail', label: 'Trail', emoji: '⛰️' },
  { value: 'triathlon', label: 'Triathlon', emoji: '🏅' },
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
  practicedSports: string[]
  languages: string[]
  presentation: string
  postalCode: string
}

export function ProfileForm({
  email,
  fullName,
  role,
  avatarUrl,
  coachedSports,
  practicedSports,
  languages,
  presentation,
  postalCode,
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
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const hiddenAvatarUrlRef = useRef<HTMLInputElement>(null)
  const { firstName, lastName } = parseFullName(fullName)
  const isCoach = role === 'coach'
  const [presentationLength, setPresentationLength] = useState((presentation || '').length)

  // Valeurs initiales pour détecter les modifications
  const initialValuesRef = useRef({
    firstName,
    lastName,
    avatarUrl,
    postalCode: postalCode || '',
    coachedSports: [...coachedSports].sort(),
    practicedSports: [...practicedSports].sort(),
    languages: [...languages].sort(),
    presentation: presentation || '',
  })

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previousIsSubmittingRef = useRef(false)
  const prevAvatarUrlPropRef = useRef(avatarUrl)

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

    const currentPostalCode = (form.querySelector('[name="postal_code"]') as HTMLInputElement)?.value.trim() || ''
    if (currentPostalCode !== initialValuesRef.current.postalCode) return true

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
    } else {
      const currentPracticedSports = Array.from(form.querySelectorAll<HTMLInputElement>('[name="practiced_sports"]:checked'))
        .map((cb) => cb.value)
        .sort()
      if (JSON.stringify(currentPracticedSports) !== JSON.stringify(initialValuesRef.current.practicedSports)) return true
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
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`
      setAvatarUrlState(urlWithCacheBust)
      // L'avatar sera enregistré en base au clic sur "Enregistrer" (champ caché avatar_url)
      initialValuesRef.current.avatarUrl = urlWithCacheBust
      setTimeout(() => setHasUnsavedChanges(checkUnsavedChanges()), 0)
    } catch (err) {
      console.error(err)
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  // À chaque succès : afficher "Enregistré", réinitialiser les valeurs de référence et hasUnsavedChanges (une seule dépendance pour taille constante)
  const saveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isSubmitting}`
  useEffect(() => {
    const justFinishedSubmitting = previousIsSubmittingRef.current && !isSubmitting
    previousIsSubmittingRef.current = isSubmitting

    if (state?.success && justFinishedSubmitting) {
      setShowSavedFeedback(true)
      router.refresh()
      const t = setTimeout(() => setShowSavedFeedback(false), 2500)
      // Réinitialiser tout de suite pour que la modale "quitter sans enregistrer" ne s'affiche pas
      const form = formRef.current
      if (form) {
        const currentFirstName = (form.querySelector('[name="first_name"]') as HTMLInputElement)?.value.trim() || ''
        const currentLastName = (form.querySelector('[name="last_name"]') as HTMLInputElement)?.value.trim() || ''
        const currentPostalCode = (form.querySelector('[name="postal_code"]') as HTMLInputElement)?.value.trim() || ''
        const currentCoachedSports = Array.from(form.querySelectorAll<HTMLInputElement>('[name="coached_sports"]:checked'))
          .map((cb) => cb.value)
          .sort()
        const currentPracticedSports = Array.from(form.querySelectorAll<HTMLInputElement>('[name="practiced_sports"]:checked'))
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
          postalCode: currentPostalCode,
          coachedSports: currentCoachedSports,
          practicedSports: currentPracticedSports,
          languages: currentLanguages,
          presentation: currentPresentation,
        }
        setHasUnsavedChanges(false)
      }
      return () => clearTimeout(t)
    }
    if (state?.error) {
      setShowSavedFeedback(false)
    }
  }, [saveFeedbackKey])

  // Réinitialiser "Enregistré" dès qu'une nouvelle modification est détectée
  useEffect(() => {
    if (hasUnsavedChanges && showSavedFeedback) {
      setShowSavedFeedback(false)
    }
  }, [hasUnsavedChanges, showSavedFeedback])

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

  // Réinitialiser le flag et l'état submitting après la soumission
  useEffect(() => {
    if (state?.success || state?.error) {
      isSubmittingRef.current = false
      setIsSubmitting(false)
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

  // Quand la prop avatarUrl change (ex. retour sur la page, refresh après enregistrement), afficher la bonne image
  useEffect(() => {
    if (avatarUploading) return
    if (prevAvatarUrlPropRef.current !== avatarUrl) {
      prevAvatarUrlPropRef.current = avatarUrl
      const url = avatarUrl || ''
      setAvatarUrlState(url)
      initialValuesRef.current.avatarUrl = url
    }
  }, [avatarUrl, avatarUploading])

  // Garder le champ caché avatar_url synchronisé avec l'état (garantit la bonne URL au submit)
  useLayoutEffect(() => {
    const el = hiddenAvatarUrlRef.current
    if (!el) return
    const url = avatarUrlState ? avatarUrlState.split('?')[0] : ''
    if (el.value !== url) el.value = url
  }, [avatarUrlState])

  // Gérer la soumission du formulaire
  const handleFormSubmit = () => {
    // Forcer la valeur du champ caché avatar_url au moment du submit (évite toute valeur obsolète)
    const hidden = hiddenAvatarUrlRef.current
    if (hidden) hidden.value = avatarUrlState ? avatarUrlState.split('?')[0] : ''
    isSubmittingRef.current = true
    setIsSubmitting(true)
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

  // Même structure pour coach et athlète : bannière, photo de profil, formulaire
  return (
    <>
      <form ref={formRef} action={action} onSubmit={handleFormSubmit} className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
        {/* BANNIÈRE BRANDÉE : Dégradé Forest Dark -> Olive */}
        <div className="h-[136px] bg-gradient-to-r from-[#627e59] to-[#8e9856] relative">
          {/* Avatar positionné sur la bannière */}
          <div className="absolute -bottom-10 left-8">
            <div className="relative group cursor-pointer">
              {/* Cercle de fond (Placeholder ou photo) */}
              <div className="w-28 h-28 rounded-full bg-stone-100 border-4 border-white shadow-md flex items-center justify-center text-stone-300 overflow-hidden group-hover:bg-stone-200 transition-colors">
                {avatarUrlState ? (
                  <img src={avatarUrlState} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 transform translate-y-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* Bouton d'ajout (+) */}
              <div 
                className="absolute bottom-1 right-1 bg-[#627e59] text-white p-1.5 rounded-full shadow-lg border-2 border-white hover:bg-[#506648] transition-transform group-hover:scale-110 flex items-center justify-center cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={avatarUploading}
                className="sr-only"
              />
              <input 
                ref={hiddenAvatarUrlRef}
                type="hidden" 
                name="avatar_url" 
                defaultValue={avatarUrl ? avatarUrl.split('?')[0] : ''} 
              />
            </div>
          </div>
        </div>

        {/* Contenu du formulaire */}
        <div className="pt-16 pb-8 px-8">
          {/* Header section + Bouton Enregistrer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">Mes informations</h1>
              <p className="text-stone-500 text-sm">
                {isCoach ? 'Complétez votre profil pour vos athlètes.' : 'Gérez vos informations et votre photo de profil.'}
              </p>
            </div>
            <PrimaryButton
              type="submit"
              disabled={!hasUnsavedChanges || isSubmitting}
              className={`flex items-center gap-2 ${state?.error ? '!bg-red-600 hover:!bg-red-700 focus:!ring-red-500' : ''}`}
            >
              {showSavedFeedback ? (
                <>
                  <span>Enregistré</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 animate-saved-check" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </>
              ) : state?.error ? (
                <>
                  <span>Non enregistré</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </>
              ) : isSubmitting ? (
                'Enregistrement...'
              ) : (
                <span>Enregistrer</span>
              )}
            </PrimaryButton>
            {state?.error && (
              <p className="text-sm text-red-600 mt-3" role="alert">
                {state.error}
              </p>
            )}
          </div>

          {/* Grille Informations Personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
            {/* Prénom */}
            <div className="md:col-span-6 input-group">
              <label htmlFor="first_name" className="block text-xs text-stone-500 uppercase tracking-wide font-bold mb-1.5">Prénom</label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                defaultValue={firstName}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 outline-none text-stone-900 bg-stone-50 focus:bg-white transition-colors focus:border-[#627e59] focus:ring-2 focus:ring-[#627e59]/20"
              />
            </div>
            
            {/* Nom */}
            <div className="md:col-span-6 input-group">
              <label htmlFor="last_name" className="block text-xs text-stone-500 uppercase tracking-wide font-bold mb-1.5">Nom</label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                defaultValue={lastName}
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 outline-none text-stone-900 bg-stone-50 focus:bg-white transition-colors focus:border-[#627e59] focus:ring-2 focus:ring-[#627e59]/20"
              />
            </div>

            {/* Email */}
            <div className="md:col-span-8 relative">
              <label htmlFor="email" className="block text-xs text-stone-500 uppercase tracking-wide font-bold mb-1.5 flex justify-between">
                Adresse email
                <span className="text-[10px] font-normal normal-case text-stone-400 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Non modifiable
                </span>
              </label>
              <input
                id="email"
                type="text"
                value={email}
                readOnly
                className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none text-stone-500 bg-stone-100 cursor-not-allowed"
              />
            </div>

            {/* Code Postal */}
            <div className="md:col-span-4 input-group">
              <label htmlFor="postal_code" className="block text-xs text-stone-500 uppercase tracking-wide font-bold mb-1.5">Code Postal</label>
              <input
                id="postal_code"
                name="postal_code"
                type="text"
                defaultValue={postalCode}
                placeholder="Ex: 75001"
                className="w-full border border-stone-300 rounded-lg px-4 py-2.5 outline-none text-stone-900 bg-stone-50 focus:bg-white transition-colors focus:border-[#627e59] focus:ring-2 focus:ring-[#627e59]/20"
              />
            </div>
          </div>

          <hr className="border-stone-100 my-8" />

          {/* Section Sports : coach = sports coachés, athlète = sports pratiqués */}
          <div className="mb-8">
            {isCoach ? (
              <>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">Sports coachés</h2>
                <div className="flex flex-wrap gap-3">
                  {COACHED_SPORTS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="coached_sports"
                        value={opt.value}
                        defaultChecked={coachedSports.includes(opt.value)}
                        className="hidden chip-checkbox"
                      />
                      <div className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 hover:border-[#627e59] transition-all text-sm font-medium select-none flex items-center gap-2">
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">Sport(s) pratiqué(s)</h2>
                <div className="flex flex-wrap gap-3">
                  {PRACTICED_SPORTS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="cursor-pointer">
                      <input
                        type="checkbox"
                        name="practiced_sports"
                        value={opt.value}
                        defaultChecked={practicedSports.includes(opt.value)}
                        className="hidden chip-checkbox"
                      />
                      <div className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 hover:border-[#627e59] transition-all text-sm font-medium select-none flex items-center gap-2">
                        <span>{opt.emoji}</span>
                        <span>{opt.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Section Langues (coach uniquement) */}
          {isCoach && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">Langues parlées</h2>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES_OPTIONS.map((opt) => (
                <label key={opt.value} className="cursor-pointer">
                  <input
                    type="checkbox"
                    name="languages"
                    value={opt.value}
                    defaultChecked={languages.includes(opt.value)}
                    className="hidden chip-checkbox"
                  />
                  <div className="px-3 py-1.5 rounded-md border border-stone-200 bg-white text-stone-600 hover:border-[#627e59] transition-all text-sm font-medium select-none">
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>
          )}

          {isCoach && (
          <hr className="border-stone-100 my-8" />
          )}

          {/* Bio (coach uniquement) */}
          {isCoach && (
          <div className="input-group">
            <div className="flex justify-between items-end mb-2">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide">Présentation</h2>
              <span className="text-xs text-stone-400">Pour votre profil public</span>
            </div>
            <div className="relative">
              <textarea
                name="presentation"
                defaultValue={presentation}
                onChange={(e) => setPresentationLength(e.target.value.length)}
                rows={8}
                placeholder="Décrivez votre expérience..."
                className="w-full border border-stone-300 rounded-xl p-4 text-stone-700 focus:outline-none transition-all leading-relaxed text-sm bg-stone-50 focus:bg-white resize-y focus:border-[#627e59] focus:ring-2 focus:ring-[#627e59]/20"
              />
              <div className="absolute bottom-3 right-3 text-[10px] text-stone-400 font-medium bg-white/80 px-2 py-1 rounded">
                {presentationLength} / 500
              </div>
            </div>
          </div>
          )}

          {/* Danger Zone */}
          <div className="mt-16 pt-6 border-t border-stone-100 flex flex-col items-center">
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
              className="text-stone-400 hover:text-red-600 text-xs font-medium transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer mon compte
            </button>
            <div className="min-h-[2.5rem] mt-2 text-center w-full max-w-md">
              {deleteBlockReason && (
                <p className="text-sm text-red-600" role="alert">
                  {deleteBlockReason}
                </p>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* Modales (identique à avant) */}
      {deleteModalOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 bg-palette-forest-dark/50 backdrop-blur-sm z-[90]"
            onClick={() => !isDeleting && setDeleteModalOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-account-title"
          >
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
        </>,
        document.body
      )}

      {unsavedChangesModalOpen && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 bg-palette-forest-dark/50 backdrop-blur-sm z-[90]"
            onClick={() => !isSavingBeforeLeave && setUnsavedChangesModalOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="unsaved-changes-title"
          >
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
        </>, document.body
      )}
    </>
  )
}

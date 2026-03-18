'use client'

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { LanguagePrefixTextarea } from '@/components/LanguagePrefixField'
import { Modal } from '@/components/Modal'
import { LogoutButton } from '@/components/LogoutButton'
import { SportTileSelectable } from '@/components/SportTileSelectable'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { createClient } from '@/utils/supabase/client'
import { updateProfile, checkCanDeleteAccount, deleteMyAccount, type ProfileFormState } from './actions'
import type { Role } from '@/types/database'
import { compressProfileImage } from '@/utils/imageCompress'
import { logger } from '@/lib/logger'

import { LANGUAGES_OPTIONS } from '@/lib/sportsOptions'
import { useCoachedSportsOptions, usePracticedSportsOptions } from '@/lib/hooks/useSportsOptions'
import { SPORT_ICONS, SPORT_CARD_STYLES, SPORT_TRANSLATION_KEYS, getWeeklyVolumeUnit } from '@/lib/sportStyles'
import type { SportType } from '@/lib/sportStyles'

/** Ordre stable pour afficher les sports dans la section volume (triathlon → course, vélo, natation). */
const DISPLAY_SPORTS_ORDER = ['course', 'velo', 'natation', 'musculation', 'trail', 'triathlon'] as const

type ProfileFormProps = {
  email: string
  firstName: string
  lastName: string
  role: Role
  avatarUrl: string
  coachedSports: string[]
  practicedSports: string[]
  languages: string[]
  /** Langue d'affichage préférée (fr/en). Null = non définie. */
  preferredLocale?: string | null
  /** Présentation (athlète : non utilisé ; coach : conservé pour rétrocompat, préférer presentationFr/En). */
  presentation: string
  /** Présentation du coach en français. */
  presentationFr?: string
  /** Présentation du coach en anglais. */
  presentationEn?: string
  postalCode: string
  /** Volume actuel (heures/sem.), athlète uniquement. */
  weeklyCurrentHours?: number | null
  /** Volume maximum (heures/sem.), athlète uniquement. */
  weeklyTargetHours?: number | null
  /** Volume par sport (km, m ou h), athlète uniquement. */
  weeklyVolumeBySport?: Record<string, number> | null
}

export function ProfileForm({
  email,
  firstName,
  lastName,
  role,
  avatarUrl,
  coachedSports,
  practicedSports,
  languages,
  presentation,
  presentationFr = '',
  presentationEn = '',
  postalCode,
  preferredLocale: preferredLocaleProp = null,
  weeklyCurrentHours = null,
  weeklyTargetHours = null,
  weeklyVolumeBySport = null,
}: ProfileFormProps) {
  const locale = useLocale()
  const effectiveInitialLocale = preferredLocaleProp === 'fr' || preferredLocaleProp === 'en' ? preferredLocaleProp : (locale === 'en' ? 'en' : 'fr')
  const tProfile = useTranslations('profile')
  const tSports = useTranslations('sports')
  const tCommon = useTranslations('common')
  const router = useRouter()
  const coachedSportsOptions = useCoachedSportsOptions()
  const practicedSportsOptions = usePracticedSportsOptions()
  const [state, action] = useActionState<ProfileFormState, FormData>(updateProfile, {})
  const [avatarUrlState, setAvatarUrlState] = useState(avatarUrl)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [deleteBlockReason, setDeleteBlockReason] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCheckingDelete, setIsCheckingDelete] = useState(false)
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false)
  const isSubmittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const hiddenAvatarUrlRef = useRef<HTMLInputElement>(null)
  const isCoach = role === 'coach'
  const [presentationFrLength, setPresentationFrLength] = useState((presentationFr || '').length)
  const [presentationEnLength, setPresentationEnLength] = useState((presentationEn || '').length)

  /** Sports pratiqués sélectionnés (état local pour mise à jour dynamique des tuiles volume). */
  const [selectedPracticedSports, setSelectedPracticedSports] = useState<string[]>(() => [...practicedSports].sort())
  useEffect(() => {
    setSelectedPracticedSports((prev) => {
      const next = [...practicedSports].sort()
      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next
    })
  }, [practicedSports])

  /** Liste des sports pour la section volume : triathlon → course, vélo, natation ; trail n’a pas de tuile dédiée (champ D+ dans la tuile Course). */
  const displaySportsForVolume = useMemo(() => {
    const expanded = selectedPracticedSports.flatMap((s) =>
      s === 'triathlon' ? ['course', 'velo', 'natation'] : [s]
    )
    const withoutTrail = expanded.filter((s) => s !== 'trail')
    if (selectedPracticedSports.includes('trail') && !withoutTrail.includes('course')) {
      withoutTrail.push('course')
    }
    return DISPLAY_SPORTS_ORDER.filter((s) => withoutTrail.includes(s))
  }, [selectedPracticedSports])

  // Valeurs initiales pour détecter les modifications
  const initialValuesRef = useRef({
    firstName,
    lastName,
    avatarUrl,
    postalCode: postalCode || '',
    preferredLocale: effectiveInitialLocale,
    coachedSports: [...coachedSports].sort(),
    practicedSports: [...practicedSports].sort(),
    languages: [...languages].sort(),
    presentation: presentation || '',
    presentationFr: presentationFr || '',
    presentationEn: presentationEn || '',
    weeklyCurrentHours: weeklyCurrentHours ?? '',
    weeklyTargetHours: weeklyTargetHours ?? '',
    weeklyVolumeBySport: JSON.stringify(weeklyVolumeBySport ?? {}),
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

      const currentPresentationFr = (form.querySelector('[name="presentation_fr"]') as HTMLTextAreaElement)?.value.trim() || ''
      const currentPresentationEn = (form.querySelector('[name="presentation_en"]') as HTMLTextAreaElement)?.value.trim() || ''
      if (currentPresentationFr !== initialValuesRef.current.presentationFr) return true
      if (currentPresentationEn !== initialValuesRef.current.presentationEn) return true
    } else {
      const currentPracticedSports = Array.from(form.querySelectorAll<HTMLInputElement>('[name="practiced_sports"]:checked'))
        .map((cb) => cb.value)
        .sort()
      if (JSON.stringify(currentPracticedSports) !== JSON.stringify(initialValuesRef.current.practicedSports)) return true

      const currentWeeklyCurrent = (form.querySelector('[name="weekly_current_hours"]') as HTMLInputElement)?.value.trim() ?? ''
      if (currentWeeklyCurrent !== String(initialValuesRef.current.weeklyCurrentHours)) return true
      const currentWeeklyTarget = (form.querySelector('[name="weekly_target_hours"]') as HTMLInputElement)?.value.trim() ?? ''
      if (currentWeeklyTarget !== String(initialValuesRef.current.weeklyTargetHours)) return true

      const expandedForVolume = currentPracticedSports.flatMap((s) =>
        s === 'triathlon' ? ['course', 'velo', 'natation'] : [s]
      )
      const volumeDisplayList = DISPLAY_SPORTS_ORDER.filter((s) => expandedForVolume.includes(s))
      const currentVolume: Record<string, number> = {}
      volumeDisplayList.forEach((sport) => {
        const el = form.querySelector(`[name="weekly_volume_${sport}"]`) as HTMLInputElement
        const v = el?.value.trim() ?? ''
        if (v !== '') {
          const parsed = parseFloat(v.replace(',', '.'))
          if (!Number.isNaN(parsed)) currentVolume[sport] = parsed
        }
      })
      const initialVolume = JSON.parse(initialValuesRef.current.weeklyVolumeBySport) as Record<string, number>
      if (currentPracticedSports.includes('trail')) {
        const el = form.querySelector('[name="weekly_volume_course_elevation_m"]') as HTMLInputElement
        const v = el?.value.trim() ?? ''
        const parsed = v !== '' ? parseFloat(v.replace(',', '.')) : NaN
        const currentElevation = !Number.isNaN(parsed) ? parsed : undefined
        if (String(currentElevation ?? '') !== String(initialVolume.course_elevation_m ?? '')) return true
      }
      for (const sport of volumeDisplayList) {
        if (String(currentVolume[sport] ?? '') !== String(initialVolume[sport] ?? '')) return true
      }
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
      logger.error('Avatar upload failed', err)
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
        const currentPresentationFr = (form.querySelector('[name="presentation_fr"]') as HTMLTextAreaElement)?.value.trim() || ''
        const currentPresentationEn = (form.querySelector('[name="presentation_en"]') as HTMLTextAreaElement)?.value.trim() || ''
        const currentWeeklyCurrent = (form.querySelector('[name="weekly_current_hours"]') as HTMLInputElement)?.value.trim() ?? ''
        const currentWeeklyTarget = (form.querySelector('[name="weekly_target_hours"]') as HTMLInputElement)?.value.trim() ?? ''
        const expandedForVolume = currentPracticedSports.flatMap((s) =>
          s === 'triathlon' ? ['course', 'velo', 'natation'] : [s]
        )
        const volumeDisplayList = DISPLAY_SPORTS_ORDER.filter((s) => expandedForVolume.includes(s))
        const currentVolume: Record<string, number> = {}
        volumeDisplayList.forEach((sport) => {
          const el = form.querySelector(`[name="weekly_volume_${sport}"]`) as HTMLInputElement
          const v = el?.value.trim() ?? ''
          if (v !== '') {
            const parsed = parseFloat(v.replace(',', '.'))
            if (!Number.isNaN(parsed)) currentVolume[sport] = parsed
          }
        })
        if (currentPracticedSports.includes('trail')) {
          const el = form.querySelector('[name="weekly_volume_course_elevation_m"]') as HTMLInputElement
          const v = el?.value.trim() ?? ''
          if (v !== '') {
            const parsed = parseFloat(v.replace(',', '.'))
            if (!Number.isNaN(parsed)) currentVolume.course_elevation_m = parsed
          }
        }
        initialValuesRef.current = {
          ...initialValuesRef.current,
          firstName: currentFirstName,
          lastName: currentLastName,
          avatarUrl: avatarUrlState,
          postalCode: currentPostalCode,
          preferredLocale: effectiveInitialLocale,
          coachedSports: currentCoachedSports,
          practicedSports: currentPracticedSports,
          languages: currentLanguages,
          presentation: initialValuesRef.current.presentation,
          presentationFr: currentPresentationFr,
          presentationEn: currentPresentationEn,
          weeklyCurrentHours: currentWeeklyCurrent,
          weeklyTargetHours: currentWeeklyTarget,
          weeklyVolumeBySport: JSON.stringify(currentVolume),
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
        const confirmed = window.confirm(tProfile('unsavedChangesAlert'))
        if (!confirmed) {
          window.history.pushState(null, '', window.location.href)
        } else {
          setHasUnsavedChanges(false)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [hasUnsavedChanges, tProfile])

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
        <div className="h-[136px] bg-gradient-palette relative">
          {/* Avatar positionné sur la bannière */}
          <div className="absolute -bottom-10 left-8">
            <div className="relative group cursor-pointer">
              {/* Cercle de fond (Placeholder ou photo) */}
              <div className="w-28 h-28 rounded-full bg-stone-100 border-4 border-white shadow-md flex items-center justify-center text-stone-300 overflow-hidden group-hover:bg-stone-200 transition-colors">
                {avatarUrlState ? (
                  <img src={avatarUrlState} alt={tProfile('profilePhoto')} className="w-full h-full object-cover" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 transform translate-y-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* Bouton d'ajout (+) */}
              <div 
                className="absolute bottom-1 right-1 bg-palette-forest-dark text-white p-1.5 rounded-full shadow-lg border-2 border-white hover:bg-palette-forest-darker transition-transform group-hover:scale-110 flex items-center justify-center cursor-pointer"
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
              <input type="hidden" name="locale" value={locale} />
            </div>
          </div>
        </div>

        {/* Contenu du formulaire */}
        <div className="pt-16 pb-8 px-8">
          {/* Header section + Bouton Enregistrer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-stone-900">{tProfile('myInformation')}</h1>
              <p className="text-stone-500 text-sm">
                {isCoach ? tProfile('coachSubtitle') : tProfile('athleteSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <div className="h-6 w-px bg-stone-200" aria-hidden />
              <Button
                type="submit"
                variant="primary"
                disabled={!hasUnsavedChanges || isSubmitting}
                loading={isSubmitting}
                loadingText={tCommon('saving')}
                success={showSavedFeedback}
                successText={tCommon('saved')}
                error={!!state?.error}
                errorText={tCommon('notSaved')}
              >
                {tCommon('save')}
              </Button>
            </div>
            {state?.error && (
              <p className="text-sm text-red-600 mt-3" role="alert">
                {state.error}
              </p>
            )}
          </div>

          {/* Grille Informations Personnelles */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-5">
            {/* Prénom */}
            <div className="md:col-span-6">
              <Input
                id="first_name"
                label={tProfile('firstName')}
                name="first_name"
                type="text"
                defaultValue={firstName}
              />
            </div>

            {/* Nom */}
            <div className="md:col-span-6">
              <Input
                id="last_name"
                label={tProfile('lastName')}
                name="last_name"
                type="text"
                defaultValue={lastName}
              />
            </div>

            {/* Email */}
            <div className="md:col-span-6">
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2 flex justify-between items-center">
                {tProfile('emailAddress')}
                <span className="text-xs font-normal text-stone-400 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  {tProfile('nonEditable')}
                </span>
              </label>
              <Input
                id="email"
                type="text"
                value={email}
                readOnly
              />
            </div>

            {/* Code Postal — même ligne que l'email sur md+ */}
            <div className="md:col-span-6">
              <Input
                id="postal_code"
                label={tProfile('postalCode')}
                name="postal_code"
                type="text"
                defaultValue={postalCode}
                placeholder={tProfile('postalCodePlaceholder')}
              />
            </div>
          </div>

          <hr className="border-stone-100 my-5" />

          {/* Section Sports : coach = sports coachés, athlète = sports pratiqués */}
          <div className="mb-5">
            {isCoach ? (
              <>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">{tProfile('coachedSports')}</h2>
                <div className="flex flex-wrap gap-3">
                  {coachedSportsOptions.map((opt) => (
                    <SportTileSelectable
                      key={opt.value}
                      value={opt.value}
                      name="coached_sports"
                      defaultChecked={coachedSports.includes(opt.value)}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">{tProfile('practicedSports')}</h2>
                <div className="flex flex-wrap gap-3">
                  {practicedSportsOptions.map((opt) => (
                    <SportTileSelectable
                      key={opt.value}
                      value={opt.value}
                      name="practiced_sports"
                      checked={selectedPracticedSports.includes(opt.value)}
                      onChange={(checked) => {
                        setSelectedPracticedSports((prev) =>
                          checked
                            ? [...prev, opt.value].sort()
                            : prev.filter((s) => s !== opt.value)
                        )
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Section Volumes hebdomadaires (athlète uniquement) */}
          {!isCoach && (
            <>
              <hr className="border-stone-100 my-5" />
              <div className="mb-5">
                <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">
                  {tProfile('weeklyVolumesSectionTitle')}
                </h2>
                {selectedPracticedSports.length === 0 ? (
                  <p className="text-sm text-stone-500">{tProfile('noPracticedSportsMessage')}</p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-100">
                        <span className="text-sm font-medium text-stone-700 shrink-0">
                          {tProfile('weeklyCurrentHoursLabel')}
                        </span>
                        <div className="relative w-[6.5rem] shrink-0">
                          <input
                            type="text"
                            name="weekly_current_hours"
                            inputMode="decimal"
                            defaultValue={weeklyCurrentHours != null ? String(weeklyCurrentHours) : ''}
                            placeholder="6"
                            className="w-full pl-3 pr-10 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
                            {tProfile('suffixHoursPerWeek')}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3 py-2.5 px-3 rounded-xl bg-stone-50 border border-stone-100">
                        <span className="text-sm font-medium text-stone-700 shrink-0">
                          {tProfile('weeklyMaxHoursLabel')}
                        </span>
<div className="relative w-[6.5rem] shrink-0">
                        <input
                          type="text"
                          name="weekly_target_hours"
                            inputMode="decimal"
                            defaultValue={weeklyTargetHours != null ? String(weeklyTargetHours) : ''}
                            placeholder="10"
                            className="w-full pl-3 pr-10 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
                            {tProfile('suffixHoursPerWeek')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {displaySportsForVolume.map((sport) => {
                        const sportKey = sport as SportType
                        const Icon = SPORT_ICONS[sportKey] ?? SPORT_ICONS.course
                        const styles = SPORT_CARD_STYLES[sportKey] ?? SPORT_CARD_STYLES.course
                        const unit = getWeeklyVolumeUnit(sport)
                        const suffixKey = unit === 'km' ? 'suffixKmPerWeek' : unit === 'm' ? 'suffixMPerWeek' : 'suffixHoursPerWeek'
                        const value = weeklyVolumeBySport?.[sport]
                        const defaultValue = value != null ? String(value) : ''
                        const showCourseElevation = sport === 'course' && selectedPracticedSports.includes('trail')
                        const elevationValue = weeklyVolumeBySport?.course_elevation_m
                        const elevationDefault = elevationValue != null ? String(elevationValue) : ''
                        return (
                          <div
                            key={sport}
                            className={`rounded-xl border-l-4 border border-stone-200 bg-white p-3 flex flex-wrap items-center justify-between gap-3 ${styles.borderLeft}`}
                          >
                            <div className="flex items-center gap-2 min-w-0 shrink-0">
                              <span className={styles.badge}>
                                <Icon className="w-4 h-4" />
                              </span>
                              <span className="text-sm font-semibold text-stone-800">
                                {tSports(SPORT_TRANSLATION_KEYS[sportKey])}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 ml-auto min-w-0 w-full sm:w-auto justify-end">
                              <div className="relative w-[6.5rem] shrink-0">
                                <input
                                  type="text"
                                  name={`weekly_volume_${sport}`}
                                  inputMode="decimal"
                                  defaultValue={defaultValue}
                                  placeholder={unit === 'm' ? '2500' : unit === 'h' ? '2,5' : '42'}
                                  className="w-full pl-3 pr-11 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none whitespace-nowrap">
                                  {tProfile(suffixKey)}
                                </span>
                              </div>
                              {showCourseElevation && (
                                <div className="relative w-[6.5rem] shrink-0">
                                  <input
                                    type="text"
                                    name="weekly_volume_course_elevation_m"
                                    inputMode="decimal"
                                    defaultValue={elevationDefault}
                                    placeholder="500"
                                    className="w-full pl-3 pr-12 py-2 rounded-lg border border-stone-300 bg-white text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs pointer-events-none whitespace-nowrap">
                                    {tProfile('suffixDPlusPerWeek')}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Section Langues (coach uniquement) */}
          {isCoach && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">{tProfile('spokenLanguages')}</h2>
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
                  <div className="px-4 py-2 rounded-full border border-stone-200 bg-white text-stone-600 hover:border-palette-forest-dark transition-all text-sm font-medium select-none">
                    {opt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>
          )}

          {isCoach && (
          <hr className="border-stone-100 my-5" />
          )}

          {/* Bio (coach uniquement) — EN à gauche, FR à droite (composant LanguagePrefixField) */}
          {isCoach && (
          <div className="mb-5">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wide mb-3">{tProfile('presentation')}</h2>
            <p className="text-xs text-stone-400 mb-2">{tProfile('presentationSubtitle')}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="relative">
                <LanguagePrefixTextarea
                  lang="EN"
                  id="presentation_en"
                  name="presentation_en"
                  defaultValue={presentationEn}
                  onChange={(e) => setPresentationEnLength(e.target.value.length)}
                  rows={5}
                  placeholder={tProfile('presentationPlaceholder')}
                  className="min-h-[120px]"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-stone-400 font-medium bg-white/80 px-2 py-1 rounded">
                  {presentationEnLength} / 500
                </div>
              </div>
              <div className="relative">
                <LanguagePrefixTextarea
                  lang="FR"
                  id="presentation_fr"
                  name="presentation_fr"
                  defaultValue={presentationFr}
                  onChange={(e) => setPresentationFrLength(e.target.value.length)}
                  rows={5}
                  placeholder={tProfile('presentationPlaceholder')}
                  className="min-h-[120px]"
                />
                <div className="absolute bottom-3 right-3 text-[10px] text-stone-400 font-medium bg-white/80 px-2 py-1 rounded">
                  {presentationFrLength} / 500
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Danger Zone */}
          <div className="mt-16 pt-6 border-t border-stone-100 flex flex-col items-center">
            <div className="w-full max-w-md flex flex-col items-center gap-4">
              <LogoutButton />
              <hr className="w-full border-t border-stone-200" aria-hidden />
              <Button
                type="button"
                variant="danger"
                onClick={async () => {
                  setDeleteBlockReason(null)
                  setDeleteError(null)
                  setIsCheckingDelete(true)
                  try {
                    const result = await checkCanDeleteAccount(locale)
                    if (!result.canDelete) {
                      setDeleteBlockReason(result.error ?? tProfile('deletionNotPossible'))
                      return
                    }
                    setDeleteModalOpen(true)
                  } finally {
                    setIsCheckingDelete(false)
                  }
                }}
                disabled={isCheckingDelete}
                loading={isCheckingDelete}
                loadingText={tProfile('checking')}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                {tProfile('deleteAccount')}
              </Button>
            </div>
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

      {/* Modale de confirmation suppression de compte (design system) */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title={tProfile('deleteConfirmTitle')}
        size="md"
        titleId="delete-account-title"
        disableOverlayClose={isDeleting}
        disableEscapeClose={isDeleting}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="muted"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
              className="flex-1"
            >
              {tProfile('back')}
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                setIsDeleting(true)
                setDeleteError(null)
                const result = await deleteMyAccount(locale)
                if (result.error) {
                  setDeleteError(result.error)
                  setIsDeleting(false)
                  return
                }
                await createClient().auth.signOut()
                window.location.href = '/'
              }}
              disabled={isDeleting}
              loading={isDeleting}
              loadingText={tCommon('deleting')}
              className="flex-1"
            >
              {tProfile('confirm')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4">
          <p className="text-sm text-stone-600 mb-4">
            {tProfile('deleteConfirmMessage')}
          </p>
          {deleteError && (
            <p className="text-sm text-red-600" role="alert">{deleteError}</p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={unsavedChangesModalOpen}
        onClose={() => !isSavingBeforeLeave && setUnsavedChangesModalOpen(false)}
        title={tProfile('unsavedChangesTitle')}
        size="md"
        titleId="unsaved-changes-title"
        disableOverlayClose={isSavingBeforeLeave}
        disableEscapeClose={isSavingBeforeLeave}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="muted"
              onClick={handleLeaveWithoutSaving}
              disabled={isSavingBeforeLeave}
              className="flex-1"
            >
              {tProfile('leaveWithoutSaving')}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSaveAndLeave}
              disabled={isSavingBeforeLeave}
              loading={isSavingBeforeLeave}
              loadingText={tCommon('saving')}
              className="flex-1"
            >
              {tProfile('saveAndLeave')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4">
          <p className="text-sm text-stone-600">
            {tProfile('unsavedChangesMessage')}
          </p>
        </div>
      </Modal>
    </>
  )
}

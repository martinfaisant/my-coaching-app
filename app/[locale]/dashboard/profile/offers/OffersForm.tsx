'use client'

import { useState, useActionState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { TileCard } from '@/components/TileCard'
import { LanguagePrefixInput, LanguagePrefixTextarea } from '@/components/LanguagePrefixField'
import { saveOffers, archiveOffer, publishOffer, type OffersFormState } from './actions'
import type { CoachOffer, CoachOfferArchived } from '@/types/database'

type OffersFormProps = {
  offers: CoachOffer[]
  archivedOffers?: CoachOfferArchived[]
}

export function OffersForm({ offers, archivedOffers = [] }: OffersFormProps) {
  const router = useRouter()
  const t = useTranslations('offers')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const [state, action] = useActionState<OffersFormState, FormData>(saveOffers, {})
  /** IDs archivés pendant cette session : on les retire de l'affichage sans refetch (préserve les modifications non enregistrées des autres offres). */
  const [archivedIdsInThisSession, setArchivedIdsInThisSession] = useState<Set<string>>(new Set())
  /** Offres archivées ajoutées pendant cette session pour affichage immédiat dans la section archivée. */
  const [optimisticArchivedList, setOptimisticArchivedList] = useState<CoachOfferArchived[]>([])
  /** IDs publiés pendant cette session : on les affiche comme published sans refetch (préserve l'état des autres tuiles). */
  const [publishedIdsInThisSession, setPublishedIdsInThisSession] = useState<Set<string>>(new Set())
  const [publishError, setPublishError] = useState<string | null>(null)
  const [publishingOfferId, setPublishingOfferId] = useState<string | null>(null)

  /** Offres « live » affichées : props moins celles archivées dans cette session (sans refetch). */
  const displayedOffers = useMemo(
    () =>
      offers
        .filter((o) => !archivedIdsInThisSession.has(o.id))
        .sort((a, b) => a.display_order - b.display_order),
    [offers, archivedIdsInThisSession]
  )
  /** Section archivée : props + offres archivées optimistes, dédoublonnée par id (évite le doublon si le serveur a refetch après revalidatePath). */
  const displayedArchivedOffers = useMemo(() => {
    const byId = new Map<string, CoachOfferArchived>()
    archivedOffers.forEach((a) => byId.set(a.id, a))
    optimisticArchivedList.forEach((a) => byId.set(a.id, a))
    return Array.from(byId.values()).sort(
      (a, b) => new Date(b.archived_at).getTime() - new Date(a.archived_at).getTime()
    )
  }, [archivedOffers, optimisticArchivedList])
  const sortedOffers = displayedOffers

  const [offerCount, setOfferCount] = useState(() => Math.min(3, Math.max(sortedOffers.length, 1)))
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const needsInitialOffersUpdateRef = useRef(false)
  const previousIsSubmittingRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [priceTypes, setPriceTypes] = useState<Record<string, 'one_time' | 'monthly' | 'free' | undefined>>(() => {
    const initial: Record<string, 'one_time' | 'monthly' | 'free' | undefined> = {}
    sortedOffers.forEach((offer, idx) => {
      const key = offer.id ?? `new-${idx - sortedOffers.length}`
      initial[key] = offer.price_type ?? undefined
    })
    return initial
  })
  const [featuredOfferIndex, setFeaturedOfferIndex] = useState<number | null>(() => {
    const featuredIndex = sortedOffers.findIndex(offer => offer.is_featured)
    return featuredIndex >= 0 ? featuredIndex : null
  })
  const [archiveModalOpen, setArchiveModalOpen] = useState(false)
  const [archiveTargetOfferId, setArchiveTargetOfferId] = useState<string | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)
  /** IDs archivés pendant cette session : on les retire de l’affichage sans refetch (préserve les modifications non enregistrées des autres offres). */
  const initialOffersRef = useRef(offers)
  const initialFeaturedIndexRef = useRef<number | null>((() => {
    const featuredIndex = sortedOffers.findIndex(offer => offer.is_featured)
    return featuredIndex >= 0 ? featuredIndex : null
  })())
  const isInitializedRef = useRef(false)

  useEffect(() => {
    if (!isInitializedRef.current) {
      const newPriceTypes: Record<string, 'one_time' | 'monthly' | 'free' | undefined> = {}
      sortedOffers.forEach((offer, idx) => {
        const key = offer.id ?? `new-${idx - sortedOffers.length}`
        newPriceTypes[key] = offer.price_type ?? undefined
      })
      setPriceTypes(newPriceTypes)
      const featuredIdx = sortedOffers.findIndex(offer => offer.is_featured)
      setFeaturedOfferIndex(featuredIdx >= 0 ? featuredIdx : null)
      initialOffersRef.current = [...sortedOffers]
      isInitializedRef.current = true
      setOfferCount(Math.min(3, Math.max(sortedOffers.length, 1)))
      return
    }
    if (needsInitialOffersUpdateRef.current) {
      initialOffersRef.current = [...sortedOffers]
      initialFeaturedIndexRef.current = featuredOfferIndex
      needsInitialOffersUpdateRef.current = false
    }
  }, [offers, sortedOffers, featuredOfferIndex])

  // Fonction pour vérifier les modifications
  const checkUnsavedChanges = useCallback(() => {
    const form = formRef.current
    if (!form) return false

    const currentOffers: Array<{
      title_fr: string
      title_en: string
      description_fr: string
      description_en: string
      price: string
      price_type: string
    }> = []

    for (let i = 0; i < offerCount; i++) {
      const titleFr = (form.querySelector(`[name="offer_${i}_title_fr"]`) as HTMLInputElement)?.value.trim() || ''
      const titleEn = (form.querySelector(`[name="offer_${i}_title_en"]`) as HTMLInputElement)?.value.trim() || ''
      const descriptionFr = (form.querySelector(`[name="offer_${i}_description_fr"]`) as HTMLTextAreaElement)?.value.trim() || ''
      const descriptionEn = (form.querySelector(`[name="offer_${i}_description_en"]`) as HTMLTextAreaElement)?.value.trim() || ''
      const price = (form.querySelector(`[name="offer_${i}_price"]`) as HTMLInputElement)?.value.trim() || ''
      const initialAtI = initialOffersRef.current[i] as { id?: string; price_type?: string } | undefined
      const slotKey = initialAtI?.id ?? `new-${i - (initialOffersRef.current?.length ?? 0)}`
      const priceType = priceTypes[slotKey] ?? initialAtI?.price_type ?? (initialAtI ? 'one_time' : undefined)

      if (titleFr || titleEn || descriptionFr || descriptionEn || price || priceType) {
        currentOffers.push({ title_fr: titleFr, title_en: titleEn, description_fr: descriptionFr, description_en: descriptionEn, price, price_type: priceType ?? '' })
      }
    }

    const initialOffers = initialOffersRef.current || []
    if (currentOffers.length !== initialOffers.length) return true

    for (let i = 0; i < currentOffers.length; i++) {
      const current = currentOffers[i]
      const initial = initialOffers[i] as (CoachOffer & { title_fr?: string; title_en?: string; description_fr?: string; description_en?: string; price?: number | null; price_type?: string | null }) | undefined
      if (!initial) return true
      const initTitleFr = (initial.title_fr ?? '').trim()
      const initTitleEn = (initial.title_en ?? '').trim()
      const initDescFr = (initial.description_fr ?? '').trim()
      const initDescEn = (initial.description_en ?? '').trim()
      const initPrice = initial.price != null ? String(initial.price) : ''
      const initPriceType = (initial.price_type ?? '') as string
      if (
        current.title_fr !== initTitleFr ||
        current.title_en !== initTitleEn ||
        current.description_fr !== initDescFr ||
        current.description_en !== initDescEn ||
        current.price !== initPrice ||
        current.price_type !== initPriceType
      ) {
        return true
      }
    }

    if (featuredOfferIndex !== initialFeaturedIndexRef.current) return true

    return false
  }, [offerCount, featuredOfferIndex, priceTypes])

  // Détection des modifications : écouter les champs du formulaire (comme ProfileForm)
  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const updateUnsavedChanges = () => {
      setHasUnsavedChanges(checkUnsavedChanges())
    }

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

  const triggerUnsavedCheck = useCallback(() => {
    setHasUnsavedChanges(checkUnsavedChanges())
  }, [checkUnsavedChanges])



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

  // Intercepter la navigation programmatique
  useEffect(() => {
    const handlePopState = () => {
      if (hasUnsavedChanges && !isSubmittingRef.current) {
        const confirmed = window.confirm(t('unsavedChangesAlert'))
        if (!confirmed) {
          window.history.pushState(null, '', window.location.href)
        } else {
          setHasUnsavedChanges(false)
        }
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [hasUnsavedChanges, t])

  /** Offre complète (titre FR/EN, description FR/EN, prix et récurrence) → bouton Publier actif */
  const canPublishOfferAtSlot = useCallback(
    (index: number) => {
      const form = formRef.current
      if (!form) return false
      const offer = sortedOffers[index] as (CoachOffer & { price_type?: string }) | undefined
      const titleFr = (form.querySelector(`[name="offer_${index}_title_fr"]`) as HTMLInputElement)?.value?.trim() ?? ''
      const titleEn = (form.querySelector(`[name="offer_${index}_title_en"]`) as HTMLInputElement)?.value?.trim() ?? ''
      const descFr = (form.querySelector(`[name="offer_${index}_description_fr"]`) as HTMLTextAreaElement)?.value?.trim() ?? ''
      const descEn = (form.querySelector(`[name="offer_${index}_description_en"]`) as HTMLTextAreaElement)?.value?.trim() ?? ''
      const slotKey = offer?.id ?? `new-${index - sortedOffers.length}`
      const priceType = priceTypes[slotKey] ?? offer?.price_type
      const priceStr = (form.querySelector(`[name="offer_${index}_price"]`) as HTMLInputElement)?.value?.trim() ?? ''
      const hasTitles = titleFr.length > 0 && titleEn.length > 0
      const hasDescriptions = descFr.length > 0 && descEn.length > 0
      const hasRecurrence = priceType === 'one_time' || priceType === 'monthly' || priceType === 'free'
      const hasValidPrice =
        priceType === 'free' || (priceStr.length > 0 && !isNaN(parseFloat(priceStr)) && parseFloat(priceStr) >= 0)
      return hasTitles && hasDescriptions && hasRecurrence && hasValidPrice
    },
    [sortedOffers, priceTypes]
  )

  // Soumission : marquer l’envoi en cours et le slot (aligné sur ProfileForm handleFormSubmit)
  const handleFormSubmit = () => {
    isSubmittingRef.current = true
    setIsSubmitting(true)
  }

  // Réinitialiser l’état d’envoi à la réception de la réponse (pattern PATTERN_SAVE_BUTTON)
  useEffect(() => {
    if (state?.success || state?.error) {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }, [state])

  // Feedback success/error : détecter la transition pending → terminé (aligné sur ProfileForm / PATTERN_SAVE_BUTTON)
  const saveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isSubmitting}`
  useEffect(() => {
    const justFinishedSubmitting = previousIsSubmittingRef.current && !isSubmitting
    previousIsSubmittingRef.current = isSubmitting

    if (state?.success && justFinishedSubmitting) {
      needsInitialOffersUpdateRef.current = true
      router.refresh()
      setHasUnsavedChanges(false)
      setShowSavedFeedback(true)
      const t = setTimeout(() => setShowSavedFeedback(false), 2500)
      return () => clearTimeout(t)
    }

    if (state?.error) {
      setShowSavedFeedback(false)
    }
  }, [saveFeedbackKey])

  // Cacher le feedback « Enregistré » dès qu’une modification est détectée (pattern PATTERN_SAVE_BUTTON)
  useEffect(() => {
    if (hasUnsavedChanges && showSavedFeedback) setShowSavedFeedback(false)
  }, [hasUnsavedChanges, showSavedFeedback])

  const handleSaveAndLeave = async () => {
    if (!formRef.current) return
    setIsSavingBeforeLeave(true)
    const formData = new FormData(formRef.current)
    formData.set('_locale', locale)
    const result = await saveOffers({}, formData)
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

  const handleArchiveConfirm = async () => {
    if (!archiveTargetOfferId) return
    setIsArchiving(true)
    setArchiveError(null)
    const result = await archiveOffer(archiveTargetOfferId, locale)
    setIsArchiving(false)
    if ('error' in result && result.error) {
      setArchiveError(result.error)
      return
    }
    if (!('archived' in result) || !result.archived) return
    const archivedIndex = displayedOffers.findIndex((o) => o.id === archiveTargetOfferId)
    setArchivedIdsInThisSession((prev) => new Set(prev).add(archiveTargetOfferId))
    setOptimisticArchivedList((prev) => [...prev, result.archived])
    setOfferCount((prev) => Math.max(1, prev - 1))
    if (featuredOfferIndex === archivedIndex) {
      setFeaturedOfferIndex(null)
    } else if (featuredOfferIndex !== null && featuredOfferIndex > archivedIndex) {
      setFeaturedOfferIndex((prev) => (prev !== null ? prev - 1 : null))
    }
    setArchiveModalOpen(false)
    setArchiveTargetOfferId(null)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && unsavedChangesModalOpen && !isSavingBeforeLeave) {
        setUnsavedChangesModalOpen(false)
        setPendingNavigation(null)
      }
    }
    if (unsavedChangesModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [unsavedChangesModalOpen, isSavingBeforeLeave])

  const remainingOffers = 3 - offerCount

  return (
    <>
      <form
        id="offers-form"
        ref={formRef}
        action={action}
        onSubmit={handleFormSubmit}
        className="flex flex-1 flex-col min-h-0 min-w-0"
      >
        <input type="hidden" name="_locale" value={locale} />
        <input type="hidden" name="_save_slot" value="" />
        <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white border-b border-stone-100">
          <h1 className="text-2xl font-bold text-stone-800">{t('title')}</h1>
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
        </header>

        {/* CONTENU (GRILLE D'OFFRES) */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 lg:px-8 py-8">
          {state?.error && (
            <div
              className="mb-6 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700"
              role="alert"
            >
              {state.error}
            </div>
          )}
          {publishError && (
            <div
              className="mb-6 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700"
              role="alert"
            >
              {publishError}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
            {/* Cartes d'offres existantes */}
            {Array.from({ length: Math.min(offerCount, 3) }).map((_, index) => {
              const offer = sortedOffers[index] as CoachOffer | null
              const isFeatured = featuredOfferIndex === index
              // Clé stable pour les slots "nouveaux" (sans offre sauvegardée) : new-0, new-1... pour ne pas créer de carte vide à l'archivage
              const slotKey = offer?.id ?? `new-${index - sortedOffers.length}`

              return (
                <div
                  key={slotKey}
                  className={`bg-white rounded-2xl border-2 flex flex-col relative group ${
                    isFeatured ? 'border-palette-forest-dark shadow-md' : 'border-stone-200 shadow-sm hover:shadow-md'
                  } transition-all`}
                >
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-palette-forest-dark text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {t('recommended')}
                    </div>
                  )}

                  <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-2xl flex-wrap gap-2">
                    <span className="text-xs font-bold text-stone-400 uppercase flex items-center gap-2">
                      {t('offerNumber', { number: index + 1 })}
                      {offer?.id && (offer as { status?: string }).status === 'draft' && !publishedIdsInThisSession.has(offer.id) && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-medium">
                          {t('status.draft')}
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1">
                      {offer?.id && (offer as { status?: string }).status === 'draft' && !publishedIdsInThisSession.has(offer.id) && (
                        <button
                          type="button"
                          onClick={async () => {
                            const form = formRef.current
                            if (!form || !offer?.id) return
                            setPublishError(null)
                            setPublishingOfferId(offer.id)
                            const fd = new FormData()
                            fd.set('_locale', locale)
                            fd.set('_publish_title_fr', (form.querySelector(`[name="offer_${index}_title_fr"]`) as HTMLInputElement)?.value?.trim() ?? '')
                            fd.set('_publish_title_en', (form.querySelector(`[name="offer_${index}_title_en"]`) as HTMLInputElement)?.value?.trim() ?? '')
                            fd.set('_publish_description_fr', (form.querySelector(`[name="offer_${index}_description_fr"]`) as HTMLTextAreaElement)?.value?.trim() ?? '')
                            fd.set('_publish_description_en', (form.querySelector(`[name="offer_${index}_description_en"]`) as HTMLTextAreaElement)?.value?.trim() ?? '')
                            fd.set('_publish_price', (form.querySelector(`[name="offer_${index}_price"]`) as HTMLInputElement)?.value?.trim() ?? '')
                            const slotKey = offer.id ?? `new-${index - sortedOffers.length}`
                            fd.set('_publish_price_type', (priceTypes[slotKey] ?? offer.price_type) ?? '')
                            const result = await publishOffer(offer.id, fd, locale)
                            setPublishingOfferId(null)
                            if ('error' in result && result.error) {
                              setPublishError(result.error)
                              return
                            }
                            setPublishedIdsInThisSession((prev) => new Set(prev).add(offer.id))
                            setPublishError(null)
                          }}
                          disabled={!canPublishOfferAtSlot(index) || publishingOfferId === offer.id}
                          className="px-2.5 py-1 rounded-lg text-xs font-medium bg-palette-forest-dark text-white hover:bg-palette-forest-darker disabled:opacity-50 disabled:pointer-events-none"
                          title={t('publish')}
                        >
                          {publishingOfferId === offer.id ? tCommon('saving') : t('publish')}
                        </button>
                      )}
                      {offer?.id && (
                        <button
                          type="button"
                          onClick={() => {
                            setArchiveTargetOfferId(offer.id)
                            setArchiveError(null)
                            setArchiveModalOpen(true)
                          }}
                          className="p-1.5 rounded-lg transition-colors hover:bg-stone-100 text-stone-400 hover:text-stone-600"
                          title={t('archive')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                          </svg>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          if (isFeatured) setFeaturedOfferIndex(null)
                          else setFeaturedOfferIndex(index)
                          setTimeout(() => setHasUnsavedChanges(checkUnsavedChanges()), 0)
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFeatured ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'hover:bg-yellow-50 text-stone-300 hover:text-yellow-600'
                        }`}
                        title={isFeatured ? t('unfeature') : t('feature')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div
                    className="p-5 flex flex-col gap-4 flex-1"
                    onInputCapture={triggerUnsavedCheck}
                    onChangeCapture={triggerUnsavedCheck}
                  >
                    <input type="hidden" name={`offer_${index}_id`} value={offer?.id || ''} />
                    <input type="hidden" name={`offer_${index}_featured`} value={isFeatured ? 'on' : ''} />

                    {/* Titre : EN à gauche, FR à droite (composant LanguagePrefixField) */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">{t('offerTitle')}</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <LanguagePrefixInput
                          lang="EN"
                          id={`offer_${index}_title_en`}
                          name={`offer_${index}_title_en`}
                          type="text"
                          defaultValue={(offer as { title_en?: string })?.title_en ?? ''}
                          placeholder={t('offerTitlePlaceholder')}
                          onInput={triggerUnsavedCheck}
                        />
                        <LanguagePrefixInput
                          lang="FR"
                          id={`offer_${index}_title_fr`}
                          name={`offer_${index}_title_fr`}
                          type="text"
                          defaultValue={(offer as { title_fr?: string })?.title_fr ?? ''}
                          placeholder={t('offerTitlePlaceholder')}
                          onInput={triggerUnsavedCheck}
                        />
                      </div>
                    </div>

                    {/* Description & avantages : EN à gauche, FR à droite (composant LanguagePrefixField) */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">{t('descriptionLabel')}</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <LanguagePrefixTextarea
                          lang="EN"
                          id={`offer_${index}_description_en`}
                          name={`offer_${index}_description_en`}
                          rows={3}
                          defaultValue={(offer as { description_en?: string })?.description_en ?? ''}
                          placeholder={t('descriptionPlaceholder')}
                          onInput={triggerUnsavedCheck}
                        />
                        <LanguagePrefixTextarea
                          lang="FR"
                          id={`offer_${index}_description_fr`}
                          name={`offer_${index}_description_fr`}
                          rows={3}
                          defaultValue={(offer as { description_fr?: string })?.description_fr ?? ''}
                          placeholder={t('descriptionPlaceholder')}
                          onInput={triggerUnsavedCheck}
                        />
                      </div>
                    </div>

                    <div className="w-full border-t border-stone-100 pt-4">
                      <label className="block text-sm font-medium text-stone-700 mb-2">{t('pricing')}</label>
                      <div className="grid grid-cols-5 gap-3 items-stretch">
                          <div className="col-span-2 flex">
                            {(priceTypes[slotKey] ?? offer?.price_type) === 'free' ? (
                              <>
                                <input type="hidden" name={`offer_${index}_price`} value="0" />
                                <div className="w-full pl-3 pr-6 py-2.5 rounded-lg bg-white border border-stone-300 flex items-center text-stone-900 font-bold">
                                  <span>0</span>
                                  <span className="ml-auto text-stone-400 font-medium">€</span>
                                </div>
                              </>
                            ) : (
                              <div className="relative w-full">
                                <input
                                  id={`offer_${index}_price`}
                                  name={`offer_${index}_price`}
                                  type="number"
                                  step="0.01"
                                  min={0}
                                  defaultValue={offer?.price != null && offer?.price_type !== 'free' ? String(offer.price) : ''}
                                  placeholder="0"
                                  onInput={triggerUnsavedCheck}
                                  className="w-full pl-3 pr-6 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 font-bold focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-medium pointer-events-none">€</span>
                              </div>
                            )}
                          </div>
                          <div className="col-span-3 flex gap-1 bg-stone-100 p-1 rounded-lg border border-stone-200 items-center h-full min-h-[42px]" role="group" aria-label={t('recurrence')}>
                            {[
                              { value: 'monthly' as const, label: t('priceTypes.monthly') },
                              { value: 'one_time' as const, label: t('priceTypes.oneTime') },
                              { value: 'free' as const, label: t('priceTypes.free') },
                            ].map((opt) => {
                              const selected = (priceTypes[slotKey] ?? offer?.price_type ?? undefined) === opt.value
                              return (
                                <label key={opt.value} className="flex-1 cursor-pointer flex items-center justify-center min-h-0">
                                  <input
                                    type="radio"
                                    name={`offer_${index}_price_type`}
                                    value={opt.value}
                                    checked={selected}
                                    onChange={() => {
                                      setPriceTypes(prev => ({ ...prev, [slotKey]: opt.value }))
                                      triggerUnsavedCheck()
                                    }}
                                    className="sr-only"
                                  />
                                  <div
                                    className={`w-full py-2 rounded-md text-sm font-medium select-none transition-all text-center flex items-center justify-center ${
                                      selected ? 'bg-palette-forest-dark text-white border border-palette-forest-dark shadow-[0_2px_4px_-1px_rgba(98,126,89,0.25)]' : 'bg-white text-stone-600 border border-stone-200 hover:border-palette-forest-dark'
                                    }`}
                                  >
                                    {opt.label}
                                  </div>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Carte vide pour ajouter une offre */}
            {offerCount < 3 && (
              <button
                type="button"
                onClick={() => {
                  setOfferCount(offerCount + 1)
                  setPriceTypes(prev => ({ ...prev, [`new-${offerCount - sortedOffers.length}`]: undefined }))
                }}
                className="bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-4 hover:border-palette-forest-dark hover:bg-palette-forest-dark/5 transition-all group cursor-pointer min-h-[400px]"
              >
                <div className="w-16 h-16 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 shadow-sm group-hover:scale-110 group-hover:text-palette-forest-dark group-hover:border-palette-forest-dark transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-stone-600 group-hover:text-palette-forest-dark">{t('addOffer')}</h3>
                  <p className="text-xs text-stone-400 mt-1">{t(remainingOffers === 1 ? 'remainingOffers' : 'remainingOffers_plural', { count: remainingOffers })}</p>
                </div>
              </button>
            )}
          </div>

          {/* Section Offres archivées */}
          {displayedArchivedOffers.length > 0 && (
            <section className="mt-10 pt-8 border-t border-stone-200" aria-labelledby="archived-offers-heading">
              <h2 id="archived-offers-heading" className="text-lg font-bold text-stone-800 mb-4">
                {t('archivedOffersSection')}
              </h2>
              <ul className="space-y-3">
                {displayedArchivedOffers.map((archived) => {
                  const title = (locale === 'fr' ? archived.title_fr : archived.title_en) || archived.title
                  const priceLabel =
                    archived.price_type === 'free'
                      ? t('priceTypes.free')
                      : `${archived.price ?? 0} € / ${archived.price_type === 'monthly' ? t('priceTypes.monthly') : t('priceTypes.oneTime')}`
                  const archivedDate = new Date(archived.archived_at).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                  return (
                    <li key={archived.id}>
                      <TileCard leftBorderColor="stone" badge={t('status.archived')}>
                        <h3 className="text-sm font-semibold text-stone-800">{title}</h3>
                        <p className="text-xs text-stone-500 mt-1">{priceLabel}</p>
                        <p className="text-xs text-stone-500 mt-1.5">{archivedDate}</p>
                      </TileCard>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
          {displayedArchivedOffers.length === 0 && (
            <section className="mt-10 pt-8 border-t border-stone-200" aria-labelledby="archived-offers-heading">
              <h2 id="archived-offers-heading" className="text-lg font-bold text-stone-800 mb-2">
                {t('archivedOffersSection')}
              </h2>
              <p className="text-sm text-stone-500">{t('noArchivedOffers')}</p>
            </section>
          )}

        </div>
      </form>

      <Modal
        isOpen={archiveModalOpen}
        onClose={() => !isArchiving && (setArchiveModalOpen(false), setArchiveTargetOfferId(null), setArchiveError(null))}
        title={t('archiveModal.title')}
        size="md"
        titleId="archive-offer-title"
        disableOverlayClose={isArchiving}
        disableEscapeClose={isArchiving}
        footer={
          <div className="flex gap-3 w-full">
            <Button
              type="button"
              variant="muted"
              onClick={() => !isArchiving && (setArchiveModalOpen(false), setArchiveTargetOfferId(null), setArchiveError(null))}
              disabled={isArchiving}
              className="flex-1"
            >
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleArchiveConfirm}
              disabled={isArchiving}
              loading={isArchiving}
              loadingText={tCommon('saving')}
              className="flex-1"
            >
              {t('archiveModal.confirm')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4 space-y-3">
          <p className="text-sm text-stone-600">{t('archiveModal.message')}</p>
          {archiveError && (
            <p className="text-sm text-palette-danger" role="alert">
              {archiveError}
            </p>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={unsavedChangesModalOpen}
        onClose={() => !isSavingBeforeLeave && setUnsavedChangesModalOpen(false)}
        title={t('unsavedChangesModal.title')}
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
              {t('unsavedChangesModal.leaveWithoutSaving')}
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
              {t('unsavedChangesModal.saveAndLeave')}
            </Button>
          </div>
        }
      >
        <div className="px-6 py-4">
          <p className="text-sm text-stone-600">
            {t('unsavedChangesModal.message')}
          </p>
        </div>
      </Modal>
    </>
  )
}

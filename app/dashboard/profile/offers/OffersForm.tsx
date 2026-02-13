'use client'

import { useState, useActionState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { saveOffers, deleteOffer, type OffersFormState } from './actions'
import type { CoachOffer } from '@/types/database'

type OffersFormProps = {
  offers: CoachOffer[]
}

export function OffersForm({ offers }: OffersFormProps) {
  const router = useRouter()
  const [state, action] = useActionState<OffersFormState, FormData>(saveOffers, {})
  const [offerCount, setOfferCount] = useState(Math.max(offers.length || 0, 0))
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [offerToDelete, setOfferToDelete] = useState<{ index: number; title: string; id?: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const [isSavingBeforeLeave, setIsSavingBeforeLeave] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const previousIsSubmittingRef = useRef(false)
  const isSubmittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)
  const sortedOffers = [...offers].sort((a, b) => a.display_order - b.display_order)
  const [priceTypes, setPriceTypes] = useState<Record<number, 'one_time' | 'monthly' | 'free'>>(() => {
    const initial: Record<number, 'one_time' | 'monthly' | 'free'> = {}
    sortedOffers.forEach((offer, idx) => {
      initial[idx] = offer.price_type || 'one_time'
    })
    return initial
  })
  const [featuredOfferIndex, setFeaturedOfferIndex] = useState<number | null>(() => {
    const featuredIndex = sortedOffers.findIndex(offer => offer.is_featured)
    return featuredIndex >= 0 ? featuredIndex : null
  })
  const initialOffersRef = useRef(offers)
  const initialFeaturedIndexRef = useRef<number | null>((() => {
    const featuredIndex = sortedOffers.findIndex(offer => offer.is_featured)
    return featuredIndex >= 0 ? featuredIndex : null
  })())
  const lastOffersLengthRef = useRef(offers.length)
  const isInitializedRef = useRef(false)

  // Synchroniser le compteur avec les offres après suppression en base
  useEffect(() => {
    // Premier chargement : initialiser les types de prix depuis les offres en base
    if (!isInitializedRef.current) {
      const sorted = [...offers].sort((a, b) => a.display_order - b.display_order)
      const newPriceTypes: Record<number, 'one_time' | 'monthly' | 'free'> = {}
      sorted.forEach((offer, idx) => {
        newPriceTypes[idx] = offer.price_type || 'one_time'
      })
      setPriceTypes(newPriceTypes)
      const featuredIndex = sorted.findIndex(offer => offer.is_featured)
      const featuredIdx = featuredIndex >= 0 ? featuredIndex : null
      setFeaturedOfferIndex(featuredIdx)
      initialFeaturedIndexRef.current = featuredIdx
      initialOffersRef.current = [...offers].sort((a, b) => a.display_order - b.display_order)
      isInitializedRef.current = true
      lastOffersLengthRef.current = offers.length
      return
    }
    
    // Si le nombre d'offres a diminué (suppression en base), mettre à jour
    // Ne pas toucher aux types de prix si l'utilisateur a fait des modifications
    if (offers.length < lastOffersLengthRef.current) {
      setOfferCount(Math.max(offers.length || 0, 0))
      initialOffersRef.current = offers
      
      // Réinitialiser les types de prix seulement si une offre a été supprimée
      const sorted = [...offers].sort((a, b) => a.display_order - b.display_order)
      setPriceTypes(prev => {
        const newPriceTypes: Record<number, 'one_time' | 'monthly' | 'free'> = {}
        sorted.forEach((offer, idx) => {
          newPriceTypes[idx] = offer.price_type || 'one_time'
        })
        return newPriceTypes
      })
      const featuredIndex = sorted.findIndex(offer => offer.is_featured)
      const featuredIdx = featuredIndex >= 0 ? featuredIndex : null
      setFeaturedOfferIndex(featuredIdx)
      initialFeaturedIndexRef.current = featuredIdx
      lastOffersLengthRef.current = offers.length
    }
    // Ne rien faire si le nombre d'offres est le même - ne pas écraser les modifications de l'utilisateur
  }, [offers])

  // Fonction pour vérifier les modifications
  const checkUnsavedChanges = useCallback(() => {
    const form = formRef.current
    if (!form) return false

    const currentOffers: Array<{
      title: string
      description: string
      price: string
      price_type: string
    }> = []

    for (let i = 0; i < offerCount; i++) {
      const title = (form.querySelector(`[name="offer_${i}_title"]`) as HTMLInputElement)?.value.trim() || ''
      const description = (form.querySelector(`[name="offer_${i}_description"]`) as HTMLTextAreaElement)?.value.trim() || ''
      const price = (form.querySelector(`[name="offer_${i}_price"]`) as HTMLInputElement)?.value.trim() || ''
      const priceType = priceTypes[i] ?? (initialOffersRef.current[i] as { price_type?: string })?.price_type ?? 'one_time'

      if (title || description || price || priceType) {
        currentOffers.push({ title, description, price, price_type: priceType })
      }
    }

    const initialOffers = initialOffersRef.current || []
    if (currentOffers.length !== initialOffers.length) return true

    for (let i = 0; i < currentOffers.length; i++) {
      const current = currentOffers[i]
      const initial = initialOffers[i]
      if (!initial) return true

      if (
        current.title !== (initial.title || '').trim() ||
        current.description !== (initial.description || '').trim() ||
        current.price !== String(initial.price || '') ||
        current.price_type !== (initial.price_type || '')
      ) {
        return true
      }
    }

    // Vérifier si l'offre privilégiée a changé
    if (featuredOfferIndex !== initialFeaturedIndexRef.current) {
      return true
    }

    return false
  }, [offerCount, featuredOfferIndex, priceTypes])

  // Mettre à jour l'état des modifications
  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const updateUnsavedChanges = () => {
      setHasUnsavedChanges(checkUnsavedChanges())
    }

    const inputs = form.querySelectorAll('input, textarea, select')
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



  // Réinitialiser après sauvegarde réussie
  useEffect(() => {
    if (state?.success) {
      initialOffersRef.current = offers
      setHasUnsavedChanges(false)
    }
  }, [state?.success, offers])

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

  // Gérer la soumission du formulaire
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    isSubmittingRef.current = true
    setIsSubmitting(true)
  }

  // Réinitialiser le flag après la soumission
  useEffect(() => {
    if (state?.success || state?.error) {
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
  }, [state])

  // À chaque succès : afficher "Enregistré", réinitialiser les valeurs de référence et hasUnsavedChanges
  const saveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isSubmitting}`
  useEffect(() => {
    const justFinishedSubmitting = previousIsSubmittingRef.current && !isSubmitting
    previousIsSubmittingRef.current = isSubmitting
  
    if (state?.success && justFinishedSubmitting) {
      setShowSavedFeedback(true)
      router.refresh()
      const t = setTimeout(() => setShowSavedFeedback(false), 2500)
      initialOffersRef.current = offers  // garder pour le run actuel
      initialFeaturedIndexRef.current = featuredOfferIndex
      setHasUnsavedChanges(false)
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

  // Gérer la suppression d'offre
  const handleDeleteClick = (index: number) => {
    const offer = sortedOffers[index]
    const form = formRef.current
    const title = offer?.title || (form?.querySelector(`[name="offer_${index}_title"]`) as HTMLInputElement)?.value || `Offre ${index + 1}`
    setOfferToDelete({ index, title, id: offer?.id })
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!offerToDelete) return
    setIsDeleting(true)

    try {
      // Si l'offre existe en base, la supprimer immédiatement
      if (offerToDelete.id) {
        const result = await deleteOffer(offerToDelete.id)
        if (result.error) {
          alert(result.error)
          setIsDeleting(false)
          return
        }
        // Mettre à jour les offres initiales après suppression
        initialOffersRef.current = initialOffersRef.current.filter((o) => o.id !== offerToDelete.id)
        router.refresh()
      }

      // Réduire le compteur d'offres
      const newCount = Math.max(0, offerCount - 1)
      setOfferCount(newCount)
      
      // Si toutes les offres sont supprimées, réinitialiser les modifications
      if (newCount === 0) {
        setHasUnsavedChanges(false)
      }
      
      setDeleteModalOpen(false)
      setOfferToDelete(null)
    } catch (error) {
      alert('Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveAndLeave = async () => {
    if (!formRef.current) return
    setIsSavingBeforeLeave(true)
    const formData = new FormData(formRef.current)
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

  // Gérer Escape pour fermer les modales
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (unsavedChangesModalOpen && !isSavingBeforeLeave) {
          setUnsavedChangesModalOpen(false)
          setPendingNavigation(null)
        } else if (deleteModalOpen && !isDeleting) {
          setDeleteModalOpen(false)
          setOfferToDelete(null)
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

  const remainingOffers = 3 - offerCount

  return (
    <>
      {/* HEADER */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-8 shrink-0 bg-white border-b border-stone-100">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Mon Offre</h1>
        </div>
        
        {/* Bouton Sauvegarde */}
        <Button
          type="submit"
          variant="primary"
          form="offers-form"
          disabled={!hasUnsavedChanges || isSubmitting}
          loading={isSubmitting}
          loadingText="Enregistrement…"
          success={showSavedFeedback}
          error={!!state?.error}
        >
          Enregistrer
        </Button>
      </header>

      {/* CONTENU (GRILLE D'OFFRES) */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-8">
        {state?.error && (
          <div
            className="mb-6 p-3 rounded-lg text-sm bg-red-50 border border-red-200 text-red-700"
            role="alert"
          >
            {state.error}
          </div>
        )}

        <form id="offers-form" ref={formRef} action={action} onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20">
            {/* Cartes d'offres existantes */}
            {Array.from({ length: Math.min(offerCount, 3) }).map((_, index) => {
              const offer = sortedOffers[index] || null
              const isFeatured = featuredOfferIndex === index
              
              return (
                <div
                  key={index}
                  className={`bg-white rounded-2xl border-2 flex flex-col relative group ${
                    isFeatured ? 'border-palette-forest-dark shadow-md' : 'border-stone-200 shadow-sm hover:shadow-md'
                  } transition-all`}
                >
                  {/* Badge "Mis en avant" */}
                  {isFeatured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-palette-forest-dark text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide shadow-sm flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Recommandé
                    </div>
                  )}

                  {/* Header Carte & Actions */}
                  <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50/50 rounded-t-2xl">
                    <span className="text-xs font-bold text-stone-400 uppercase">Offre {index + 1}</span>
                    <div className="flex gap-2">
                      {/* Toggle "Privilégié" */}
                      <button
                        type="button"
                        onClick={() => {
                          if (isFeatured) {
                            setFeaturedOfferIndex(null)
                          } else {
                            setFeaturedOfferIndex(index)
                          }
                          setTimeout(() => setHasUnsavedChanges(checkUnsavedChanges()), 0)
                        }}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isFeatured
                            ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                            : 'hover:bg-yellow-50 text-stone-300 hover:text-yellow-600'
                        }`}
                        title={isFeatured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </button>
                      {/* Supprimer */}
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleDeleteClick(index)}
                        className="p-1.5 hover:bg-red-50 hover:text-red-500"
                        title="Supprimer l'offre"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>

                  {/* Formulaire Intégré */}
                  <div className="p-5 flex flex-col gap-4 flex-1">
                    <input type="hidden" name={`offer_${index}_id`} value={offer?.id || ''} />
                    <input type="hidden" name={`offer_${index}_featured`} value={isFeatured ? 'on' : ''} />

                    {/* Titre */}
                    <Input
                      id={`offer_${index}_title`}
                      label="Titre de l'offre"
                      name={`offer_${index}_title`}
                      type="text"
                      defaultValue={offer?.title || ''}
                      placeholder="Ex: Suivi Mensuel"
                      className="rounded-xl text-stone-800 font-bold bg-stone-50"
                    />

                    {/* Tarification : Prix + Récurrence */}
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Tarification
                      </label>
                      <div className="grid grid-cols-5 gap-3 items-stretch">
                        {/* Input Prix (Col 2/5) */}
                        <div className="col-span-2 flex">
                          {priceTypes[index] === 'free' ? (
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
                                defaultValue={offer?.price !== undefined && offer.price_type !== 'free' ? String(offer.price) : ''}
                                placeholder="0"
                                className="w-full pl-3 pr-6 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 font-bold focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:border-transparent transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 font-medium pointer-events-none">
                                €
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Sélecteur Récurrence (Col 3/5) */}
                        <div className="col-span-3 flex gap-1 bg-white p-1 rounded-lg border border-stone-300 items-center h-full min-h-[42px]" role="group" aria-label="Récurrence">
                          {(
                            [
                              { value: 'monthly' as const, label: '/ Mois' },
                              { value: 'one_time' as const, label: 'Unique' },
                              { value: 'free' as const, label: 'Gratuit' },
                            ]
                          ).map((opt) => {
                            const selected = (priceTypes[index] || offer?.price_type || 'one_time') === opt.value
                            return (
                              <label key={opt.value} className="flex-1 cursor-pointer flex items-center justify-center min-h-0">
                                <input
                                  type="radio"
                                  name={`offer_${index}_price_type`}
                                  value={opt.value}
                                  checked={selected}
                                  onChange={() => {
                                    setPriceTypes(prev => {
                                      const updated = { ...prev, [index]: opt.value }
                                      return updated
                                    })
                                  }}
                                  className="sr-only"
                                />
                                <div
                                  className={`w-full py-1.5 rounded-lg text-[10px] font-medium select-none transition-all text-center flex items-center justify-center text-stone-700 ${
                                    selected
                                      ? 'font-bold bg-stone-100 border border-stone-200'
                                      : 'hover:bg-stone-50'
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

                    {/* Description */}
                    <div className="flex-1">
                      <Textarea
                        id={`offer_${index}_description`}
                        label="Description & Avantages"
                        name={`offer_${index}_description`}
                        rows={4}
                        defaultValue={offer?.description || ''}
                        placeholder="Décrivez ce que l'athlète obtient..."
                        className="h-32 text-sm text-stone-600 bg-stone-50 resize-none min-h-0"
                      />
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
                  setPriceTypes(prev => ({ ...prev, [offerCount]: 'one_time' }))
                }}
                className="bg-stone-50 rounded-2xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center gap-4 hover:border-palette-forest-dark hover:bg-palette-forest-dark/5 transition-all group cursor-pointer min-h-[400px]"
              >
                <div className="w-16 h-16 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 shadow-sm group-hover:scale-110 group-hover:text-palette-forest-dark group-hover:border-palette-forest-dark transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-stone-600 group-hover:text-palette-forest-dark">Ajouter une offre</h3>
                  <p className="text-xs text-stone-400 mt-1">Vous pouvez encore créer {remainingOffers} offre{remainingOffers > 1 ? 's' : ''}</p>
                </div>
              </button>
            )}
          </div>
        </form>
      </div>

      {deleteModalOpen && offerToDelete && typeof document !== 'undefined' && createPortal(
        <>
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]"
            onClick={() => !isDeleting && setDeleteModalOpen(false)}
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-offer-title"
          >
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl border border-stone-100">
              <div className="sticky top-0 flex justify-end p-3 bg-white rounded-t-xl z-10">
              <Button
                type="button"
                variant="ghost"
                onClick={() => !isDeleting && setDeleteModalOpen(false)}
                disabled={isDeleting}
                aria-label="Fermer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
            <div className="px-8 pb-8">
              <h2 id="delete-offer-title" className="text-xl font-semibold text-stone-900 mb-2">
                Supprimer l&apos;offre
              </h2>
              <p className="text-sm text-stone-600 mb-8">
                Voulez-vous supprimer l&apos;offre &quot;{offerToDelete.title}&quot; ? Cette action est immédiate et définitive.
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="muted"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  loading={isDeleting}
                  loadingText="Suppression…"
                  className="flex-1"
                >
                  Supprimer
                </Button>
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
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]"
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
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => !isSavingBeforeLeave && setUnsavedChangesModalOpen(false)}
                  disabled={isSavingBeforeLeave}
                  aria-label="Fermer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                  </svg>
                </Button>
              </div>
              <div className="px-8 pb-8">
                <h2 id="unsaved-changes-title" className="text-xl font-semibold text-stone-900 mb-2">
                  Modifications non enregistrées
                </h2>
                <p className="text-sm text-stone-600 mb-8">
                  Vous avez des modifications non enregistrées. Que souhaitez-vous faire ?
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="muted"
                    onClick={handleLeaveWithoutSaving}
                    disabled={isSavingBeforeLeave}
                    className="flex-1"
                  >
                    Quitter sans enregistrer
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveAndLeave}
                    disabled={isSavingBeforeLeave}
                    loading={isSavingBeforeLeave}
                    loadingText="Enregistrement…"
                    className="flex-1"
                  >
                    Enregistrer et quitter
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}

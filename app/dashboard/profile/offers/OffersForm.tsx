'use client'

import { useState, useActionState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { PrimaryButton } from '@/components/PrimaryButton'
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
  const isSubmittingRef = useRef(false)
  const formRef = useRef<HTMLFormElement>(null)

  const sortedOffers = [...offers].sort((a, b) => a.display_order - b.display_order)
  const initialOffersRef = useRef(offers)
  const lastOffersLengthRef = useRef(offers.length)

  // Synchroniser le compteur avec les offres après suppression en base
  useEffect(() => {
    // Si le nombre d'offres a diminué (suppression en base), mettre à jour
    if (offers.length < lastOffersLengthRef.current) {
      setOfferCount(Math.max(offers.length || 0, 0))
      initialOffersRef.current = offers
    } else if (offers.length === lastOffersLengthRef.current) {
      // Même nombre, mettre à jour les références initiales
      initialOffersRef.current = offers
    }
    lastOffersLengthRef.current = offers.length
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
      const priceType = (form.querySelector(`[name="offer_${i}_price_type"]`) as HTMLSelectElement)?.value || ''

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
        current.title !== (initial.title || '') ||
        current.description !== (initial.description || '') ||
        current.price !== String(initial.price || '') ||
        current.price_type !== (initial.price_type || '')
      ) {
        return true
      }
    }

    return false
  }, [offerCount])

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
  }

  // Réinitialiser le flag après la soumission
  useEffect(() => {
    if (state?.success || state?.error) {
      isSubmittingRef.current = false
    }
  }, [state])

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

  return (
    <>
      <form ref={formRef} action={action} onSubmit={handleFormSubmit} className="mt-8 space-y-8">
      <section className="space-y-6 rounded-2xl border border-stone-200 bg-section p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-stone-900">Mes offres</h2>
          <p className="text-sm text-stone-500">Jusqu'à 3 offres</p>
        </div>

        <p className="text-sm text-stone-600">
          Définissez jusqu'à 3 offres de coaching. Chaque offre doit avoir un titre, une description et un prix (frais unique ou mensuel).
        </p>

        {offerCount === 0 ? (
          <p className="text-sm text-stone-500 text-center py-4">
            Aucune offre définie. Cliquez sur &quot;Ajouter une offre&quot; pour commencer.
          </p>
        ) : (
          Array.from({ length: Math.min(offerCount, 3) }).map((_, index) => {
          const offer = sortedOffers[index] || null
          return (
            <div key={index} className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-stone-700">Offre {index + 1}</h3>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(index)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Supprimer
                </button>
              </div>

              <input type="hidden" name={`offer_${index}_id`} value={offer?.id || ''} />

              <div>
                <label htmlFor={`offer_${index}_title`} className="block text-sm font-medium text-stone-700 mb-1.5">
                  Titre *
                </label>
                <input
                  id={`offer_${index}_title`}
                  name={`offer_${index}_title`}
                  type="text"
                  defaultValue={offer?.title || ''}
                  placeholder="Ex: Coaching mensuel complet"
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
                />
              </div>

              <div>
                <label htmlFor={`offer_${index}_description`} className="block text-sm font-medium text-stone-700 mb-1.5">
                  Description *
                </label>
                <textarea
                  id={`offer_${index}_description`}
                  name={`offer_${index}_description`}
                  rows={4}
                  defaultValue={offer?.description || ''}
                  placeholder="Décrivez votre offre en détail..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent resize-y min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor={`offer_${index}_price`} className="block text-sm font-medium text-stone-700 mb-1.5">
                    Prix *
                  </label>
                  <div className="relative">
                    <input
                      id={`offer_${index}_price`}
                      name={`offer_${index}_price`}
                      type="number"
                      step="0.01"
                      min="0"
                      defaultValue={offer?.price || ''}
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">€</span>
                  </div>
                </div>

                <div>
                  <label htmlFor={`offer_${index}_price_type`} className="block text-sm font-medium text-stone-700 mb-1.5">
                    Type de prix *
                  </label>
                  <select
                    id={`offer_${index}_price_type`}
                    name={`offer_${index}_price_type`}
                    defaultValue={offer?.price_type || 'one_time'}
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-transparent transition"
                  >
                    <option value="one_time">Frais unique</option>
                    <option value="monthly">Prix mensuel</option>
                  </select>
                </div>
              </div>
            </div>
          )
          })
        )}

        {offerCount < 3 && (
          <button
            type="button"
            onClick={() => setOfferCount(offerCount + 1)}
            className="w-full py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            + Ajouter une offre
          </button>
        )}
      </section>

      {(state?.error || state?.success) && (
        <p
          className={`text-sm ${state.error ? 'text-red-600' : 'text-palette-forest-dark'}`}
          role="alert"
        >
          {state.error || state.success}
        </p>
      )}

      <PrimaryButton type="submit" fullWidth>
        Enregistrer les offres
      </PrimaryButton>
      </form>

      {deleteModalOpen && offerToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-offer-title"
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
                disabled={isDeleting}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="px-8 pb-8">
              <h2 id="delete-offer-title" className="text-xl font-semibold text-stone-900 mb-2">
                Supprimer l&apos;offre
              </h2>
              <p className="text-sm text-stone-600 mb-8">
                Voulez-vous supprimer l&apos;offre &quot;{offerToDelete.title}&quot; ? Cette action est immédiate et définitive.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-lg border border-stone-300 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
                <PrimaryButton
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Suppression...' : 'Supprimer'}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      )}

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

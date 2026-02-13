'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/authHelpers'

export type OffersFormState = {
  error?: string
  success?: string
}

export async function saveOffers(
  _prevState: OffersFormState,
  formData: FormData
): Promise<OffersFormState> {
  const supabase = await createClient()
  const result = await requireRole(supabase, 'coach')
  if ('error' in result) return { error: result.error }

  const { user } = result

  // Récupérer les offres depuis le formulaire
  const offers: Array<{
    id?: string
    title: string
    description: string
    price: number
    price_type: 'one_time' | 'monthly' | 'free'
    display_order: number
    is_featured: boolean
  }> = []

  let featuredIndex: number | null = null

  for (let i = 0; i < 3; i++) {
    const title = (formData.get(`offer_${i}_title`) as string)?.trim()
    const description = (formData.get(`offer_${i}_description`) as string)?.trim()
    const priceStr = (formData.get(`offer_${i}_price`) as string)?.trim()
    const priceType = (formData.get(`offer_${i}_price_type`) as string)?.trim() as 'one_time' | 'monthly' | 'free'
    const offerId = (formData.get(`offer_${i}_id`) as string)?.trim()
    const isFeatured = formData.get(`offer_${i}_featured`) === 'on'

    if (title && description && priceType) {
      let price = 0
      
      // Si le type est "free", le prix est forcé à 0
      if (priceType === 'free') {
        price = 0
      } else {
        // Pour les autres types, le prix est requis
        if (!priceStr) {
          return { error: `Le prix de l'offre ${i + 1} est requis pour ce type de prix.` }
        }
        price = parseFloat(priceStr)
        if (isNaN(price) || price < 0) {
          return { error: `Le prix de l'offre ${i + 1} est invalide.` }
        }
      }

      if (isFeatured) {
        if (featuredIndex !== null) {
          return { error: 'Une seule offre peut être privilégiée.' }
        }
        featuredIndex = offers.length
      }

      offers.push({
        id: offerId || undefined,
        title,
        description,
        price,
        price_type: priceType,
        display_order: i,
        is_featured: isFeatured,
      })
    }
  }

  // Supprimer toutes les offres existantes
  const { error: deleteError } = await supabase
    .from('coach_offers')
    .delete()
    .eq('coach_id', user.id)

  if (deleteError) return { error: deleteError.message }

  // Insérer les nouvelles offres
  if (offers.length > 0) {
    const { error: insertError } = await supabase
      .from('coach_offers')
      .insert(
        offers.map((offer) => ({
          coach_id: user.id,
          title: offer.title,
          description: offer.description,
          price: offer.price,
          price_type: offer.price_type,
          display_order: offer.display_order,
          is_featured: offer.is_featured,
        }))
      )

    if (insertError) {
      // Si l'erreur est due à la contrainte unique sur is_featured, donner un message plus clair
      if (insertError.message.includes('idx_coach_offers_featured_unique')) {
        return { error: 'Une seule offre peut être privilégiée. Veuillez désélectionner l\'autre offre privilégiée.' }
      }
      return { error: insertError.message }
    }
  }

  revalidatePath('/dashboard/profile/offers')
  return { success: 'ok' }
}

export async function deleteOffer(offerId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const roleResult = await requireRole(supabase, 'coach')
  if ('error' in roleResult) return { error: roleResult.error }

  const { user } = roleResult

  const { error } = await supabase
    .from('coach_offers')
    .delete()
    .eq('id', offerId)
    .eq('coach_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile/offers')
  return {}
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type OffersFormState = {
  error?: string
  success?: string
}

export async function saveOffers(
  _prevState: OffersFormState,
  formData: FormData
): Promise<OffersFormState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'coach') {
    return { error: 'Seuls les coaches peuvent gérer des offres.' }
  }

  // Récupérer les offres depuis le formulaire
  const offers: Array<{
    id?: string
    title: string
    description: string
    price: number
    price_type: 'one_time' | 'monthly'
    display_order: number
  }> = []

  for (let i = 0; i < 3; i++) {
    const title = (formData.get(`offer_${i}_title`) as string)?.trim()
    const description = (formData.get(`offer_${i}_description`) as string)?.trim()
    const priceStr = (formData.get(`offer_${i}_price`) as string)?.trim()
    const priceType = (formData.get(`offer_${i}_price_type`) as string)?.trim() as 'one_time' | 'monthly'
    const offerId = (formData.get(`offer_${i}_id`) as string)?.trim()

    if (title && description && priceStr && priceType) {
      const price = parseFloat(priceStr)
      if (isNaN(price) || price < 0) {
        return { error: `Le prix de l'offre ${i + 1} est invalide.` }
      }

      offers.push({
        id: offerId || undefined,
        title,
        description,
        price,
        price_type: priceType,
        display_order: i,
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
        }))
      )

    if (insertError) return { error: insertError.message }
  }

  revalidatePath('/dashboard/profile/offers')
  return { success: 'Offres enregistrées avec succès.' }
}

export async function deleteOffer(offerId: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'coach') {
    return { error: 'Seuls les coaches peuvent gérer des offres.' }
  }

  const { error } = await supabase
    .from('coach_offers')
    .delete()
    .eq('id', offerId)
    .eq('coach_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/profile/offers')
  return {}
}

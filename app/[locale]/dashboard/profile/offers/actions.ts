'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/authHelpers'
import { getTranslations } from 'next-intl/server'

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
  
  // Extraire la locale du formData
  const locale = (formData.get('_locale') as string) || 'fr'
  const t = await getTranslations({ locale, namespace: 'offers.validation' })

  // Récupérer les offres depuis le formulaire (titres et descriptions FR/EN)
  const offers: Array<{
    id?: string
    title_fr: string | null
    title_en: string | null
    description_fr: string | null
    description_en: string | null
    price: number
    price_type: 'one_time' | 'monthly' | 'free'
    display_order: number
    is_featured: boolean
  }> = []

  let featuredIndex: number | null = null

  for (let i = 0; i < 3; i++) {
    const titleFr = (formData.get(`offer_${i}_title_fr`) as string)?.trim() || null
    const titleEn = (formData.get(`offer_${i}_title_en`) as string)?.trim() || null
    const descriptionFr = (formData.get(`offer_${i}_description_fr`) as string)?.trim() || null
    const descriptionEn = (formData.get(`offer_${i}_description_en`) as string)?.trim() || null
    const priceStr = (formData.get(`offer_${i}_price`) as string)?.trim()
    const priceType = (formData.get(`offer_${i}_price_type`) as string)?.trim() as 'one_time' | 'monthly' | 'free'
    const offerId = (formData.get(`offer_${i}_id`) as string)?.trim()
    const isFeatured = formData.get(`offer_${i}_featured`) === 'on'

    const hasTitle = (titleFr ?? '').length > 0 || (titleEn ?? '').length > 0
    const hasDescription = (descriptionFr ?? '').length > 0 || (descriptionEn ?? '').length > 0
    if (hasTitle && hasDescription && priceType) {
      let price = 0
      
      // Si le type est "free", le prix est forcé à 0
      if (priceType === 'free') {
        price = 0
      } else {
        // Pour les autres types, le prix est requis
        if (!priceStr) {
          return { error: t('priceRequired', { number: i + 1 }) }
        }
        price = parseFloat(priceStr)
        if (isNaN(price) || price < 0) {
          return { error: t('priceInvalid', { number: i + 1 }) }
        }
      }

      if (isFeatured) {
        if (featuredIndex !== null) {
          return { error: t('onlyOneFeatured') }
        }
        featuredIndex = offers.length
      }

      offers.push({
        id: offerId || undefined,
        title_fr: titleFr,
        title_en: titleEn,
        description_fr: descriptionFr,
        description_en: descriptionEn,
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

  // Insérer les nouvelles offres (title/description gardés pour NOT NULL, dérivés de _fr/_en)
  if (offers.length > 0) {
    const { error: insertError } = await supabase
      .from('coach_offers')
      .insert(
        offers.map((offer) => {
          const title = (offer.title_fr ?? '').trim() || (offer.title_en ?? '').trim() || 'Offre'
          const description = (offer.description_fr ?? '').trim() || (offer.description_en ?? '').trim() || ''
          return {
            coach_id: user.id,
            title,
            description,
            title_fr: offer.title_fr || null,
            title_en: offer.title_en || null,
            description_fr: offer.description_fr || null,
            description_en: offer.description_en || null,
            price: offer.price,
            price_type: offer.price_type,
            display_order: offer.display_order,
            is_featured: offer.is_featured,
          }
        })
      )

    if (insertError) {
      // Si l'erreur est due à la contrainte unique sur is_featured, donner un message plus clair
      if (insertError.message.includes('idx_coach_offers_featured_unique')) {
        return { error: t('onlyOneFeatured') }
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

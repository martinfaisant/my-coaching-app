'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/authHelpers'
import { getTranslations } from 'next-intl/server'
import type { CoachOfferArchived } from '@/types/database'

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
  const locale = (formData.get('_locale') as string) || 'fr'
  const t = await getTranslations({ locale, namespace: 'offers.validation' })

  type OfferRow = {
    id?: string
    title_fr: string | null
    title_en: string | null
    description_fr: string | null
    description_en: string | null
    price: number | null
    price_type: 'one_time' | 'monthly' | 'free' | null
    display_order: number
    is_featured: boolean
  }

  const offers: OfferRow[] = []
  let featuredIndex: number | null = null

  const draftTitleFallback = locale === 'fr' ? 'Brouillon' : 'Draft'

  for (let i = 0; i <= 2; i++) {
    const titleFr = (formData.get(`offer_${i}_title_fr`) as string)?.trim() || null
    const titleEn = (formData.get(`offer_${i}_title_en`) as string)?.trim() || null
    const descriptionFr = (formData.get(`offer_${i}_description_fr`) as string)?.trim() || null
    const descriptionEn = (formData.get(`offer_${i}_description_en`) as string)?.trim() || null
    const priceStr = (formData.get(`offer_${i}_price`) as string)?.trim()
    const priceTypeRaw = (formData.get(`offer_${i}_price_type`) as string)?.trim() as 'one_time' | 'monthly' | 'free' | undefined
    const offerId = (formData.get(`offer_${i}_id`) as string)?.trim() || undefined
    const isFeatured = formData.get(`offer_${i}_featured`) === 'on'

    const hasAnyContent = (titleFr ?? '').length > 0 || (titleEn ?? '').length > 0 || (descriptionFr ?? '').length > 0 || (descriptionEn ?? '').length > 0 || (priceStr ?? '').length > 0 || priceTypeRaw != null
    if (!offerId && !hasAnyContent) continue

    const hasPriceOrType = (priceStr ?? '').length > 0 || (priceTypeRaw && ['one_time', 'monthly', 'free'].includes(priceTypeRaw))
    let price: number | null = null
    let priceType: 'one_time' | 'monthly' | 'free' | null = null
    if (hasPriceOrType) {
      priceType = priceTypeRaw && ['one_time', 'monthly', 'free'].includes(priceTypeRaw) ? priceTypeRaw : null
      if (priceType === 'free') {
        price = 0
      } else if (priceType === 'one_time' || priceType === 'monthly') {
        const parsed = priceStr ? parseFloat(priceStr) : NaN
        if (priceStr && !isNaN(parsed) && parsed >= 0) {
          price = parsed
        }
      }
    }

    if (price != null && price < 0) return { error: t('priceInvalid', { number: i + 1 }) }

    if (isFeatured) {
      if (featuredIndex !== null) return { error: t('onlyOneFeatured') }
      featuredIndex = offers.length
    }

    offers.push({
      id: offerId,
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

  const title = (o: OfferRow) => (o.title_fr ?? '').trim() || (o.title_en ?? '').trim() || draftTitleFallback
  const description = (o: OfferRow) => (o.description_fr ?? '').trim() || (o.description_en ?? '').trim() || ''

  const { data: existingOffers } = await supabase
    .from('coach_offers')
    .select('id, display_order')
    .eq('coach_id', user.id)
  // Utiliser les display_order qu'on assigne aux offres existantes dans ce formulaire (pas la DB),
  // pour que l'insert de la nouvelle offre choisisse un slot libre sans conflit.
  const usedOrders = new Set(offers.filter((o) => o.id).map((o) => o.display_order))
  const nextFreeDisplayOrder = (): number => {
    for (let o = 0; o <= 2; o++) {
      if (!usedOrders.has(o)) return o
    }
    return 0
  }

  for (const offer of offers) {
    if (offer.is_featured && offer.id) {
      await supabase
        .from('coach_offers')
        .update({ is_featured: false })
        .eq('coach_id', user.id)
        .neq('id', offer.id)
    }

    if (offer.id) {
      const existing = await supabase
        .from('coach_offers')
        .select('id, coach_id')
        .eq('id', offer.id)
        .eq('coach_id', user.id)
        .single()

      if (existing.error || !existing.data) return { error: t('offerNotFound') }

      const { error: updateError } = await supabase
        .from('coach_offers')
        .update({
          title: title(offer),
          description: description(offer),
          title_fr: offer.title_fr || null,
          title_en: offer.title_en || null,
          description_fr: offer.description_fr || null,
          description_en: offer.description_en || null,
          price: offer.price,
          price_type: offer.price_type,
          display_order: offer.display_order,
          is_featured: offer.is_featured,
        })
        .eq('id', offer.id)
        .eq('coach_id', user.id)

      if (updateError) {
        if (updateError.message.includes('idx_coach_offers_featured_unique')) return { error: t('onlyOneFeatured') }
        return { error: updateError.message }
      }
    } else {
      if (offer.is_featured) {
        await supabase.from('coach_offers').update({ is_featured: false }).eq('coach_id', user.id)
      }
      const displayOrder = nextFreeDisplayOrder()
      const { error: insertError } = await supabase.from('coach_offers').insert({
        coach_id: user.id,
        title: title(offer),
        description: description(offer),
        title_fr: offer.title_fr || null,
        title_en: offer.title_en || null,
        description_fr: offer.description_fr || null,
        description_en: offer.description_en || null,
        price: offer.price,
        price_type: offer.price_type,
        display_order: displayOrder,
        is_featured: offer.is_featured,
      })

      if (insertError) {
        if (insertError.message.includes('idx_coach_offers_featured_unique')) return { error: t('onlyOneFeatured') }
        if (insertError.message.includes('coach_offers_coach_id_display_order')) return { error: t('displayOrderConflict') }
        return { error: insertError.message }
      }
      usedOrders.add(displayOrder)
    }
  }

  revalidatePath('/dashboard/profile/offers')
  return { success: 'ok' }
}

export type ArchiveOfferResult = { error?: string } | { success: true; archived: CoachOfferArchived }

export async function archiveOffer(
  offerId: string,
  locale: string = 'fr'
): Promise<ArchiveOfferResult> {
  const supabase = await createClient()
  const result = await requireRole(supabase, 'coach')
  if ('error' in result) return { error: result.error }

  const { user } = result
  const t = await getTranslations({ locale, namespace: 'offers.validation' })

  const { data: offer, error: fetchError } = await supabase
    .from('coach_offers')
    .select('*')
    .eq('id', offerId)
    .eq('coach_id', user.id)
    .single()

  if (fetchError || !offer) return { error: t('offerNotFound') }

  const { data: insertedArchived, error: insertError } = await supabase
    .from('coach_offers_archived')
    .insert({
      original_id: offer.id,
      coach_id: offer.coach_id,
      title: offer.title,
      description: offer.description,
      title_fr: offer.title_fr ?? null,
      title_en: offer.title_en ?? null,
      description_fr: offer.description_fr ?? null,
      description_en: offer.description_en ?? null,
      price: offer.price ?? 0,
      price_type: offer.price_type ?? 'one_time',
      display_order: offer.display_order,
      is_featured: offer.is_featured,
      created_at: offer.created_at,
      updated_at: offer.updated_at,
    })
    .select()
    .single()

  if (insertError) return { error: insertError.message }
  if (!insertedArchived) return { error: t('offerNotFound') }

  const { error: deleteError } = await supabase
    .from('coach_offers')
    .delete()
    .eq('id', offerId)
    .eq('coach_id', user.id)

  if (deleteError) return { error: deleteError.message }

  revalidatePath('/dashboard/profile/offers')
  return { success: true, archived: insertedArchived }
}

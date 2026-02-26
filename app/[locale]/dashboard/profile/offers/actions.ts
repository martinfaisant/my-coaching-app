'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { requireRole } from '@/lib/authHelpers'
import { getTranslations } from 'next-intl/server'
import type { CoachOffer, CoachOfferArchived } from '@/types/database'

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

  // Pour les nouvelles offres : garder la position du formulaire (ordre de création affiché)
  const usedOrders = new Set(offers.filter((o) => o.id).map((o) => o.display_order))

  for (const offer of offers) {
    if (offer.is_featured && offer.id) {
      await supabase
        .from('coach_offers')
        .update({ is_featured: false })
        .eq('coach_id', user.id)
        .eq('status', 'published')
        .neq('id', offer.id)
    }

    if (offer.id) {
      const existing = await supabase
        .from('coach_offers')
        .select('id, coach_id, status')
        .eq('id', offer.id)
        .eq('coach_id', user.id)
        .single()

      if (existing.error || !existing.data) return { error: t('offerNotFound') }

      const isPublished = existing.data.status === 'published'
      const updatePayload: Record<string, unknown> = {
        title: title(offer),
        description: description(offer),
        title_fr: offer.title_fr || null,
        title_en: offer.title_en || null,
        description_fr: offer.description_fr || null,
        description_en: offer.description_en || null,
        display_order: offer.display_order,
        is_featured: offer.is_featured,
      }
      if (!isPublished) {
        updatePayload.price = offer.price
        updatePayload.price_type = offer.price_type
      }

      const { error: updateError } = await supabase
        .from('coach_offers')
        .update(updatePayload)
        .eq('id', offer.id)
        .eq('coach_id', user.id)

      if (updateError) {
        if (updateError.message.includes('idx_coach_offers_featured_unique')) return { error: t('onlyOneFeatured') }
        return { error: updateError.message }
      }
    } else {
      if (offer.is_featured) {
        await supabase
          .from('coach_offers')
          .update({ is_featured: false })
          .eq('coach_id', user.id)
          .eq('status', 'published')
      }
      // Garder la position du slot (ordre affiché = ordre de création)
      const displayOrder = offer.display_order
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
        status: 'draft',
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

  const { data: updated, error: updateError } = await supabase
    .from('coach_offers')
    .update({
      status: 'archived',
      archived_at: new Date().toISOString(),
      is_featured: false,
    })
    .eq('id', offerId)
    .eq('coach_id', user.id)
    .select()
    .single()

  if (updateError) return { error: updateError.message }
  if (!updated || updated.status !== 'archived' || !updated.archived_at)
    return { error: t('offerNotFound') }

  revalidatePath('/dashboard/profile/offers')
  return {
    success: true,
    archived: { ...updated, status: 'archived' as const, archived_at: updated.archived_at },
  }
}

export type PublishOfferResult = { error?: string } | { success: true; offer: CoachOffer }

export async function publishOffer(
  offerId: string,
  formData: FormData,
  locale: string = 'fr'
): Promise<PublishOfferResult> {
  const supabase = await createClient()
  const result = await requireRole(supabase, 'coach')
  if ('error' in result) return { error: result.error }

  const { user } = result
  const t = await getTranslations({ locale, namespace: 'offers.validation' })

  const titleFr = (formData.get('_publish_title_fr') as string)?.trim() ?? ''
  const titleEn = (formData.get('_publish_title_en') as string)?.trim() ?? ''
  const descriptionFr = (formData.get('_publish_description_fr') as string)?.trim() ?? ''
  const descriptionEn = (formData.get('_publish_description_en') as string)?.trim() ?? ''
  const priceStr = (formData.get('_publish_price') as string)?.trim() ?? ''
  const priceTypeRaw = (formData.get('_publish_price_type') as string)?.trim() as 'one_time' | 'monthly' | 'free' | undefined

  const hasTitles = titleFr.length > 0 && titleEn.length > 0
  const hasDescriptions = descriptionFr.length > 0 && descriptionEn.length > 0
  const hasRecurrence = priceTypeRaw === 'one_time' || priceTypeRaw === 'monthly' || priceTypeRaw === 'free'
  const hasValidPrice =
    priceTypeRaw === 'free' || (priceStr.length > 0 && !isNaN(parseFloat(priceStr)) && parseFloat(priceStr) >= 0)
  if (!hasTitles || !hasDescriptions || !hasRecurrence || !hasValidPrice) {
    return { error: t('publishFieldsRequired') }
  }

  const title = titleFr.trim() || titleEn.trim() || (locale === 'fr' ? 'Brouillon' : 'Draft')
  const description = descriptionFr.trim() || descriptionEn.trim() || ''
  let price: number | null = null
  if (priceTypeRaw === 'free') {
    price = 0
  } else if (priceTypeRaw === 'one_time' || priceTypeRaw === 'monthly') {
    const parsed = parseFloat(priceStr)
    if (!isNaN(parsed) && parsed >= 0) price = parsed
  }
  if (price === null && priceTypeRaw !== 'free') return { error: t('publishFieldsRequired') }

  const { data: offer, error: fetchError } = await supabase
    .from('coach_offers')
    .select('*')
    .eq('id', offerId)
    .eq('coach_id', user.id)
    .eq('status', 'draft')
    .single()

  if (fetchError || !offer) return { error: t('offerNotFound') }

  const { data: updated, error: updateError } = await supabase
    .from('coach_offers')
    .update({
      title,
      description,
      title_fr: titleFr || null,
      title_en: titleEn || null,
      description_fr: descriptionFr || null,
      description_en: descriptionEn || null,
      price,
      price_type: priceTypeRaw,
      status: 'published',
    })
    .eq('id', offerId)
    .eq('coach_id', user.id)
    .select()
    .single()

  if (updateError) return { error: updateError.message }
  if (!updated) return { error: t('offerNotFound') }

  revalidatePath('/dashboard/profile/offers')
  return {
    success: true,
    offer: { ...updated, status: 'published' as const },
  }
}

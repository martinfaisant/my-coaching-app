import type { CoachOffer } from '@/types/database'

export function makeCoachOffer(overrides: Partial<CoachOffer> & Pick<CoachOffer, 'id'>): CoachOffer {
  return {
    coach_id: 'coach-1',
    title: 'Coaching',
    description: 'Description',
    title_fr: 'Coaching FR',
    title_en: 'Coaching EN',
    description_fr: 'Description FR',
    description_en: 'Description EN',
    price: 49,
    price_type: 'monthly',
    display_order: 0,
    is_featured: false,
    status: 'published',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

export type SaveOfferSlotInput = {
  index: number
  id?: string
  titleFr?: string
  titleEn?: string
  descriptionFr?: string
  descriptionEn?: string
  price?: string
  priceType?: 'one_time' | 'monthly' | 'free'
  featured?: boolean
}

export function buildSaveOffersFormData(slots: SaveOfferSlotInput[]): FormData {
  const formData = new FormData()
  formData.set('_locale', 'fr')

  for (const slot of slots) {
    const i = slot.index
    if (slot.id) formData.set(`offer_${i}_id`, slot.id)
    formData.set(`offer_${i}_title_fr`, slot.titleFr ?? 'Titre FR')
    formData.set(`offer_${i}_title_en`, slot.titleEn ?? 'Title EN')
    formData.set(`offer_${i}_description_fr`, slot.descriptionFr ?? 'Description FR')
    formData.set(`offer_${i}_description_en`, slot.descriptionEn ?? 'Description EN')
    formData.set(`offer_${i}_price`, slot.price ?? '49')
    formData.set(`offer_${i}_price_type`, slot.priceType ?? 'monthly')
    if (slot.featured) formData.set(`offer_${i}_featured`, 'on')
  }

  return formData
}

export function buildPublishFormData(options: {
  featured?: boolean
  priceType?: 'one_time' | 'monthly' | 'free'
  price?: string
} = {}): FormData {
  const formData = new FormData()
  formData.set('_publish_title_fr', 'Titre FR')
  formData.set('_publish_title_en', 'Title EN')
  formData.set('_publish_description_fr', 'Description FR')
  formData.set('_publish_description_en', 'Description EN')
  formData.set('_publish_price_type', options.priceType ?? 'monthly')
  formData.set('_publish_price', options.price ?? '49')
  if (options.featured) formData.set('_publish_is_featured', 'on')
  return formData
}

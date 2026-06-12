import { beforeEach, describe, expect, it, vi } from 'vitest'

import { publishOffer, saveOffers } from './actions'
import { buildPublishFormData, buildSaveOffersFormData } from './offersTestUtils'

const mockUpdatePayloads = vi.hoisted(() => [] as Record<string, unknown>[])

const supabaseBuilder = vi.hoisted(() => {
  const builder: {
    eq: ReturnType<typeof vi.fn>
    neq: ReturnType<typeof vi.fn>
    select: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    single: ReturnType<typeof vi.fn>
  } = {
    eq: vi.fn(),
    neq: vi.fn(),
    select: vi.fn(),
    update: vi.fn(),
    insert: vi.fn(),
    single: vi.fn(),
  }

  const chain = () => builder
  builder.eq.mockImplementation(chain)
  builder.neq.mockImplementation(chain)
  builder.select.mockImplementation(chain)
  builder.update.mockImplementation((payload: Record<string, unknown>) => {
    mockUpdatePayloads.push(payload)
    return builder
  })
  builder.insert.mockResolvedValue({ error: null })
  builder.single.mockResolvedValue({
    data: { id: 'offer-id', coach_id: 'coach-1', status: 'published' },
    error: null,
  })

  return builder
})

const mockSupabase = vi.hoisted(() => ({
  from: vi.fn(() => supabaseBuilder),
}))

vi.mock('@/utils/supabase/server', () => ({
  createClient: vi.fn(async () => mockSupabase),
}))

vi.mock('@/lib/authHelpers', () => ({
  requireRole: vi.fn(async () => ({
    user: { id: 'coach-1' },
    profile: { role: 'coach' },
  })),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}))

describe('offers actions — is_featured', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdatePayloads.length = 0
    supabaseBuilder.single.mockResolvedValue({
      data: { id: 'offer-id', coach_id: 'coach-1', status: 'published' },
      error: null,
    })
  })

  it('saveOffers persiste is_featured sur le slot recommandé', async () => {
    const formData = buildSaveOffersFormData([
      { index: 0, id: 'offer-a', featured: true },
      { index: 1, id: 'offer-b' },
    ])

    const result = await saveOffers({}, formData)

    expect(result).toEqual({ success: 'ok' })
    expect(mockUpdatePayloads.some((payload) => payload.is_featured === true)).toBe(true)
    expect(mockUpdatePayloads.some((payload) => payload.is_featured === false)).toBe(true)
  })

  it('saveOffers refuse deux offres recommandées dans le même formulaire', async () => {
    const formData = buildSaveOffersFormData([
      { index: 0, id: 'offer-a', featured: true },
      { index: 1, id: 'offer-b', featured: true },
    ])

    const result = await saveOffers({}, formData)

    expect(result).toEqual({ error: 'onlyOneFeatured' })
    expect(mockUpdatePayloads).toHaveLength(0)
  })

  it('publishOffer persiste is_featured quand _publish_is_featured est envoyé', async () => {
    supabaseBuilder.single
      .mockResolvedValueOnce({
        data: { id: 'draft-offer', coach_id: 'coach-1', status: 'draft' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: 'draft-offer',
          coach_id: 'coach-1',
          status: 'published',
          is_featured: true,
        },
        error: null,
      })

    const formData = buildPublishFormData({ featured: true })

    const result = await publishOffer('draft-offer', formData, 'fr')

    expect(result).toMatchObject({ success: true })
    expect(mockUpdatePayloads.some((payload) => payload.is_featured === true)).toBe(true)
    expect(mockUpdatePayloads.some((payload) => payload.status === 'published')).toBe(true)
  })

  it('publishOffer enregistre is_featured à false sans flag _publish_is_featured', async () => {
    supabaseBuilder.single
      .mockResolvedValueOnce({
        data: { id: 'draft-offer', coach_id: 'coach-1', status: 'draft' },
        error: null,
      })
      .mockResolvedValueOnce({
        data: {
          id: 'draft-offer',
          coach_id: 'coach-1',
          status: 'published',
          is_featured: false,
        },
        error: null,
      })

    const formData = buildPublishFormData()

    const result = await publishOffer('draft-offer', formData, 'fr')

    expect(result).toMatchObject({ success: true })
    const publishUpdate = mockUpdatePayloads.find((payload) => payload.status === 'published')
    expect(publishUpdate?.is_featured).toBe(false)
  })
})

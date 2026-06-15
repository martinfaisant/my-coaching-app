import { createClient } from '@/utils/supabase/server'
import { logger } from '@/lib/logger'
import {
  type CoachOfferForDisplay,
  type CoachListingProfile,
  groupOffersByCoachId,
  mapRatingsByCoachId,
} from '@/lib/coachListingUtils'

export type PublicCoachProfile = CoachListingProfile & {
  user_id: string
  avatar_url?: string | null
}

export type PublicCoachDirectoryData = {
  coaches: PublicCoachProfile[]
  offersByCoach: Record<string, CoachOfferForDisplay[]>
  ratingsByCoach: Record<string, { averageRating: number; reviewCount: number }>
}

export type PublicCoachProfileData = {
  coach: PublicCoachProfile
  offers: CoachOfferForDisplay[]
  ratings: { averageRating: number; reviewCount: number } | null
}

export type RpcCoachRow = {
  user_id: string
  first_name: string | null
  last_name: string | null
  coached_sports: string[] | null
  languages: string[] | null
  presentation_fr: string | null
  presentation_en: string | null
  avatar_url: string | null
}

export type RpcOfferRow = {
  id: string
  coach_id: string
  title: string
  description: string | null
  title_fr: string | null
  title_en: string | null
  description_fr: string | null
  description_en: string | null
  price: number | null
  price_type: string | null
  is_featured: boolean
  display_order: number
}

export function mapCoachRow(row: RpcCoachRow): PublicCoachProfile {
  return {
    user_id: row.user_id,
    first_name: row.first_name,
    last_name: row.last_name,
    coached_sports: row.coached_sports ?? [],
    languages: row.languages ?? [],
    presentation_fr: row.presentation_fr,
    presentation_en: row.presentation_en,
    avatar_url: row.avatar_url,
  }
}

export function mapOfferRow(row: RpcOfferRow): CoachOfferForDisplay {
  return {
    id: row.id,
    coach_id: row.coach_id,
    title: row.title,
    description: row.description,
    title_fr: row.title_fr,
    title_en: row.title_en,
    description_fr: row.description_fr,
    description_en: row.description_en,
    price: Number(row.price ?? 0),
    price_type: row.price_type ?? 'monthly',
    is_featured: row.is_featured,
    display_order: row.display_order,
  }
}

export async function loadPublicCoachDirectory(): Promise<PublicCoachDirectoryData> {
  const supabase = await createClient()

  const [coachesResult, offersResult, ratingStats] = await Promise.all([
    supabase.rpc('get_public_coaches'),
    supabase.rpc('get_public_coach_offers'),
    supabase.rpc('get_coach_rating_stats'),
  ])

  if (coachesResult.error) {
    logger.error('get_public_coaches rpc failed', coachesResult.error)
  }
  if (offersResult.error) {
    logger.error('get_public_coach_offers rpc failed', offersResult.error)
  }
  if (ratingStats.error) {
    logger.error('get_coach_rating_stats rpc failed', ratingStats.error)
  }

  const coaches = ((coachesResult.data ?? []) as RpcCoachRow[]).map(mapCoachRow)
  const offers = ((offersResult.data ?? []) as RpcOfferRow[]).map(mapOfferRow)

  return {
    coaches,
    offersByCoach: groupOffersByCoachId(offers),
    ratingsByCoach: mapRatingsByCoachId(ratingStats.data ?? []),
  }
}

export async function loadPublicCoachProfile(
  coachId: string
): Promise<PublicCoachProfileData | null> {
  const supabase = await createClient()

  const [profileResult, ratingStats] = await Promise.all([
    supabase.rpc('get_public_coach_profile', { p_coach_id: coachId }),
    supabase.rpc('get_coach_rating_stats'),
  ])

  if (profileResult.error) {
    logger.error('get_public_coach_profile rpc failed', profileResult.error, { coachId })
    return null
  }

  const row = (profileResult.data ?? [])[0] as
    | (RpcCoachRow & { offers: RpcOfferRow[] | null })
    | undefined

  if (!row) return null

  const offersRaw = Array.isArray(row.offers) ? row.offers : []
  const offers = offersRaw.map((offer) =>
    mapOfferRow({
      ...offer,
      coach_id: coachId,
    })
  )

  const ratingsByCoach = mapRatingsByCoachId(ratingStats.data ?? [])

  return {
    coach: mapCoachRow(row),
    offers,
    ratings: ratingsByCoach[coachId] ?? null,
  }
}

export type PublicCoachSitemapEntry = {
  coachId: string
  lastModified: Date
}

export async function loadPublicCoachSitemapEntries(): Promise<PublicCoachSitemapEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_public_coach_sitemap_entries')

  if (error) {
    logger.error('get_public_coach_sitemap_entries rpc failed', error)
    return []
  }

  return (data ?? []).map((row: { coach_id: string; last_modified: string }) => ({
    coachId: row.coach_id,
    lastModified: new Date(row.last_modified),
  }))
}

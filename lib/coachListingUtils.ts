export type CoachListingProfile = {
  user_id: string
  first_name?: string | null
  last_name?: string | null
  coached_sports?: string[] | null
  languages?: string[] | null
  presentation?: string | null
  presentation_fr?: string | null
  presentation_en?: string | null
}

export type CoachOfferForDisplay = {
  id: string
  coach_id: string
  title?: string | null
  description?: string | null
  title_fr?: string | null
  title_en?: string | null
  description_fr?: string | null
  description_en?: string | null
  price: number
  price_type: string
  is_featured: boolean
  display_order: number
}

export function isCoachPubliclyListable(coach: CoachListingProfile): boolean {
  const first = (coach.first_name ?? '').trim()
  const last = (coach.last_name ?? '').trim()
  const hasName = [first, last].filter(Boolean).join(' ').trim() !== ''
  const hasSports = (coach.coached_sports ?? []).length > 0
  const hasLanguages = (coach.languages ?? []).length > 0
  const hasPresentation =
    (coach.presentation_fr ?? '').trim() !== '' || (coach.presentation_en ?? '').trim() !== ''
  return hasName && hasSports && hasLanguages && hasPresentation
}

export function getDisplayPresentation(coach: CoachListingProfile, locale: string): string {
  const fr = (coach.presentation_fr ?? '').trim()
  const en = (coach.presentation_en ?? '').trim()
  const legacy = (coach.presentation ?? '').trim()
  if (locale === 'fr') return fr || en || legacy
  return en || fr || legacy
}

export function getOfferDisplayTitle(offer: CoachOfferForDisplay, locale: string): string {
  const fr = (offer.title_fr ?? '').trim()
  const en = (offer.title_en ?? '').trim()
  const legacy = (offer.title ?? '').trim()
  if (locale === 'fr') return fr || en || legacy
  return en || fr || legacy
}

export function getOfferDisplayDescription(offer: CoachOfferForDisplay, locale: string): string {
  const fr = (offer.description_fr ?? '').trim()
  const en = (offer.description_en ?? '').trim()
  const legacy = (offer.description ?? '').trim()
  if (locale === 'fr') return fr || en || legacy
  return en || fr || legacy
}

export function matchesCoachName(coach: CoachListingProfile, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (q === '') return true

  const first = (coach.first_name ?? '').trim().toLowerCase()
  const last = (coach.last_name ?? '').trim().toLowerCase()
  const fullName = `${first} ${last}`
  const fullNameReverse = `${last} ${first}`

  return (
    first.includes(q) ||
    last.includes(q) ||
    fullName.includes(q) ||
    fullNameReverse.includes(q)
  )
}

export function matchesCoachSport(coach: CoachListingProfile, selectedSports: string[]): boolean {
  if (selectedSports.length === 0) return true
  const coachSports = coach.coached_sports ?? []
  return selectedSports.some((s) => coachSports.includes(s))
}

export function matchesCoachLanguage(coach: CoachListingProfile, selectedLanguages: string[]): boolean {
  if (selectedLanguages.length === 0) return true
  const coachLangs = coach.languages ?? []
  return selectedLanguages.some((l) => coachLangs.includes(l))
}

export function filterCoachesForDisplay<T extends CoachListingProfile>(
  coaches: T[],
  filters: { searchName: string; selectedSports: string[]; selectedLanguages: string[] }
): T[] {
  return coaches.filter(
    (coach) =>
      matchesCoachName(coach, filters.searchName) &&
      matchesCoachSport(coach, filters.selectedSports) &&
      matchesCoachLanguage(coach, filters.selectedLanguages)
  )
}

export function groupOffersByCoachId<T extends { coach_id: string }>(
  offers: T[]
): Record<string, T[]> {
  const map: Record<string, T[]> = {}
  for (const offer of offers) {
    if (!map[offer.coach_id]) {
      map[offer.coach_id] = []
    }
    map[offer.coach_id].push(offer)
  }
  return map
}

export function mapRatingsByCoachId(
  rows: Array<{ coach_id: string; avg_rating: number | string; review_count: number | string | null }>
): Record<string, { averageRating: number; reviewCount: number }> {
  const ratingsByCoach: Record<string, { averageRating: number; reviewCount: number }> = {}
  for (const row of rows) {
    ratingsByCoach[row.coach_id] = {
      averageRating: Number(row.avg_rating),
      reviewCount: Number(row.review_count ?? 0),
    }
  }
  return ratingsByCoach
}

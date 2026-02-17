export type Role = 'athlete' | 'coach' | 'admin'

/** Valeurs possibles pour "sports coachés" (Ma pratique) */
export type CoachSport = 'course_route' | 'trail' | 'triathlon' | 'velo'

export type Profile = {
  user_id: string
  email: string
  full_name: string | null
  role: Role
  coach_id: string | null
  created_at: string
  updated_at: string
  coached_sports?: string[] | null
  languages?: string[] | null
  presentation?: string | null
  /** Présentation du coach en français (affichée lorsque la langue = fr). */
  presentation_fr?: string | null
  /** Présentation du coach en anglais (affichée lorsque la langue = en). */
  presentation_en?: string | null
  avatar_url?: string | null
  postal_code?: string | null
  /** Sport(s) pratiqué(s) par l'athlète (course, velo, natation, musculation). */
  practiced_sports?: string[] | null
}

export type SportType = 'course' | 'musculation' | 'natation' | 'velo' | 'nordic_ski' | 'backcountry_ski' | 'ice_skating'

export type Goal = {
  id: string
  athlete_id: string
  date: string
  race_name: string
  distance: string
  is_primary: boolean
  created_at: string
}

export type Workout = {
  id: string
  athlete_id: string
  date: string
  sport_type: SportType
  title: string
  description: string
  /** Objectif en minutes (temps). */
  target_duration_minutes?: number | null
  /** Objectif en km (distance). */
  target_distance_km?: number | null
  /** Dénivelé en m (facultatif, course / vélo). */
  target_elevation_m?: number | null
  /** Vitesse/allure pour calcul automatique. Course: min/km, Vélo: km/h, Natation: min/100m */
  target_pace?: number | null
  athlete_comment?: string | null
  athlete_comment_at?: string | null
  created_at: string
  updated_at: string
}

export type Conversation = {
  id: string
  coach_id: string
  athlete_id: string
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export type CoachRequestStatus = 'pending' | 'accepted' | 'declined'

export type CoachRequest = {
  id: string
  athlete_id: string
  coach_id: string
  sport_practiced: string
  coaching_need: string
  status: CoachRequestStatus
  offer_id: string | null
  offer_snapshot_id: string | null
  created_at: string
  responded_at: string | null
}

export type CoachRating = {
  id: string
  athlete_id: string
  coach_id: string
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
}

/** Statut du cycle de vie d'une offre catalogue */
export type CoachOfferStatus = 'draft' | 'published' | 'archived'

export type CoachOffer = {
  id: string
  coach_id: string
  title: string
  description: string
  /** Titre en français (affichage selon langue). */
  title_fr?: string | null
  /** Titre en anglais. */
  title_en?: string | null
  /** Description et avantages en français. */
  description_fr?: string | null
  /** Description et avantages en anglais. */
  description_en?: string | null
  /** Prix (null = non renseigné en brouillon) */
  price: number | null
  /** Récurrence (null = non renseigné en brouillon) */
  price_type: 'one_time' | 'monthly' | 'free' | null
  display_order: number
  is_featured: boolean
  /** published = visibles dans les 3 slots et par les athlètes ; archived = liste en bas côté coach uniquement */
  status?: CoachOfferStatus
  /** Date d'archivage (rempli quand status = archived) */
  archived_at?: string | null
  created_at: string
  updated_at: string
}

/** Offre archivée : CoachOffer avec status = 'archived' (même table coach_offers). Pour affichage liste. */
export type CoachOfferArchived = CoachOffer & { status: 'archived'; archived_at: string }

/** Version historisée (titre/description) d'une offre */
export type CoachOfferVersion = {
  id: string
  offer_id: string
  version: number
  title: string
  description: string
  title_fr?: string | null
  title_en?: string | null
  description_fr?: string | null
  description_en?: string | null
  created_at: string
}

/** Snapshot figé d'une offre (à la demande, puis lié à la souscription) */
export type OfferSnapshot = {
  id: string
  coach_id: string
  source_offer_id: string | null
  title: string
  description: string
  title_fr?: string | null
  title_en?: string | null
  description_fr?: string | null
  description_en?: string | null
  price: number
  price_type: 'one_time' | 'monthly' | 'free'
  display_order: number
  is_featured: boolean
  created_at: string
}

/** Statut d'une souscription athlète–coach */
export type AthleteSubscriptionStatus = 'active' | 'cancelled_at_period_end' | 'ended'

export type AthleteSubscription = {
  id: string
  athlete_id: string
  coach_id: string
  offer_snapshot_id: string
  price_type: 'one_time' | 'monthly' | 'free'
  started_at: string
  current_period_end: string | null
  status: AthleteSubscriptionStatus
  cancelled_at: string | null
  coach_delivered_at: string | null
  athlete_confirmed_at: string | null
  created_at: string
  updated_at: string
}

export type ConnectedServiceProvider = 'strava'

export type AthleteConnectedService = {
  id: string
  user_id: string
  provider: ConnectedServiceProvider
  access_token: string
  refresh_token: string
  expires_at: string
  strava_athlete_id: number | null
  created_at: string
  updated_at: string
}

export type ImportedActivitySource = 'strava'

export type ImportedActivity = {
  id: string
  athlete_id: string
  source: ImportedActivitySource
  external_id: string
  date: string
  sport_type: SportType
  title: string
  description: string
  /** Type d'activité du service source (ex: Strava "Ride", "Run"). */
  activity_type: string | null
  raw_data: Record<string, unknown> | null
  created_at: string
}

/** Totaux hebdomadaires par sport (activités importées). Visible par le coach pour ses athlètes. */
export type ImportedActivityWeeklyTotal = {
  athlete_id: string
  week_start: string
  sport_type: SportType
  total_moving_time_seconds: number
  total_distance_m: number
  total_elevation_m: number
  updated_at: string
}

/** Totaux hebdomadaires par sport (entraînements prévus). Précalculés pour accélérer l'affichage. */
export type WorkoutWeeklyTotal = {
  athlete_id: string
  week_start: string
  sport_type: SportType
  total_duration_minutes: number
  total_distance_km: number
  total_elevation_m: number
  duration_percent_vs_previous_week: number | null
  distance_percent_vs_previous_week: number | null
  updated_at: string
}

export type Role = 'athlete' | 'coach' | 'admin'

/** Valeurs possibles pour "sports coachés" (Ma pratique) */
export type CoachSport = 'course_route' | 'trail' | 'triathlon' | 'velo'

export type Profile = {
  user_id: string
  email: string
  first_name: string | null
  last_name: string | null
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
  /** Langue d'affichage préférée (fr/en). Utilisée sur tout le site quand l'utilisateur est connecté. */
  preferred_locale?: string | null
  /** Temps à allouer par semaine (global), en heures (athlète). */
  weekly_target_hours?: number | null
  /** Volume actuel par sport et par semaine : clés = sport (course, velo, …), valeurs = nombre (km, m ou h). */
  weekly_volume_by_sport?: Record<string, number> | null
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
  /** Résultat : temps (heures, minutes, secondes). Les trois requis pour « avoir un résultat ». */
  result_time_hours?: number | null
  result_time_minutes?: number | null
  result_time_seconds?: number | null
  /** Place à l'arrivée (ex. 42). */
  result_place?: number | null
  /** Note libre (max 500 car.). */
  result_note?: string | null
}

/** Statut de réalisation d'une séance (affichage i18n : Planifié, Réalisé, Non réalisé). */
export type WorkoutStatus = 'planned' | 'completed' | 'not_completed'

/** Moment de la journée pour structurer le calendrier par sections (Matin / Midi / Soir). Null = non précisé (premier bloc). */
export type WorkoutTimeOfDay = 'morning' | 'noon' | 'evening'

export type Workout = {
  id: string
  athlete_id: string
  date: string
  sport_type: SportType
  title: string
  description: string
  /** Statut de réalisation (planifié / réalisé / non réalisé). Modifiable par l'athlète. Défaut 'planned' si absent (avant migration). */
  status?: WorkoutStatus
  /** Moment de la journée (section calendrier). Null = non précisé (premier bloc). */
  time_of_day?: WorkoutTimeOfDay | null
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
  /** Ressenti athlète 1–5 (optionnel). */
  perceived_feeling?: number | null
  /** Intensité effort perçu 1–10 (optionnel). */
  perceived_intensity?: number | null
  /** Plaisir pris 1–5 (optionnel). */
  perceived_pleasure?: number | null
  created_at: string
  updated_at: string
}

/** Créneau disponibilité / indisponibilité athlète (une ligne = un jour ; récurrence dépliée à la création). */
export type AthleteAvailabilitySlot = {
  id: string
  athlete_id: string
  date: string
  type: 'available' | 'unavailable'
  start_time: string | null
  end_time: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export type Conversation = {
  id: string
  coach_id: string
  athlete_id: string
  request_id?: string | null
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
  /** Prix figé de l'offre au moment de la demande */
  frozen_price: number | null
  /** Type de tarification figé (free / one_time / monthly) au moment de la demande */
  frozen_price_type: FrozenPriceType | null
  /** Titre figé de l'offre au moment de la demande */
  frozen_title: string | null
  /** Description figée de l'offre au moment de la demande */
  frozen_description: string | null
  frozen_title_fr: string | null
  frozen_title_en: string | null
  frozen_description_fr: string | null
  frozen_description_en: string | null
  created_at: string
  responded_at: string | null
}

/** Souscription active ou annulée (données figées depuis coach_requests à l'acceptation) */
export type SubscriptionStatus = 'active' | 'cancelled'

/** Type de tarification figé (snapshot) pour affichage et résiliation */
export type FrozenPriceType = 'free' | 'one_time' | 'monthly'

export type Subscription = {
  id: string
  athlete_id: string
  coach_id: string
  request_id: string
  frozen_price: number | null
  frozen_title: string | null
  frozen_description: string | null
  frozen_title_fr: string | null
  frozen_title_en: string | null
  frozen_description_fr: string | null
  frozen_description_en: string | null
  frozen_price_type: FrozenPriceType | null
  status: SubscriptionStatus
  start_date: string
  end_date: string | null
  created_at: string
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

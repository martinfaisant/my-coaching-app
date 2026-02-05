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
  avatar_url?: string | null
}

export type SportType = 'course' | 'musculation' | 'natation' | 'velo'

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
  created_at: string
  responded_at: string | null
}

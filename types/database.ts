export type Role = 'athlete' | 'coach' | 'admin'

export type Profile = {
  user_id: string
  email: string
  full_name: string | null
  role: Role
  coach_id: string | null
  created_at: string
  updated_at: string
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

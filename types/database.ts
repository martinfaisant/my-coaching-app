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

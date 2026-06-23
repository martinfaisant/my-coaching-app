import type { Profile } from '@/types/database'

export type CoachProfileCompletionFields = Pick<
  Profile,
  'first_name' | 'last_name' | 'coached_sports' | 'languages' | 'presentation_fr' | 'presentation_en'
>

/** Critères alignés sur la page Mes athlètes : nom, sports coachés, langues, présentation FR ou EN. */
export function isCoachProfileComplete(profile: CoachProfileCompletionFields): boolean {
  const displayName = [(profile.first_name ?? '').trim(), (profile.last_name ?? '').trim()]
    .filter(Boolean)
    .join(' ')
    .trim()

  return (
    displayName !== '' &&
    (profile.coached_sports ?? []).length > 0 &&
    (profile.languages ?? []).length > 0 &&
    ((profile.presentation_fr ?? '').trim() !== '' || (profile.presentation_en ?? '').trim() !== '')
  )
}

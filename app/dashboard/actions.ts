'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type { CoachRequest } from '@/types/database'

export type SetCoachResult = { error?: string }
export type CoachRequestResult = { error?: string }

/** Athlète : envoyer une demande de coaching au coach. */
export async function createCoachRequest(
  coachId: string,
  sportPracticed: string,
  coachingNeed: string
): Promise<CoachRequestResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, coach_id')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'athlete') return { error: 'Réservé aux athlètes.' }
  if (profile?.coach_id) return { error: 'Vous avez déjà un coach.' }

  const sport = (sportPracticed ?? '').trim()
  const need = (coachingNeed ?? '').trim()
  if (!sport || !need) return { error: 'Sport pratiqué et besoin de coaching sont obligatoires.' }

  const { data: coach } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('user_id', coachId)
    .eq('role', 'coach')
    .single()

  if (!coach) return { error: 'Ce coach n’existe pas.' }

  const { error } = await supabase.from('coach_requests').insert({
    athlete_id: user.id,
    coach_id: coachId,
    sport_practiced: sport,
    coaching_need: need,
    status: 'pending',
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return {}
}

/** Athlète : liste des demandes envoyées (pour afficher "Demande envoyée" par coach). */
export async function getMyCoachRequests(): Promise<{ coach_id: string; status: string }[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('coach_requests')
    .select('coach_id, status')
    .eq('athlete_id', user.id)
    .order('created_at', { ascending: false })

  return (data ?? []).map((r) => ({ coach_id: r.coach_id, status: r.status }))
}

export type PendingRequestWithAthlete = {
  id: string
  athlete_id: string
  athlete_name: string
  athlete_email: string
  sport_practiced: string
  coaching_need: string
  created_at: string
}

/** Coach : demandes en attente. */
export async function getPendingCoachRequests(): Promise<PendingRequestWithAthlete[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: rows } = await supabase
    .from('coach_requests')
    .select('id, athlete_id, sport_practiced, coaching_need, created_at')
    .eq('coach_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (!rows?.length) return []

  const athleteIds = [...new Set(rows.map((r) => r.athlete_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, full_name, email')
    .in('user_id', athleteIds)

  const nameByUserId = new Map<string, string>()
  const emailByUserId = new Map<string, string>()
  for (const p of profiles ?? []) {
    nameByUserId.set(p.user_id, p.full_name?.trim() || p.email)
    emailByUserId.set(p.user_id, p.email)
  }

  return rows.map((r) => ({
    id: r.id,
    athlete_id: r.athlete_id,
    athlete_name: nameByUserId.get(r.athlete_id) ?? emailByUserId.get(r.athlete_id) ?? '—',
    athlete_email: emailByUserId.get(r.athlete_id) ?? '',
    sport_practiced: r.sport_practiced,
    coaching_need: r.coaching_need,
    created_at: r.created_at,
  }))
}

/** Coach : accepter ou refuser une demande. */
export async function respondToCoachRequest(
  requestId: string,
  accept: boolean
): Promise<CoachRequestResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: req } = await supabase
    .from('coach_requests')
    .select('id, coach_id, athlete_id, status')
    .eq('id', requestId)
    .single()

  if (!req || req.coach_id !== user.id) return { error: 'Demande introuvable.' }
  if (req.status !== 'pending') return { error: 'Cette demande a déjà été traitée.' }

  if (accept) {
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ coach_id: user.id })
      .eq('user_id', req.athlete_id)

    if (updateProfileError) return { error: updateProfileError.message }
  }

  const { error } = await supabase
    .from('coach_requests')
    .update({
      status: accept ? 'accepted' : 'declined',
      responded_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) return { error: error.message }
  revalidatePath('/dashboard')
  return {}
}

'use server'

import { createClient } from '@/utils/supabase/server'
import type { Conversation, ChatMessage } from '@/types/database'

export type ChatRoleResult = { role: 'athlete' | 'coach'; userId: string } | null

/** Retourne le rôle et l'id utilisateur si l'utilisateur peut voir le chat (athlete ou coach), sinon null. Pas de redirection. */
export async function getChatRole(): Promise<ChatRoleResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role === 'athlete' || profile?.role === 'coach')
    return { role: profile.role, userId: user.id }
  return null
}

export type ConversationWithMeta = {
  id: string
  athlete_id: string
  athlete_name: string
  updated_at: string
}

export type AthleteConversationResult = {
  conversation: Conversation
  coachName: string
} | null

/** Athlète : récupère ou crée la conversation avec son coach. */
export async function getOrCreateConversationForAthlete(): Promise<AthleteConversationResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('coach_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.coach_id) return null

  let { data: conv } = await supabase
    .from('conversations')
    .select('*')
    .eq('coach_id', profile.coach_id)
    .eq('athlete_id', user.id)
    .maybeSingle()

  if (!conv) {
    const { data: inserted, error } = await supabase
      .from('conversations')
      .insert({ coach_id: profile.coach_id, athlete_id: user.id })
      .select()
      .single()
    if (error) return null
    conv = inserted
  }

  const { data: coachProfile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('user_id', profile.coach_id)
    .single()

  const coachName = coachProfile?.full_name?.trim() || coachProfile?.email || 'Coach'
  return { conversation: conv as Conversation, coachName }
}

/** Coach : liste des conversations avec les athlètes. */
export async function getConversationsForCoach(): Promise<ConversationWithMeta[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: rows } = await supabase
    .from('conversations')
    .select('id, athlete_id, updated_at')
    .eq('coach_id', user.id)
    .order('updated_at', { ascending: false })

  if (!rows?.length) return []

  const athleteIds = [...new Set(rows.map((r) => r.athlete_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, full_name, email')
    .in('user_id', athleteIds)

  const nameByUserId = new Map<string, string>()
  for (const p of profiles ?? []) {
    nameByUserId.set(p.user_id, p.full_name?.trim() || p.email || 'Athlète')
  }

  return rows.map((r) => ({
    id: r.id,
    athlete_id: r.athlete_id,
    athlete_name: nameByUserId.get(r.athlete_id) ?? 'Athlète',
    updated_at: r.updated_at,
  }))
}

/** Messages d'une conversation. */
export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  return (data ?? []) as ChatMessage[]
}

export type SendMessageResult = { error?: string }

/** Envoyer un message. */
export async function sendMessage(
  conversationId: string,
  content: string
): Promise<SendMessageResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const text = (content ?? '').trim()
  if (!text) return { error: 'Message vide.' }

  const { error } = await supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: text,
  })

  if (error) return { error: error.message }
  return {}
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { getTranslations } from 'next-intl/server'
import type { Conversation, ChatMessage } from '@/types/database'
import { getDisplayName } from '@/lib/displayName'

export type ChatRoleResult =
  | { role: 'athlete'; userId: string; hasCoach: boolean }
  | { role: 'coach'; userId: string }
  | null

/** Retourne le rôle et l'id utilisateur si l'utilisateur peut voir le chat (athlete avec coach, ou coach), sinon null. Pas de redirection. */
export async function getChatRole(): Promise<ChatRoleResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, coach_id')
    .eq('user_id', user.id)
    .single()

  if (profile?.role === 'coach') return { role: 'coach', userId: user.id }
  if (profile?.role === 'athlete')
    return { role: 'athlete', userId: user.id, hasCoach: !!profile.coach_id }
  return null
}

export type ConversationWithMeta = {
  id: string
  athlete_id: string
  athlete_name: string
  avatar_url?: string | null
  updated_at: string
}

export type AthleteForChat = {
  athlete_id: string
  displayName: string
  avatar_url?: string | null
  conversation_id: string | null
  updated_at: string | null
}

/** Coach : liste des athlètes avec souscription active ou en résiliation (cancellation_scheduled), pour démarrer une conversation. Tri : dernier message décroissant, puis alphabétique. */
export async function getAthletesForCoachForChat(): Promise<AthleteForChat[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('athlete_id')
    .eq('coach_id', user.id)
    .in('status', ['active', 'cancellation_scheduled'])

  if (!subs?.length) return []

  const athleteIds = [...new Set(subs.map((s) => s.athlete_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email, avatar_url')
    .in('user_id', athleteIds)

  const { data: convs } = await supabase
    .from('conversations')
    .select('id, athlete_id, updated_at')
    .eq('coach_id', user.id)
    .in('athlete_id', athleteIds)

  const profileByUserId = new Map(
    (profiles ?? []).map((p) => [
      p.user_id,
      {
        displayName: getDisplayName(p, 'Athlète'),
        avatar_url: p.avatar_url ?? null,
      },
    ])
  )
  const convByAthleteId = new Map((convs ?? []).map((c) => [c.athlete_id, { id: c.id, updated_at: c.updated_at }]))

  const list: AthleteForChat[] = athleteIds.map((aid) => {
    const profile = profileByUserId.get(aid)
    const conv = convByAthleteId.get(aid)
    return {
      athlete_id: aid,
      displayName: profile?.displayName ?? 'Athlète',
      avatar_url: profile?.avatar_url ?? null,
      conversation_id: conv?.id ?? null,
      updated_at: conv?.updated_at ?? null,
    }
  })

  list.sort((a, b) => {
    const aDate = a.updated_at ? new Date(a.updated_at).getTime() : 0
    const bDate = b.updated_at ? new Date(b.updated_at).getTime() : 0
    if (bDate !== aDate) return bDate - aDate
    return a.displayName.localeCompare(b.displayName, undefined, { sensitivity: 'base' })
  })

  return list
}

export type GetOrCreateConversationForCoachResult =
  | { ok: true; conversationId: string; athleteName: string }
  | { ok: false; error: string }

/** Coach : récupère ou crée la conversation avec un athlète (vérifie souscription active). */
export async function getOrCreateConversationForCoach(
  athleteId: string,
  locale: string = 'fr'
): Promise<GetOrCreateConversationForCoachResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    const t = await getTranslations({ locale, namespace: 'chat.validation' })
    return { ok: false, error: t('notConnected') }
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('coach_id', user.id)
    .eq('athlete_id', athleteId)
    .in('status', ['active', 'cancellation_scheduled'])
    .maybeSingle()

  if (!sub) {
    const t = await getTranslations({ locale, namespace: 'chat' })
    return { ok: false, error: t('subscriptionRequired') }
  }

  let { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('coach_id', user.id)
    .eq('athlete_id', athleteId)
    .maybeSingle()

  if (!conv) {
    const { data: inserted, error } = await supabase
      .from('conversations')
      .insert({ coach_id: user.id, athlete_id: athleteId })
      .select('id')
      .single()
    if (error) return { ok: false, error: error.message }
    conv = inserted
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('user_id', athleteId)
    .single()

  const athleteName = profile ? getDisplayName(profile, 'Athlète') : 'Athlète'
  return { ok: true, conversationId: conv.id, athleteName }
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
    .select('first_name, last_name, email')
    .eq('user_id', profile.coach_id)
    .single()

  const coachName = coachProfile ? getDisplayName(coachProfile, 'Coach') : 'Coach'
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
    .select('user_id, first_name, last_name, email, avatar_url')
    .in('user_id', athleteIds)

  const nameByUserId = new Map<string, string>()
  const avatarByUserId = new Map<string, string | null>()
  for (const p of profiles ?? []) {
    nameByUserId.set(p.user_id, getDisplayName(p, 'Athlète'))
    avatarByUserId.set(p.user_id, p.avatar_url ?? null)
  }

  return rows.map((r) => ({
    id: r.id,
    athlete_id: r.athlete_id,
    athlete_name: nameByUserId.get(r.athlete_id) ?? 'Athlète',
    avatar_url: avatarByUserId.get(r.athlete_id) ?? null,
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
  content: string,
  locale: string = 'fr'
): Promise<SendMessageResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const t = await getTranslations({ locale, namespace: 'chat.validation' })
  
  if (!user) return { error: t('notConnected') }

  const text = (content ?? '').trim()
  if (!text) return { error: t('emptyMessage') }

  const { error } = await supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: text,
  })

  if (error) return { error: error.message }
  return {}
}

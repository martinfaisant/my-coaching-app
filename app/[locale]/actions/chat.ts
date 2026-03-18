'use server'

import { createClient } from '@/utils/supabase/server'
import { getLocale, getTranslations } from 'next-intl/server'
import type { ChatMessage } from '@/types/database'
import { getDisplayName } from '@/lib/displayName'

export type ChatRoleResult =
  | { role: 'athlete'; userId: string }
  | { role: 'coach'; userId: string }
  | null

type RequestStatus = 'pending' | 'accepted' | 'declined'

type SubscriptionWriteStatus = 'active' | 'cancellation_scheduled'

type ConversationAccess = {
  canSend: boolean
  requestStatus: RequestStatus | null
  hasWritableSubscription: boolean
}

function canSendFromState(
  requestStatus: RequestStatus | null,
  hasWritableSubscription: boolean
): boolean {
  if (!requestStatus) return false
  if (requestStatus === 'pending') return true
  if (requestStatus === 'accepted') return hasWritableSubscription
  return false
}

async function getAccessByRequestIds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  requestIds: string[]
): Promise<Map<string, ConversationAccess>> {
  const uniqueRequestIds = [...new Set(requestIds.filter(Boolean))]
  if (uniqueRequestIds.length === 0) return new Map()

  const [{ data: requests }, { data: writableSubs }] = await Promise.all([
    supabase.from('coach_requests').select('id, status').in('id', uniqueRequestIds),
    supabase
      .from('subscriptions')
      .select('request_id')
      .in('request_id', uniqueRequestIds)
      .in('status', ['active', 'cancellation_scheduled'] satisfies SubscriptionWriteStatus[]),
  ])

  const writableRequestSet = new Set((writableSubs ?? []).map((s) => s.request_id))
  const accessMap = new Map<string, ConversationAccess>()

  for (const request of requests ?? []) {
    const requestStatus = (request.status as RequestStatus | null) ?? null
    const hasWritableSubscription = writableRequestSet.has(request.id)
    accessMap.set(request.id, {
      requestStatus,
      hasWritableSubscription,
      canSend: canSendFromState(requestStatus, hasWritableSubscription),
    })
  }

  return accessMap
}

async function getLatestWritableRequestIdForPair(
  supabase: Awaited<ReturnType<typeof createClient>>,
  coachId: string,
  athleteId: string
): Promise<string | null> {
  const { data: requests } = await supabase
    .from('coach_requests')
    .select('id, status, created_at')
    .eq('coach_id', coachId)
    .eq('athlete_id', athleteId)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })

  if (!requests?.length) return null

  const acceptedIds = requests.filter((r) => r.status === 'accepted').map((r) => r.id)
  const writableAcceptedSet = new Set<string>()

  if (acceptedIds.length > 0) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('request_id')
      .in('request_id', acceptedIds)
      .in('status', ['active', 'cancellation_scheduled'] satisfies SubscriptionWriteStatus[])
    for (const sub of subs ?? []) {
      writableAcceptedSet.add(sub.request_id)
    }
  }

  for (const request of requests) {
    if (request.status === 'pending') return request.id
    if (request.status === 'accepted' && writableAcceptedSet.has(request.id)) return request.id
  }

  return null
}

/** Retourne le rôle et l'id utilisateur si l'utilisateur peut voir le chat. Pas de redirection. */
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

  if (profile?.role === 'coach') return { role: 'coach', userId: user.id }
  if (profile?.role === 'athlete') return { role: 'athlete', userId: user.id }
  return null
}

export type ConversationWithMeta = {
  id: string
  request_id: string | null
  athlete_id: string
  athlete_name: string
  avatar_url?: string | null
  updated_at: string
  can_send: boolean
  is_read_only: boolean
}

export type AthleteForChat = {
  athlete_id: string
  displayName: string
  avatar_url?: string | null
  request_id: string
  conversation_id: string | null
  updated_at: string | null
}

export type ConversationWithCoachMeta = {
  id: string
  request_id: string | null
  coach_id: string
  coach_name: string
  avatar_url?: string | null
  updated_at: string
  can_send: boolean
  is_read_only: boolean
}

export type CoachForChat = {
  coach_id: string
  displayName: string
  avatar_url?: string | null
  request_id: string
  conversation_id: string | null
  updated_at: string | null
}

/** Coach : liste des athlètes éligibles pour démarrer une conversation éditable. */
export async function getAthletesForCoachForChat(): Promise<AthleteForChat[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const locale = await getLocale()
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const { data: requests } = await supabase
    .from('coach_requests')
    .select('id, athlete_id, status, created_at')
    .eq('coach_id', user.id)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })

  if (!requests?.length) return []

  const acceptedIds = requests.filter((r) => r.status === 'accepted').map((r) => r.id)
  const writableAcceptedSet = new Set<string>()
  if (acceptedIds.length > 0) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('request_id')
      .in('request_id', acceptedIds)
      .in('status', ['active', 'cancellation_scheduled'] satisfies SubscriptionWriteStatus[])
    for (const sub of subs ?? []) {
      writableAcceptedSet.add(sub.request_id)
    }
  }

  const writableByAthleteId = new Map<string, string>()
  for (const request of requests) {
    const isWritable =
      request.status === 'pending' ||
      (request.status === 'accepted' && writableAcceptedSet.has(request.id))
    if (!isWritable) continue
    if (!writableByAthleteId.has(request.athlete_id)) {
      writableByAthleteId.set(request.athlete_id, request.id)
    }
  }

  const athleteIds = [...writableByAthleteId.keys()]
  if (athleteIds.length === 0) return []

  const [{ data: profiles }, { data: convs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email, avatar_url')
      .in('user_id', athleteIds),
    supabase
      .from('conversations')
      .select('id, athlete_id, updated_at')
      .eq('coach_id', user.id)
      .in('athlete_id', athleteIds),
  ])

  const profileByUserId = new Map(
    (profiles ?? []).map((p) => [
      p.user_id,
      {
        displayName: getDisplayName(p, tCommon('athlete')),
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
      displayName: profile?.displayName ?? tCommon('athlete'),
      avatar_url: profile?.avatar_url ?? null,
      request_id: writableByAthleteId.get(aid) ?? '',
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

/** Athlète : liste des coachs éligibles pour démarrer une conversation éditable. */
export async function getCoachesForAthleteForChat(): Promise<CoachForChat[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const locale = await getLocale()
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const { data: requests } = await supabase
    .from('coach_requests')
    .select('id, coach_id, status, created_at')
    .eq('athlete_id', user.id)
    .in('status', ['pending', 'accepted'])
    .order('created_at', { ascending: false })

  if (!requests?.length) return []

  const acceptedIds = requests.filter((r) => r.status === 'accepted').map((r) => r.id)
  const writableAcceptedSet = new Set<string>()
  if (acceptedIds.length > 0) {
    const { data: subs } = await supabase
      .from('subscriptions')
      .select('request_id')
      .in('request_id', acceptedIds)
      .in('status', ['active', 'cancellation_scheduled'] satisfies SubscriptionWriteStatus[])
    for (const sub of subs ?? []) {
      writableAcceptedSet.add(sub.request_id)
    }
  }

  const writableByCoachId = new Map<string, string>()
  for (const request of requests) {
    const isWritable =
      request.status === 'pending' ||
      (request.status === 'accepted' && writableAcceptedSet.has(request.id))
    if (!isWritable) continue
    if (!writableByCoachId.has(request.coach_id)) {
      writableByCoachId.set(request.coach_id, request.id)
    }
  }

  const coachIds = [...writableByCoachId.keys()]
  if (coachIds.length === 0) return []

  const [{ data: profiles }, { data: convs }] = await Promise.all([
    supabase
      .from('profiles')
      .select('user_id, first_name, last_name, email, avatar_url')
      .in('user_id', coachIds),
    supabase
      .from('conversations')
      .select('id, coach_id, updated_at')
      .eq('athlete_id', user.id)
      .in('coach_id', coachIds),
  ])

  const profileByUserId = new Map(
    (profiles ?? []).map((p) => [
      p.user_id,
      {
        displayName: getDisplayName(p, tCommon('coach')),
        avatar_url: p.avatar_url ?? null,
      },
    ])
  )
  const convByCoachId = new Map((convs ?? []).map((c) => [c.coach_id, { id: c.id, updated_at: c.updated_at }]))

  const list: CoachForChat[] = coachIds.map((cid) => {
    const profile = profileByUserId.get(cid)
    const conv = convByCoachId.get(cid)
    return {
      coach_id: cid,
      displayName: profile?.displayName ?? tCommon('coach'),
      avatar_url: profile?.avatar_url ?? null,
      request_id: writableByCoachId.get(cid) ?? '',
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

/** Coach : récupère ou crée la conversation avec un athlète (vérifie request writable). */
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

  const writableRequestId = await getLatestWritableRequestIdForPair(supabase, user.id, athleteId)
  if (!writableRequestId) {
    const t = await getTranslations({ locale, namespace: 'chat' })
    return { ok: false, error: t('writeAccessRequired') }
  }

  let { data: conv } = await supabase
    .from('conversations')
    .select('id, request_id')
    .eq('coach_id', user.id)
    .eq('athlete_id', athleteId)
    .maybeSingle()

  if (!conv) {
    const { data: inserted, error } = await supabase
      .from('conversations')
      .insert({ coach_id: user.id, athlete_id: athleteId, request_id: writableRequestId })
      .select('id, request_id')
      .single()
    if (error) return { ok: false, error: error.message }
    conv = inserted
  } else if (conv.request_id !== writableRequestId) {
    await supabase.from('conversations').update({ request_id: writableRequestId }).eq('id', conv.id)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('user_id', athleteId)
    .single()

  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const athleteName = profile ? getDisplayName(profile, tCommon('athlete')) : tCommon('athlete')
  return { ok: true, conversationId: conv.id, athleteName }
}

export type GetOrCreateConversationForAthleteResult =
  | { ok: true; conversationId: string; coachName: string }
  | { ok: false; error: string }

/** Athlète : récupère ou crée la conversation avec un coach (request writable requise). */
export async function getOrCreateConversationForAthlete(
  coachId: string,
  locale: string = 'fr'
): Promise<GetOrCreateConversationForAthleteResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    const t = await getTranslations({ locale, namespace: 'chat.validation' })
    return { ok: false, error: t('notConnected') }
  }

  const writableRequestId = await getLatestWritableRequestIdForPair(supabase, coachId, user.id)
  if (!writableRequestId) {
    const t = await getTranslations({ locale, namespace: 'chat' })
    return { ok: false, error: t('writeAccessRequired') }
  }

  let { data: conv } = await supabase
    .from('conversations')
    .select('id, request_id')
    .eq('coach_id', coachId)
    .eq('athlete_id', user.id)
    .maybeSingle()

  if (!conv) {
    const { data: inserted, error } = await supabase
      .from('conversations')
      .insert({ coach_id: coachId, athlete_id: user.id, request_id: writableRequestId })
      .select('id, request_id')
      .single()
    if (error) return { ok: false, error: error.message }
    conv = inserted
  } else if (conv.request_id !== writableRequestId) {
    await supabase.from('conversations').update({ request_id: writableRequestId }).eq('id', conv.id)
  }

  const { data: coachProfile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email')
    .eq('user_id', coachId)
    .single()

  const tCommon = await getTranslations({ locale, namespace: 'common' })
  const coachName = coachProfile ? getDisplayName(coachProfile, tCommon('coach')) : tCommon('coach')
  return { ok: true, conversationId: conv.id, coachName }
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
    .select('id, athlete_id, updated_at, request_id')
    .eq('coach_id', user.id)
    .order('updated_at', { ascending: false })

  if (!rows?.length) return []

  const locale = await getLocale()
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const athleteIds = [...new Set(rows.map((r) => r.athlete_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email, avatar_url')
    .in('user_id', athleteIds)

  const nameByUserId = new Map<string, string>()
  const avatarByUserId = new Map<string, string | null>()
  for (const p of profiles ?? []) {
    nameByUserId.set(p.user_id, getDisplayName(p, tCommon('athlete')))
    avatarByUserId.set(p.user_id, p.avatar_url ?? null)
  }

  const result: ConversationWithMeta[] = []
  for (const r of rows) {
    const writableRequestId = await getLatestWritableRequestIdForPair(supabase, user.id, r.athlete_id)
    const canSend = !!writableRequestId
    if (writableRequestId && writableRequestId !== r.request_id) {
      await supabase.from('conversations').update({ request_id: writableRequestId }).eq('id', r.id)
    }
    const effectiveRequestId = writableRequestId ?? r.request_id
    result.push({
      id: r.id,
      request_id: effectiveRequestId ?? null,
      athlete_id: r.athlete_id,
      athlete_name: nameByUserId.get(r.athlete_id) ?? tCommon('athlete'),
      avatar_url: avatarByUserId.get(r.athlete_id) ?? null,
      updated_at: r.updated_at,
      can_send: canSend,
      is_read_only: !canSend,
    })
  }
  return result
}

/** Athlète : liste des conversations avec les coachs. */
export async function getConversationsForAthlete(): Promise<ConversationWithCoachMeta[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data: rows } = await supabase
    .from('conversations')
    .select('id, coach_id, updated_at, request_id')
    .eq('athlete_id', user.id)
    .order('updated_at', { ascending: false })

  if (!rows?.length) return []

  const locale = await getLocale()
  const tCommon = await getTranslations({ locale, namespace: 'common' })

  const coachIds = [...new Set(rows.map((r) => r.coach_id))]
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, first_name, last_name, email, avatar_url')
    .in('user_id', coachIds)

  const nameByUserId = new Map<string, string>()
  const avatarByUserId = new Map<string, string | null>()
  for (const p of profiles ?? []) {
    nameByUserId.set(p.user_id, getDisplayName(p, tCommon('coach')))
    avatarByUserId.set(p.user_id, p.avatar_url ?? null)
  }

  const result: ConversationWithCoachMeta[] = []
  for (const r of rows) {
    const writableRequestId = await getLatestWritableRequestIdForPair(supabase, r.coach_id, user.id)
    const canSend = !!writableRequestId
    if (writableRequestId && writableRequestId !== r.request_id) {
      await supabase.from('conversations').update({ request_id: writableRequestId }).eq('id', r.id)
    }
    const effectiveRequestId = writableRequestId ?? r.request_id
    result.push({
      id: r.id,
      request_id: effectiveRequestId ?? null,
      coach_id: r.coach_id,
      coach_name: nameByUserId.get(r.coach_id) ?? tCommon('coach'),
      avatar_url: avatarByUserId.get(r.coach_id) ?? null,
      updated_at: r.updated_at,
      can_send: canSend,
      is_read_only: !canSend,
    })
  }
  return result
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

  const { data: conv } = await supabase
    .from('conversations')
    .select('id, coach_id, athlete_id, request_id')
    .eq('id', conversationId)
    .or(`coach_id.eq.${user.id},athlete_id.eq.${user.id}`)
    .maybeSingle()

  if (!conv) return { error: t('conversationUnavailable') }

  let effectiveRequestId = conv.request_id
  const accessByRequest = await getAccessByRequestIds(supabase, effectiveRequestId ? [effectiveRequestId] : [])
  let canSend = effectiveRequestId ? (accessByRequest.get(effectiveRequestId)?.canSend ?? false) : false

  if (!canSend) {
    const writableRequestId = await getLatestWritableRequestIdForPair(supabase, conv.coach_id, conv.athlete_id)
    if (writableRequestId) {
      await supabase.from('conversations').update({ request_id: writableRequestId }).eq('id', conv.id)
      effectiveRequestId = writableRequestId
      canSend = true
    }
  }

  if (!effectiveRequestId || !canSend) return { error: t('readOnlyConversation') }

  const { error } = await supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content: text,
  })

  if (error) return { error: error.message }
  return {}
}

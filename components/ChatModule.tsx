'use client'

import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { IconClose } from '@/components/icons/IconClose'
import { ChatAthleteListItem } from '@/components/ChatAthleteListItem'
import { ChatConversationSidebar } from '@/components/ChatConversationSidebar'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  getChatRole,
  getOrCreateConversationForAthlete,
  getOrCreateConversationForCoach,
  getConversationsForCoach,
  getAthletesForCoachForChat,
  getMessages,
  sendMessage,
  type ChatRoleResult,
  type AthleteConversationResult,
  type ConversationWithMeta,
  type AthleteForChat,
} from '@/app/[locale]/actions/chat'
import type { ChatMessage } from '@/types/database'
import { FORM_BASE_CLASSES } from '@/lib/formStyles'

function formatMessageTime(iso: string, localeTag: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (sameDay) {
    return d.toLocaleTimeString(localeTag, { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString(localeTag, {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function filterByDisplayName<T extends { displayName?: string; athlete_name?: string }>(
  list: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return list
  return list.filter((item) => {
    const name = ('displayName' in item ? item.displayName : item.athlete_name) ?? ''
    return name.toLowerCase().includes(q)
  })
}

const AVATAR_VARIANTS: ('olive' | 'sage' | 'stone')[] = ['olive', 'sage', 'stone']

/** Skeleton de chargement pour l’overlay chat (liste athlètes ou panneau messages). */
function ChatOverlaySkeleton({
  variant,
}: {
  variant: 'list' | 'conversation'
}) {
  if (variant === 'list') {
    return (
      <div className="flex flex-col flex-1 min-h-0 p-4" aria-hidden>
        <div className="h-4 w-48 rounded bg-stone-200 animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100">
              <div className="w-11 h-11 rounded-full bg-stone-200 animate-pulse shrink-0" />
              <div className="h-4 flex-1 max-w-[60%] rounded bg-stone-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col flex-1 min-h-0" aria-hidden>
      <div className="shrink-0 px-4 py-3 border-b border-stone-100">
        <div className="h-5 w-32 rounded bg-stone-200 animate-pulse" />
      </div>
      <div className="flex-1 overflow-hidden px-4 py-3 space-y-3">
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-md px-4 py-2.5 w-48 h-14 bg-stone-200 animate-pulse" />
        </div>
        <div className="flex justify-end">
          <div className="rounded-2xl rounded-tr-md px-4 py-2.5 w-40 h-14 bg-stone-300 animate-pulse" />
        </div>
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-md px-4 py-2.5 w-56 h-12 bg-stone-200 animate-pulse" />
        </div>
      </div>
      <div className="shrink-0 p-4 border-t border-stone-100">
        <div className="flex gap-2">
          <div className="flex-1 h-10 rounded-lg bg-stone-200 animate-pulse" />
          <div className="h-10 w-24 rounded-lg bg-stone-200 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

type ChatModuleProps = {
  initialChatRole?: ChatRoleResult | null
}

export function ChatModule({ initialChatRole }: ChatModuleProps = {}) {
  const locale = useLocale()
  const t = useTranslations('chat')
  const [chatRole, setChatRole] = useState<ChatRoleResult>(initialChatRole ?? null)
  const [open, setOpen] = useState(false)
  /** État persistant (survit à la fermeture de l’overlay et au changement de page) : conversations ouvertes et sélection. */
  const [coachConvs, setCoachConvs] = useState<ConversationWithMeta[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)

  useEffect(() => {
    if (initialChatRole !== undefined) return
    getChatRole().then(setChatRole)
  }, [initialChatRole])

  if (!chatRole) return null
  if (chatRole.role === 'athlete' && !chatRole.hasCoach) return null

  const label =
    chatRole.role === 'athlete' ? t('chatWithCoach') : t('chatWithAthletes')

  return (
    <>
      <Button
        type="button"
        variant="primary"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 rounded-full shadow-lg"
        aria-label={label}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="hidden sm:inline">{label}</span>
      </Button>

      {open && (
        <ChatOverlay
          role={chatRole.role}
          userId={chatRole.userId}
          onClose={() => setOpen(false)}
          coachConvs={coachConvs}
          setCoachConvs={setCoachConvs}
          selectedConvId={selectedConvId}
          setSelectedConvId={setSelectedConvId}
        />
      )}
    </>
  )
}

type ChatOverlayProps = {
  role: 'athlete' | 'coach'
  userId: string
  onClose: () => void
  coachConvs: ConversationWithMeta[]
  setCoachConvs: React.Dispatch<React.SetStateAction<ConversationWithMeta[]>>
  selectedConvId: string | null
  setSelectedConvId: React.Dispatch<React.SetStateAction<string | null>>
}

function ChatOverlay({ role, userId, onClose, coachConvs, setCoachConvs, selectedConvId, setSelectedConvId }: ChatOverlayProps) {
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const t = useTranslations('chat')

  const [athleteData, setAthleteData] = useState<AthleteConversationResult | null>(null)
  const [coachAthletes, setCoachAthletes] = useState<AthleteForChat[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  /** Filtre appliqué uniquement à la pression sur Entrée (liste athlètes état 1 ou état 3). */
  const [searchApplied, setSearchApplied] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  /** Vue « Ouvrir une discussion » (état 3) : liste des athlètes avec recherche, au lieu de la sidebar. */
  const [showOpenDiscussionView, setShowOpenDiscussionView] = useState(false)
  const [athletesLoadedForOpenView, setAthletesLoadedForOpenView] = useState(false)

  const applySearch = useCallback(() => {
    setSearchApplied(searchQuery.trim())
  }, [searchQuery])

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        applySearch()
      }
    },
    [applySearch]
  )

  useEffect(() => {
    if (role === 'coach' && showOpenDiscussionView) {
      setSearchQuery('')
      setSearchApplied('')
      setAthletesLoadedForOpenView(false)
      getAthletesForCoachForChat()
        .then((list) => {
          setCoachAthletes(list)
          setAthletesLoadedForOpenView(true)
        })
        .catch(() => setAthletesLoadedForOpenView(true))
    }
  }, [role, showOpenDiscussionView])

  useEffect(() => {
    if (role === 'coach' && coachConvs.length === 0 && !showOpenDiscussionView) {
      getAthletesForCoachForChat().then(setCoachAthletes)
    }
  }, [role, coachConvs.length, showOpenDiscussionView])

  const loadMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true)
    const list = await getMessages(conversationId)
    setMessages(list)
    setMessagesLoading(false)
  }, [])

  useEffect(() => {
    if (role === 'athlete') {
      setLoading(true)
      setCreateError(null)
      getOrCreateConversationForAthlete()
        .then((data) => {
          setAthleteData(data)
          if (data) loadMessages(data.conversation.id)
        })
        .finally(() => setLoading(false))
    } else {
      setCreateError(null)
      if (coachConvs.length === 0) {
        setLoading(true)
        getConversationsForCoach()
          .then((list) => {
            setCoachConvs(list)
            if (list.length > 0) {
              setSelectedConvId(list[0].id)
            }
          })
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    }
  }, [role, coachConvs.length])

  useEffect(() => {
    if (role === 'coach' && coachConvs.length > 0 && selectedConvId) {
      loadMessages(selectedConvId)
    }
  }, [role, coachConvs.length, selectedConvId, loadMessages])

  const isCoachState1 = role === 'coach' && coachConvs.length === 0 && !showOpenDiscussionView
  const isCoachState2a = role === 'coach' && coachConvs.length > 0 && !showOpenDiscussionView
  const isCoachState3 = role === 'coach' && showOpenDiscussionView

  const filteredAthletes = useMemo(
    () => filterByDisplayName(coachAthletes, searchApplied),
    [coachAthletes, searchApplied]
  )

  const currentConversationId =
    role === 'athlete' ? athleteData?.conversation.id ?? null : selectedConvId
  const selectedConv = selectedConvId
    ? coachConvs.find((c) => c.id === selectedConvId)
    : null

  const handleCoachSelectAthlete = useCallback(
    async (athleteId: string) => {
      setCreateError(null)
      const existingConv = coachConvs.find((c) => c.athlete_id === athleteId)
      if (existingConv) {
        setShowOpenDiscussionView(false)
        setSelectedConvId(existingConv.id)
        loadMessages(existingConv.id)
        return
      }
      const result = await getOrCreateConversationForCoach(athleteId, locale)
      if (!result.ok) {
        setCreateError(result.error)
        return
      }
      const newConv: ConversationWithMeta = {
        id: result.conversationId,
        athlete_id: athleteId,
        athlete_name: result.athleteName,
        avatar_url: null,
        updated_at: new Date().toISOString(),
      }
      if (coachConvs.length === 0) {
        setCoachConvs([newConv])
        setCoachAthletes([])
      } else {
        setCoachConvs((prev) => [...prev, newConv])
        setShowOpenDiscussionView(false)
      }
      setSelectedConvId(result.conversationId)
      loadMessages(result.conversationId)
    },
    [locale, loadMessages, coachConvs]
  )

  const handleCloseConversation = useCallback(() => {
    const nextConvs = coachConvs.filter((c) => c.id !== selectedConvId)
    setCoachConvs(nextConvs)
    setSelectedConvId(nextConvs[0]?.id ?? null)
  }, [coachConvs, selectedConvId])

  const handleSend = async () => {
    if (!currentConversationId || !inputValue.trim() || sending) return
    setSending(true)
    setSendError(null)
    const result = await sendMessage(currentConversationId, inputValue.trim(), locale)
    if (result.error) {
      setSendError(result.error)
    } else {
      setInputValue('')
      loadMessages(currentConversationId)
    }
    setSending(false)
  }

  const modalTitle =
    role === 'athlete'
      ? athleteData
        ? t('conversationWith', { name: athleteData.coachName })
        : t('chatWithCoach')
      : t('messages')

  const tCommon = useTranslations('common')
  const headerRight =
    role === 'coach' && isCoachState2a ? (
      <Button
        type="button"
        variant="secondary"
        onClick={() => setShowOpenDiscussionView(true)}
        className="shrink-0"
      >
        {t('openDiscussion')}
      </Button>
    ) : undefined

  /** Sidebar = conversations ouvertes (pas de filtre recherche). */
  const sidebarItems = useMemo(
    () =>
      coachConvs.map((c) => ({
        id: c.id,
        displayName: c.athlete_name,
        avatarUrl: c.avatar_url ?? null,
      })),
    [coachConvs]
  )

  const renderBody = () => {
    if (role === 'athlete') {
      if (loading) return <ChatOverlaySkeleton variant="conversation" />
      if (!athleteData)
        return (
          <p className="text-sm text-stone-400 px-4 py-2">{t('noCoachAssigned')}</p>
        )
      return (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">
            {messages.map((m) => {
              const isMe = m.sender_id === userId
              return (
                <div
                  key={m.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-chat-inner ${
                      isMe
                        ? 'rounded-tr-md bg-palette-forest-dark text-white'
                        : 'rounded-tl-md bg-white text-stone-800 border border-stone-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                    <p className={`text-xs mt-1 ${isMe ? 'text-white/80' : 'text-stone-400'}`}>
                      {formatMessageTime(m.created_at, localeTag)}
                      {isMe && ` · ${t('you')}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="shrink-0 p-4 border-t border-stone-100">
            {sendError && (
              <p className="text-sm text-palette-danger mb-2">{sendError}</p>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('placeholder')}
                className={`${FORM_BASE_CLASSES} flex-1`}
                disabled={sending}
              />
              <Button type="submit" variant="primary" disabled={sending || !inputValue.trim()}>
                {t('send')}
              </Button>
            </form>
          </div>
        </div>
      )
    }

    if (isCoachState1) {
      if (loading) return <ChatOverlaySkeleton variant="list" />
      return (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="shrink-0 px-4 py-2 border-b border-stone-100">
            <p className="text-sm text-stone-600">{t('chooseAthleteToStart')}</p>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-2">
            {createError && (
              <p className="text-sm text-palette-danger mb-2">{createError}</p>
            )}
            {filteredAthletes.length === 0 ? (
              <p className="text-sm text-stone-500">
                {searchApplied
                  ? t('noMatch', { query: searchApplied })
                  : t('noConversations')}
              </p>
            ) : (
              filteredAthletes.map((a, i) => (
                <ChatAthleteListItem
                  key={a.athlete_id}
                  displayName={a.displayName}
                  avatarUrl={a.avatar_url}
                  actionLabel={t('start')}
                  avatarVariant={AVATAR_VARIANTS[i % AVATAR_VARIANTS.length]}
                  onClick={() => handleCoachSelectAthlete(a.athlete_id)}
                />
              ))
            )}
          </div>
        </div>
      )
    }

    if (isCoachState3) {
      const athletesLoading = !athletesLoadedForOpenView && coachAthletes.length === 0
      return (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="shrink-0 px-4 py-3 border-b border-stone-100 flex items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowOpenDiscussionView(false)}
              aria-label={tCommon('back')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <span className="text-sm font-medium text-stone-700">{t('chooseAthleteToStart')}</span>
            <span className="w-10" aria-hidden />
          </div>
          <div className="shrink-0 px-4 py-2 border-b border-stone-100">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={t('searchPlaceholder')}
              className={`${FORM_BASE_CLASSES} py-2 text-sm`}
              aria-label={t('searchPlaceholder')}
            />
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-2">
            {createError && (
              <p className="text-sm text-palette-danger mb-2">{createError}</p>
            )}
            {athletesLoading ? (
              <ChatOverlaySkeleton variant="list" />
            ) : filteredAthletes.length === 0 ? (
              <p className="text-sm text-stone-500">
                {searchApplied
                  ? t('noMatch', { query: searchApplied })
                  : t('noConversations')}
              </p>
            ) : (
              filteredAthletes.map((a, i) => (
                <ChatAthleteListItem
                  key={a.athlete_id}
                  displayName={a.displayName}
                  avatarUrl={a.avatar_url}
                  actionLabel={t('start')}
                  avatarVariant={AVATAR_VARIANTS[i % AVATAR_VARIANTS.length]}
                  onClick={() => handleCoachSelectAthlete(a.athlete_id)}
                />
              ))
            )}
          </div>
        </div>
      )
    }

    if (isCoachState2a) {
      return (
        <div className="flex flex-1 min-h-0 border-t border-stone-100">
          <div className="md:hidden flex-1 flex flex-col min-h-0">
            {selectedConvId && selectedConv ? (
              <>
                <div className="shrink-0 px-3 py-3 border-b border-stone-100 flex items-center justify-between gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedConvId(null)}
                    aria-label={tCommon('back')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </Button>
                  <span className="text-sm font-semibold text-stone-900 truncate">
                    {selectedConv.athlete_name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleCloseConversation}
                    aria-label={t('closeConversation')}
                  >
                    <IconClose className="w-5 h-5" />
                  </Button>
                </div>
                {messagesLoading ? (
                  <div className="flex-1 overflow-hidden min-h-0">
                    <ChatOverlaySkeleton variant="conversation" />
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3 bg-stone-50/40">
                      {messages.map((m) => {
                        const isMe = m.sender_id === userId
                        return (
                          <div
                            key={m.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-chat-inner ${
                                isMe
                                  ? 'rounded-tr-md bg-palette-forest-dark text-white'
                                  : 'rounded-tl-md bg-white text-stone-800 border border-stone-200'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap break-words">
                                {m.content}
                              </p>
                              <p
                                className={`text-xs mt-1 ${
                                  isMe ? 'text-white/80' : 'text-stone-400'
                                }`}
                              >
                                {formatMessageTime(m.created_at, localeTag)}
                                {isMe && ` · ${t('you')}`}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="shrink-0 p-3 border-t border-stone-100 bg-white">
                      {sendError && (
                        <p className="text-sm text-palette-danger mb-2">{sendError}</p>
                      )}
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          handleSend()
                        }}
                        className="flex gap-2"
                      >
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          placeholder={t('placeholder')}
                          className={`${FORM_BASE_CLASSES} flex-1`}
                          disabled={sending}
                        />
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={sending || !inputValue.trim()}
                        >
                          {t('send')}
                        </Button>
                      </form>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3 space-y-2">
                {coachConvs.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedConvId(c.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-palette-forest-light hover:border-palette-olive/30 transition-all text-left"
                  >
                    {c.avatar_url?.trim() ? (
                      <img
                        src={c.avatar_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-stone-300 text-stone-600 flex items-center justify-center text-xs font-semibold shrink-0">
                        {c.athlete_name
                          .split(' ')
                          .map((p) => p[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <span className="text-sm font-medium text-stone-900 block truncate">
                        {c.athlete_name}
                      </span>
                      <span className="text-xs text-stone-500 block truncate">
                        {formatMessageTime(c.updated_at, localeTag)}
                      </span>
                    </div>
                    <svg className="w-4 h-4 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-1 min-h-0">
            <ChatConversationSidebar
              items={sidebarItems}
              selectedId={selectedConvId}
              onSelectItem={(id) => setSelectedConvId(id)}
              labels={{ reduceList: t('reduceList'), expandList: t('expandList') }}
              className="border-t-0"
            />
            <div className="flex-1 flex flex-col min-w-0 min-h-0">
              {selectedConvId && selectedConv ? (
                <>
                  <div className="shrink-0 px-4 py-3 border-b border-stone-100 flex items-center justify-between gap-2">
                    <span className="font-semibold text-stone-900 truncate">
                      {selectedConv.athlete_name}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleCloseConversation}
                      aria-label={t('closeConversation')}
                    >
                      <IconClose className="w-5 h-5" />
                    </Button>
                  </div>
                  {messagesLoading ? (
                    <div className="flex-1 overflow-hidden min-h-0">
                      <ChatOverlaySkeleton variant="conversation" />
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">
                        {messages.map((m) => {
                          const isMe = m.sender_id === userId
                          return (
                            <div
                              key={m.id}
                              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[85%] rounded-2xl px-4 py-2 shadow-chat-inner ${
                                  isMe
                                    ? 'rounded-tr-md bg-palette-forest-dark text-white'
                                    : 'rounded-tl-md bg-white text-stone-800 border border-stone-200'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {m.content}
                                </p>
                                <p
                                  className={`text-xs mt-1 ${
                                    isMe ? 'text-white/80' : 'text-stone-400'
                                  }`}
                                >
                                  {formatMessageTime(m.created_at, localeTag)}
                                  {isMe && ` · ${t('you')}`}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div className="shrink-0 p-4 border-t border-stone-100">
                        {sendError && (
                          <p className="text-sm text-palette-danger mb-2">{sendError}</p>
                        )}
                        <form
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleSend()
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={t('placeholder')}
                            className={`${FORM_BASE_CLASSES} flex-1`}
                            disabled={sending}
                          />
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={sending || !inputValue.trim()}
                          >
                            {t('send')}
                          </Button>
                        </form>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center p-6 min-h-0">
                  <p className="text-sm text-stone-500 text-center">
                    {t('selectConversation')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return null
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="2xl"
      alignment="right"
      title={modalTitle}
      headerRight={headerRight}
      contentClassName="px-0 flex flex-col min-h-[480px] h-[calc(80vh-6rem)] max-h-[640px]"
      className="border border-stone-200 shadow-chat"
      footer={undefined}
    >
      {renderBody()}
    </Modal>
  )
}

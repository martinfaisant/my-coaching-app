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
  getConversationsForAthlete,
  getAthletesForCoachForChat,
  getCoachesForAthleteForChat,
  getMessages,
  sendMessage,
  type ChatRoleResult,
  type ConversationWithMeta,
  type ConversationWithCoachMeta,
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

function filterByDisplayName<T extends { displayName: string }>(list: T[], query: string): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return list
  return list.filter((item) => item.displayName.toLowerCase().includes(q))
}

const AVATAR_VARIANTS: ('olive' | 'sage' | 'stone')[] = ['olive', 'sage', 'stone']

function ContactListSkeleton() {
  return (
    <div className="space-y-2" aria-hidden>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/50">
          <div className="w-11 h-11 rounded-full bg-stone-200 animate-pulse shrink-0" />
          <div className="h-4 flex-1 max-w-[60%] rounded bg-stone-200 animate-pulse" />
        </div>
      ))}
    </div>
  )
}

type ChatModuleProps = {
  initialChatRole?: ChatRoleResult | null
}

export function ChatModule({ initialChatRole }: ChatModuleProps = {}) {
  const t = useTranslations('chat')
  const [chatRole, setChatRole] = useState<ChatRoleResult>(initialChatRole ?? null)
  const [open, setOpen] = useState(false)
  const [coachConvs, setCoachConvs] = useState<ConversationWithMeta[]>([])
  const [selectedCoachConvId, setSelectedCoachConvId] = useState<string | null>(null)

  useEffect(() => {
    if (initialChatRole !== undefined) return
    getChatRole().then(setChatRole)
  }, [initialChatRole])

  if (!chatRole) return null

  const label = chatRole.role === 'athlete' ? t('chatWithCoach') : t('chatWithAthletes')

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
          selectedCoachConvId={selectedCoachConvId}
          setSelectedCoachConvId={setSelectedCoachConvId}
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
  selectedCoachConvId: string | null
  setSelectedCoachConvId: React.Dispatch<React.SetStateAction<string | null>>
}

function ChatOverlay({
  role,
  userId,
  onClose,
  coachConvs,
  setCoachConvs,
  selectedCoachConvId,
  setSelectedCoachConvId,
}: ChatOverlayProps) {
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const t = useTranslations('chat')
  const tCommon = useTranslations('common')

  const [athleteConvs, setAthleteConvs] = useState<ConversationWithCoachMeta[]>([])
  const [selectedAthleteConvId, setSelectedAthleteConvId] = useState<string | null>(null)
  const [coachContacts, setCoachContacts] = useState<{ id: string; displayName: string; avatarUrl: string | null }[]>([])
  const [athleteContacts, setAthleteContacts] = useState<{ id: string; displayName: string; avatarUrl: string | null }[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchApplied, setSearchApplied] = useState('')
  const [createError, setCreateError] = useState<string | null>(null)
  const [showOpenDiscussionView, setShowOpenDiscussionView] = useState(false)
  const [contactsLoaded, setContactsLoaded] = useState(false)

  const conversations = role === 'coach' ? coachConvs : athleteConvs
  const selectedId = role === 'coach' ? selectedCoachConvId : selectedAthleteConvId
  const setSelectedId = role === 'coach' ? setSelectedCoachConvId : setSelectedAthleteConvId

  const normalizedConversations = useMemo(
    () =>
      role === 'coach'
        ? coachConvs.map((c) => ({
            id: c.id,
            peerId: c.athlete_id,
            displayName: c.athlete_name,
            avatarUrl: c.avatar_url ?? null,
            canSend: c.can_send,
          }))
        : athleteConvs.map((c) => ({
            id: c.id,
            peerId: c.coach_id,
            displayName: c.coach_name,
            avatarUrl: c.avatar_url ?? null,
            canSend: c.can_send,
          })),
    [role, coachConvs, athleteConvs]
  )

  const contacts = role === 'coach' ? coachContacts : athleteContacts

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

  const loadMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true)
    const list = await getMessages(conversationId)
    setMessages(list)
    setMessagesLoading(false)
  }, [])

  useEffect(() => {
    if (role === 'coach') {
      if (coachConvs.length > 0) {
        queueMicrotask(() => setLoading(false))
        return
      }
      queueMicrotask(() => setLoading(true))
      getConversationsForCoach()
        .then((list) => {
          setCoachConvs(list)
          setSelectedCoachConvId(list[0]?.id ?? null)
        })
        .finally(() => setLoading(false))
      return
    }

    queueMicrotask(() => setLoading(true))
    getConversationsForAthlete()
      .then((list) => {
        setAthleteConvs(list)
        setSelectedAthleteConvId(list[0]?.id ?? null)
      })
      .finally(() => setLoading(false))
  }, [role, coachConvs.length, setCoachConvs, setSelectedCoachConvId])

  useEffect(() => {
    if (!selectedId) return
    void Promise.resolve().then(() => loadMessages(selectedId))
  }, [selectedId, loadMessages])

  useEffect(() => {
    const shouldLoadContacts = showOpenDiscussionView || (!loading && conversations.length === 0)
    if (!shouldLoadContacts) return

    queueMicrotask(() => setSearchQuery(''))
    queueMicrotask(() => setSearchApplied(''))
    queueMicrotask(() => setContactsLoaded(false))

    if (role === 'coach') {
      getAthletesForCoachForChat()
        .then((list) => {
          setCoachContacts(
            list.map((a) => ({
              id: a.athlete_id,
              displayName: a.displayName,
              avatarUrl: a.avatar_url ?? null,
            }))
          )
          setContactsLoaded(true)
        })
        .catch(() => setContactsLoaded(true))
    } else {
      getCoachesForAthleteForChat()
        .then((list) => {
          setAthleteContacts(
            list.map((c) => ({
              id: c.coach_id,
              displayName: c.displayName,
              avatarUrl: c.avatar_url ?? null,
            }))
          )
          setContactsLoaded(true)
        })
        .catch(() => setContactsLoaded(true))
    }
  }, [role, showOpenDiscussionView, conversations.length, loading])

  const filteredContacts = useMemo(
    () => filterByDisplayName(contacts, searchApplied),
    [contacts, searchApplied]
  )

  const selectedConversation = normalizedConversations.find((c) => c.id === selectedId) ?? null
  const canSendInSelected = selectedConversation?.canSend ?? false

  const handleSelectContact = useCallback(
    async (contactId: string) => {
      setCreateError(null)
      const existing = normalizedConversations.find((c) => c.peerId === contactId)
      if (existing) {
        setShowOpenDiscussionView(false)
        setSelectedId(existing.id)
        return
      }

      const now = new Date().toISOString()
      if (role === 'coach') {
        const result = await getOrCreateConversationForCoach(contactId, locale)
        if (!result.ok) {
          setCreateError(result.error)
          return
        }
        const newConv: ConversationWithMeta = {
          id: result.conversationId,
          request_id: null,
          athlete_id: contactId,
          athlete_name: result.athleteName,
          avatar_url: null,
          updated_at: now,
          can_send: true,
          is_read_only: false,
        }
        setCoachConvs((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)])
        setSelectedId(result.conversationId)
        setShowOpenDiscussionView(false)
        await loadMessages(result.conversationId)
      } else {
        const result = await getOrCreateConversationForAthlete(contactId, locale)
        if (!result.ok) {
          setCreateError(result.error)
          return
        }
        const newConv: ConversationWithCoachMeta = {
          id: result.conversationId,
          request_id: null,
          coach_id: contactId,
          coach_name: result.coachName,
          avatar_url: null,
          updated_at: now,
          can_send: true,
          is_read_only: false,
        }
        setAthleteConvs((prev) => [newConv, ...prev.filter((c) => c.id !== newConv.id)])
        setSelectedId(result.conversationId)
        setShowOpenDiscussionView(false)
        await loadMessages(result.conversationId)
      }
    },
    [role, locale, normalizedConversations, setSelectedId, setCoachConvs, loadMessages]
  )

  const handleCloseConversation = useCallback(() => {
    if (!selectedId) return
    if (role === 'coach') {
      const next = coachConvs.filter((c) => c.id !== selectedId)
      setCoachConvs(next)
      setSelectedCoachConvId(next[0]?.id ?? null)
    } else {
      const next = athleteConvs.filter((c) => c.id !== selectedId)
      setAthleteConvs(next)
      setSelectedAthleteConvId(next[0]?.id ?? null)
    }
  }, [role, selectedId, coachConvs, athleteConvs, setCoachConvs, setSelectedCoachConvId])

  const handleSend = async () => {
    if (!selectedId || !inputValue.trim() || sending) return
    if (!canSendInSelected) {
      setSendError(t('readOnlyConversation'))
      return
    }
    setSending(true)
    setSendError(null)
    const result = await sendMessage(selectedId, inputValue.trim(), locale)
    if (result.error) {
      setSendError(result.error)
    } else {
      setInputValue('')
      loadMessages(selectedId)
    }
    setSending(false)
  }

  const isState1 = conversations.length === 0 && !showOpenDiscussionView
  const isState2 = conversations.length > 0 && !showOpenDiscussionView
  const isState3 = showOpenDiscussionView
  const contactLoading = !contactsLoaded && contacts.length === 0
  const chooseContactLabel =
    role === 'coach' ? t('chooseAthleteToStart') : t('chooseCoachToStart')
  const searchPlaceholderLabel =
    role === 'coach' ? t('searchAthletePlaceholder') : t('searchCoachPlaceholder')

  const sidebarItems = normalizedConversations.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    avatarUrl: c.avatarUrl,
  }))

  const renderConversationPanel = (options?: { mobile?: boolean }) => {
    const isMobile = options?.mobile ?? false

    if (!selectedConversation) {
      return (
        <div className="flex-1 flex items-center justify-center p-6 min-h-0">
          <p className="text-sm text-stone-500 text-center">{t('selectConversation')}</p>
        </div>
      )
    }

    if (messagesLoading) {
      return <div className="flex-1 min-h-0" />
    }

    return (
      <>
        <div className="shrink-0 px-4 py-3 border-b border-stone-100 flex items-center justify-between gap-2">
          {isMobile ? (
            <Button type="button" variant="ghost" onClick={() => setSelectedId(null)} aria-label={tCommon('back')}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          ) : (
            <span aria-hidden className="w-10" />
          )}
          <span className="font-semibold text-stone-900 truncate flex-1 text-center">{selectedConversation.displayName}</span>
          <Button type="button" variant="ghost" onClick={handleCloseConversation} aria-label={t('closeConversation')}>
            <IconClose className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-3">
          {messages.map((m) => {
            const isMe = m.sender_id === userId
            return (
              <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
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
          {sendError && <p className="text-sm text-palette-danger mb-2">{sendError}</p>}
          {!canSendInSelected && <p className="text-xs text-stone-500 mb-2">{t('readOnlyHint')}</p>}
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
              disabled={sending || !canSendInSelected}
            />
            <Button type="submit" variant="primary" disabled={sending || !inputValue.trim() || !canSendInSelected}>
              {t('send')}
            </Button>
          </form>
        </div>
      </>
    )
  }

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="2xl"
      alignment="right"
      title={t('messages')}
      headerRight={
        isState2 ? (
          <Button type="button" variant="secondary" onClick={() => setShowOpenDiscussionView(true)} className="shrink-0">
            {t('openDiscussion')}
          </Button>
        ) : undefined
      }
      contentClassName="px-0 flex flex-col min-h-[480px] h-[calc(80vh-6rem)] max-h-[640px]"
      className="border border-stone-200 shadow-chat"
      footer={undefined}
    >
      {(isState1 || isState3) && (
        <div className="flex flex-col flex-1 min-h-0">
          {isState3 && (
            <div className="shrink-0 px-4 py-3 border-b border-stone-100 flex items-center justify-between gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowOpenDiscussionView(false)} aria-label={tCommon('back')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <span className="text-sm font-medium text-stone-700">{chooseContactLabel}</span>
              <span className="w-10" aria-hidden />
            </div>
          )}
          <div className="shrink-0 px-4 py-2 border-b border-stone-100">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder={searchPlaceholderLabel}
              className={`${FORM_BASE_CLASSES} py-2 text-sm`}
              aria-label={searchPlaceholderLabel}
            />
          </div>
          <div className="flex-1 overflow-y-auto min-h-0 px-4 py-3 space-y-2">
            {createError && <p className="text-sm text-palette-danger mb-2">{createError}</p>}
            {contactLoading ? (
              <ContactListSkeleton />
            ) : filteredContacts.length === 0 ? (
              <p className="text-sm text-stone-500">
                {searchApplied ? t('noMatch', { query: searchApplied }) : t('noConversations')}
              </p>
            ) : (
              filteredContacts.map((item, i) => (
                <ChatAthleteListItem
                  key={item.id}
                  displayName={item.displayName}
                  avatarUrl={item.avatarUrl}
                  actionLabel={t('start')}
                  avatarVariant={AVATAR_VARIANTS[i % AVATAR_VARIANTS.length]}
                  onClick={() => handleSelectContact(item.id)}
                />
              ))
            )}
          </div>
        </div>
      )}

      {isState2 && (
        <div className="flex flex-1 min-h-0 border-t border-stone-100">
          <div className="md:hidden flex-1 flex flex-col min-h-0">
            {selectedConversation ? (
              renderConversationPanel({ mobile: true })
            ) : (
              <div className="flex-1 overflow-y-auto min-h-0 px-3 py-3 space-y-2">
                {normalizedConversations.map((c, i) => (
                  <ChatAthleteListItem
                    key={c.id}
                    displayName={c.displayName}
                    avatarUrl={c.avatarUrl}
                    avatarVariant={AVATAR_VARIANTS[i % AVATAR_VARIANTS.length]}
                    onClick={() => setSelectedId(c.id)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="hidden md:flex flex-1 min-h-0">
            <ChatConversationSidebar
              items={sidebarItems}
              selectedId={selectedId}
              onSelectItem={(id) => setSelectedId(id)}
              labels={{ reduceList: t('reduceList'), expandList: t('expandList') }}
              className="border-t-0"
            />
            <div className="flex-1 flex flex-col min-w-0 min-h-0">{renderConversationPanel()}</div>
          </div>
        </div>
      )}
    </Modal>
  )
}

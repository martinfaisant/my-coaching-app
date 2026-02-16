'use client'

import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { IconClose } from '@/components/icons/IconClose'
import { useState, useEffect, useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import {
  getChatRole,
  getOrCreateConversationForAthlete,
  getConversationsForCoach,
  getMessages,
  sendMessage,
  type ChatRoleResult,
  type AthleteConversationResult,
  type ConversationWithMeta,
} from '@/app/[locale]/actions/chat'
import type { ChatMessage } from '@/types/database'

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

type ChatModuleProps = {
  /** Fourni par le layout dashboard pour éviter un appel client au montage */
  initialChatRole?: ChatRoleResult | null
}

export function ChatModule({ initialChatRole }: ChatModuleProps = {}) {
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const t = useTranslations('chat')
  const [chatRole, setChatRole] = useState<ChatRoleResult>(initialChatRole ?? null)
  const [open, setOpen] = useState(false)

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
        />
      )}
    </>
  )
}

type ChatOverlayProps = {
  role: 'athlete' | 'coach'
  userId: string
  onClose: () => void
}

function ChatOverlay({ role, userId, onClose }: ChatOverlayProps) {
  const locale = useLocale()
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  const t = useTranslations('chat')
  const [athleteData, setAthleteData] = useState<AthleteConversationResult | null>(null)
  const [coachConvs, setCoachConvs] = useState<ConversationWithMeta[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sendError, setSendError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)

  const loadMessages = useCallback(async (conversationId: string) => {
    const list = await getMessages(conversationId)
    setMessages(list)
  }, [])

  useEffect(() => {
    if (role === 'athlete') {
      setLoading(true)
      getOrCreateConversationForAthlete()
        .then((data) => {
          setAthleteData(data)
          if (data) loadMessages(data.conversation.id)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(true)
      getConversationsForCoach()
        .then((list) => {
          setCoachConvs(list)
          if (list.length > 0 && !selectedConvId) {
            setSelectedConvId(list[0].id)
          }
        })
        .finally(() => setLoading(false))
    }
  }, [role])

  useEffect(() => {
    if (role === 'coach' && selectedConvId) {
      loadMessages(selectedConvId)
    }
  }, [role, selectedConvId, loadMessages])

  const currentConversationId =
    role === 'athlete' ? athleteData?.conversation.id ?? null : selectedConvId

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

  const title =
    role === 'athlete'
      ? athleteData
        ? t('conversationWith', { name: athleteData.coachName })
        : t('chatWithCoach')
      : t('chatWithAthletes')

  const headerRight =
    role === 'coach' && coachConvs.length > 0 ? (
      <div className="flex gap-1 overflow-x-auto max-w-[300px]">
        {coachConvs.map((c) => (
          <Button
            key={c.id}
            type="button"
            variant={selectedConvId === c.id ? 'primary' : 'muted'}
            onClick={() => setSelectedConvId(c.id)}
            className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium min-h-0 ${
              selectedConvId === c.id
                ? 'border-2 border-transparent hover:!bg-palette-forest-dark'
                : '!border-2 !border-palette-forest-dark !bg-stone-100 hover:!bg-stone-200'
            }`}
          >
            {c.athlete_name}
          </Button>
        ))}
      </div>
    ) : undefined

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      size="md"
      alignment="right"
      title={title}
      contentClassName="px-0 flex flex-col h-[calc(80vh-8rem)] max-h-[600px]"
      className="border-2 border-palette-forest-dark"
      footer={
        (role === 'athlete' ? athleteData : currentConversationId) ? (
          <div className="w-full">
            {sendError && <p className="text-sm text-red-600 mb-2">{sendError}</p>}
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
                className="flex-1 rounded-lg border-2 border-palette-forest-dark bg-white px-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-palette-olive transition"
                disabled={sending}
              />
              <Button type="submit" variant="primary" disabled={sending || !inputValue.trim()}>
                {t('send')}
              </Button>
            </form>
          </div>
        ) : undefined
      }
    >
      {role === 'coach' && coachConvs.length > 0 && (
        <div className="shrink-0 flex gap-1 p-2 border-b-2 border-palette-forest-dark overflow-x-auto">
          {coachConvs.map((c) => (
            <Button
              key={c.id}
              type="button"
              variant={selectedConvId === c.id ? 'primary' : 'muted'}
              onClick={() => setSelectedConvId(c.id)}
              className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium min-h-0 ${
                selectedConvId === c.id
                  ? 'border-2 border-transparent hover:!bg-palette-forest-dark'
                  : '!border-2 !border-palette-forest-dark !bg-stone-100 hover:!bg-stone-200'
              }`}
            >
              {c.athlete_name}
            </Button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 space-y-3 min-h-0">
        {loading ? (
            <p className="text-sm text-stone-400">{t('loading')}</p>
          ) : role === 'athlete' && !athleteData ? (
            <p className="text-sm text-stone-400">
              {t('noCoachAssigned')}
            </p>
          ) : role === 'coach' && coachConvs.length === 0 ? (
            <p className="text-sm text-stone-400">
              {t('noConversations')}
            </p>
          ) : (
            messages.map((m) => {
              const isMe = m.sender_id === userId
              return (
                <div
                  key={m.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 border-2 ${
                      isMe
                        ? 'bg-palette-forest-dark text-white border-palette-olive'
                        : 'bg-stone-100 text-stone-900 border-palette-forest-dark'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{m.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isMe
                          ? 'text-stone-400'
                          : 'text-stone-400'
                      }`}
                    >
                      {formatMessageTime(m.created_at, localeTag)}
                      {isMe && ` · ${t('you')}`}
                    </p>
                  </div>
                </div>
              )
            })
          )}
      </div>
    </Modal>
  )
}

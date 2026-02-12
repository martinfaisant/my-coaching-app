'use client'

import { Button } from '@/components/Button'
import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  getChatRole,
  getOrCreateConversationForAthlete,
  getConversationsForCoach,
  getMessages,
  sendMessage,
  type ChatRoleResult,
  type AthleteConversationResult,
  type ConversationWithMeta,
} from '@/app/actions/chat'
import type { ChatMessage } from '@/types/database'

function formatMessageTime(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  if (sameDay) {
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('fr-FR', {
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
  const [chatRole, setChatRole] = useState<ChatRoleResult>(initialChatRole ?? null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (initialChatRole !== undefined) return
    getChatRole().then(setChatRole)
  }, [initialChatRole])

  if (!chatRole) return null
  if (chatRole.role === 'athlete' && !chatRole.hasCoach) return null

  const label =
    chatRole.role === 'athlete' ? 'Chater avec mon coach' : 'Discuter avec mes athlètes'

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

      {open && typeof document !== 'undefined' && createPortal(
        <ChatOverlay
          role={chatRole.role}
          userId={chatRole.userId}
          onClose={() => setOpen(false)}
        />,
        document.body
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
  const [athleteData, setAthleteData] = useState<AthleteConversationResult | null>(null)
  const [coachConvs, setCoachConvs] = useState<ConversationWithMeta[]>([])
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [sendError, setSendError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

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
    const result = await sendMessage(currentConversationId, inputValue.trim())
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
        ? `Discussion avec ${athleteData.coachName}`
        : 'Chater avec mon coach'
      : 'Discuter avec mes athlètes'

  return (
    <>
      <div
        className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="fixed inset-0 z-[100] flex items-center justify-end p-4"
        role="dialog"
        aria-modal="true"
        aria-label="Discussion"
      >
      <div className="relative flex flex-col w-full max-w-md h-[80vh] max-h-[600px] rounded-2xl border-2 border-palette-forest-dark bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between shrink-0 p-4 border-b-2 border-palette-forest-dark bg-white">
          <h2 className="text-lg font-semibold text-stone-900 truncate">
            {title}
          </h2>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            aria-label="Fermer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </Button>
        </div>

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

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {loading ? (
            <p className="text-sm text-stone-400">Chargement...</p>
          ) : role === 'athlete' && !athleteData ? (
            <p className="text-sm text-stone-400">
              Aucun coach assigné. Vous ne pouvez pas envoyer de message pour le moment.
            </p>
          ) : role === 'coach' && coachConvs.length === 0 ? (
            <p className="text-sm text-stone-400">
              Aucune discussion avec vos athlètes pour le moment.
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
                      {formatMessageTime(m.created_at)}
                      {isMe && ' · Vous'}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {(role === 'athlete' ? athleteData : currentConversationId) && (
          <div className="shrink-0 p-4 border-t-2 border-palette-forest-dark bg-white">
            {sendError && (
              <p className="text-sm text-red-600 mb-2">{sendError}</p>
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
                placeholder="Votre message..."
                className="flex-1 rounded-lg border-2 border-palette-forest-dark bg-white px-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-palette-olive focus:border-palette-olive transition"
                disabled={sending}
              />
              <Button
                type="submit"
                variant="primary"
                disabled={sending || !inputValue.trim()}
              >
                Envoyer
              </Button>
            </form>
          </div>
        )}
      </div>
      </div>
    </>
  )
}

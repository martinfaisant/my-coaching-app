'use client'

import { useState, useEffect, useCallback } from 'react'
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

export function ChatModule() {
  const [chatRole, setChatRole] = useState<ChatRoleResult>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    getChatRole().then(setChatRole)
  }, [])

  if (!chatRole) return null
  if (chatRole.role === 'athlete' && !chatRole.hasCoach) return null

  const label =
    chatRole.role === 'athlete' ? 'Chater avec mon coach' : 'Discuter avec mes athlètes'

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-palette-forest-dark px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-palette-olive transition-colors focus:outline-none focus:ring-2 focus:ring-palette-olive focus:ring-offset-2"
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
      </button>

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
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-end p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Discussion"
    >
      <div
        className="absolute inset-0 bg-palette-forest-dark/50bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative flex flex-col w-full max-w-md h-[80vh] max-h-[600px] rounded-2xl border-2 border-palette-forest-dark bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between shrink-0 p-4 border-b-2 border-palette-forest-dark bg-white">
          <h2 className="text-lg font-semibold text-stone-900 truncate">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
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
          </button>
        </div>

        {role === 'coach' && coachConvs.length > 0 && (
          <div className="shrink-0 flex gap-1 p-2 border-b-2 border-palette-forest-dark overflow-x-auto">
            {coachConvs.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedConvId(c.id)}
                className={`shrink-0 px-3 py-2 rounded-xl text-sm font-medium transition border-2 ${
                  selectedConvId === c.id
                    ? 'bg-palette-forest-dark text-white border-palette-olive'
                    : 'bg-stone-100 text-stone-700 border-palette-forest-dark hover:bg-stone-200'
                }`}
              >
                {c.athlete_name}
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {loading ? (
            <p className="text-sm text-white0text-stone-400">Chargement...</p>
          ) : role === 'athlete' && !athleteData ? (
            <p className="text-sm text-white0text-stone-400">
              Aucun coach assigné. Vous ne pouvez pas envoyer de message pour le moment.
            </p>
          ) : role === 'coach' && coachConvs.length === 0 ? (
            <p className="text-sm text-white0text-stone-400">
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
                          ? 'text-stone-400text-white0'
                          : 'text-white0text-stone-400'
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
              <p className="text-sm text-red-600text-red-400 mb-2">{sendError}</p>
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
              <button
                type="submit"
                disabled={sending || !inputValue.trim()}
                className="shrink-0 rounded-lg bg-palette-forest-dark px-4 py-2 text-sm font-medium text-white border-2 border-palette-olive hover:bg-palette-olive transition-colors disabled:opacity-50"
              >
                Envoyer
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

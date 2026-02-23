'use client'

/**
 * ChatConversationSidebar — Sidebar liste des conversations (états 2a/2b overlay chat coach).
 * Affiche les conversations avec avatar + nom (étendue) ou avatars seuls (réduite).
 * Un bouton chevron permet de réduire/étendre. Pas de bouton Fermer dans les lignes.
 * Référence : docs/CHAT_COACH_START_CONVERSATION_DESIGN.md, mockup états 2a et 2b.
 */

import { useState } from 'react'
import { AvatarImage } from '@/components/AvatarImage'
import { getInitials } from '@/lib/stringUtils'

export type ChatConversationSidebarItem = {
  id: string
  displayName: string
  avatarUrl?: string | null
}

export type ChatConversationSidebarProps = {
  /** Liste des conversations (athlètes) */
  items: ChatConversationSidebarItem[]
  /** Id de l'item sélectionné */
  selectedId: string | null
  /** Appelé au clic sur un item */
  onSelectItem: (id: string) => void
  /** Labels i18n pour les boutons réduire/étendre */
  labels?: {
    reduceList?: string
    expandList?: string
  }
  className?: string
}

const AVATAR_SELECTED = 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
const AVATAR_UNSELECTED = 'bg-stone-300 text-stone-600'
const ROW_SELECTED = 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
const ROW_UNSELECTED = 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'

export function ChatConversationSidebar({
  items,
  selectedId,
  onSelectItem,
  labels = {},
  className = '',
}: ChatConversationSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { reduceList = 'Réduire la liste', expandList = 'Étendre la liste' } = labels

  const widthClass = collapsed ? 'w-14' : 'w-40'
  return (
    <aside
      className={`${widthClass} shrink-0 border-r border-stone-100 py-2 flex flex-col min-h-0 ${className}`.trim()}
    >
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className={collapsed
          ? 'w-8 h-8 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-100 hover:text-stone-600 mx-auto'
          : 'flex items-center justify-end px-2 py-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-50 w-full'}
        aria-label={collapsed ? expandList : reduceList}
      >
        {collapsed ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-h-0 overflow-y-auto">
      {collapsed ? (
        <div className="flex flex-col items-center gap-1 mt-1">
          {items.map((item) => {
            const isSelected = selectedId === item.id
            const initials = getInitials(item.displayName)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                title={item.displayName}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all ${
                  isSelected ? AVATAR_SELECTED : `${AVATAR_UNSELECTED} hover:ring-2 hover:ring-stone-300`
                }`}
              >
                {item.avatarUrl?.trim() ? (
                  <AvatarImage
                    src={item.avatarUrl}
                    initials={initials}
                    alt=""
                    className={`w-9 h-9 rounded-full object-cover ${isSelected ? 'ring-2 ring-white' : ''}`}
                  />
                ) : (
                  initials
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-stretch mt-0 px-2">
          {items.map((item) => {
            const isSelected = selectedId === item.id
            const initials = getInitials(item.displayName)
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectItem(item.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all duration-300 ${
                  isSelected ? ROW_SELECTED : ROW_UNSELECTED
                }`}
              >
                {item.avatarUrl?.trim() ? (
                  <AvatarImage
                    src={item.avatarUrl}
                    initials={initials}
                    alt=""
                    className={`w-8 h-8 rounded-full object-cover shrink-0 ${isSelected ? 'ring-2 ring-white' : ''}`}
                  />
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : AVATAR_UNSELECTED
                    }`}
                    aria-hidden
                  >
                    {initials}
                  </div>
                )}
                <span className="text-sm truncate font-medium">
                  {item.displayName}
                </span>
              </button>
            )
          })}
        </div>
      )}
      </div>
    </aside>
  )
}

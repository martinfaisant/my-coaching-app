'use client'

/**
 * Showcase des composants Chat du design system :
 * ChatAthleteListItem (liste d'athlètes pour démarrer une conversation),
 * ChatConversationSidebar (sidebar conversations réductible).
 * Référence : docs/CHAT_COACH_START_CONVERSATION_DESIGN.md, mockup.
 */

import { useState } from 'react'
import { ChatAthleteListItem } from '@/components/ChatAthleteListItem'
import { ChatConversationSidebar } from '@/components/ChatConversationSidebar'

const SIDEBAR_ITEMS = [
  { id: '1', displayName: 'Jean Dupont', avatarUrl: null },
  { id: '2', displayName: 'Marie Martin', avatarUrl: null },
]

export function ChatShowcase() {
  const [selectedId, setSelectedId] = useState<string | null>('1')

  return (
    <div className="space-y-10">
      <div>
        <h3 className="text-base font-semibold text-stone-800 mb-2">
          ChatAthleteListItem
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Ligne cliquable pour la liste d&apos;athlètes dans l&apos;overlay chat (état 1). Avatar (initiales ou image), nom, label optionnel « Démarrer » au hover. Utilisé quand le coach n&apos;a aucune conversation pour choisir un athlète et démarrer une conversation.
        </p>
        <div className="max-w-md space-y-2">
          <ChatAthleteListItem
            displayName="Jean Dupont"
            actionLabel="Démarrer"
            avatarVariant="olive"
            onClick={() => {}}
          />
          <ChatAthleteListItem
            displayName="Marie Martin"
            actionLabel="Démarrer"
            avatarVariant="sage"
            onClick={() => {}}
          />
          <ChatAthleteListItem
            displayName="Sophie Leroy"
            actionLabel="Démarrer"
            avatarVariant="stone"
            onClick={() => {}}
          />
        </div>
      </div>

      <div className="pt-8 border-t border-stone-200">
        <h3 className="text-base font-semibold text-stone-800 mb-2">
          ChatConversationSidebar
        </h3>
        <p className="text-sm text-stone-600 mb-4">
          Sidebar des conversations (états 2a/2b). Liste avatar + nom ; bouton chevron pour réduire (avatars seuls) ou étendre. Clic sur une ligne pour sélectionner la conversation. Pas de bouton Fermer dans les lignes.
        </p>
        <div className="rounded-xl border border-stone-200 bg-white shadow-chat overflow-hidden flex" style={{ minHeight: 320 }}>
          <ChatConversationSidebar
            items={SIDEBAR_ITEMS}
            selectedId={selectedId}
            onSelectItem={(id) => setSelectedId(id)}
            labels={{ reduceList: 'Réduire la liste', expandList: 'Étendre la liste' }}
          />
          <div className="flex-1 flex flex-col min-w-0 border-l border-stone-100">
            <div className="px-4 py-3 border-b border-stone-100">
              <span className="text-sm font-semibold text-stone-900">
                {selectedId === '1' ? 'Jean Dupont' : selectedId === '2' ? 'Marie Martin' : '—'}
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 bg-stone-50/40">
              <p className="text-sm text-stone-500 text-center">
                Panneau de conversation (mock). Cliquez sur un nom dans la sidebar ou sur le chevron pour réduire/étendre.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

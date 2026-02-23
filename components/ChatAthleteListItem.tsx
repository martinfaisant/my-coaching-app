'use client'

/**
 * ChatAthleteListItem — Ligne athlète pour la liste du chat (état 1 overlay coach).
 * Utilisé dans l'overlay chat quand le coach n'a pas encore de conversation : liste des athlètes
 * avec souscription active, clic pour démarrer une conversation.
 * Design : avatar (initiales ou image), nom, label optionnel « Démarrer » au hover.
 * Référence : docs/CHAT_COACH_START_CONVERSATION_DESIGN.md, mockup état 1.
 */

import { AvatarImage } from '@/components/AvatarImage'
import { getInitials } from '@/lib/stringUtils'

export type ChatAthleteListItemProps = {
  /** Nom affiché (prénom + nom ou email) */
  displayName: string
  /** URL de l'avatar ou null pour initiales */
  avatarUrl?: string | null
  /** Label affiché au hover à droite (ex. "Démarrer"). Optionnel. */
  actionLabel?: string
  /** Appelé au clic sur la ligne */
  onClick?: () => void
  /** Variante visuelle de l'avatar (couleur de fond si pas d'image) */
  avatarVariant?: 'olive' | 'sage' | 'stone'
  className?: string
}

const AVATAR_BG: Record<NonNullable<ChatAthleteListItemProps['avatarVariant']>, string> = {
  olive: 'bg-palette-olive',
  sage: 'bg-palette-sage',
  stone: 'bg-stone-300 text-stone-600',
}

export function ChatAthleteListItem({
  displayName,
  avatarUrl,
  actionLabel,
  onClick,
  avatarVariant = 'olive',
  className = '',
}: ChatAthleteListItemProps) {
  const initials = getInitials(displayName)

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-stone-50/50 hover:bg-palette-forest-light hover:border-palette-olive/30 transition-all text-left group ${className}`.trim()}
    >
      {avatarUrl?.trim() ? (
        <AvatarImage
          src={avatarUrl}
          initials={initials}
          alt=""
          className="w-11 h-11 rounded-full object-cover shrink-0 shadow-chat-inner"
        />
      ) : (
        <div
          className={`w-11 h-11 rounded-full text-white flex items-center justify-center text-sm font-semibold shrink-0 shadow-chat-inner ${AVATAR_BG[avatarVariant]}`}
          aria-hidden
        >
          {initials}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <span className="font-medium text-stone-900 group-hover:text-palette-forest-darker">
          {displayName}
        </span>
      </div>
      {actionLabel && (
        <span className="text-xs font-medium text-palette-forest-dark opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {actionLabel}
        </span>
      )}
    </button>
  )
}

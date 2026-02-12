'use client'

type AvatarProps = {
  /** 1 ou 2 lettres (ex. "JP", "A") */
  initials: string
  /** Classes optionnelles pour la taille (ex. w-8 h-8, w-10 h-10). Par défaut w-9 h-9. */
  className?: string
}

export function Avatar({ initials, className = '' }: AvatarProps) {
  const display = (initials || '?').slice(0, 2).toUpperCase()

  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white w-9 h-9 bg-gradient-palette-br ${className}`.trim()}
    >
      {display}
    </div>
  )
}

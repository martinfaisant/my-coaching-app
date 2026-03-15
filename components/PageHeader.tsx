import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  /** Icône affichée à gauche du titre (ex. badge vert forêt). */
  icon?: ReactNode
  rightContent?: ReactNode
}

export function PageHeader({ title, icon, rightContent }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 lg:px-8 py-4 border-b border-stone-200/50 bg-white/80 shrink-0">
      <h1 className="flex items-center gap-2 md:gap-3 text-xl font-bold text-stone-900 truncate min-w-0">
        {icon && (
          <span
            className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl bg-palette-forest-dark text-white shrink-0"
            aria-hidden
          >
            {icon}
          </span>
        )}
        <span className="truncate">{title}</span>
      </h1>
      {rightContent && <div className="shrink-0">{rightContent}</div>}
    </header>
  )
}

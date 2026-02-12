import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  rightContent?: ReactNode
}

export function PageHeader({ title, rightContent }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 lg:px-8 py-4 border-b border-stone-200/50 bg-white/80 shrink-0">
      <h1 className="text-xl font-bold text-stone-900 truncate">{title}</h1>
      {rightContent && <div className="shrink-0">{rightContent}</div>}
    </header>
  )
}

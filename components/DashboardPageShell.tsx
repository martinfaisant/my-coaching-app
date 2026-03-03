import { ReactNode } from 'react'
import { PageHeader } from './PageHeader'

interface DashboardPageShellProps {
  title: string
  rightContent?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

/**
 * Shell réutilisable pour les pages du dashboard.
 * Fournit le layout standard : card blanche avec header et zone scrollable.
 */
export function DashboardPageShell({
  title,
  rightContent,
  children,
  className = '',
  contentClassName = '',
}: DashboardPageShellProps) {
  return (
    <main
      className={`flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50 ${className}`.trim()}
    >
      <PageHeader title={title} rightContent={rightContent} />

      {/* ZONE SCROLLABLE — pb-24 évite que le bouton flottant "Discuter" recouvre la dernière ligne de contenu */}
      <div className={`flex-1 min-h-0 overflow-y-auto px-6 lg:px-8 pt-6 pb-24 ${contentClassName}`.trim()}>
        {children}
      </div>
    </main>
  )
}

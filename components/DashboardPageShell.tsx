import { ReactNode } from 'react'

interface DashboardPageShellProps {
  children: ReactNode
  className?: string
  contentClassName?: string
}

/**
 * Shell réutilisable pour les pages du dashboard.
 * Fournit uniquement le padding de contenu (pas de carte ni titre).
 * Le scroll est géré par le layout (DashboardChatWrapper).
 */
export function DashboardPageShell({
  children,
  className = '',
  contentClassName = '',
}: DashboardPageShellProps) {
  return (
    <div className={`px-6 lg:px-8 pt-6 pb-24 ${contentClassName} ${className}`.trim()}>
      {children}
    </div>
  )
}

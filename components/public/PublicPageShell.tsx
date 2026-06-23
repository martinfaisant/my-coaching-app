import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'

type PublicPageShellProps = {
  children: React.ReactNode
  footer: React.ReactNode
}

/**
 * Layout partagé des pages publiques : header marketing ou dashboard, contenu, pied de page.
 */
export function PublicPageShell({ children, footer }: PublicPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicOrDashboardHeader />
      {children}
      {footer}
    </div>
  )
}

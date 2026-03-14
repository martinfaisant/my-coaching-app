'use client'

import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import type { NavItem } from '@/lib/dashboardNavConfig'
import { isNavItemActive } from '@/lib/dashboardNavConfig'
import { getNavIcon } from '@/components/DashboardNavIcons'

type DashboardNavLinksProps = {
  items: NavItem[]
  variant: 'inline' | 'list'
  /** En mode tablette et desktop (md+), centrer les liens dans l’en-tête. */
  centerOnDesktop?: boolean
  /** Classe sur le conteneur nav (ex. scrollbar-hide overflow-x-auto pour la barre). */
  className?: string
}

export function DashboardNavLinks({
  items,
  variant,
  centerOnDesktop = false,
  className = '',
}: DashboardNavLinksProps) {
  const t = useTranslations('navigation')
  const pathname = usePathname()

  const linkBase =
    'flex items-center rounded-xl transition-all duration-300 group shrink-0 ' +
    (variant === 'inline'
      ? 'gap-2 px-3 py-2 text-sm font-medium whitespace-nowrap'
      : 'gap-3 px-3 py-3 font-medium')

  const activeClass =
    'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
  const inactiveClass =
    'text-stone-600 hover:bg-stone-50 hover:text-palette-forest-dark'

  const navContent = (
    <>
      {items.map((item) => {
        const active = isNavItemActive(pathname, item)
        const icon = getNavIcon(item)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${linkBase} ${active ? activeClass : inactiveClass}`}
          >
            {icon}
            <span>{t(item.i18nKey as any)}</span>
          </Link>
        )
      })}
    </>
  )

  if (variant === 'inline') {
    return (
      <nav
        className={`scrollbar-hide flex items-center gap-1 min-w-0 flex-1 overflow-x-auto overflow-y-hidden py-1 ${centerOnDesktop ? 'justify-center' : ''} ${className}`.trim()}
      >
        {navContent}
      </nav>
    )
  }

  return (
    <nav className={`flex flex-col space-y-1 p-2 ${className}`.trim()}>
      {navContent}
    </nav>
  )
}

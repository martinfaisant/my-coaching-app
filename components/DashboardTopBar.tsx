'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { AvatarImage } from '@/components/AvatarImage'
import { getDisplayName } from '@/lib/displayName'
import { getInitials } from '@/lib/stringUtils'
import { getDashboardNavItems, getPageTitleI18nKey } from '@/lib/dashboardNavConfig'
import { DashboardNavLinks } from '@/components/DashboardNavLinks'
import { Drawer } from '@/components/Drawer'
import { LogoutButton } from '@/components/LogoutButton'
import { IconClose } from '@/components/icons/IconClose'
import type { Profile } from '@/types/database'

type DashboardTopBarProps = {
  profile: Profile & { email: string }
}

export function DashboardTopBar({ profile }: DashboardTopBarProps) {
  const t = useTranslations('navigation')
  const pathname = usePathname()
  const [drawerOpenPathname, setDrawerOpenPathname] = useState<string | null>(null)
  const navItems = getDashboardNavItems(profile)
  const displayName = getDisplayName(profile, '')
  const initials = getInitials(displayName)
  const isProfilePage = pathname === '/dashboard/profile'
  const isEmail = displayName.includes('@')
  const maxLength = isEmail ? 14 : 18
  const profileLabel =
    displayName.length > maxLength
      ? `${displayName.slice(0, maxLength - 3)}...`
      : displayName

  const isDrawerOpen = drawerOpenPathname === pathname

  return (
    <>
      <header className="h-14 flex items-center gap-3 md:gap-4 px-4 md:px-5 lg:px-6 bg-white shrink-0 z-30">
        {/* Logo à gauche */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 shrink-0 min-w-0"
          aria-label="My Sport Ally"
        >
          <Image
            src="/logo.svg"
            alt=""
            width={64}
            height={64}
            className="h-7 w-auto object-contain shrink-0"
            aria-hidden
          />
          <span className="text-base font-bold text-stone-800 truncate hidden sm:inline">
            My Sport Ally
          </span>
        </Link>

        {/* Mobile : titre de la page au centre */}
        <div className="flex-1 flex justify-center min-w-0 md:hidden">
          <span className="text-sm font-semibold text-stone-800 truncate px-2" aria-hidden>
            {t(getPageTitleI18nKey(pathname, navItems))}
          </span>
        </div>
        <button
          type="button"
          className="md:hidden ml-auto p-2.5 rounded-xl text-stone-500 hover:bg-stone-100 shrink-0 transition-colors"
          onClick={() => setDrawerOpenPathname(pathname)}
          aria-label={t('openMenu')}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Tablette / Desktop : nav au centre + profil à droite */}
        <div className="hidden md:flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          <DashboardNavLinks
            items={navItems}
            variant="inline"
            centerOnDesktop
            className="flex-1 min-w-0"
          />
          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl border shrink-0 min-w-0 ${
              isProfilePage
                ? 'bg-palette-forest-dark text-white border-palette-forest-dark'
                : 'border-stone-100 bg-stone-50 hover:bg-white text-stone-800'
            }`}
          >
            <AvatarImage
              src={profile.avatar_url}
              initials={initials}
              className={`w-7 h-7 md:w-8 md:h-8 rounded-full object-cover shrink-0 ${isProfilePage ? '!bg-white/20' : ''}`}
            />
            <span className="text-xs md:text-sm font-bold truncate max-w-[100px] lg:max-w-[120px] hidden sm:inline">
              {profileLabel}
            </span>
          </Link>
        </div>
      </header>

      {/* Drawer mobile */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setDrawerOpenPathname(null)}
        placement="right"
        aria-label={t('openMenu')}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-end p-4 border-b border-stone-200 bg-stone-50 shrink-0">
            <button
              type="button"
              onClick={() => setDrawerOpenPathname(null)}
              className="p-2.5 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors"
              aria-label={t('collapseMenu')}
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <DashboardNavLinks items={navItems} variant="list" />
            <div className="border-t border-stone-200 p-2 mt-2 space-y-1">
              <Link
                href="/dashboard/profile"
                onClick={() => setDrawerOpenPathname(null)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl border border-stone-100 bg-stone-50"
              >
                <AvatarImage
                  src={profile.avatar_url}
                  initials={initials}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="text-left min-w-0">
                  <p className="font-bold text-stone-800 truncate" title={displayName}>
                    {profileLabel}
                  </p>
                  <p className="text-xs text-stone-500">{t('profile')}</p>
                </div>
              </Link>
              <hr className="border-stone-200 my-2" />
              <div className="px-3 py-2">
                <LogoutButton className="w-full justify-start gap-3 rounded-xl font-medium !py-3 hover:bg-palette-danger-light" />
              </div>
            </div>
          </div>
        </div>
      </Drawer>
    </>
  )
}

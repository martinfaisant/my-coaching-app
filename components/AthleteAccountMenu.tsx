'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { AvatarImage } from '@/components/AvatarImage'
import { LogoutButton } from '@/components/LogoutButton'
import { getNavIcon } from '@/components/DashboardNavIcons'
import {
  getAthleteAccountNavItems,
  getAthleteNotificationsNavItem,
  getAthleteProfileNavItem,
  getContactPublicNavItem,
  isAthleteAccountMenuTriggerActive,
  isNavItemActive,
} from '@/lib/dashboardNavConfig'
import type { ProfileNavInput } from '@/lib/dashboardNavConfig'
import type { Profile } from '@/types/database'

type AthleteAccountMenuProps = {
  profile: ProfileNavInput & Pick<Profile, 'avatar_url'>
  displayName: string
  profileLabel: string
  initials: string
}

const LINK_ROW =
  'flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium transition-all duration-300'
const LINK_ACTIVE =
  'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
const LINK_INACTIVE = 'text-stone-600 hover:bg-stone-50 hover:text-palette-forest-dark'

export function AthleteAccountMenu(props: AthleteAccountMenuProps) {
  const pathname = usePathname()
  return <AthleteAccountMenuInner key={pathname} pathname={pathname} {...props} />
}

type AthleteAccountMenuInnerProps = AthleteAccountMenuProps & {
  pathname: string
}

function AthleteAccountMenuInner({
  profile,
  displayName,
  profileLabel,
  initials,
  pathname,
}: AthleteAccountMenuInnerProps) {
  const t = useTranslations('navigation')
  const menuId = useId()
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const accountItems = getAthleteAccountNavItems(profile)
  const contactItem = getContactPublicNavItem()
  const profileItem = getAthleteProfileNavItem()
  const notificationsItem = getAthleteNotificationsNavItem()
  const triggerActive = isAthleteAccountMenuTriggerActive(pathname, profile)

  useEffect(() => {
    if (!open) return
    function handlePointerDown(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  return (
    <div ref={wrapRef} className="relative shrink-0 min-w-0">
      <button
        type="button"
        id={`${menuId}-trigger`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={`${menuId}-panel`}
        aria-label={`${t('accountMenu')}: ${displayName}`}
        className={`hidden md:flex items-center gap-2 px-2 md:px-3 py-1.5 rounded-xl border min-w-0 transition-colors ${
          triggerActive
            ? 'bg-palette-forest-dark text-white border-palette-forest-dark'
            : 'border-stone-100 bg-stone-50 hover:bg-white text-stone-800'
        }`}
        onClick={() => setOpen((v) => !v)}
      >
        <AvatarImage
          src={profile.avatar_url}
          initials={initials}
          className={`w-7 h-7 md:w-8 md:h-8 rounded-full object-cover shrink-0 ${triggerActive ? '!bg-white/20' : ''}`}
        />
        <span className="text-xs md:text-sm font-bold truncate max-w-[100px] lg:max-w-[120px] hidden sm:inline">
          {profileLabel}
        </span>
        <svg
          className={`w-4 h-4 shrink-0 text-stone-400 transition-transform ${open ? 'rotate-180' : ''} ${triggerActive ? 'text-white/80' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open ? (
        <div
          id={`${menuId}-panel`}
          role="menu"
          aria-labelledby={`${menuId}-trigger`}
          className="absolute right-0 top-full z-40 mt-1 min-w-[16rem] max-w-[min(18rem,calc(100vw-2rem))] rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
        >
          <div className="py-1" role="none">
            {accountItems.map((item) => {
              const active = isNavItemActive(pathname, item)
              const icon = getNavIcon(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="menuitem"
                  className={`${LINK_ROW} ${active ? LINK_ACTIVE : LINK_INACTIVE}`}
                  onClick={() => setOpen(false)}
                >
                  {icon}
                  <span>{t(item.i18nKey)}</span>
                </Link>
              )
            })}
          </div>
          <hr className="border-stone-200" role="separator" />
          <div className="py-1" role="none">
            <Link
              href={contactItem.href}
              role="menuitem"
              className={`${LINK_ROW} ${
                isNavItemActive(pathname, contactItem) ? LINK_ACTIVE : LINK_INACTIVE
              }`}
              onClick={() => setOpen(false)}
            >
              {getNavIcon(contactItem)}
              <span>{t(contactItem.i18nKey)}</span>
            </Link>
          </div>
          <hr className="border-stone-200" role="separator" />
          <div className="py-1" role="none">
            <Link
              href={profileItem.href}
              role="menuitem"
              className={`${LINK_ROW} ${
                isNavItemActive(pathname, profileItem) ? LINK_ACTIVE : LINK_INACTIVE
              }`}
              onClick={() => setOpen(false)}
            >
              {getNavIcon(profileItem)}
              <span>{t(profileItem.i18nKey)}</span>
            </Link>
            <Link
              href={notificationsItem.href}
              role="menuitem"
              className={`${LINK_ROW} ${
                isNavItemActive(pathname, notificationsItem) ? LINK_ACTIVE : LINK_INACTIVE
              }`}
              onClick={() => setOpen(false)}
            >
              {getNavIcon(notificationsItem)}
              <span>{t(notificationsItem.i18nKey)}</span>
            </Link>
            <div className="px-2 pb-2 pt-1" role="none">
              <LogoutButton className="w-full justify-start gap-3 rounded-xl font-medium !py-3 hover:bg-palette-danger-light" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

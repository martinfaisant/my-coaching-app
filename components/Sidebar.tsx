'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/navigation'
import { AvatarImage } from '@/components/AvatarImage'
import { Button } from '@/components/Button'
import type { Profile } from '@/types/database'
import { getInitials } from '@/lib/stringUtils'
import { getDisplayName } from '@/lib/displayName'

type SidebarProps = {
  profile: Profile & { email: string }
}

export function Sidebar({ profile }: SidebarProps) {
  const t = useTranslations('navigation')
  const path = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [textVisible, setTextVisible] = useState(true)
  const displayName = getDisplayName(profile, '')
  const initials = getInitials(displayName)

  useEffect(() => {
    if (isCollapsed) {
      setTextVisible(false)
    } else {
      const t = setTimeout(() => setTextVisible(true), 100)
      return () => clearTimeout(t)
    }
  }, [isCollapsed])

  const showText = !isCollapsed && textVisible

  /** Tronquer l'affichage pour laisser la place au chevron. Les emails sont plus longs : limite plus stricte si @ présent. */
  const isEmail = displayName.includes('@')
  const maxLength = isEmail ? 14 : 18
  const profileLabel = displayName.length > maxLength
    ? `${displayName.slice(0, maxLength - 3)}...`
    : displayName

  if (profile.role === 'athlete') {
    return (
      <aside className={`${isCollapsed ? 'w-14' : 'w-14 lg:w-52'} bg-white rounded-2xl shadow-sm flex flex-col justify-between shrink-0 relative transition-all duration-300 ease-in-out z-30`}>
        {/* Bouton toggle : absolute -right-3 top-14 */}
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-14 bg-white border border-stone-200 text-stone-400 hover:text-palette-forest-dark p-1.5 rounded-full shadow-md hover:shadow-lg !min-w-0 !min-h-0 z-50 !hidden lg:!flex items-center justify-center group"
        aria-label={isCollapsed ? t('openMenu') : t('collapseMenu')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Button>
        <div>
          {/* Logo : h-20 px-6 quand ouvert, justify-center px-0 quand fermé (comme le HTML) */}
          <div className={`h-20 flex items-center transition-all duration-300 overflow-hidden shrink-0 hidden lg:flex ${isCollapsed ? 'justify-center px-0' : 'px-3 lg:px-5'}`}>
            <div className="w-8 h-8 min-w-[2rem] bg-palette-forest-dark rounded-xl flex items-center justify-center text-white shadow-lg shadow-palette-forest-dark/30 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className={`ml-3 text-base font-bold text-stone-800 tracking-tight transition-all duration-300 whitespace-nowrap ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>CoachApp</span>
          </div>
          <div className={`lg:hidden flex items-center px-3 h-14 shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-palette-forest-dark rounded-xl flex items-center justify-center text-white shadow-lg shadow-palette-forest-dark/30 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
          </div>

          {/* Menu */}
          <nav className={`px-2 lg:px-3 space-y-1.5 mt-2 shrink-0 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
            {!profile.coach_id && (
              <Link
                href="/dashboard"
                className={`flex items-center h-10 rounded-xl transition-all duration-300 group ${
                  isCollapsed ? 'w-10 justify-center px-0' : 'gap-2.5 px-2.5 lg:px-3'
                } ${
                  path === '/dashboard'
                    ? 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap hidden lg:block ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{t('findCoach')}</span>
              </Link>
            )}
            <Link
              href="/dashboard/calendar"
              className={`flex items-center h-10 rounded-xl transition-all duration-300 group ${
                isCollapsed ? 'w-10 justify-center px-0' : 'gap-2.5 px-2.5 lg:px-3'
              } ${
                path === '/dashboard/calendar'
                  ? 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
                <path d="m9 16 2 2 4-4" />
              </svg>
                <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap hidden lg:block ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{t('calendar')}</span>
            </Link>
            <Link
              href="/dashboard/objectifs"
              className={`flex items-center h-10 rounded-xl transition-all duration-300 group ${
                isCollapsed ? 'w-10 justify-center px-0' : 'gap-2.5 px-2.5 lg:px-3'
              } ${
                path === '/dashboard/objectifs'
                  ? 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap hidden lg:block ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{t('goals')}</span>
            </Link>
            <Link
              href="/dashboard/devices"
              className={`flex items-center h-10 rounded-xl transition-all duration-300 group ${
                isCollapsed ? 'w-10 justify-center px-0' : 'gap-2.5 px-2.5 lg:px-3'
              } ${
                path === '/dashboard/devices'
                  ? 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 10v2.2l1.6 1" />
                <path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05" />
                <path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05" />
                <circle cx="12" cy="12" r="6" />
              </svg>
              <span className={`text-sm font-medium transition-all duration-300 hidden lg:block ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{t('devices')}</span>
            </Link>
            {profile.coach_id && (
              <Link
                href="/dashboard/coach"
                className={`flex items-center h-10 rounded-xl transition-all duration-300 group ${
                  isCollapsed ? 'w-10 justify-center px-0' : 'gap-2.5 px-2.5 lg:px-3'
                } ${
                  path === '/dashboard/coach'
                    ? 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap hidden lg:block ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{t('myCoach')}</span>
              </Link>
            )}
            <Link
              href="/dashboard/subscriptions/history"
              className={`flex items-center min-h-10 rounded-xl transition-all duration-300 group ${
                isCollapsed ? 'w-10 justify-center px-0 h-10' : 'gap-2.5 px-2.5 lg:px-3 py-2'
              } ${
                path === '/dashboard/subscriptions/history'
                  ? 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0 self-center" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 14v2.2l1.6 1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v.832" />
                <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2" />
                <circle cx="16" cy="16" r="6" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
              </svg>
              <span className={`text-sm font-medium transition-all duration-300 hidden lg:block min-w-0 break-words ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{t('subscriptionHistory')}</span>
            </Link>
          </nav>
        </div>

        {/* Profil Bas */}
        <div className={`p-2 lg:p-3 space-y-2 ${isCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
          <Link
            href="/dashboard/profile"
            className={`flex items-center h-10 rounded-xl border border-stone-100 bg-stone-50 hover:bg-white hover:shadow-md transition-all duration-300 group ${
              isCollapsed ? 'w-10 justify-center px-0' : 'w-full gap-2.5 px-2.5 lg:px-3'
            }`}
          >
            <AvatarImage src={profile.avatar_url} initials={initials} className="w-7 h-7 rounded-full object-cover ring-2 ring-white shrink-0" />
            <div className={`text-left transition-all duration-300 hidden lg:block min-w-0 overflow-hidden ${showText ? 'opacity-100 flex-1' : 'opacity-0 w-0'}`}>
              <p className="text-xs font-bold text-stone-800 truncate" title={displayName}>{profileLabel}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 text-stone-300 group-hover:text-palette-forest-dark transition-all shrink-0 ml-auto hidden lg:block ${showText ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </Link>
        </div>
      </aside>
    )
  }

  // Coach sidebar (même animation et position flèche que le HTML de référence)
  return (
    <aside className={`${isCollapsed ? 'w-14' : 'w-14 lg:w-52'} bg-white rounded-2xl shadow-sm flex flex-col justify-between shrink-0 relative transition-all duration-300 ease-in-out z-30`}>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-14 bg-white border border-stone-200 text-stone-400 hover:text-palette-forest-dark p-1.5 rounded-full shadow-md hover:shadow-lg !min-w-0 !min-h-0 z-50 !hidden lg:!flex items-center justify-center group"
        aria-label={isCollapsed ? t('openMenu') : t('collapseMenu')}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`w-4 h-4 transition-transform duration-300 group-hover:scale-110 ${isCollapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
      </Button>
      <div>
        <div className={`h-20 flex items-center transition-all duration-300 overflow-hidden shrink-0 hidden lg:flex ${isCollapsed ? 'justify-center px-0' : 'px-3 lg:px-5'}`}>
          <div className="w-8 h-8 min-w-[2rem] bg-palette-forest-dark rounded-xl flex items-center justify-center text-white shadow-lg shadow-palette-forest-dark/30 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className={`ml-3 text-base font-bold text-stone-800 tracking-tight transition-all duration-300 whitespace-nowrap ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>CoachApp</span>
        </div>
        <div className={`lg:hidden flex items-center px-3 h-14 shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-palette-forest-dark rounded-xl flex items-center justify-center text-white shadow-lg shadow-palette-forest-dark/30 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
        </div>

        <nav className={`px-2 lg:px-3 space-y-1.5 mt-2 shrink-0 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <Link
            href="/dashboard"
            className={`flex items-center h-10 rounded-xl transition-all duration-300 group ${
              isCollapsed ? 'w-10 justify-center px-0' : 'gap-2.5 px-2.5 lg:px-3'
            } ${
              (path === '/dashboard' || path.startsWith('/dashboard/athletes'))
                ? 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
                : 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap hidden lg:block ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{t('athletes')}</span>
          </Link>
          {profile.role !== 'admin' && (
            <Link
              href="/dashboard/profile/offers"
              className={`flex items-center h-10 rounded-xl transition-all duration-300 group ${
                isCollapsed ? 'w-10 justify-center px-0' : 'gap-2.5 px-2.5 lg:px-3'
              } ${
                path === '/dashboard/profile/offers'
                  ? 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M3 9h18" />
                <path d="M9 21V9" />
              </svg>
              <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap hidden lg:block ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{t('offers')}</span>
            </Link>
          )}
          {profile.role === 'coach' && (
            <Link
              href="/dashboard/subscriptions"
              className={`flex items-center h-10 rounded-xl transition-all duration-300 group ${
                isCollapsed ? 'w-10 justify-center px-0' : 'gap-2.5 px-2.5 lg:px-3'
              } ${
                path === '/dashboard/subscriptions'
                  ? 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 14v2.2l1.6 1" />
                <path d="M16 4h2a2 2 0 0 1 2 2v.832" />
                <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h2" />
                <circle cx="16" cy="16" r="6" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
              </svg>
              <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap hidden lg:block ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>{t('subscriptions')}</span>
            </Link>
          )}
          {profile.role === 'admin' && (
            <Link
              href="/dashboard/admin/design-system"
              className={`flex items-center h-10 rounded-xl transition-all duration-300 group ${
                isCollapsed ? 'w-10 justify-center px-0' : 'gap-2.5 px-2.5 lg:px-3'
              } ${
                path === '/dashboard/admin/design-system'
                  ? 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
                  : 'text-stone-500 hover:bg-stone-50 hover:text-palette-forest-dark'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r=".5" />
                <circle cx="17.5" cy="10.5" r=".5" />
                <circle cx="8.5" cy="7.5" r=".5" />
                <circle cx="6.5" cy="12.5" r=".5" />
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.555C21.965 6.012 17.461 2 12 2z" />
              </svg>
              <span className={`text-sm font-medium transition-all duration-300 whitespace-nowrap hidden lg:block ${showText ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>Design System</span>
            </Link>
          )}
        </nav>
      </div>
      <div className={`p-2 lg:p-3 space-y-2 ${isCollapsed ? 'flex flex-col items-center gap-2' : ''}`}>
        <Link
          href="/dashboard/profile"
          className={`flex items-center h-10 rounded-xl border border-stone-100 bg-stone-50 hover:bg-white hover:shadow-md transition-all duration-300 group ${
            isCollapsed ? 'w-10 justify-center px-0' : 'w-full gap-2.5 px-2.5 lg:px-3'
          }`}
        >
          <AvatarImage src={profile.avatar_url} initials={initials} className="w-7 h-7 rounded-full object-cover ring-2 ring-white shrink-0" />
          <div className={`text-left transition-all duration-300 hidden lg:block min-w-0 overflow-hidden ${showText ? 'opacity-100 flex-1' : 'opacity-0 w-0'}`}>
            <p className="text-xs font-bold text-stone-800 truncate" title={displayName}>{profileLabel}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`w-3.5 h-3.5 text-stone-300 group-hover:text-palette-forest-dark transition-all shrink-0 ml-auto hidden lg:block ${showText ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </Link>
      </div>
    </aside>
  )
}

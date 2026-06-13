'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { usePathname, Link as I18nLink } from '@/i18n/navigation'
import { AuthButtons } from '@/components/AuthButtons'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { Drawer } from '@/components/Drawer'
import { IconClose } from '@/components/icons/IconClose'
import { getPublicHeaderPageTitleI18n } from '@/lib/publicHeaderPageTitle'

function navLinkClass(isActive: boolean): string {
  if (isActive) {
    return 'text-sm font-semibold text-palette-forest-dark border-b-2 border-palette-forest-dark pb-0.5 transition-colors'
  }
  return 'text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors'
}

const drawerLinkBase =
  'flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 shrink-0 mx-2'
const drawerLinkActive = 'bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20'
const drawerLinkInactive = 'text-stone-600 hover:bg-stone-50 hover:text-palette-forest-dark'

/**
 * En-tête public partagé : page d'accueil, tarifs, contact, etc.
 */
export function PublicHeader() {
  const tNav = useTranslations('navigation')
  const tPricing = useTranslations('coachPricingPublic')
  const tMeta = useTranslations('metadata')
  const tAuth = useTranslations('auth')
  const pathname = usePathname()
  const [drawerOpenPathname, setDrawerOpenPathname] = useState<string | null>(null)

  const isHome = pathname === '/'
  const isPricing = pathname === '/pricing'
  const isDrawerOpen = drawerOpenPathname === pathname
  const closeDrawer = () => setDrawerOpenPathname(null)

  const { namespace, key } = getPublicHeaderPageTitleI18n(pathname)
  const pageTitle =
    namespace === 'coachPricingPublic'
      ? tPricing(key)
      : namespace === 'metadata'
        ? tMeta(key)
        : tAuth(key)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-background/95 backdrop-blur-md shrink-0 md:bg-background/95">
        <div className="mx-auto flex h-14 md:hidden items-center gap-3 px-4 sm:px-6">
          <I18nLink
            href="/"
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
          </I18nLink>

          <div className="flex-1 flex justify-center min-w-0">
            <span className="text-sm font-semibold text-stone-800 truncate px-2">{pageTitle}</span>
          </div>

          <button
            type="button"
            className="ml-auto p-2.5 rounded-xl text-stone-500 hover:bg-stone-100 shrink-0 transition-colors"
            onClick={() => setDrawerOpenPathname(pathname)}
            aria-label={tNav('openMenu')}
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
        </div>

        <div className="mx-auto hidden md:flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <I18nLink
              href="/"
              className="text-xl font-semibold text-stone-900 tracking-tight flex items-center gap-2 shrink-0"
            >
              <Image
                src="/logo.svg"
                alt="My Sport Ally"
                width={80}
                height={80}
                className="h-9 w-auto object-contain"
              />
              <span className="hidden sm:inline">My Sport Ally</span>
            </I18nLink>
            <nav className="flex items-center gap-3 sm:gap-6 shrink-0" aria-label={tPricing('publicNavAriaLabel')}>
              <I18nLink href="/" aria-current={isHome ? 'page' : undefined} className={navLinkClass(isHome)}>
                {tPricing('navHome')}
              </I18nLink>
              <I18nLink
                href="/pricing"
                aria-current={isPricing ? 'page' : undefined}
                className={navLinkClass(isPricing)}
              >
                {tPricing('navPricing')}
              </I18nLink>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <AuthButtons />
            <div className="h-6 w-px bg-stone-200 hidden sm:block" aria-hidden />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        placement="right"
        aria-label={tNav('openMenu')}
      >
        <div className="flex flex-col h-full overflow-hidden">
          <div className="flex items-center justify-end p-4 border-b border-stone-200 bg-stone-50 shrink-0">
            <button
              type="button"
              onClick={closeDrawer}
              className="p-2.5 rounded-xl text-stone-500 hover:bg-stone-100 transition-colors"
              aria-label={tNav('collapseMenu')}
            >
              <IconClose className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            <nav aria-label={tPricing('publicNavAriaLabel')}>
              <I18nLink
                href="/"
                aria-current={isHome ? 'page' : undefined}
                onClick={closeDrawer}
                className={`${drawerLinkBase} ${isHome ? drawerLinkActive : drawerLinkInactive}`}
              >
                {tPricing('navHome')}
              </I18nLink>
              <I18nLink
                href="/pricing"
                aria-current={isPricing ? 'page' : undefined}
                onClick={closeDrawer}
                className={`${drawerLinkBase} ${isPricing ? drawerLinkActive : drawerLinkInactive}`}
              >
                {tPricing('navPricing')}
              </I18nLink>
            </nav>
            <hr className="border-stone-200 mx-4 my-2" />
            <AuthButtons variant="drawer" onBeforeOpen={closeDrawer} />
            <hr className="border-stone-200 mx-4 my-2" />
            <div className="px-4 py-2">
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </Drawer>
    </>
  )
}

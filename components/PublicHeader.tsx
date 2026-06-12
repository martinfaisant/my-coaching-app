'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { usePathname, Link as I18nLink } from '@/i18n/navigation'
import { AuthButtons } from '@/components/AuthButtons'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

function navLinkClass(isActive: boolean): string {
  if (isActive) {
    return 'text-sm font-semibold text-palette-forest-dark border-b-2 border-palette-forest-dark pb-0.5 transition-colors'
  }
  return 'text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors'
}

/**
 * En-tête public partagé : page d'accueil, tarifs, contact, etc.
 */
export function PublicHeader() {
  const t = useTranslations('coachPricingPublic')
  const pathname = usePathname()
  const isHome = pathname === '/'
  const isPricing = pathname === '/pricing'

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-background/95 backdrop-blur-md shrink-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 sm:gap-8 min-w-0">
          <Link
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
          </Link>
          <nav className="flex items-center gap-3 sm:gap-6 shrink-0" aria-label={t('publicNavAriaLabel')}>
            <I18nLink href="/" aria-current={isHome ? 'page' : undefined} className={navLinkClass(isHome)}>
              {t('navHome')}
            </I18nLink>
            <I18nLink
              href="/pricing"
              aria-current={isPricing ? 'page' : undefined}
              className={navLinkClass(isPricing)}
            >
              {t('navPricing')}
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
  )
}

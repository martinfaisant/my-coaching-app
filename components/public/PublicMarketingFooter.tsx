import { getTranslations } from 'next-intl/server'
import { IconFacebook } from '@/components/icons/IconFacebook'
import { IconLinkedIn } from '@/components/icons/IconLinkedIn'
import { Link } from '@/i18n/navigation'
import { FACEBOOK_PAGE_URL, LINKEDIN_COMPANY_URL } from '@/lib/socialLinks'

export type PublicFooterActiveLink =
  | 'privacy'
  | 'terms'
  | 'contact'
  | 'athlete'
  | 'coach'

type PublicMarketingFooterProps = {
  activeLink?: PublicFooterActiveLink
}

function navLinkClass(isActive: boolean): string {
  if (isActive) {
    return 'font-medium text-palette-forest-dark'
  }
  return 'text-stone-600 transition-colors hover:text-stone-900'
}

type FooterNavItemProps = {
  href: '/privacy' | '/terms' | '/contact' | '/faq/athlete' | '/faq/coach'
  label: string
  isActive: boolean
}

function FooterNavItem({ href, label, isActive }: FooterNavItemProps) {
  if (isActive) {
    return (
      <span aria-current="page" className={navLinkClass(true)}>
        {label}
      </span>
    )
  }

  return (
    <Link href={href} className={navLinkClass(false)}>
      {label}
    </Link>
  )
}

export async function PublicMarketingFooter({ activeLink }: PublicMarketingFooterProps) {
  const t = await getTranslations('publicFooter')

  return (
    <footer className="border-t border-stone-200 bg-stone-50 py-12 shrink-0">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 text-center text-stone-600">
          <nav
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
            aria-label={t('navAriaLabel')}
          >
            <FooterNavItem
              href="/privacy"
              label={t('privacyLink')}
              isActive={activeLink === 'privacy'}
            />
            <FooterNavItem
              href="/terms"
              label={t('termsLink')}
              isActive={activeLink === 'terms'}
            />
            <FooterNavItem
              href="/contact"
              label={t('contactLink')}
              isActive={activeLink === 'contact'}
            />
            <FooterNavItem
              href="/faq/athlete"
              label={t('faqAthleteLink')}
              isActive={activeLink === 'athlete'}
            />
            <FooterNavItem
              href="/faq/coach"
              label={t('faqCoachLink')}
              isActive={activeLink === 'coach'}
            />
          </nav>
          <nav
            className="flex items-center justify-center gap-1"
            aria-label={t('socialAriaLabel')}
          >
            <a
              href={LINKEDIN_COMPANY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-200/60 hover:text-palette-forest-dark"
              aria-label={t('linkedinAriaLabel')}
            >
              <IconLinkedIn />
            </a>
            <a
              href={FACEBOOK_PAGE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-lg p-2 text-stone-500 transition-colors hover:bg-stone-200/60 hover:text-palette-forest-dark"
              aria-label={t('facebookAriaLabel')}
            >
              <IconFacebook />
            </a>
          </nav>
          <p className="text-sm">
            © {new Date().getFullYear()} My Sport Ally. {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}

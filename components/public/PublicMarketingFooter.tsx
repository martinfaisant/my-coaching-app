import { getTranslations } from 'next-intl/server'
import { IconFacebook } from '@/components/icons/IconFacebook'
import { IconLinkedIn } from '@/components/icons/IconLinkedIn'
import { Link } from '@/i18n/navigation'
import type { FaqAudience } from '@/lib/faqPublicConfig'
import { FACEBOOK_PAGE_URL, LINKEDIN_COMPANY_URL } from '@/lib/socialLinks'

type PublicMarketingFooterProps = {
  activeFaq?: FaqAudience
}

function linkClass(isActive: boolean): string {
  if (isActive) {
    return 'underline underline-offset-4 font-medium text-palette-forest-dark'
  }
  return 'underline underline-offset-4 hover:text-stone-900'
}

export async function PublicMarketingFooter({ activeFaq }: PublicMarketingFooterProps) {
  const t = await getTranslations('publicFooter')

  return (
    <footer className="border-t border-stone-200 bg-stone-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 text-center text-stone-600">
          <nav
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
            aria-label={t('navAriaLabel')}
          >
            <Link href="/privacy" className={linkClass(false)}>
              {t('privacyLink')}
            </Link>
            <Link href="/terms" className={linkClass(false)}>
              {t('termsLink')}
            </Link>
            <Link href="/contact" className={linkClass(false)}>
              {t('contactLink')}
            </Link>
            <Link href="/faq/athlete" className={linkClass(activeFaq === 'athlete')}>
              {t('faqAthleteLink')}
            </Link>
            <Link href="/faq/coach" className={linkClass(activeFaq === 'coach')}>
              {t('faqCoachLink')}
            </Link>
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

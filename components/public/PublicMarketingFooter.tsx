import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { FaqAudience } from '@/lib/faqPublicConfig'

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
          <p className="text-sm">
            © {new Date().getFullYear()} My Sport Ally. {t('copyright')}
          </p>
        </div>
      </div>
    </footer>
  )
}

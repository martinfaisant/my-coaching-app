import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { pathWithLocale } from '@/lib/pathWithLocale'
import type { LandingPricingLinkContext } from '@/lib/landingConfig'

type LandingPricingLinkProps = {
  locale: string
  context: LandingPricingLinkContext
  tone?: 'default' | 'onDark'
  className?: string
}

export async function LandingPricingLink({
  locale,
  context,
  tone = 'default',
  className = '',
}: LandingPricingLinkProps) {
  const t = await getTranslations('landing')
  const href = pathWithLocale(locale, '/pricing')

  const toneClass =
    tone === 'onDark'
      ? 'text-white/80 hover:text-white underline underline-offset-4'
      : 'text-palette-forest-dark hover:underline underline-offset-4'

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 text-sm font-medium ${toneClass} ${className}`.trim()}
    >
      {t(`pricingLink.${context}`)}
    </Link>
  )
}

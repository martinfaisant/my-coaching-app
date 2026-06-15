import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { getCrossFaqPath, type FaqAudience } from '@/lib/faqPublicConfig'

type FaqCrossAudienceBannerProps = {
  audience: FaqAudience
}

export async function FaqCrossAudienceBanner({ audience }: FaqCrossAudienceBannerProps) {
  const namespace = audience === 'athlete' ? 'faqAthlete' : 'faqCoach'
  const t = await getTranslations(namespace)
  const targetPath = getCrossFaqPath(audience)

  return (
    <section className="border-y border-stone-200 bg-stone-50 py-10" aria-labelledby={`faq-cross-cta-${audience}`}>
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <h2 id={`faq-cross-cta-${audience}`} className="text-base font-semibold text-stone-900">
            {t('crossCta.title')}
          </h2>
          <p className="mt-1 text-sm text-stone-600">{t('crossCta.subtitle')}</p>
        </div>
        <Link
          href={targetPath}
          className="inline-flex shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-semibold text-palette-forest-dark transition-colors hover:bg-stone-50"
        >
          {t('crossCta.button')}
        </Link>
      </div>
    </section>
  )
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildPublicPageMetadata } from '@/lib/seoMetadata'
import { PublicMarketingFooter } from '@/components/public/PublicMarketingFooter'
import { PublicPageShell } from '@/components/public/PublicPageShell'

type PrivacyPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return buildPublicPageMetadata({
    locale,
    path: '/privacy',
    title: t('privacyTitle'),
    description: t('privacyDescription'),
    imageAlt: t('ogImageAlt'),
  })
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal' })

  return (
    <PublicPageShell footer={<PublicMarketingFooter activeLink="privacy" />}>
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-14">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">
            {t('privacy.title')}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {t('privacy.lastUpdatedFull')}
          </p>
        </header>

        <div className="space-y-10 text-stone-800">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.commitment.title')}
            </h2>
            <p className="leading-relaxed">{t('privacy.sections.commitment.p1')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.dataCollected.title')}
            </h2>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t('privacy.sections.dataCollected.li1')}</li>
              <li>{t('privacy.sections.dataCollected.li2')}</li>
              <li>{t('privacy.sections.dataCollected.li3')}</li>
              <li>{t('privacy.sections.dataCollected.li4')}</li>
              <li>{t('privacy.sections.dataCollected.li5')}</li>
              <li>{t('privacy.sections.dataCollected.li6')}</li>
              <li>{t('privacy.sections.dataCollected.li7')}</li>
              <li>{t('privacy.sections.dataCollected.li8')}</li>
              <li>{t('privacy.sections.dataCollected.li9')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.useOfData.title')}
            </h2>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t('privacy.sections.useOfData.li1')}</li>
              <li>{t('privacy.sections.useOfData.li2')}</li>
              <li>{t('privacy.sections.useOfData.li3')}</li>
              <li>{t('privacy.sections.useOfData.li4')}</li>
              <li>{t('privacy.sections.useOfData.li5')}</li>
              <li>{t('privacy.sections.useOfData.li6')}</li>
              <li>{t('privacy.sections.useOfData.li7')}</li>
              <li>{t('privacy.sections.useOfData.li8')}</li>
              <li>{t('privacy.sections.useOfData.li9')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.consent.title')}
            </h2>
            <p className="leading-relaxed">{t('privacy.sections.consent.p1')}</p>
            <p className="leading-relaxed">{t('privacy.sections.consent.p2')}</p>
            <p className="leading-relaxed">{t('privacy.sections.consent.p3')}</p>
            <p className="leading-relaxed">{t('privacy.sections.consent.p4')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.sharing.title')}
            </h2>
            <p className="leading-relaxed">{t('privacy.sections.sharing.p1')}</p>
            <p className="leading-relaxed">{t('privacy.sections.sharing.p2')}</p>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t('privacy.sections.sharing.li1')}</li>
              <li>{t('privacy.sections.sharing.li2')}</li>
              <li>{t('privacy.sections.sharing.li3')}</li>
              <li>{t('privacy.sections.sharing.li4')}</li>
              <li>{t('privacy.sections.sharing.li5')}</li>
              <li>{t('privacy.sections.sharing.li6')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.retention.title')}
            </h2>
            <p className="leading-relaxed">{t('privacy.sections.retention.p1')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.security.title')}
            </h2>
            <p className="leading-relaxed">{t('privacy.sections.security.p1')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.rights.title')}
            </h2>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t('privacy.sections.rights.li1')}</li>
              <li>{t('privacy.sections.rights.li2')}</li>
              <li>{t('privacy.sections.rights.li3')}</li>
              <li>{t('privacy.sections.rights.li4')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.officer.title')}
            </h2>
            <p className="leading-relaxed">{t('privacy.sections.officer.p1')}</p>
            <p className="leading-relaxed">{t('privacy.sections.officer.p2')}</p>
            <p className="leading-relaxed">{t('privacy.sections.officer.p3')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.incidents.title')}
            </h2>
            <p className="leading-relaxed">{t('privacy.sections.incidents.p1')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('privacy.sections.cookies.title')}
            </h2>
            <p className="leading-relaxed">{t('privacy.sections.cookies.p1')}</p>
          </section>
        </div>
      </main>
    </PublicPageShell>
  )
}


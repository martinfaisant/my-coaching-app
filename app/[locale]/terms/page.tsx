import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { buildPublicPageMetadata } from '@/lib/seoMetadata'
import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'

type TermsPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({
  params,
}: TermsPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return buildPublicPageMetadata({
    locale,
    path: '/terms',
    title: t('termsTitle'),
    description: t('termsDescription'),
    imageAlt: t('ogImageAlt'),
  })
}

export default async function TermsPage({ params }: TermsPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'legal' })

  return (
    <div className="min-h-screen bg-background">
      <PublicOrDashboardHeader />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">
            {t('terms.title')}
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            {t('common.lastUpdatedFull')}
          </p>
        </header>

        <div className="space-y-10 text-stone-800">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.acceptance.title')}
            </h2>
            <p className="leading-relaxed">{t('terms.sections.acceptance.p1')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.eligibility.title')}
            </h2>
            <p className="leading-relaxed">{t('terms.sections.eligibility.p1')}</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.authentication.title')}
            </h2>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {t('terms.sections.authentication.accountCreation.title')}
              </h3>
              <p className="leading-relaxed">{t('terms.sections.authentication.accountCreation.p1')}</p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>{t('terms.sections.authentication.accountCreation.li1')}</li>
                <li>{t('terms.sections.authentication.accountCreation.li2')}</li>
              </ul>
              <p className="leading-relaxed">{t('terms.sections.authentication.accountCreation.p2')}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {t('terms.sections.authentication.google.title')}
              </h3>
              <p className="leading-relaxed">{t('terms.sections.authentication.google.p1')}</p>
              <p className="leading-relaxed">{t('terms.sections.authentication.google.p2')}</p>
              <p className="leading-relaxed">{t('terms.sections.authentication.google.p3')}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {t('terms.sections.authentication.linking.title')}
              </h3>
              <p className="leading-relaxed">{t('terms.sections.authentication.linking.p1')}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {t('terms.sections.authentication.security.title')}
              </h3>
              <p className="leading-relaxed">{t('terms.sections.authentication.security.p1')}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {t('terms.sections.authentication.oneAccount.title')}
              </h3>
              <p className="leading-relaxed">{t('terms.sections.authentication.oneAccount.p1')}</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.role.title')}
            </h2>
            <p className="leading-relaxed">{t('terms.sections.role.p1')}</p>
            <p className="leading-relaxed">{t('terms.sections.role.p2')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.independence.title')}
            </h2>
            <p className="leading-relaxed">{t('terms.sections.independence.p1')}</p>
          </section>

          <section className="space-y-6">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.payments.title')}
            </h2>
            <p className="leading-relaxed">{t('terms.sections.payments.intro')}</p>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {t('terms.sections.payments.coachAthlete.title')}
              </h3>
              <p className="leading-relaxed">{t('terms.sections.payments.coachAthlete.p1')}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {t('terms.sections.payments.coachPlatform.title')}
              </h3>
              <p className="leading-relaxed">{t('terms.sections.payments.coachPlatform.p1')}</p>
              <ul className="list-disc pl-6 space-y-2 leading-relaxed">
                <li>{t('terms.sections.payments.coachPlatform.trial')}</li>
                <li>{t('terms.sections.payments.coachPlatform.cancellationMonthly')}</li>
                <li>{t('terms.sections.payments.coachPlatform.cancellationAnnual')}</li>
                <li>{t('terms.sections.payments.coachPlatform.refunds')}</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {t('terms.sections.payments.accountIntegrity.title')}
              </h3>
              <p className="leading-relaxed">{t('terms.sections.payments.accountIntegrity.p1')}</p>
              <p className="leading-relaxed">{t('terms.sections.payments.accountIntegrity.p2')}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-stone-900">
                {t('terms.sections.payments.serviceEvolution.title')}
              </h3>
              <p className="leading-relaxed">{t('terms.sections.payments.serviceEvolution.p1')}</p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.medical.title')}
            </h2>
            <p className="leading-relaxed">{t('terms.sections.medical.p1')}</p>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t('terms.sections.medical.li1')}</li>
              <li>{t('terms.sections.medical.li2')}</li>
              <li>{t('terms.sections.medical.li3')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.liability.title')}
            </h2>
            <p className="leading-relaxed">{t('terms.sections.liability.p1')}</p>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t('terms.sections.liability.li1')}</li>
              <li>{t('terms.sections.liability.li2')}</li>
              <li>{t('terms.sections.liability.li3')}</li>
            </ul>
            <p className="leading-relaxed">{t('terms.sections.liability.p2')}</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.indemnification.title')}
            </h2>
            <p className="leading-relaxed">
              {t('terms.sections.indemnification.p1')}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.ip.title')}
            </h2>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t('terms.sections.ip.li1')}</li>
              <li>{t('terms.sections.ip.li2')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.prohibited.title')}
            </h2>
            <ul className="list-disc pl-6 space-y-2 leading-relaxed">
              <li>{t('terms.sections.prohibited.li1')}</li>
              <li>{t('terms.sections.prohibited.li2')}</li>
              <li>{t('terms.sections.prohibited.li3')}</li>
              <li>{t('terms.sections.prohibited.li4')}</li>
              <li>{t('terms.sections.prohibited.li5')}</li>
              <li>{t('terms.sections.prohibited.li6')}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-stone-900">
              {t('terms.sections.law.title')}
            </h2>
            <p className="leading-relaxed">{t('terms.sections.law.p1')}</p>
          </section>
        </div>
      </main>
    </div>
  )
}


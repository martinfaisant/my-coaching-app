import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { IconFacebook } from '@/components/icons/IconFacebook'
import { IconLinkedIn } from '@/components/icons/IconLinkedIn'
import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'
import { ContactForm } from '@/components/ContactForm'
import { buildPublicPageMetadata } from '@/lib/seoMetadata'
import { FACEBOOK_PAGE_URL, LINKEDIN_COMPANY_URL } from '@/lib/socialLinks'
import { getOptionalUserWithProfile } from '@/utils/auth'

type ContactPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return buildPublicPageMetadata({
    locale,
    path: '/contact',
    title: t('contactTitle'),
    description: t('contactDescription'),
    imageAlt: t('ogImageAlt'),
  })
}

export default async function ContactPage({ params }: ContactPageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })
  const userBundle = await getOptionalUserWithProfile()

  const initialValues = {
    firstName: userBundle?.profile.first_name?.trim() ?? '',
    lastName: userBundle?.profile.last_name?.trim() ?? '',
    email: (userBundle?.profile.email ?? userBundle?.email ?? '').trim(),
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicOrDashboardHeader />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">{t('title')}</h1>
          <p className="mt-2 text-stone-600 max-w-2xl">
            {t('intro')}
          </p>
        </header>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <ContactForm initialValues={initialValues} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-stone-600">
          <a
            href={LINKEDIN_COMPANY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 underline-offset-4 transition-colors hover:text-palette-forest-dark hover:underline"
            aria-label={t('linkedinAriaLabel')}
          >
            <IconLinkedIn className="h-4 w-4 shrink-0" />
            {t('linkedinFollow')}
          </a>
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 underline-offset-4 transition-colors hover:text-palette-forest-dark hover:underline"
            aria-label={t('facebookAriaLabel')}
          >
            <IconFacebook className="h-4 w-4 shrink-0" />
            {t('facebookFollow')}
          </a>
        </div>
      </main>
    </div>
  )
}

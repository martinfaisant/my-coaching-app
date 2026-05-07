import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { PublicHeader } from '@/components/PublicHeader'
import { ContactForm } from '@/components/ContactForm'
import { getOptionalUserWithProfile } from '@/utils/auth'

type ContactPageProps = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })

  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
  }
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
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">{t('title')}</h1>
          <p className="mt-2 text-stone-600 max-w-2xl">
            {userBundle ? t('introLoggedIn') : t('intro')}
          </p>
        </header>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
          <ContactForm initialValues={initialValues} />
        </div>
      </main>
    </div>
  )
}

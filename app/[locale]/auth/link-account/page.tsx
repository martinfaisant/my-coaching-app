import { getTranslations } from 'next-intl/server'
import { OAuthLinkAccountForm } from '@/components/OAuthLinkAccountForm'

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ email?: string }>
}

export default async function LinkAccountPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const { email } = await searchParams
  const t = await getTranslations({ locale, namespace: 'auth' })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-2 border-palette-forest-dark overflow-hidden">
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl font-semibold text-stone-900 text-center mb-1">
              {t('linkGoogleAccountTitle')}
            </h1>
            <OAuthLinkAccountForm email={email} />
          </div>
        </div>
      </div>
    </div>
  )
}

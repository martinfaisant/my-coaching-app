import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { OAuthCompleteSignupForm } from '@/components/OAuthCompleteSignupForm'
import { requireOAuthCompleteSignupUser } from '@/app/[locale]/login/oauthActions'
import { pathWithLocale } from '@/lib/pathWithLocale'
import { readPostAuthRedirectCookie } from '@/lib/postAuthRedirect.server'
import { isFindCoachDeepLinkRedirect } from '@/lib/postAuthRedirect'

type PageProps = {
  params: Promise<{ locale: string }>
}

export default async function CompleteSignupPage({ params }: PageProps) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })
  const pendingUser = await requireOAuthCompleteSignupUser()

  if (!pendingUser) {
    redirect(pathWithLocale(locale, '/login'))
  }

  const postAuthRedirect = await readPostAuthRedirectCookie()
  const lockSignupRole = isFindCoachDeepLinkRedirect(postAuthRedirect)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-200 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-2 border-palette-forest-dark overflow-hidden">
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl font-semibold text-stone-900 text-center mb-1">
              {t('finalizeAccountTitle')}
            </h1>
            <p className="text-stone-400 text-sm text-center mb-8">
              {t('finalizeAccountSubtitle')}
            </p>
            <OAuthCompleteSignupForm email={pendingUser.email} lockSignupRole={lockSignupRole} />
          </div>
        </div>
      </div>
    </div>
  )
}

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { NOINDEX_METADATA } from '@/lib/seoRobots'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'metadata' })
  return {
    title: t('resetPasswordTitle'),
    description: t('resetPasswordDescription'),
    ...NOINDEX_METADATA,
  }
}

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { pathWithLocale } from '@/lib/pathWithLocale'

export default async function AdminDesignSystemRedirect() {
  const locale = await getLocale()
  redirect(pathWithLocale(locale, '/dashboard/admin/design-system'))
}

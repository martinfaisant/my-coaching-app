'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Globe } from 'lucide-react'
import { Dropdown } from '@/components/Dropdown'
import { updatePreferredLocale } from '@/app/[locale]/dashboard/profile/actions'

const LOCALE_OPTIONS = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
] as const

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const t = useTranslations('common')
  const currentLocale = (params?.locale as string) || 'fr'

  const handleChange = async (newLocale: string) => {
    if (newLocale === 'fr' || newLocale === 'en') {
      await updatePreferredLocale(newLocale)
    }
    if (pathname.startsWith(`/${currentLocale}`)) {
      const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
      router.push(newPathname)
    } else {
      router.push(`/${newLocale}${pathname}`)
    }
  }

  return (
    <Dropdown
      id="language-switcher"
      label=""
      options={[...LOCALE_OPTIONS]}
      value={currentLocale}
      onChange={handleChange}
      ariaLabel={t('changeLanguage')}
      hideLabel
      valueDisplay={currentLocale.toUpperCase()}
      triggerPrefix={<Globe className="w-4 h-4 shrink-0 text-stone-500" aria-hidden />}
      minWidth="5.5rem"
      className="min-w-0"
      triggerClassName="text-sm font-medium !text-stone-700"
    />
  )
}

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

export function PublicCoachAlreadyHasCoachBanner() {
  const t = useTranslations('publicCoaches.alreadyHasCoach')
  const tCoach = useTranslations('coach')

  return (
    <div
      className="rounded-xl border border-palette-sage bg-palette-sage/20 p-4 sm:p-5"
      role="status"
    >
      <p className="font-semibold text-stone-900">{t('title')}</p>
      <p className="text-sm text-stone-600 mt-1">{t('description')}</p>
      <Link
        href="/dashboard/coach"
        className="inline-block mt-3 text-sm font-semibold text-palette-forest-dark hover:underline"
      >
        {tCoach('myCoach')} →
      </Link>
    </div>
  )
}

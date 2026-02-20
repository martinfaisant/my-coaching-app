import { getTranslations, getLocale } from 'next-intl/server'

/**
 * Custom 404 page to avoid Turbopack error: Next.js default not-found
 * instantiates next/link in a context where the module factory is not available.
 * We use plain <a> tags instead of next/link.
 */
export default async function NotFound() {
  const t = await getTranslations('errors')
  const locale = await getLocale()
  const homeHref = locale === 'fr' ? '/' : '/en'

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold text-palette-forest-dark">
        {t('notFound')}
      </h1>
      <p className="text-stone-600 text-center">
        404
      </p>
      <a
        href={homeHref}
        className="rounded-lg bg-palette-forest-dark px-4 py-2 text-white hover:bg-palette-forest-darker transition-colors"
      >
        {t('backToHome')}
      </a>
    </div>
  )
}

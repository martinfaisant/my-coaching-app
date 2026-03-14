'use client'

import { useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/Button'
import { logger } from '@/lib/logger'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const t = useTranslations('errors')

  useEffect(() => {
    // Log l'erreur pour monitoring
    logger.error('Erreur dashboard capturée', error, { digest: error.digest })
  }, [error])

  return (
    <div className="flex-1 flex flex-col min-h-0 px-6 lg:px-8 pt-6 pb-24">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex w-16 h-16 rounded-full bg-palette-danger/10 items-center justify-center mb-6">
            <svg
              className="w-8 h-8 text-palette-danger"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-stone-900 mb-3">
            {t('errorOccurred')}
          </h2>
          
          <p className="text-stone-600 mb-8">
            {error.message || t('cannotLoadPage')}
          </p>
          
          <div className="flex gap-3 justify-center">
            <Button onClick={reset}>
              {t('retry')}
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/dashboard'}
            >
              {t('backToDashboard')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect } from 'react'
import { Button } from '@/components/Button'
import { logger } from '@/lib/logger'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log l'erreur pour monitoring
    logger.error('Erreur globale capturée', error, { digest: error.digest })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg border border-stone-200">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-full bg-palette-danger/10 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-palette-danger"
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
          <h2 className="text-xl font-bold text-stone-900 mb-2">
            Une erreur est survenue
          </h2>
          <p className="text-stone-600">
            {error.message || "Quelque chose s'est mal passé. Veuillez réessayer."}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button onClick={reset} className="flex-1">
            Réessayer
          </Button>
          <Button
            variant="outline"
            onClick={() => window.location.href = '/dashboard'}
            className="flex-1"
          >
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  )
}

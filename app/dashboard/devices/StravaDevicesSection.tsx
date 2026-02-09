'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { syncStravaLastWeek, disconnectStrava } from './actions'
import type { AthleteConnectedService } from '@/types/database'

type StravaDevicesSectionProps = {
  userId: string
  connected: boolean
  connection: Pick<AthleteConnectedService, 'id' | 'provider' | 'strava_athlete_id' | 'created_at'> | null
}

export function StravaDevicesSection({ userId, connected, connection }: StravaDevicesSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const urlMessage = searchParams.get('strava') === 'connected'
    ? 'Strava est connecté.'
    : searchParams.get('error') === 'strava_invalid'
      ? 'Connexion Strava annulée ou invalide.'
      : searchParams.get('error') === 'strava_config'
        ? 'Strava n\'est pas configuré côté serveur.'
        : searchParams.get('error') === 'strava_token'
          ? 'Échec de l\'échange du code Strava.'
          : searchParams.get('error') === 'strava_save'
            ? 'Échec de l\'enregistrement de la connexion.'
            : null

  const handleSync = async () => {
    setMessage(null)
    setSyncing(true)
    const result = await syncStravaLastWeek(userId)
    setSyncing(false)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({
        type: 'success',
        text: result.imported !== undefined
          ? `Import : ${result.imported} activité(s) (3 dernières semaines).`
          : 'Import terminé.',
      })
      router.refresh()
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Déconnecter Strava supprimera aussi les activités déjà importées. Continuer ?')) return
    setMessage(null)
    setDisconnecting(true)
    const result = await disconnectStrava(userId)
    setDisconnecting(false)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Strava déconnecté.' })
      router.refresh()
    }
  }

  const ConnectWithStravaButton = () => (
    <a
      href="/api/auth/strava"
      className="inline-flex h-12 items-center justify-center rounded-lg bg-[#FC4C02] px-5 text-base font-semibold text-white no-underline transition-opacity hover:opacity-90 focus:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#FC4C02] focus:ring-offset-2"
      aria-label="Connecter Strava"
    >
      Connecter Strava
    </a>
  )

  return (
    <section className="mt-8 rounded-2xl border border-stone-200 bg-section p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#f05222]">
            <img
              src="/strava-icon.svg"
              alt="Strava"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-stone-900">Strava</h2>
            <p className="text-sm text-stone-600">
              {connected
                ? 'Connecté — importez les 3 dernières semaines d\'activités dans votre calendrier.'
                : 'Afficher vos activités Strava dans le calendrier.'}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col sm:flex-row gap-2 items-end sm:items-center justify-end">
          {connected ? (
            <>
              <a
                href="/api/auth/strava"
                className="flex h-12 items-center rounded-lg border-2 border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
              >
                Reconnecter
              </a>
              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                className="rounded-lg bg-[#FC4C02] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60 h-12 flex items-center"
              >
                {syncing ? 'Import en cours…' : 'Importer les 3 dernières semaines'}
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="rounded-lg border-2 border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-60 h-12 flex items-center"
              >
                Déconnecter
              </button>
            </>
          ) : (
            <ConnectWithStravaButton />
          )}
        </div>
      </div>
      {(urlMessage || message) && (
        <div
          className={`mt-4 rounded-lg px-3 py-2 text-sm ${
            message?.type === 'error' || (searchParams.get('error') && !urlMessage)
              ? 'bg-red-50 text-red-800'
              : 'bg-green-50 text-green-800'
          }`}
        >
          {message ? message.text : urlMessage}
        </div>
      )}
    </section>
  )
}

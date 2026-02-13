'use client'

import { Button } from '@/components/Button'
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
    <Button href="/api/auth/strava" variant="strava" aria-label="Connecter Strava">
      Connecter Strava
    </Button>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-palette-strava">
                <img
                  src="/strava-icon.svg"
                  alt="Strava"
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-stone-900 mb-1">Strava</h2>
                <p className="text-sm text-stone-600">
                  {connected
                    ? 'Connecté — importez les 3 dernières semaines d\'activités dans votre calendrier.'
                    : 'Afficher vos activités Strava dans le calendrier.'}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {connected ? (
                <>
                  <Button
                    href="/api/auth/strava"
                    variant="muted"
                  >
                    Reconnecter
                  </Button>
                  <Button
                    type="button"
                    variant="strava"
                    onClick={handleSync}
                    disabled={syncing}
                    loading={syncing}
                    loadingText="Import en cours…"
                  >
                    Importer les 3 dernières semaines
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    loading={disconnecting}
                    loadingText="Déconnexion…"
                  >
                    Déconnecter
                  </Button>
                </>
              ) : (
                <ConnectWithStravaButton />
              )}
            </div>
          </div>
          {(urlMessage || message) && (
            <div
              className={`mt-6 rounded-lg px-4 py-3 text-sm ${
                message?.type === 'error' || (searchParams.get('error') && !urlMessage)
                  ? 'bg-red-50 text-red-800 border border-red-200'
                  : 'bg-palette-forest-dark/10 text-palette-forest-dark border border-palette-forest-dark/20'
              }`}
            >
              {message ? message.text : urlMessage}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

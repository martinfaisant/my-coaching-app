'use client'

import { Button } from '@/components/Button'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { syncStravaLastWeek, disconnectStrava } from './actions'
import type { AthleteConnectedService } from '@/types/database'

type StravaDevicesSectionProps = {
  userId: string
  connected: boolean
  connection: Pick<AthleteConnectedService, 'id' | 'provider' | 'strava_athlete_id' | 'created_at'> | null
}

export function StravaDevicesSection({ userId, connected, connection }: StravaDevicesSectionProps) {
  const t = useTranslations('devices')
  const locale = useLocale()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [syncing, setSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const urlMessage = searchParams.get('strava') === 'connected'
    ? t('messages.connected')
    : searchParams.get('error') === 'strava_invalid'
      ? t('messages.errorInvalid')
      : searchParams.get('error') === 'strava_config'
        ? t('messages.errorConfig')
        : searchParams.get('error') === 'strava_token'
          ? t('messages.errorToken')
          : searchParams.get('error') === 'strava_save'
            ? t('messages.errorSave')
            : null

  // Traduire les messages statiques en dehors des handlers
  const confirmText = t('disconnectConfirm')
  const disconnectedText = t('messages.disconnected')

  const handleSync = async () => {
    setMessage(null)
    setSyncing(true)
    const result = await syncStravaLastWeek(userId, locale)
    setSyncing(false)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      const successText = result.imported !== undefined
        ? t('messages.importSuccess', { count: result.imported })
        : t('messages.importComplete')
      setMessage({
        type: 'success',
        text: successText,
      })
      router.refresh()
    }
  }

  const handleDisconnect = async () => {
    if (!confirm(confirmText)) return
    setMessage(null)
    setDisconnecting(true)
    const result = await disconnectStrava(userId, locale)
    setDisconnecting(false)
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: disconnectedText })
      router.refresh()
    }
  }

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
                <h2 className="text-base font-bold text-stone-900 mb-1">Strava</h2>
                <p className="text-sm text-stone-600">
                  {connected
                    ? t('connectedDescription')
                    : t('notConnectedDescription')}
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
                    {t('reconnect')}
                  </Button>
                  <Button
                    type="button"
                    variant="strava"
                    onClick={handleSync}
                    disabled={syncing}
                    loading={syncing}
                    loadingText={t('syncInProgress')}
                  >
                    {t('syncActivities')}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    loading={disconnecting}
                    loadingText={t('disconnecting')}
                  >
                    {t('disconnectStrava')}
                  </Button>
                </>
              ) : (
                <Button href="/api/auth/strava" variant="strava" aria-label={t('connectStrava')}>
                  {t('connectStrava')}
                </Button>
              )}
            </div>
          </div>
          {(urlMessage || message) && (
            <div
              className={`mt-6 rounded-lg px-4 py-3 text-sm ${
                message?.type === 'error' || (searchParams.get('error') && !urlMessage)
                  ? 'bg-palette-danger-light text-palette-danger-dark border border-palette-danger'
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

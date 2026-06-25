'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Switch } from '@/components/Switch'
import { FORM_ERROR_CLASSES } from '@/lib/formStyles'
import { updateCoachEmailNotifyCoachingRequest } from '@/app/[locale]/dashboard/notifications/actions'

type NotificationPreferenceRowProps = {
  preferenceId: string
  title: string
  description: string
  initialEnabled: boolean
}

const SAVED_FEEDBACK_MS = 2000

export function NotificationPreferenceRow({
  preferenceId,
  title,
  description,
  initialEnabled,
}: NotificationPreferenceRowProps) {
  const locale = useLocale()
  const t = useTranslations('coachNotifications')
  const [enabled, setEnabled] = useState(initialEnabled)
  const [serverEnabled, setServerEnabled] = useState(initialEnabled)
  const [saving, setSaving] = useState(false)
  const [showSaved, setShowSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setEnabled(initialEnabled)
    setServerEnabled(initialEnabled)
  }, [initialEnabled])

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  const persist = useCallback(
    async (next: boolean) => {
      setSaving(true)
      setError(null)
      setShowSaved(false)

      const result = await updateCoachEmailNotifyCoachingRequest(next, locale)

      setSaving(false)

      if ('error' in result) {
        setError(result.error)
        setEnabled(serverEnabled)
        return
      }

      setServerEnabled(result.data.emailNotifyCoachingRequest)
      setEnabled(result.data.emailNotifyCoachingRequest)
      setShowSaved(true)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
      savedTimeoutRef.current = setTimeout(() => setShowSaved(false), SAVED_FEEDBACK_MS)
    },
    [locale, serverEnabled],
  )

  const handleChange = (next: boolean) => {
    if (saving) return
    setEnabled(next)
    void persist(next)
  }

  return (
    <div className="px-4 py-3.5 bg-white border-b border-stone-100 last:border-b-0">
      {error ? (
        <p className={`${FORM_ERROR_CLASSES} mb-3 rounded-xl border px-3 py-2 text-xs`} role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-900">{title}</p>
          <p className="text-xs text-stone-500 mt-0.5 leading-snug">{description}</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={handleChange}
          label={title}
          disabled={saving}
          id={`notification-pref-${preferenceId}`}
        />
      </div>
      {saving ? (
        <p className="text-xs text-stone-400 mt-2 flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 border-2 border-stone-300 border-t-palette-forest-dark rounded-full animate-spin"
            aria-hidden
          />
          {t('saving')}
        </p>
      ) : null}
      {showSaved && !saving ? (
        <p className="text-xs font-medium text-palette-forest-dark mt-2" role="status">
          {t('saved')}
        </p>
      ) : null}
    </div>
  )
}

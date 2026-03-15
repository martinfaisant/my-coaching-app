'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/Button'

type LogoutButtonProps = {
  className?: string
}

export function LogoutButton(props?: LogoutButtonProps) {
  const { className } = props ?? {}
  const t = useTranslations('auth')
  const locale = useLocale()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      // Full page navigation so the next request uses cleared cookies.
      // router.push('/') caused a loop when user preferred_locale !== page locale
      // (middleware still saw the user as logged in on client nav and redirected back).
      const homePath = locale === 'fr' ? '/' : '/en'
      window.location.href = homePath
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <Button
      type="button"
      variant="danger"
      onClick={handleLogout}
      disabled={isLoggingOut}
      loading={isLoggingOut}
      loadingText={t('loggingOut')}
      className={className ?? 'flex items-center gap-2.5 px-3 lg:px-4'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </svg>
      <span className="font-medium text-sm">{t('logout')}</span>
    </Button>
  )
}

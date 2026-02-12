'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/Button'

export function LogoutButton() {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  async function handleLogout() {
    setIsLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
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
      loadingText="Déconnexion…"
      className="flex items-center gap-2.5 px-3 lg:px-4"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" x2="9" y1="12" y2="12" />
      </svg>
      <span className="font-medium text-sm hidden lg:block">Déconnexion</span>
    </Button>
  )
}

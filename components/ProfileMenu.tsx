'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

type ProfileMenuProps = {
  showObjectifsLink?: boolean
}

export function ProfileMenu({ showObjectifsLink = false }: ProfileMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [open])

  async function handleLogout() {
    setOpen(false)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl bg-slate-200 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 transition focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Profil
        <svg
          className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1">
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Mes informations
          </Link>
          {showObjectifsLink && (
            <Link
              href="/dashboard/objectifs"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Mes objectifs
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-t border-slate-200 dark:border-slate-700"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}

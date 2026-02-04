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
        className="flex items-center gap-2 rounded-lg bg-stone-100bg-stone-800 px-3 py-2 text-sm font-medium text-stone-700text-stone-300 hover:bg-stone-200hover:bg-stone-700 transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
      >
        Profil
        <svg
          className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
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
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border border-stone-100border-stone-800 bg-whitebg-palette-forest-dark shadow-lg py-1">
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-stone-700text-stone-300 hover:bg-stone-50hover:bg-palette-olive transition-colors"
          >
            Mes informations
          </Link>
          {showObjectifsLink && (
            <Link
              href="/dashboard/objectifs"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-stone-700text-stone-300 hover:bg-stone-50hover:bg-palette-olive transition-colors"
            >
              Mes objectifs
            </Link>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="block w-full px-4 py-2 text-left text-sm text-stone-700text-stone-300 hover:bg-stone-50hover:bg-palette-olive border-t border-stone-100border-stone-800 transition-colors"
          >
            Déconnexion
          </button>
        </div>
      )}
    </div>
  )
}

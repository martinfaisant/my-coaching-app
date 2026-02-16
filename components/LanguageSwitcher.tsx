'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useRef, useEffect, useState } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'

const LOCALES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
] as const

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const currentLocale = (params?.locale as string) || 'fr'
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLocale = (newLocale: string) => {
    setOpen(false)
    if (pathname.startsWith(`/${currentLocale}`)) {
      const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
      router.push(newPathname)
    } else {
      router.push(`/${newLocale}${pathname}`)
    }
  }

  const currentLabel = LOCALES.find((l) => l.code === currentLocale)?.label ?? currentLocale.toUpperCase()
  const displayCode = currentLocale.toUpperCase()

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all text-sm font-medium border border-transparent focus:outline-none focus:ring-2 focus:ring-palette-forest-dark focus:ring-offset-2"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Changer de langue"
      >
        <Globe className="w-4 h-4 shrink-0" aria-hidden />
        <span>{displayCode}</span>
        <ChevronDown
          className={`w-3 h-3 shrink-0 opacity-50 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      <div
        className={`absolute right-0 top-full mt-1 w-[10rem] bg-white border border-stone-200 rounded-xl shadow-lg z-50 transition-all duration-200 ${
          open
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible translate-y-2 pointer-events-none'
        }`}
        role="menu"
      >
        <div className="p-1">
          {LOCALES.map(({ code, label }) => {
            const isActive = currentLocale === code
            return (
              <button
                key={code}
                type="button"
                role="menuitem"
                onClick={() => switchLocale(code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'text-palette-forest-dark bg-palette-forest-dark/10'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {label}
                {isActive && <Check className="w-3.5 h-3.5 shrink-0" aria-hidden />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

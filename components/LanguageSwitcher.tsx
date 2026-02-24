'use client'

import { useParams, usePathname, useRouter } from 'next/navigation'
import { useRef, useEffect, useState, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { updatePreferredLocale } from '@/app/[locale]/dashboard/profile/actions'

const LOCALES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
] as const

const DROPDOWN_WIDTH = 160 // w-[10rem]
const VIEWPORT_PADDING = 8

export function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const currentLocale = (params?.locale as string) || 'fr'
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownStyle, setDropdownStyle] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!open || typeof document === 'undefined' || !buttonRef.current) {
      setDropdownStyle(null)
      return
    }
    const rect = buttonRef.current.getBoundingClientRect()
    const viewportWidth = window.innerWidth
    // Aligner à droite du bouton par défaut ; si le menu dépasserait à gauche, l'aligner à gauche du bouton
    let left = rect.right - DROPDOWN_WIDTH
    if (left < VIEWPORT_PADDING) {
      left = Math.max(VIEWPORT_PADDING, rect.left)
    }
    // Ne pas dépasser à droite
    if (left + DROPDOWN_WIDTH > viewportWidth - VIEWPORT_PADDING) {
      left = viewportWidth - DROPDOWN_WIDTH - VIEWPORT_PADDING
    }
    setDropdownStyle({
      top: rect.bottom + 4,
      left,
    })
  }, [open])

  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const inButton = containerRef.current?.contains(target)
      const inDropdown = dropdownRef.current?.contains(target)
      if (!inButton && !inDropdown) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLocale = async (newLocale: string) => {
    setOpen(false)
    if (newLocale === 'fr' || newLocale === 'en') {
      await updatePreferredLocale(newLocale)
    }
    if (pathname.startsWith(`/${currentLocale}`)) {
      const newPathname = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
      router.push(newPathname)
    } else {
      router.push(`/${newLocale}${pathname}`)
    }
  }

  const displayCode = currentLocale.toUpperCase()

  const dropdownContent = open && dropdownStyle && typeof document !== 'undefined' && (
    <div
      ref={(el) => {
        dropdownRef.current = el
      }}
      className="fixed w-[10rem] bg-white border border-stone-200 rounded-xl shadow-lg z-[100] transition-all duration-200 opacity-100 visible"
      style={{ top: dropdownStyle.top, left: dropdownStyle.left }}
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
  )

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-all text-sm font-medium border border-transparent focus:outline-none focus:ring-2 focus:ring-stone-300 focus:ring-offset-2"
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

      {typeof document !== 'undefined' && dropdownContent
        ? createPortal(dropdownContent, document.body)
        : null}
    </div>
  )
}

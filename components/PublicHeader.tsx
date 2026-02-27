'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AuthButtons } from '@/components/AuthButtons'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

/**
 * En-tête public partagé : page d'accueil, réinitialisation mot de passe, etc.
 * Même structure que le header de la page d'accueil (logo, LanguageSwitcher, AuthButtons).
 * Référence design : docs/design-reset-password-header/DESIGN_RESET_PASSWORD_HEADER.md
 */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-background/95 backdrop-blur-md shrink-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-semibold text-stone-900 tracking-tight flex items-center gap-2"
        >
          <Image
            src="/logo.svg"
            alt="My Sport Ally"
            width={80}
            height={80}
            className="h-9 w-auto object-contain"
          />
          <span className="hidden sm:inline">My Sport Ally</span>
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <div className="h-6 w-px bg-stone-200" aria-hidden />
          <AuthButtons />
        </div>
      </div>
    </header>
  )
}

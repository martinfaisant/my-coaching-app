'use client'

import { forwardRef } from 'react'
import { Input } from '@/components/Input'

/**
 * Champ de recherche (type="search") avec croix de suppression stylisée en vert (palette).
 * Réutilise Input et applique la classe CSS pour le bouton clear (WebKit).
 * Usage : listes filtrées, barre de recherche.
 */

export type SearchInputProps = Omit<
  React.ComponentProps<typeof Input>,
  'type'
> & {
  /** Placeholder et aria-label recommandés pour l'accessibilité */
  placeholder?: string
  'aria-label'?: string
}

const SEARCH_CLEAR_CLASS = 'search-input-clear-green'

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput({ className = '', ...props }, ref) {
    const inputClassName = [className, SEARCH_CLEAR_CLASS].filter(Boolean).join(' ')
    return (
      <Input
        ref={ref}
        type="search"
        className={inputClassName}
        {...props}
      />
    )
  }
)

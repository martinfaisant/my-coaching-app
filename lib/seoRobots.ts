import type { Metadata } from 'next'

/** Empêche l'indexation (complément de robots.txt pour liens externes). */
export const NOINDEX_METADATA: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

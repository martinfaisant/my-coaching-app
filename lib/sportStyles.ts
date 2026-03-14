/**
 * Configuration partagée : icônes et couleurs par sport.
 * Aligné avec le calendrier (CalendarView) — Run forest, Vélo olive, Nage sky, Muscu stone, etc.
 */
import type { ComponentType } from 'react'
import {
  IconRunning,
  IconBiking,
  IconSwimming,
  IconDumbbell,
  IconNordicSki,
  IconBackcountrySki,
  IconIceSkating,
  IconMountain,
  IconPersonHiking,
} from '@/components/SportIcons'

export type SportType =
  | 'course'
  | 'course_route'
  | 'velo'
  | 'natation'
  | 'musculation'
  | 'nordic_ski'
  | 'backcountry_ski'
  | 'ice_skating'
  | 'trail'
  | 'randonnee'
  | 'triathlon'

/**
 * Translation keys for sport labels.
 * Use with next-intl: t(SPORT_TRANSLATION_KEYS[sportType])
 * Note: Keys are relative to the 'sports' namespace
 */
export const SPORT_TRANSLATION_KEYS: Record<SportType, string> = {
  course: 'course',
  course_route: 'course',
  velo: 'velo',
  natation: 'natation',
  musculation: 'muscu',
  nordic_ski: 'ski_fond',
  backcountry_ski: 'ski_fond',
  ice_skating: 'autre',
  trail: 'trail',
  randonnee: 'rando',
  triathlon: 'triathlon',
}

export const SPORT_ICONS: Record<SportType, ComponentType<{ className?: string }>> = {
  course: IconRunning,
  course_route: IconRunning,
  velo: IconBiking,
  natation: IconSwimming,
  musculation: IconDumbbell,
  nordic_ski: IconNordicSki,
  backcountry_ski: IconBackcountrySki,
  ice_skating: IconIceSkating,
  trail: IconMountain,
  randonnee: IconPersonHiking,
  triathlon: IconSwimming,
}

/** Styles pour les cartes du calendrier (WorkoutCard, ActivityCard) */
export const SPORT_CARD_STYLES: Record<
  SportType,
  { borderLeft: string; badge: string; badgeBg: string }
> = {
  course: {
    borderLeft: 'border-l-palette-forest-dark',
    badge: 'text-palette-forest-dark',
    badgeBg: 'bg-palette-forest-dark/10',
  },
  course_route: {
    borderLeft: 'border-l-palette-forest-dark',
    badge: 'text-palette-forest-dark',
    badgeBg: 'bg-palette-forest-dark/10',
  },
  velo: {
    borderLeft: 'border-l-palette-olive',
    badge: 'text-palette-olive',
    badgeBg: 'bg-palette-olive/10',
  },
  natation: {
    borderLeft: 'border-l-sky-500',
    badge: 'text-sky-700',
    badgeBg: 'bg-sky-50',
  },
  musculation: {
    borderLeft: 'border-l-stone-500',
    badge: 'text-stone-600',
    badgeBg: 'bg-stone-100',
  },
  nordic_ski: {
    borderLeft: 'border-l-palette-sage',
    badge: 'text-palette-sage',
    badgeBg: 'bg-palette-sage/10',
  },
  backcountry_ski: {
    borderLeft: 'border-l-palette-gold',
    badge: 'text-palette-gold',
    badgeBg: 'bg-palette-gold/10',
  },
  ice_skating: {
    borderLeft: 'border-l-cyan-600',
    badge: 'text-cyan-700',
    badgeBg: 'bg-cyan-50',
  },
  trail: {
    borderLeft: 'border-l-palette-gold',
    badge: 'text-palette-gold',
    badgeBg: 'bg-palette-gold/10',
  },
  randonnee: {
    borderLeft: 'border-l-palette-sage',
    badge: 'text-palette-sage',
    badgeBg: 'bg-palette-sage/10',
  },
  triathlon: {
    borderLeft: 'border-l-palette-amber',
    badge: 'text-palette-amber',
    badgeBg: 'bg-palette-amber/10',
  },
}

/** Styles badge par sport (alignés calendrier). */
export const SPORT_BADGE_STYLES: Record<
  SportType,
  { bg: string; text: string; border: string }
> = {
  course: {
    bg: 'bg-palette-forest-dark/10',
    text: 'text-palette-forest-dark',
    border: 'border-palette-forest-dark/20',
  },
  course_route: {
    bg: 'bg-palette-forest-dark/10',
    text: 'text-palette-forest-dark',
    border: 'border-palette-forest-dark/20',
  },
  velo: {
    bg: 'bg-palette-olive/10',
    text: 'text-palette-olive',
    border: 'border-palette-olive/20',
  },
  natation: {
    bg: 'bg-sky-50',
    text: 'text-sky-700',
    border: 'border-sky-500/30',
  },
  musculation: {
    bg: 'bg-stone-100',
    text: 'text-stone-600',
    border: 'border-stone-300',
  },
  nordic_ski: {
    bg: 'bg-palette-sage/10',
    text: 'text-palette-sage',
    border: 'border-palette-sage/20',
  },
  backcountry_ski: {
    bg: 'bg-palette-gold/10',
    text: 'text-palette-gold',
    border: 'border-palette-gold/20',
  },
  ice_skating: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-600/30',
  },
  trail: {
    bg: 'bg-palette-gold/10',
    text: 'text-palette-gold',
    border: 'border-palette-gold/20',
  },
  randonnee: {
    bg: 'bg-palette-sage/10',
    text: 'text-palette-sage',
    border: 'border-palette-sage/20',
  },
  triathlon: {
    bg: 'bg-palette-amber/10',
    text: 'text-palette-amber',
    border: 'border-palette-amber/20',
  },
}

/** Unité pour le volume hebdo (profil athlète) : km, m ou h selon le sport. */
export type WeeklyVolumeUnit = 'km' | 'm' | 'h'

/** Sport pratiqué (valeurs du formulaire profil athlète). */
export type PracticedSportKey =
  | 'course'
  | 'velo'
  | 'natation'
  | 'musculation'
  | 'trail'
  | 'triathlon'

/**
 * Retourne l'unité de volume hebdomadaire pour un sport pratiqué.
 * Utilisé pour l'affichage du suffixe (km/sem., m/sem., h/sem.) et la validation.
 */
export function getWeeklyVolumeUnit(sport: string): WeeklyVolumeUnit {
  switch (sport) {
    case 'course':
    case 'trail':
    case 'velo':
      return 'km'
    case 'natation':
      return 'm'
    case 'musculation':
    case 'triathlon':
      return 'h'
    default:
      return 'km'
  }
}

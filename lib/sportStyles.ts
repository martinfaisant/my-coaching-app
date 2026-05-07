/**
 * Configuration partagée : icônes et couleurs par sport.
 * Aligné avec le calendrier (CalendarView) — Run forest, Vélo gold, Nage sky, Muscu stone, etc.
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
  IconTriathlon,
  IconClimb,
  IconMeditation,
  IconCanoe,
  IconSurf,
  IconGolf,
  IconYoga,
} from '@/components/SportIcons'

export type SportType =
  | 'course'
  | 'velo'
  | 'natation'
  | 'musculation'
  | 'nordic_ski'
  | 'backcountry_ski'
  | 'ice_skating'
  | 'trail'
  | 'randonnee'
  | 'triathlon'
  | 'escalade'
  | 'meditation'
  | 'canot'
  | 'surf'
  | 'golf'
  | 'yoga'

/**
 * Translation keys for sport labels.
 * Use with next-intl: t(SPORT_TRANSLATION_KEYS[sportType])
 * Note: Keys are relative to the 'sports' namespace
 */
export const SPORT_TRANSLATION_KEYS: Record<SportType, string> = {
  course: 'course',
  velo: 'velo',
  natation: 'natation',
  musculation: 'muscu',
  nordic_ski: 'ski_fond',
  backcountry_ski: 'ski_randonnee',
  ice_skating: 'patinage_glace',
  trail: 'trail',
  randonnee: 'rando',
  triathlon: 'triathlon',
  escalade: 'escalade',
  meditation: 'meditation',
  canot: 'canot',
  surf: 'surf',
  golf: 'golf',
  yoga: 'yoga',
}

export const SPORT_ICONS: Record<SportType, ComponentType<{ className?: string }>> = {
  course: IconRunning,
  velo: IconBiking,
  natation: IconSwimming,
  musculation: IconDumbbell,
  nordic_ski: IconNordicSki,
  backcountry_ski: IconBackcountrySki,
  ice_skating: IconIceSkating,
  trail: IconMountain,
  randonnee: IconPersonHiking,
  triathlon: IconTriathlon,
  escalade: IconClimb,
  meditation: IconMeditation,
  canot: IconCanoe,
  surf: IconSurf,
  golf: IconGolf,
  yoga: IconYoga,
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
  velo: {
    borderLeft: 'border-l-palette-gold',
    badge: 'text-palette-gold',
    badgeBg: 'bg-palette-gold/10',
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
    borderLeft: 'border-l-indigo-400',
    badge: 'text-indigo-700',
    badgeBg: 'bg-indigo-50',
  },
  backcountry_ski: {
    borderLeft: 'border-l-cyan-600',
    badge: 'text-cyan-700',
    badgeBg: 'bg-cyan-50',
  },
  ice_skating: {
    borderLeft: 'border-l-slate-300',
    badge: 'text-slate-600',
    badgeBg: 'bg-slate-100',
  },
  trail: {
    borderLeft: 'border-l-palette-olive',
    badge: 'text-palette-olive',
    badgeBg: 'bg-palette-olive/10',
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
  escalade: {
    borderLeft: 'border-l-stone-600',
    badge: 'text-stone-700',
    badgeBg: 'bg-stone-100',
  },
  meditation: {
    borderLeft: 'border-l-violet-200',
    badge: 'text-violet-600',
    badgeBg: 'bg-violet-50',
  },
  canot: {
    borderLeft: 'border-l-cyan-800',
    badge: 'text-cyan-900',
    badgeBg: 'bg-cyan-50',
  },
  surf: {
    borderLeft: 'border-l-orange-400',
    badge: 'text-orange-700',
    badgeBg: 'bg-orange-50',
  },
  golf: {
    borderLeft: 'border-l-teal-700',
    badge: 'text-teal-800',
    badgeBg: 'bg-teal-50',
  },
  yoga: {
    borderLeft: 'border-l-violet-400',
    badge: 'text-violet-700',
    badgeBg: 'bg-violet-50',
  },
}

/** Styles badge par sport (alignés calendrier). Fond blanc, texte et contour colorés. */
export const SPORT_BADGE_STYLES: Record<
  SportType,
  { bg: string; text: string; border: string }
> = {
  course: {
    bg: 'bg-white',
    text: 'text-palette-forest-dark',
    border: 'border-palette-forest-dark',
  },
  velo: {
    bg: 'bg-white',
    text: 'text-palette-gold',
    border: 'border-palette-gold',
  },
  natation: {
    bg: 'bg-white',
    text: 'text-sky-700',
    border: 'border-sky-500',
  },
  musculation: {
    bg: 'bg-white',
    text: 'text-stone-600',
    border: 'border-stone-300',
  },
  nordic_ski: {
    bg: 'bg-white',
    text: 'text-indigo-700',
    border: 'border-indigo-400',
  },
  backcountry_ski: {
    bg: 'bg-white',
    text: 'text-cyan-700',
    border: 'border-cyan-600',
  },
  ice_skating: {
    bg: 'bg-white',
    text: 'text-slate-600',
    border: 'border-slate-300',
  },
  trail: {
    bg: 'bg-white',
    text: 'text-palette-olive',
    border: 'border-palette-olive',
  },
  randonnee: {
    bg: 'bg-white',
    text: 'text-palette-sage',
    border: 'border-palette-sage',
  },
  triathlon: {
    bg: 'bg-white',
    text: 'text-palette-amber',
    border: 'border-palette-amber',
  },
  escalade: {
    bg: 'bg-white',
    text: 'text-stone-700',
    border: 'border-stone-600',
  },
  meditation: {
    bg: 'bg-white',
    text: 'text-violet-600',
    border: 'border-violet-200',
  },
  canot: {
    bg: 'bg-white',
    text: 'text-cyan-900',
    border: 'border-cyan-800',
  },
  surf: {
    bg: 'bg-white',
    text: 'text-orange-700',
    border: 'border-orange-400',
  },
  golf: {
    bg: 'bg-white',
    text: 'text-teal-800',
    border: 'border-teal-700',
  },
  yoga: {
    bg: 'bg-white',
    text: 'text-violet-700',
    border: 'border-violet-400',
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
  | 'nordic_ski'
  | 'backcountry_ski'
  | 'ice_skating'
  | 'randonnee'
  | 'triathlon'
  | 'escalade'
  | 'meditation'
  | 'canot'
  | 'surf'
  | 'golf'
  | 'yoga'

/**
 * D+ hebdo sur la tuile Course : uniquement si « Trail » est coché (pas de tuile volume trail dédiée).
 * Randonnée / skis : D+ sur leur tuile via `getWeeklyVolumeTileElevationJsonKey`.
 */
export function practicedSportsNeedCourseElevationField(practicedSports: string[]): boolean {
  return practicedSports.includes('trail')
}

/**
 * Retourne l'unité de volume hebdomadaire pour un sport pratiqué.
 * Utilisé pour l'affichage du suffixe (km/sem., m/sem., h/sem.) et la validation.
 */
export function getWeeklyVolumeUnit(sport: string): WeeklyVolumeUnit {
  switch (sport) {
    case 'course':
    case 'trail':
    case 'velo':
    case 'nordic_ski':
    case 'backcountry_ski':
    case 'ice_skating':
    case 'randonnee':
      return 'km'
    case 'natation':
      return 'm'
    case 'musculation':
    case 'triathlon':
    case 'escalade':
    case 'meditation':
    case 'canot':
    case 'surf':
    case 'golf':
    case 'yoga':
      return 'h'
    default:
      return 'km'
  }
}

/**
 * Ordre d'affichage des sports pratiqués (profil).
 * Trail n’a pas de tuile volume dédiée (volume course + D+ sur la tuile Course) ; rando / skis ont une tuile km + D+ dédiée.
 */
export const PRACTICED_SPORTS_DISPLAY_ORDER: PracticedSportKey[] = [
  'course',
  'velo',
  'natation',
  'musculation',
  'yoga',
  'meditation',
  'escalade',
  'surf',
  'golf',
  'canot',
  'trail',
  'randonnee',
  'nordic_ski',
  'backcountry_ski',
  'ice_skating',
  'triathlon',
]

/** Clés `weekly_volume_by_sport` affichées comme tuile de saisie volume (hors triathlon agrégé). */
export type WeeklyVolumeTileKey =
  | 'course'
  | 'velo'
  | 'natation'
  | 'musculation'
  | 'escalade'
  | 'meditation'
  | 'canot'
  | 'surf'
  | 'golf'
  | 'yoga'
  | 'ice_skating'
  | 'nordic_ski'
  | 'backcountry_ski'
  | 'randonnee'

/** Clé JSON dans `weekly_volume_by_sport` pour le D+ d'une tuile km dédiée (rando, skis). */
export const WEEKLY_VOLUME_TILE_ELEVATION_JSON_KEYS: Partial<Record<WeeklyVolumeTileKey, string>> = {
  randonnee: 'randonnee_elevation_m',
  nordic_ski: 'nordic_ski_elevation_m',
  backcountry_ski: 'backcountry_ski_elevation_m',
}

export function getWeeklyVolumeTileElevationJsonKey(tileSport: WeeklyVolumeTileKey): string | null {
  return WEEKLY_VOLUME_TILE_ELEVATION_JSON_KEYS[tileSport] ?? null
}

/** Nom du champ HTML (ex. `weekly_volume_randonnee_elevation_m`). */
export function getWeeklyVolumeTileElevationFormFieldName(tileSport: WeeklyVolumeTileKey): string | null {
  const k = getWeeklyVolumeTileElevationJsonKey(tileSport)
  return k ? `weekly_volume_${k}` : null
}

/** Lecture affichage : migrer l’ancien stockage D+ rando/ski dans `course_elevation_m` (avant clés dédiées). */
export function legacyWeeklyVolumeTileElevationValue(
  tileSport: WeeklyVolumeTileKey,
  vol: Record<string, number> | null | undefined,
  practicedSports: string[],
): number | undefined {
  const jsonKey = getWeeklyVolumeTileElevationJsonKey(tileSport)
  if (!jsonKey || !vol) return undefined
  const direct = vol[jsonKey]
  if (direct != null && !Number.isNaN(Number(direct))) return Number(direct)
  if (!practicedSports.includes('trail') && vol.course_elevation_m != null) {
    if (tileSport === 'randonnee' || tileSport === 'nordic_ski' || tileSport === 'backcountry_ski') {
      return Number(vol.course_elevation_m)
    }
  }
  return undefined
}

export type WeeklyVolumeBySportKey =
  | WeeklyVolumeTileKey
  | 'trail'
  | 'course_elevation_m'
  | 'randonnee_elevation_m'
  | 'nordic_ski_elevation_m'
  | 'backcountry_ski_elevation_m'

/**
 * Ordre d'affichage des entrées `weekly_volume_by_sport` (lecture seule coach/demandes).
 * `course_elevation_m` = D+ trail sur la tuile Course ; `*_elevation_m` = D+ sur la tuile du sport concerné.
 */
export const WEEKLY_VOLUME_DISPLAY_ORDER: WeeklyVolumeBySportKey[] = [
  'course',
  'velo',
  'natation',
  'musculation',
  'escalade',
  'meditation',
  'canot',
  'surf',
  'golf',
  'yoga',
  'ice_skating',
  'nordic_ski',
  'backcountry_ski',
  'randonnee',
  'trail',
  'course_elevation_m',
]

/** Type guard runtime (utile quand on lit des strings depuis la DB). */
export function isSportType(value: string): value is SportType {
  return value in SPORT_TRANSLATION_KEYS
}

/**
 * Normalise une valeur de sport (legacy / i18n keys) vers un SportType canonique.
 * Utile pour l'affichage (badges) quand des données historiques contiennent d'anciennes valeurs.
 */
export function normalizeSportType(value: string): SportType | null {
  const v = (value ?? '').trim()
  if (!v) return null
  if (isSportType(v)) return v
  const legacy: Partial<Record<string, SportType>> = {
    muscu: 'musculation',
    ski_fond: 'nordic_ski',
    ski_randonnee: 'backcountry_ski',
    patinage_glace: 'ice_skating',
    rando: 'randonnee',
    course_route: 'course',
  }
  return legacy[v] ?? null
}

/**
 * Retourne la clé de traduction (namespace `sports`) si le sport est connu,
 * sinon `null` (le caller peut alors fallback sur la valeur brute).
 */
export function getSportTranslationKey(value: string): string | null {
  const normalized = normalizeSportType(value)
  return normalized ? SPORT_TRANSLATION_KEYS[normalized] : null
}

/**
 * Liste des sports à afficher dans la section "Volumes hebdomadaires" du profil.
 * - triathlon => course + vélo + natation
 * - trail => tuile Course (km) + D+ (`course_elevation_m`) ; rando / ski fond / ski rando => tuile km + D+ (`*_elevation_m`)
 * - ice_skating => tuile km dédiée
 */
export function getWeeklyVolumeDisplaySports(practicedSports: string[]): WeeklyVolumeTileKey[] {
  const base: WeeklyVolumeTileKey[] = [
    'course',
    'velo',
    'natation',
    'musculation',
    'escalade',
    'meditation',
    'canot',
    'surf',
    'golf',
    'yoga',
    'ice_skating',
    'nordic_ski',
    'backcountry_ski',
    'randonnee',
  ]

  const virtual = new Set(practicedSports)
  // Triathlon => afficher au moins Course/Vélo/Natation, sans masquer les autres sports sélectionnés.
  if (virtual.has('triathlon')) {
    virtual.add('course')
    virtual.add('velo')
    virtual.add('natation')
  }
  if (virtual.has('trail')) {
    virtual.add('course')
  }

  return base.filter((k) => virtual.has(k))
}

/**
 * Styles "pill" (WorkoutModal) : uniquement la bordure colorée, alignée sur les badges.
 * Reprend les classes de `SPORT_BADGE_STYLES[*].border`.
 */
export const SPORT_PILL_STYLES: Record<SportType, { border: string }> = Object.fromEntries(
  (Object.keys(SPORT_BADGE_STYLES) as SportType[]).map((sport) => [sport, { border: SPORT_BADGE_STYLES[sport].border }]),
) as Record<SportType, { border: string }>

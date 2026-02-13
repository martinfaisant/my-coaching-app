# 🎯 PLAN D'AMÉLIORATION - My Coaching App

**Date de création**: 13 février 2026  
**Dernière mise à jour**: 13 février 2026  
**Statut global**: 🔴 EN ATTENTE

---

## 📊 VUE D'ENSEMBLE

### Objectifs

1. **Réduire la duplication de code de 15% à < 5%** (objectif : -500 lignes)
2. **Améliorer la maintenabilité** (temps de correction de bug divisé par 2)
3. **Standardiser la gestion des erreurs** (100% des actions avec error handling)
4. **Préparer pour les tests** (structure testable)

### Métriques Cibles

| Métrique | Avant | Après Sprint 1 | Après Sprint 2 | Cible Finale |
|----------|-------|----------------|----------------|--------------|
| Duplication | 15% | 8% | 5% | < 5% |
| Fichiers > 500 lignes | 2 | 1 | 0 | 0 |
| Console.log prod | 7 | 0 | 0 | 0 |
| Error boundaries | 0 | 2 | 2 | 2+ |
| Tests coverage | 0% | 0% | 30% | 70% |

---

## 🚀 SPRINT 1 - FONDATIONS (2 semaines)

**Objectif**: Éliminer la duplication critique et poser les bases d'un code maintenable.

**Effort total**: 18h  
**Impact**: 🔴 Très élevé

---

### ✅ TÂCHE 1.1 : Créer `lib/dateUtils.ts`

**Priorité**: 🔴 P0  
**Effort**: 2h  
**Impact**: Réduction de 80 lignes dupliquées

#### Description

Centraliser toutes les fonctions de manipulation de dates utilisées dans 4+ fichiers.

#### Fichier à créer

**`lib/dateUtils.ts`**

```typescript
/**
 * Utilitaires de manipulation de dates pour l'application.
 * Centralise les fonctions utilisées dans les calendriers, objectifs, etc.
 */

/**
 * Retourne le lundi de la semaine contenant la date donnée.
 * @param dateInput - Date ou string ISO (YYYY-MM-DD)
 * @returns Date du lundi à 00:00:00
 */
export function getWeekMonday(dateInput: Date | string): Date {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : new Date(dateInput)
  const day = date.getDay()
  const diff = date.getDate() - day + (day === 0 ? -6 : 1)
  date.setDate(diff)
  date.setHours(0, 0, 0, 0)
  return date
}

/**
 * Convertit une Date en string ISO (YYYY-MM-DD).
 * @param date - Date à convertir
 * @returns String au format YYYY-MM-DD
 */
export function toDateStr(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Formate une date en français long (ex: "13 février 2026").
 * @param dateInput - Date ou string ISO
 * @returns Date formatée en français
 */
export function formatDateFr(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

/**
 * Calcule le nombre de jours entre aujourd'hui et une date cible.
 * @param targetDate - Date cible (Date ou string ISO)
 * @returns Nombre de jours (négatif si passé)
 */
export function getDaysUntil(targetDate: string | Date): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Formate une date courte (ex: "13/02/2026").
 * @param dateInput - Date ou string ISO
 * @returns Date formatée DD/MM/YYYY
 */
export function formatShortDate(dateInput: Date | string): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  return new Intl.DateTimeFormat('fr-FR').format(date)
}

/**
 * Ajoute/retire des jours à une date.
 * @param date - Date de base
 * @param days - Nombre de jours à ajouter (négatif pour retirer)
 * @returns Nouvelle Date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Retourne les dates de début et fin de semaine pour une date donnée.
 * @param date - Date dans la semaine
 * @returns { start: Date, end: Date }
 */
export function getWeekRange(date: Date | string): { start: Date; end: Date } {
  const start = getWeekMonday(date)
  const end = addDays(start, 6)
  return { start, end }
}
```

#### Fichiers à modifier

1. **`components/CalendarView.tsx`**
   - Supprimer lignes 212-227 (`getWeekMonday`, `toDateStr`)
   - Ajouter en haut: `import { getWeekMonday, toDateStr } from '@/lib/dateUtils'`

2. **`components/CalendarViewWithNavigation.tsx`**
   - Supprimer lignes 13-27 (mêmes fonctions)
   - Ajouter import

3. **`app/dashboard/calendar/page.tsx`**
   - Supprimer ligne 7 (`getWeekMonday`)
   - Ajouter import

4. **`app/dashboard/athletes/[athleteId]/page.tsx`**
   - Supprimer ligne 10 (`getWeekMonday`)
   - Ajouter import

5. **`components/WorkoutModal.tsx`**
   - Supprimer lignes 26-35 (`formatDateFr`)
   - Ajouter import

6. **`app/dashboard/objectifs/page.tsx` + `ObjectifsTable.tsx` + `CoachAthleteCalendarPage.tsx`**
   - Remplacer fonction locale `getDaysUntil` par import

7. **`app/dashboard/page.tsx`**
   - Remplacer fonction locale `formatShortDate` par import

#### Tests unitaires (optionnel Sprint 1, obligatoire Sprint 4)

**`lib/__tests__/dateUtils.test.ts`**

```typescript
import { describe, it, expect } from 'vitest'
import { getWeekMonday, toDateStr, getDaysUntil, formatDateFr } from '../dateUtils'

describe('dateUtils', () => {
  describe('getWeekMonday', () => {
    it('devrait retourner le lundi pour un mercredi', () => {
      const wednesday = new Date('2026-02-13')
      const monday = getWeekMonday(wednesday)
      expect(monday.getDay()).toBe(1)
      expect(toDateStr(monday)).toBe('2026-02-10')
    })

    it('devrait retourner la même date pour un lundi', () => {
      const monday = new Date('2026-02-10')
      const result = getWeekMonday(monday)
      expect(toDateStr(result)).toBe('2026-02-10')
    })

    it('devrait gérer les dimanches correctement', () => {
      const sunday = new Date('2026-02-15')
      const monday = getWeekMonday(sunday)
      expect(toDateStr(monday)).toBe('2026-02-09')
    })
  })

  describe('getDaysUntil', () => {
    it('devrait calculer les jours restants', () => {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(getDaysUntil(tomorrow)).toBe(1)
    })
  })
})
```

#### Validation

- [ ] Toutes les occurrences de `getWeekMonday` importent depuis `@/lib/dateUtils`
- [ ] Aucune définition locale restante (vérifier avec grep)
- [ ] L'app compile sans erreurs TypeScript
- [ ] Les calendriers affichent toujours les bonnes dates
- [ ] Tests passent (si implémentés)

---

### ✅ TÂCHE 1.2 : Créer `lib/stringUtils.ts`

**Priorité**: 🔴 P0  
**Effort**: 1h  
**Impact**: Réduction de 40 lignes dupliquées

#### Fichier à créer

**`lib/stringUtils.ts`**

```typescript
/**
 * Utilitaires de manipulation de chaînes de caractères.
 */

/**
 * Génère les initiales à partir d'un nom ou email.
 * @param nameOrEmail - Nom complet ou adresse email
 * @returns Initiales (2 caractères max)
 * @example getInitials("John Doe") => "JD"
 * @example getInitials("john.doe@example.com") => "JD"
 */
export function getInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return '?'

  // Si c'est un email, extraire la partie avant @
  if (nameOrEmail.includes('@')) {
    nameOrEmail = nameOrEmail.split('@')[0]
  }

  // Remplacer les points/underscores par des espaces
  const cleaned = nameOrEmail.replace(/[._]/g, ' ').trim()

  const parts = cleaned.split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return cleaned.slice(0, 2).toUpperCase()
}

/**
 * Tronque un texte à une longueur maximale en ajoutant "...".
 * @param text - Texte à tronquer
 * @param maxLength - Longueur maximale (défaut: 100)
 * @returns Texte tronqué
 */
export function truncate(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Capitalise la première lettre d'une chaîne.
 * @param text - Texte à capitaliser
 * @returns Texte capitalisé
 */
export function capitalize(text: string): string {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Nettoie un string pour utilisation en URL (slug).
 * @param text - Texte à convertir
 * @returns Slug URL-safe
 * @example slugify("Entraînement Course à pied") => "entrainement-course-a-pied"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
```

#### Fichiers à modifier

1. **`components/Sidebar.tsx`** (L14-19)
2. **`components/CoachAthleteCalendarPage.tsx`** (L47-52)
3. **`app/dashboard/page.tsx`** (L24)
4. **`app/dashboard/FindCoachSection.tsx`** (L15)
5. **`app/dashboard/coach/page.tsx`** (L16)

**Remplacer partout**:

```typescript
// Supprimer la fonction locale
function getInitials(nameOrEmail: string): string { ... }

// Ajouter en haut du fichier
import { getInitials } from '@/lib/stringUtils'
```

#### Validation

- [ ] Aucune définition locale de `getInitials` restante
- [ ] Tous les avatars affichent les bonnes initiales
- [ ] L'app compile sans erreurs

---

### ✅ TÂCHE 1.3 : Créer `lib/authHelpers.ts`

**Priorité**: 🔴 P0  
**Effort**: 6h  
**Impact**: Réduction de 300+ lignes dupliquées

#### Fichier à créer

**`lib/authHelpers.ts`**

```typescript
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

/**
 * Résultat avec erreur.
 */
export type ErrorResult = {
  error: string
}

/**
 * Vérifie qu'un utilisateur est authentifié.
 * @returns User ou erreur
 */
export async function requireUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Non connecté.' } as ErrorResult
  }

  return { user }
}

/**
 * Récupère le profil d'un utilisateur.
 * @param supabase - Client Supabase
 * @param userId - ID de l'utilisateur
 * @param fields - Champs à sélectionner (défaut: 'role')
 * @returns Profil ou null
 */
export async function getProfile(
  supabase: SupabaseClient,
  userId: string,
  fields: string = 'role'
): Promise<Partial<Profile> | null> {
  const { data } = await supabase.from('profiles').select(fields).eq('user_id', userId).single()
  return data
}

/**
 * Vérifie qu'un utilisateur est un coach ou l'athlète concerné.
 * Utilisé dans les actions workouts, objectifs, etc.
 * 
 * @param supabase - Client Supabase
 * @param athleteId - ID de l'athlète
 * @returns User + profiles ou erreur
 */
export async function requireCoachOrAthleteAccess(
  supabase: SupabaseClient,
  athleteId: string
): Promise<
  | ErrorResult
  | {
      user: { id: string; email: string }
      profile: Partial<Profile>
      athleteProfile: Partial<Profile>
    }
> {
  const userResult = await requireUser(supabase)
  if ('error' in userResult) return userResult

  const { user } = userResult

  const [myProfile, athleteProfile] = await Promise.all([
    getProfile(supabase, user.id, 'role, user_id'),
    getProfile(supabase, athleteId, 'coach_id, user_id'),
  ])

  if (!myProfile || !athleteProfile) {
    return { error: 'Profil introuvable.' }
  }

  const isCoach = myProfile.role === 'coach' && athleteProfile.coach_id === user.id
  const isAthlete = myProfile.role === 'athlete' && user.id === athleteId

  if (!isCoach && !isAthlete) {
    return { error: 'Accès refusé.' }
  }

  return { user, profile: myProfile, athleteProfile }
}

/**
 * Vérifie qu'un utilisateur a un rôle spécifique.
 * @param supabase - Client Supabase
 * @param requiredRole - Rôle requis ('coach', 'admin', etc.)
 * @returns User + profile ou erreur
 */
export async function requireRole(
  supabase: SupabaseClient,
  requiredRole: 'coach' | 'admin' | 'athlete'
): Promise<ErrorResult | { user: { id: string; email: string }; profile: Partial<Profile> }> {
  const userResult = await requireUser(supabase)
  if ('error' in userResult) return userResult

  const { user } = userResult
  const profile = await getProfile(supabase, user.id, 'role, user_id, email')

  if (!profile || profile.role !== requiredRole) {
    return { error: 'Accès refusé. Rôle requis : ' + requiredRole }
  }

  return { user, profile }
}
```

#### Fichiers à refactoriser

**1. `app/dashboard/workouts/actions.ts`**

Avant (15 lignes dans `createWorkout`):

```typescript
export async function createWorkout(athleteId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const { data: athleteProfile } = await supabase
    .from('profiles')
    .select('coach_id')
    .eq('user_id', athleteId)
    .single()

  const isCoach = profile?.role === 'coach' && athleteProfile?.coach_id === user.id
  const isAthlete = profile?.role === 'athlete' && user.id === athleteId

  if (!isCoach && !isAthlete) {
    return { error: 'Accès refusé.' }
  }

  // ... reste du code
}
```

Après (3 lignes):

```typescript
import { requireCoachOrAthleteAccess } from '@/lib/authHelpers'

export async function createWorkout(athleteId: string, formData: FormData) {
  const supabase = await createClient()
  const result = await requireCoachOrAthleteAccess(supabase, athleteId)
  if ('error' in result) return result

  const { user } = result

  // ... reste du code (validation, insert)
}
```

**Appliquer le même pattern dans**:

- `updateWorkout`
- `deleteWorkout`
- `getWorkoutsForDateRange`
- `getImportedActivityWeeklyTotals`
- `getWorkoutWeeklyTotals`
- `addAthleteComment`

**2. `app/dashboard/objectifs/actions.ts`**

```typescript
import { requireUser, getProfile } from '@/lib/authHelpers'

export async function addGoal(formData: FormData) {
  const supabase = await createClient()
  const result = await requireUser(supabase)
  if ('error' in result) return result

  const { user } = result
  const profile = await getProfile(supabase, user.id, 'role')

  if (profile?.role !== 'athlete') {
    return { error: 'Seuls les athlètes peuvent créer des objectifs.' }
  }

  // ... reste du code
}
```

**3. `app/dashboard/profile/offers/actions.ts`**

```typescript
import { requireRole } from '@/lib/authHelpers'

export async function saveOffers(formData: FormData) {
  const supabase = await createClient()
  const result = await requireRole(supabase, 'coach')
  if ('error' in result) return result

  const { user } = result

  // ... reste du code
}
```

**4. `app/admin/members/actions.ts`**

```typescript
import { requireRole } from '@/lib/authHelpers'

export async function updateMemberRole(userId: string, newRole: Role) {
  const supabase = await createClient()
  const result = await requireRole(supabase, 'admin')
  if ('error' in result) return result

  // ... reste du code
}
```

#### Validation

- [ ] Toutes les actions utilisent les helpers
- [ ] Aucune duplication d'auth check restante
- [ ] Tests manuels : essayer d'accéder aux workouts d'un autre athlète (doit échouer)
- [ ] Tests manuels : coach peut bien modifier ses athlètes
- [ ] Tests manuels : admin peut bien gérer les rôles

---

### ✅ TÂCHE 1.4 : Créer `lib/workoutValidation.ts`

**Priorité**: 🔴 P0  
**Effort**: 3h  
**Impact**: Réduction de 60 lignes dupliquées

#### Fichier à créer

**`lib/workoutValidation.ts`**

```typescript
import type { SportType } from '@/types/database'

export const VALID_SPORT_TYPES: SportType[] = [
  'course',
  'velo',
  'natation',
  'musculation',
  'nordic_ski',
  'backcountry_ski',
  'ice_skating',
]

export type WorkoutTargets = {
  target_duration_minutes: number | null
  target_distance_km: number | null
  target_elevation_m: number | null
  target_pace: number | null
}

export type ValidatedWorkoutData = {
  date: string
  sportType: SportType
  title: string
  description: string
  targets: WorkoutTargets
}

/**
 * Parse et valide les targets d'un workout depuis FormData.
 * Extrait duration, distance, elevation, pace selon le sport.
 */
function parseWorkoutTargets(formData: FormData, sportType: SportType): WorkoutTargets {
  const durationStr = formData.get('target_duration_minutes') as string
  const distanceStr = formData.get('target_distance_km') as string
  const elevationStr = formData.get('target_elevation_m') as string
  const paceStr = formData.get('target_pace') as string

  const duration = durationStr ? parseFloat(durationStr) : null
  const distance = distanceStr ? parseFloat(distanceStr) : null
  const elevation = elevationStr ? parseFloat(elevationStr) : null
  const pace = paceStr ? parseFloat(paceStr) : null

  // Validation: au moins duration OU distance
  if (!duration && !distance) {
    throw new Error('Au moins une durée ou une distance est requise.')
  }

  // Validation pace pour course, velo, natation
  if (['course', 'velo', 'natation'].includes(sportType) && pace && pace <= 0) {
    throw new Error('L\'allure/vitesse doit être positive.')
  }

  return {
    target_duration_minutes: duration,
    target_distance_km: distance,
    target_elevation_m: elevation,
    target_pace: pace,
  }
}

/**
 * Valide les données d'un formulaire de workout (create ou update).
 * @throws Error si validation échoue
 */
export function validateWorkoutFormData(formData: FormData): ValidatedWorkoutData {
  const date = formData.get('date') as string
  if (!date) throw new Error('Date requise.')

  const sportType = formData.get('sport_type') as string
  if (!VALID_SPORT_TYPES.includes(sportType as SportType)) {
    throw new Error('Sport invalide.')
  }

  const title = formData.get('title') as string
  if (!title || title.trim().length < 3) {
    throw new Error('Titre requis (min 3 caractères).')
  }

  const description = (formData.get('description') as string) || ''

  const targets = parseWorkoutTargets(formData, sportType as SportType)

  return {
    date,
    sportType: sportType as SportType,
    title: title.trim(),
    description: description.trim(),
    targets,
  }
}
```

#### Fichiers à refactoriser

**`app/dashboard/workouts/actions.ts`**

Avant (`createWorkout`, lignes 96-115):

```typescript
const date = formData.get('date') as string
if (!date) return { error: 'Date requise.' }

const sportType = formData.get('sport_type') as string
const validSports = ['course', 'velo', 'natation', 'musculation', 'nordic_ski', 'backcountry_ski', 'ice_skating']
if (!validSports.includes(sportType)) {
  return { error: 'Sport invalide.' }
}

const title = formData.get('title') as string
if (!title) return { error: 'Titre requis.' }

const description = (formData.get('description') as string) || ''

// Targets
const durationStr = formData.get('target_duration_minutes') as string
// ... 10 lignes de plus
```

Après:

```typescript
import { validateWorkoutFormData } from '@/lib/workoutValidation'

export async function createWorkout(athleteId: string, formData: FormData) {
  const supabase = await createClient()
  const result = await requireCoachOrAthleteAccess(supabase, athleteId)
  if ('error' in result) return result

  try {
    const workoutData = validateWorkoutFormData(formData)

    const { error: insertError } = await supabase.from('workouts').insert({
      athlete_id: athleteId,
      date: workoutData.date,
      sport_type: workoutData.sportType,
      title: workoutData.title,
      description: workoutData.description,
      ...workoutData.targets,
    })

    if (insertError) return { error: insertError.message }

    revalidatePath(pathToRevalidate)
    return {}
  } catch (err: any) {
    return { error: err.message }
  }
}
```

Appliquer le même pattern dans `updateWorkout`.

#### Validation

- [ ] `createWorkout` et `updateWorkout` utilisent `validateWorkoutFormData`
- [ ] Messages d'erreur cohérents entre création et mise à jour
- [ ] Validation fonctionne (tester avec des données invalides)

---

### ✅ TÂCHE 1.5 : Créer `lib/logger.ts` et remplacer console.log

**Priorité**: 🟡 P1 / P2  
**Effort**: 1h  
**Impact**: Prêt pour monitoring en production

#### Fichier à créer

**`lib/logger.ts`**

```typescript
/**
 * Logger centralisé pour l'application.
 * En dev: log dans la console
 * En prod: envoie vers un service de monitoring (Sentry, LogRocket, etc.)
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug'

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    this.log('error', message, error, context)
    
    // En production, envoyer à Sentry ou autre service
    if (!this.isDev && typeof window !== 'undefined') {
      // Exemple avec Sentry (à activer quand configuré):
      // Sentry.captureException(error, { tags: context })
    }
  }

  warn(message: string, data?: unknown) {
    this.log('warn', message, data)
  }

  info(message: string, data?: unknown) {
    this.log('info', message, data)
  }

  debug(message: string, data?: unknown) {
    if (this.isDev) {
      this.log('debug', message, data)
    }
  }

  private log(level: LogLevel, message: string, data?: unknown, context?: Record<string, unknown>) {
    if (!this.isDev) return // En prod, on ne log pas dans la console

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    switch (level) {
      case 'error':
        console.error(prefix, message, data, context)
        break
      case 'warn':
        console.warn(prefix, message, data)
        break
      case 'info':
        console.log(prefix, message, data)
        break
      case 'debug':
        console.debug(prefix, message, data)
        break
    }
  }
}

export const logger = new Logger()
```

#### Fichiers à modifier

Remplacer tous les `console.error` par `logger.error`:

1. **`app/dashboard/actions.ts:79`**

```typescript
// Avant
console.error('Mise à jour practiced_sports:', updateError.message)

// Après
import { logger } from '@/lib/logger'
logger.error('Mise à jour practiced_sports:', updateError)
```

2. **`app/dashboard/profile/ProfileForm.tsx:178`**
3. **`app/dashboard/devices/actions.ts:65,122`**
4. **`app/api/auth/strava/callback/route.ts:80,111,117`**
5. **`app/api/auth/strava/route.ts:62`**

#### Validation

- [ ] Aucun `console.log`, `console.error`, `console.warn` restant (vérifier avec grep)
- [ ] Les logs apparaissent toujours en développement
- [ ] En production (build), les logs n'apparaissent pas dans la console du navigateur

---

### ✅ TÂCHE 1.6 : Nettoyer le code mort

**Priorité**: 🔵 P2  
**Effort**: 30 min  
**Impact**: Clarté du code

#### Actions

1. **Supprimer `formatSportPracticedDisplay`** dans `app/dashboard/RequestCoachButton.tsx:27`
2. **Supprimer `updateAvatarUrl`** dans `app/dashboard/profile/actions.ts:79`
3. **Supprimer le ré-export** `export { PRACTICED_SPORTS_OPTIONS }` dans `RequestCoachButton.tsx:12`
4. **Supprimer la prop `onToday`** de `WeekSelector.tsx` (ou l'implémenter si utile)

#### Validation

- [ ] `npm run lint` ne signale aucun export inutilisé
- [ ] L'app compile sans erreurs

---

## 📊 FIN DU SPRINT 1 - CHECKPOINT

### Résultats Attendus

| Métrique | Avant | Après Sprint 1 | Objectif Atteint |
|----------|-------|----------------|------------------|
| Duplication | 15% | 8% | ✅ |
| Fichiers helpers | 0 | 5 | ✅ |
| Console.log prod | 7 | 0 | ✅ |
| Code mort nettoyé | - | 4 exports | ✅ |
| Lignes réduites | - | ~500 lignes | ✅ |

### Revue de Code (Checklist)

- [ ] Tous les utilitaires date/string sont importés depuis `/lib`
- [ ] Toutes les actions utilisent les helpers auth
- [ ] Aucune duplication d'auth check restante
- [ ] Aucun console.log en production
- [ ] App compile sans erreurs TypeScript
- [ ] Tests manuels passent (calendrier, workouts, auth)
- [ ] Performance identique ou améliorée

### Prochaine Étape

**Sprint 2** : Refactoriser les composants (modals, layouts, styles).

---

## 🚀 SPRINT 2 - COMPOSANTS (2 semaines)

**Objectif**: Consolider les composants visuels et réduire la duplication de markup.

**Effort total**: 12h  
**Impact**: 🟡 Élevé

---

### ✅ TÂCHE 2.1 : Créer `components/icons/IconClose.tsx`

**Priorité**: 🟡 P1  
**Effort**: 30 min  
**Impact**: Cohérence visuelle

#### Fichier à créer

**`components/icons/IconClose.tsx`**

```typescript
interface IconCloseProps {
  className?: string
}

export function IconClose({ className = 'w-5 h-5' }: IconCloseProps) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
```

#### Fichiers à modifier

Remplacer le SVG inline dans:

1. `components/LoginForm.tsx` (3 occurrences)
2. `components/WorkoutModal.tsx` (L365-367)
3. `components/Modal.tsx` (L167-179)
4. `components/CalendarView.tsx` (L1200, L1411)
5. `components/ChatModule.tsx` (L203-214)

**Avant**:

```tsx
<svg className="w-5 h-5" fill="none" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
</svg>
```

**Après**:

```tsx
import { IconClose } from '@/components/icons/IconClose'

<IconClose className="w-5 h-5" />
```

---

### ✅ TÂCHE 2.2 : Refactoriser les modals pour utiliser `<Modal>`

**Priorité**: 🟡 P1  
**Effort**: 4h  
**Impact**: Réduction de 150 lignes

#### A. Refactoriser `LoginModal`

**Avant** (`components/LoginModal.tsx`, 35 lignes):

```tsx
export default function LoginModal({ isOpen, onClose, mode, onModeChange }: LoginModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <LoginForm mode={mode} onModeChange={onModeChange} onClose={onClose} />
      </div>
    </div>,
    document.body
  )
}
```

**Après** (10 lignes):

```tsx
import { Modal } from '@/components/Modal'

export default function LoginModal({ isOpen, onClose, mode, onModeChange }: LoginModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <LoginForm mode={mode} onModeChange={onModeChange} onClose={onClose} />
    </Modal>
  )
}
```

#### B. Refactoriser `WorkoutModal`

**`components/WorkoutModal.tsx`** (actuellement 540 lignes)

Le modal réimplémente tout le layout. Utiliser `<Modal>` avec `title` et `footer`:

```tsx
import { Modal } from '@/components/Modal'

export default function WorkoutModal({ isOpen, onClose, workout, ... }: WorkoutModalProps) {
  // ... state et logique de formulaire (garder)

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={handleClose}>
        Annuler
      </Button>
      <Button type="submit" variant="primary">
        {workout ? 'Mettre à jour' : 'Créer'}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={workout ? 'Modifier la séance' : 'Nouvelle séance'}
      size="lg"
      footer={footer}
    >
      <form action={handleSubmit}>
        {/* Contenu du formulaire (garder) */}
      </form>
    </Modal>
  )
}
```

**Vérifier** que `Modal.tsx` supporte bien la prop `footer`. Si non, l'ajouter:

```tsx
// components/Modal.tsx
interface ModalProps {
  // ... props existantes
  footer?: React.ReactNode  // AJOUTER
}

export function Modal({ isOpen, onClose, title, children, footer, size }: ModalProps) {
  return (
    // ... overlay et dialog
    {children}
    
    {footer && (
      <div className="shrink-0 px-6 py-4 border-t border-stone-100 bg-stone-50/30 flex justify-end gap-3">
        {footer}
      </div>
    )}
  )
}
```

#### C. Refactoriser `ChatModule`

Le `ChatOverlay` dans `ChatModule` réimplémente un modal. Options:

1. Utiliser `<Modal>` avec `alignment="right"` (si supporté)
2. Ou créer un `<Drawer>` component séparé pour les panneaux latéraux

**Recommandation**: Garder `ChatOverlay` tel quel pour l'instant (comportement différent d'un modal centré), mais harmoniser le z-index et l'overlay.

**Modifier**:

```tsx
// ChatModule.tsx, ligne overlay
className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[90] flex items-end sm:items-center sm:justify-end p-4"
//                                                             ^^^^ Aligner avec Modal.tsx
```

---

### ✅ TÂCHE 2.3 : Créer `lib/formStyles.ts`

**Priorité**: 🟡 P1  
**Effort**: 2h  
**Impact**: Cohérence des formulaires

#### Fichier à créer

**`lib/formStyles.ts`**

```typescript
/**
 * Styles partagés pour les composants de formulaire (Input, Textarea).
 */

export const FORM_BASE_CLASSES =
  'w-full px-4 py-3 rounded-xl border border-stone-200 bg-white ' +
  'focus:border-palette-forest-dark focus:ring-2 focus:ring-palette-forest-dark/10 ' +
  'transition-all duration-200 outline-none ' +
  'placeholder:text-stone-400'

export const FORM_DISABLED_READONLY_CLASSES = 'bg-stone-100 cursor-not-allowed text-stone-500 border-stone-200'

export const FORM_ERROR_CLASSES =
  'border-palette-danger/40 bg-palette-danger-light/30 ' +
  'focus:border-palette-danger focus:ring-palette-danger/10'

/**
 * Classe de label standard pour les formulaires.
 */
export const FORM_LABEL_CLASSES = 'block text-sm font-medium text-stone-700 mb-2'
```

#### Fichiers à modifier

1. **`components/Input.tsx`**

Avant (L8-16):

```typescript
const BASE_CLASSES = 'w-full px-4 py-3 rounded-xl border ...'
const DISABLED_READONLY_CLASSES = 'bg-stone-100 cursor-not-allowed text-stone-500'
const ERROR_CLASSES = 'border-palette-danger/40 bg-palette-danger-light/30'
```

Après:

```typescript
import { FORM_BASE_CLASSES, FORM_DISABLED_READONLY_CLASSES, FORM_ERROR_CLASSES } from '@/lib/formStyles'

const classes = cn(
  FORM_BASE_CLASSES,
  isDisabled && FORM_DISABLED_READONLY_CLASSES,
  error && FORM_ERROR_CLASSES,
  className
)
```

2. **`components/Textarea.tsx`** (identique)

---

### ✅ TÂCHE 2.4 : Créer `DashboardPageShell`

**Priorité**: 🟡 P1  
**Effort**: 3h  
**Impact**: Réduction de 200 lignes

#### Fichier à créer

**`components/DashboardPageShell.tsx`**

```typescript
import { cn } from '@/lib/utils' // Si vous utilisez shadcn/ui, sinon créer cette fonction
import { PageHeader } from '@/components/PageHeader'

interface DashboardPageShellProps {
  title: string
  rightContent?: React.ReactNode
  children: React.ReactNode
  className?: string
  /** Permet de désactiver le scroll automatique si le contenu gère lui-même (ex: calendrier) */
  noScroll?: boolean
}

export function DashboardPageShell({
  title,
  rightContent,
  children,
  className,
  noScroll = false,
}: DashboardPageShellProps) {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      <PageHeader title={title} rightContent={rightContent} />
      
      <div
        className={cn(
          'flex-1 px-6 lg:px-8 py-6',
          !noScroll && 'overflow-y-auto',
          className
        )}
      >
        {children}
      </div>
    </main>
  )
}
```

#### Fichiers à modifier

Remplacer dans 8+ fichiers:

1. **`app/dashboard/calendar/page.tsx`**
2. **`app/dashboard/coach/page.tsx`**
3. **`app/dashboard/objectifs/page.tsx`**
4. **`app/dashboard/profile/page.tsx`**
5. **`app/dashboard/devices/page.tsx`**
6. **`app/dashboard/admin/design-system/page.tsx`**

**Avant** (15 lignes):

```tsx
<main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
  <PageHeader title="Mon Calendrier" rightContent={...} />
  <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
    {/* contenu */}
  </div>
</main>
```

**Après** (5 lignes):

```tsx
import { DashboardPageShell } from '@/components/DashboardPageShell'

<DashboardPageShell title="Mon Calendrier" rightContent={...}>
  {/* contenu */}
</DashboardPageShell>
```

**Note**: Pour `app/dashboard/page.tsx` (coach view), remplacer le header custom par `PageHeader` puis utiliser le shell.

---

### ✅ TÂCHE 2.5 : Consolider styles sport dans `lib/sportStyles.ts`

**Priorité**: 🟡 P1  
**Effort**: 2h  
**Impact**: Source unique pour les couleurs sport

#### Problème

`CalendarView.tsx` (L11-119) redéfinit:

- `SPORT_LABELS`
- `SPORT_ICONS` 
- `SPORT_CARD_STYLES`
- `SPORT_COLORS`

#### Solution

Étendre `lib/sportStyles.ts`:

```typescript
// lib/sportStyles.ts (AJOUTER)

/**
 * Styles pour les cartes workout dans le calendrier.
 */
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
    borderLeft: 'border-l-stone-400',
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
}

/**
 * Couleurs hexadécimales par sport (pour graphiques, etc.).
 */
export const SPORT_COLORS: Record<SportType, string> = {
  course: '#627e59',
  velo: '#8e9856',
  natation: '#0ea5e9',
  musculation: '#78716c',
  nordic_ski: '#aaaa51',
  backcountry_ski: '#cbb44b',
  ice_skating: '#06b6d4',
}
```

#### Fichier à modifier

**`components/CalendarView.tsx`**

- Supprimer lignes 11-119 (toutes les définitions locales)
- Ajouter en haut:

```tsx
import { 
  SPORT_LABELS, 
  SPORT_ICONS, 
  SPORT_CARD_STYLES, 
  SPORT_COLORS 
} from '@/lib/sportStyles'
```

---

### ✅ TÂCHE 2.6 : Aligner loading states avec pages

**Priorité**: 🔵 P2  
**Effort**: 2h  
**Impact**: UX fluidité

#### Fichiers à modifier

1. **`app/dashboard/athletes/[athleteId]/loading.tsx`**

Avant (full page):

```tsx
<div className="min-h-screen bg-stone-50">
```

Après (dashboard layout):

```tsx
<main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
  <div className="shrink-0 px-6 lg:px-8 h-20 flex items-center justify-between border-b border-stone-100 bg-stone-50/50">
    <div className="h-6 w-48 bg-stone-200 rounded animate-pulse" />
  </div>
  <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 space-y-4">
    <div className="h-32 bg-stone-100 rounded-xl animate-pulse" />
    <div className="h-64 bg-stone-100 rounded-xl animate-pulse" />
  </div>
</main>
```

2. **`app/dashboard/loading.tsx`** (même pattern)
3. **`app/admin/members/loading.tsx`** : corriger les classes de border/bg pour matcher la page

---

### ✅ TÂCHE 2.7 : Ajouter métadonnées SEO

**Priorité**: 🔵 P2  
**Effort**: 1h  
**Impact**: Référencement

#### Fichiers à modifier

1. **`app/layout.tsx`**

```typescript
export const metadata: Metadata = {
  title: {
    default: 'Coach Pro - Coaching sportif personnalisé',
    template: '%s | Coach Pro',
  },
  description:
    'Plateforme de coaching sportif : programmes d\'entraînement sur mesure, suivi en temps réel, synchronisation Strava et messagerie directe avec votre coach.',
  keywords: ['coaching sportif', 'entraînement', 'running', 'cyclisme', 'triathlon', 'Strava'],
  authors: [{ name: 'Coach Pro' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Coach Pro',
  },
}
```

2. **Ajouter dans les pages principales**:

```typescript
// app/login/page.tsx
export const metadata: Metadata = {
  title: 'Connexion',
}

// app/dashboard/page.tsx
export const metadata: Metadata = {
  title: 'Tableau de bord',
}

// app/dashboard/calendar/page.tsx
export const metadata: Metadata = {
  title: 'Mon Calendrier',
}
```

---

## 📊 FIN DU SPRINT 2 - CHECKPOINT

### Résultats Attendus

| Métrique | Avant | Après Sprint 2 | Objectif |
|----------|-------|----------------|----------|
| Duplication | 8% | 5% | ✅ |
| Modals utilisant `<Modal>` | 0/3 | 2/3 | ✅ |
| Pages avec `DashboardPageShell` | 0 | 8+ | ✅ |
| Métadonnées SEO | 0 | 5+ pages | ✅ |
| Loading states alignés | 0/3 | 3/3 | ✅ |

### Revue de Code

- [ ] Tous les modals (sauf Chat) utilisent `<Modal>`
- [ ] Toutes les pages dashboard utilisent `DashboardPageShell`
- [ ] Styles sport centralisés dans `lib/sportStyles.ts`
- [ ] Styles formulaire centralisés dans `lib/formStyles.ts`
- [ ] Loading states ressemblent aux pages réelles
- [ ] Métadonnées SEO présentes sur les pages principales

---

## 🚀 SPRINT 3 - ROBUSTESSE (2 semaines)

**Objectif**: Améliorer la gestion des erreurs et la documentation.

**Effort total**: 8h  
**Impact**: 🟡 Élevé

---

### ✅ TÂCHE 3.1 : Créer error boundaries

**Priorité**: 🟡 P1  
**Effort**: 2h

#### Fichiers à créer

**1. `app/error.tsx`** (root error boundary)

```tsx
'use client'

import { Button } from '@/components/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-lg">
        <div className="text-palette-danger mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-bold text-stone-800 mb-2 text-center">Une erreur est survenue</h2>
        
        <p className="text-stone-600 text-sm mb-6 text-center">
          {error.message || 'Une erreur inattendue s\'est produite.'}
        </p>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.location.href = '/'} className="flex-1">
            Retour à l'accueil
          </Button>
          <Button variant="primary" onClick={reset} className="flex-1">
            Réessayer
          </Button>
        </div>
      </div>
    </div>
  )
}
```

**2. `app/dashboard/error.tsx`** (dashboard-specific)

```tsx
'use client'

import { Button } from '@/components/Button'
import { DashboardPageShell } from '@/components/DashboardPageShell'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <DashboardPageShell title="Erreur">
      <div className="flex items-center justify-center h-full">
        <div className="max-w-md w-full p-8 bg-palette-danger-light/30 rounded-2xl border border-palette-danger/20">
          <h2 className="text-lg font-bold text-palette-danger mb-4">Une erreur est survenue</h2>
          <p className="text-stone-700 text-sm mb-6">{error.message}</p>
          <Button variant="primary" onClick={reset}>
            Réessayer
          </Button>
        </div>
      </div>
    </DashboardPageShell>
  )
}
```

---

### ✅ TÂCHE 3.2 : Créer types d'erreur structurés

**Priorité**: 🟡 P1  
**Effort**: 3h

#### Fichier à créer

**`lib/errors.ts`**

```typescript
/**
 * Types et helpers pour la gestion d'erreurs structurées.
 */

export type ErrorCode =
  | 'AUTH_REQUIRED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'RATE_LIMIT'

export type ApiError = {
  error: string
  code?: ErrorCode
}

export type ApiSuccess<T> = {
  data: T
}

export type ApiResult<T> = ApiSuccess<T> | ApiError

/**
 * Crée une erreur structurée avec un code.
 */
export function createError(message: string, code?: ErrorCode): ApiError {
  return { error: message, code }
}

/**
 * Type guard pour vérifier si un résultat est une erreur.
 */
export function isError<T>(result: ApiResult<T>): result is ApiError {
  return 'error' in result
}

/**
 * Type guard pour vérifier si un résultat est un succès.
 */
export function isSuccess<T>(result: ApiResult<T>): result is ApiSuccess<T> {
  return 'data' in result
}
```

#### Exemples d'utilisation

**Dans une action**:

```typescript
import { createError, isError, type ApiResult } from '@/lib/errors'
import type { CoachRequest } from '@/types/database'

export async function getMyCoachRequests(): Promise<ApiResult<CoachRequest[]>> {
  const supabase = await createClient()
  const result = await requireUser(supabase)
  
  if ('error' in result) {
    return createError('Non connecté.', 'AUTH_REQUIRED')
  }

  const { user } = result
  const { data, error } = await supabase
    .from('coach_requests')
    .select('*')
    .eq('athlete_id', user.id)

  if (error) {
    return createError(error.message, 'SERVER_ERROR')
  }

  return { data: data || [] }
}
```

**Dans un composant**:

```tsx
const result = await getMyCoachRequests()

if (isError(result)) {
  if (result.code === 'AUTH_REQUIRED') {
    router.push('/login')
  } else {
    setError(result.error)
  }
  return
}

setRequests(result.data)
```

#### Actions à refactoriser

1. `app/dashboard/actions.ts` : `getMyCoachRequests`, `getPendingCoachRequests`
2. `app/dashboard/coach/actions.ts` : `getMyCoachRating`
3. `app/dashboard/devices/actions.ts` : `disconnectStrava` (ajouter error handling)

---

### ✅ TÂCHE 3.3 : Mettre à jour la documentation

**Priorité**: 🔵 P2  
**Effort**: 1h

#### Actions

1. **Archiver les docs obsolètes**:

```bash
mkdir -p docs/archive
mv docs/DESIGN_SYSTEM_AUDIT.md docs/archive/
mv docs/DESIGN_SYSTEM_AUDIT_V2.md docs/archive/
```

2. **Corriger `docs/DESIGN_SYSTEM.md`** (lignes 428-436):

```markdown
### Icônes Disponibles

- `IconRunning` : Course à pied
- `IconBiking` : Vélo (non `IconBike`)
- `IconSwimming` : Natation (utilisé aussi pour triathlon)
- `IconDumbbell` : Musculation
- `IconNordicSki` : Ski de fond (non `IconSkiNordic`)
- `IconBackcountrySki` : Ski de randonnée (non `IconSkiBackcountry`)
- `IconIceSkating` : Patin à glace
```

3. **Mettre à jour `docs/FIX_ATHLETE_MODAL_INTERACTION.md`**:

Supprimer les références aux numéros de lignes obsolètes, ou indiquer que le fichier est historique.

4. **Créer `docs/HELPERS.md`** pour documenter les nouveaux helpers:

```markdown
# Helpers et Utilitaires

## `lib/dateUtils.ts`

Fonctions de manipulation de dates :

- `getWeekMonday(date)` : Retourne le lundi de la semaine
- `toDateStr(date)` : Convertit en YYYY-MM-DD
- `formatDateFr(date)` : Formate en français long
- `getDaysUntil(date)` : Nombre de jours jusqu'à une date
- `formatShortDate(date)` : Format DD/MM/YYYY

## `lib/authHelpers.ts`

Helpers d'authentification et autorisation :

- `requireUser(supabase)` : Vérifie l'authentification
- `getProfile(supabase, userId, fields)` : Récupère un profil
- `requireCoachOrAthleteAccess(supabase, athleteId)` : Vérifie l'accès coach/athlète
- `requireRole(supabase, role)` : Vérifie un rôle spécifique

## `lib/workoutValidation.ts`

Validation des formulaires workout :

- `validateWorkoutFormData(formData)` : Valide un workout (create/update)

## `lib/errors.ts`

Gestion d'erreurs structurées :

- `createError(message, code)` : Crée une ApiError
- `isError(result)` : Type guard pour erreurs
- `isSuccess(result)` : Type guard pour succès
```

---

### ✅ TÂCHE 3.4 : Optimiser les images et bundle

**Priorité**: 🔵 P2  
**Effort**: 2h

#### Actions

1. **Ajouter Supabase Storage dans `next.config.ts`**:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
}
```

2. **Dynamic imports pour ChatModule et WorkoutModal**:

```tsx
// app/dashboard/calendar/page.tsx
import dynamic from 'next/dynamic'

const WorkoutModal = dynamic(() => import('@/components/WorkoutModal'), {
  loading: () => <div>Chargement...</div>,
})
```

3. **Paralléliser les requêtes Supabase dans `dashboard/page.tsx`**:

Avant (séquentiel):

```typescript
const workouts = await getWorkouts()
const goals = await getGoals()
const requests = await getRequests()
```

Après (parallèle):

```typescript
const [workouts, goals, requests] = await Promise.all([
  getWorkouts(),
  getGoals(),
  getRequests(),
])
```

---

## 📊 FIN DU SPRINT 3 - CHECKPOINT

### Résultats

| Métrique | Avant | Après Sprint 3 | Cible |
|----------|-------|----------------|-------|
| Error boundaries | 0 | 2 | ✅ |
| Actions avec ApiResult | 0 | 5+ | ✅ |
| Docs à jour | 50% | 90% | ✅ |
| Images optimisées | Non | Oui | ✅ |

---

## 🚀 SPRINT 4 - QUALITÉ (3-4 semaines)

**Objectif**: Ajouter des tests et améliorer l'accessibilité.

**Effort total**: 30h+  
**Impact**: 🟢 Long terme

### Tâches

1. **Configurer Vitest + Testing Library** (2h)
2. **Tests unitaires pour helpers** (8h)
   - `dateUtils.test.ts`
   - `authHelpers.test.ts`
   - `workoutValidation.test.ts`
3. **Tests composants** (10h)
   - `Button.test.tsx`
   - `Input.test.tsx`
   - `Modal.test.tsx`
4. **Tests E2E avec Playwright** (10h)
   - Parcours signup → login → create workout
   - Tests de régression modales
5. **Améliorer l'accessibilité** (4-6h)
   - Focus traps dans modals
   - Labels ARIA
   - Contraste couleurs
6. **Types Supabase auto-générés** (1h)

---

## 📈 SUIVI DES MÉTRIQUES

### Dashboard de Progression

| Sprint | Semaines | Duplication | Tests | Erreurs Prod | Statut |
|--------|----------|-------------|-------|--------------|--------|
| Sprint 1 | S1-S2 | 15% → 8% | 0% | 7 → 0 | 🔴 À FAIRE |
| Sprint 2 | S3-S4 | 8% → 5% | 0% | 0 | 🔴 À FAIRE |
| Sprint 3 | S5-S6 | 5% | 0% → 30% | 0 | 🔴 À FAIRE |
| Sprint 4 | S7-S10 | < 5% | 30% → 70% | 0 | 🔴 À FAIRE |

### Checklist Globale

#### Sprint 1 - Fondations
- [ ] Tâche 1.1 : `lib/dateUtils.ts` créé et utilisé partout
- [ ] Tâche 1.2 : `lib/stringUtils.ts` créé et utilisé partout
- [ ] Tâche 1.3 : `lib/authHelpers.ts` créé et utilisé dans toutes les actions
- [ ] Tâche 1.4 : `lib/workoutValidation.ts` créé et utilisé
- [ ] Tâche 1.5 : `lib/logger.ts` créé, aucun console.log restant
- [ ] Tâche 1.6 : Code mort nettoyé

#### Sprint 2 - Composants
- [ ] Tâche 2.1 : `IconClose` créé et utilisé partout
- [ ] Tâche 2.2 : Modals refactorisés pour utiliser `<Modal>`
- [ ] Tâche 2.3 : `lib/formStyles.ts` créé et utilisé
- [ ] Tâche 2.4 : `DashboardPageShell` créé et utilisé dans 8+ pages
- [ ] Tâche 2.5 : Styles sport consolidés dans `lib/sportStyles.ts`
- [ ] Tâche 2.6 : Loading states alignés avec pages
- [ ] Tâche 2.7 : Métadonnées SEO ajoutées

#### Sprint 3 - Robustesse
- [ ] Tâche 3.1 : Error boundaries créés (`app/error.tsx`, `app/dashboard/error.tsx`)
- [ ] Tâche 3.2 : Types erreur structurés (`lib/errors.ts`) utilisés
- [ ] Tâche 3.3 : Documentation mise à jour
- [ ] Tâche 3.4 : Images et bundle optimisés

#### Sprint 4 - Qualité
- [ ] Tests unitaires configurés (Vitest)
- [ ] Tests unitaires helpers (coverage > 80%)
- [ ] Tests composants (coverage > 60%)
- [ ] Tests E2E (Playwright, parcours critiques)
- [ ] Accessibilité améliorée (focus traps, ARIA, contraste)
- [ ] Types Supabase auto-générés configurés

---

## 🎯 PROCHAINES ÉTAPES IMMÉDIATES

### Cette Semaine (Priorité Absolue)

1. ✅ **Créer `lib/dateUtils.ts`** (2h)
   - Copier le code du template ci-dessus
   - Remplacer toutes les occurrences dans 7 fichiers
   - Tester que les calendriers fonctionnent

2. ✅ **Créer `lib/stringUtils.ts`** (1h)
   - Copier le code du template
   - Remplacer dans 5 fichiers
   - Vérifier les avatars

3. ✅ **Créer `lib/authHelpers.ts`** (6h)
   - Copier le template
   - Refactoriser `workouts/actions.ts` (6 fonctions)
   - Refactoriser `objectifs/actions.ts`
   - Refactoriser `profile/offers/actions.ts`
   - Refactoriser `admin/members/actions.ts`

**Total**: 9h de travail concentré = **gain immédiat de ~400 lignes de code en moins**.

---

## 📞 SUPPORT

Pour toute question sur ce plan:

- Consulter `AUDIT_COMPLET.md` pour le contexte détaillé
- Créer un ticket GitHub avec le tag `refactoring`
- Documenter les décisions dans `docs/ADR/` (Architecture Decision Records)

**Bon courage pour la refactorisation ! 🚀**

# 📊 AUDIT COMPLET DU CODE - My Coaching App

**Date**: 13 février 2026  
**Type de projet**: Application Next.js 16 + TypeScript + Supabase + Tailwind CSS  
**Lignes de code analysées**: ~12 000 lignes (89 fichiers TS/TSX + 39 migrations SQL)

---

## 📋 TABLE DES MATIÈRES

1. [Résumé Exécutif](#résumé-exécutif)
2. [Points Forts](#points-forts)
3. [Problèmes Critiques (P0)](#problèmes-critiques-p0)
4. [Problèmes Importants (P1)](#problèmes-importants-p1)
5. [Améliorations Recommandées (P2)](#améliorations-recommandées-p2)
6. [Optimisations Futures (P3)](#optimisations-futures-p3)
7. [Métriques de Qualité](#métriques-de-qualité)

---

## 📊 RÉSUMÉ EXÉCUTIF

### État Général: 🟢 BON (Score: 7.5/10)

L'application présente une architecture solide et bien structurée avec des fondations techniques saines. Le code est globalement propre, TypeScript est bien utilisé, et la sécurité de base est en place. Cependant, il existe des opportunités significatives d'amélioration en termes de:

- **Mutualisation du code** (duplication importante détectée)
- **Gestion des erreurs** (inconsistante)
- **Structure des layouts** (duplication de patterns)
- **Documentation technique** (docs partiellement obsolètes)

### Scores par Catégorie

| Catégorie | Score | Commentaire |
|-----------|-------|-------------|
| **Architecture** | 8/10 | Structure claire, bonne séparation des responsabilités |
| **Sécurité** | 8/10 | RLS en place, pas de SQL injection, auth bien gérée |
| **Qualité du Code** | 6/10 | Beaucoup de duplication, manque de mutualisation |
| **Performance** | 7/10 | Bon, mais optimisations possibles (loading states) |
| **Maintenabilité** | 6/10 | Duplication rend la maintenance difficile |
| **TypeScript** | 9/10 | Excellent typage, pas d'usage de `any` |
| **Tests** | 0/10 | Aucun test présent |
| **Documentation** | 5/10 | Présente mais partiellement obsolète |

---

## 🎯 POINTS FORTS

### ✅ Architecture & Structure

1. **Next.js App Router bien utilisé**
   - Structure `/app` claire et cohérente
   - Layouts imbriqués correctement
   - Server Actions pour toutes les mutations

2. **Séparation des responsabilités**
   - Composants réutilisables dans `/components`
   - Actions serveur isolées dans `actions.ts`
   - Types centralisés dans `/types`
   - Utilitaires dans `/lib` et `/utils`

3. **Composants partagés bien conçus**
   - Design system documenté (`Button`, `Input`, `Textarea`, `Badge`, `Modal`)
   - Variantes cohérentes et personnalisables
   - Tokens de couleur centralisés dans Tailwind

### ✅ Sécurité

1. **Pas de vulnérabilités critiques détectées**
   - Aucune injection SQL (utilisation correcte de Supabase client)
   - Aucun secret exposé côté client
   - Service role key correctement isolée

2. **Authentification robuste**
   - Middleware Next.js pour la protection des routes
   - Helper `getCurrentUserWithProfile()` avec cache React
   - Vérifications de rôle avant actions sensibles

3. **Contrôle d'accès granulaire**
   - Coach peut seulement modifier ses athlètes (`coach_id` check)
   - Athlete peut seulement voir/modifier ses données
   - Admin checks pour les opérations sensibles

### ✅ TypeScript

1. **Typage fort et cohérent**
   - Aucun usage de `any` détecté
   - Types centralisés dans `types/database.ts`
   - Interfaces bien définies pour tous les composants

2. **Configuration TypeScript stricte**
   - `strict: true` activé
   - Pas d'erreurs de compilation

### ✅ Bonnes Pratiques

1. **Git bien utilisé**
   - Historique propre
   - Migrations SQL numérotées séquentiellement

2. **Pas de code commenté**
   - Aucun TODO/FIXME/HACK détecté
   - Code propre sans dette technique apparente

3. **Design system documenté**
   - Page showcase pour tous les composants
   - Guidelines de couleurs et spacing
   - Documentation à jour dans `docs/DESIGN_SYSTEM.md`

---

## 🔴 PROBLÈMES CRITIQUES (P0)

### 1. Duplication Massive de Fonctions Utilitaires

**Impact**: 🔴 CRITIQUE  
**Effort**: 🟢 FAIBLE (4h)

#### Problème

Les mêmes fonctions sont redéfinies dans 4-6 fichiers différents:

| Fonction | Occurrences | Fichiers |
|----------|-------------|----------|
| `getWeekMonday` | 4× | `CalendarView.tsx`, `CalendarViewWithNavigation.tsx`, `calendar/page.tsx`, `athletes/[id]/page.tsx` |
| `toDateStr` | 2× | `CalendarView.tsx`, `CalendarViewWithNavigation.tsx` |
| `getInitials` | 5× | `Sidebar.tsx`, `CoachAthleteCalendarPage.tsx`, `dashboard/page.tsx`, `FindCoachSection.tsx`, `coach/page.tsx` |
| `formatDateFr` | 1× | `WorkoutModal.tsx` (devrait être partagée) |
| `getDaysUntil` | 3× | `objectifs/page.tsx`, `ObjectifsTable.tsx`, `CoachAthleteCalendarPage.tsx` |

**Exemple de duplication**:

```typescript
// Dans CalendarView.tsx (L212-217)
function getWeekMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d
}

// MÊME CODE dans CalendarViewWithNavigation.tsx (L13-20)
function getWeekMonday(dateInput: Date | string): Date {
  // ... exactement le même code
}
```

#### Solution

Créer `lib/dateUtils.ts` et `lib/stringUtils.ts`:

```typescript
// lib/dateUtils.ts
export function getWeekMonday(date: Date | string): Date { ... }
export function toDateStr(date: Date): string { ... }
export function formatDateFr(date: Date | string): string { ... }
export function getDaysUntil(targetDate: string | Date): number { ... }

// lib/stringUtils.ts
export function getInitials(nameOrEmail: string): string { ... }
```

**Bénéfices**:
- Maintien centralisé (1 endroit au lieu de 5)
- Tests unitaires plus faciles
- Bugs corrigés une seule fois
- Réduction de ~150 lignes de code dupliqué

---

### 2. Duplication d'Authentification et Autorisations dans les Actions

**Impact**: 🔴 CRITIQUE  
**Effort**: 🟡 MOYEN (6h)

#### Problème

Pattern auth répété 25+ fois dans 10 fichiers `actions.ts`:

```typescript
// Répété dans CHAQUE action
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { error: 'Non connecté.' }

const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('user_id', user.id)
  .single()

if (profile?.role !== 'coach') return { error: 'Accès refusé.' }
```

**Coach-athlete access check** dupliqué 6× dans `workouts/actions.ts`:

```typescript
// Dans createWorkout (L75-85)
const isCoach = profile?.role === 'coach'
const isAthlete = profile?.role === 'athlete' && user.id === athleteId
const { data: athleteProfile } = await supabase...
const hasAccess = isCoach && athleteProfile?.coach_id === user.id || isAthlete

// MÊME LOGIQUE dans updateWorkout, deleteWorkout, getWorkoutsForDateRange, etc.
```

#### Solution

Créer `lib/authHelpers.ts`:

```typescript
export async function requireUser(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté.' }
  return { user }
}

export async function getProfile(supabase: SupabaseClient, userId: string, fields = 'role') {
  const { data } = await supabase.from('profiles').select(fields).eq('user_id', userId).single()
  return data
}

export async function requireCoachOrAthleteAccess(supabase: SupabaseClient, athleteId: string) {
  const { user, error } = await requireUser(supabase)
  if (error) return { error }
  
  const [myProfile, athleteProfile] = await Promise.all([
    getProfile(supabase, user.id, 'role, user_id'),
    getProfile(supabase, athleteId, 'coach_id, user_id'),
  ])
  
  const isCoach = myProfile?.role === 'coach' && athleteProfile?.coach_id === user.id
  const isAthlete = myProfile?.role === 'athlete' && user.id === athleteId
  
  if (!isCoach && !isAthlete) return { error: 'Accès refusé.' }
  
  return { user, profile: myProfile, athleteProfile }
}
```

**Usage**:

```typescript
// Avant (15 lignes)
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { error: 'Non connecté.' }
// ... 12 lignes de plus

// Après (3 lignes)
const supabase = await createClient()
const result = await requireCoachOrAthleteAccess(supabase, athleteId)
if ('error' in result) return result
```

**Bénéfices**:
- Réduction de ~300 lignes de code dupliqué
- Sécurité centralisée (bugs d'auth corrigés partout d'un coup)
- Tests unitaires pour la logique d'auth
- Meilleure lisibilité des actions

---

### 3. Validation de Formulaire Dupliquée

**Impact**: 🔴 CRITIQUE  
**Effort**: 🟢 FAIBLE (3h)

#### Problème

Validation identique dans `createWorkout` et `updateWorkout` (30 lignes × 2):

```typescript
// createWorkout (L96-115)
const date = formData.get('date') as string
if (!date) return { error: 'Date requise.' }
// ... 18 lignes de validation identiques

// updateWorkout (L169-188)
const date = formData.get('date') as string
if (!date) return { error: 'Date requise.' }
// ... 18 lignes EXACTEMENT IDENTIQUES
```

Rate limit error handling dupliqué 2× dans `login/actions.ts`:

```typescript
// signup (L73-77) et resetPassword (L154-157)
if (error.message.includes('rate limit') || error.message.includes('rate_limit')) {
  return {
    error: 'Trop de demandes d\'email ont été envoyées...',
  }
}
```

#### Solution

**Pour les workouts**:

```typescript
// lib/workoutValidation.ts
export function validateWorkoutFormData(formData: FormData) {
  const date = formData.get('date') as string
  if (!date) return { error: 'Date requise.' }
  
  const sportType = formData.get('sport_type') as string
  const validSports = ['course', 'velo', 'natation', 'musculation', 'nordic_ski', 'backcountry_ski', 'ice_skating']
  if (!validSports.includes(sportType)) return { error: 'Sport invalide.' }
  
  // ... reste de la validation
  
  return { data: { date, sportType, title, description, targets } }
}

// Dans actions.ts
const validation = validateWorkoutFormData(formData)
if ('error' in validation) return validation
const { date, sportType, title, description, targets } = validation.data
```

**Pour les erreurs auth**:

```typescript
// lib/authErrors.ts
export function handleAuthRateLimitError(error: AuthError) {
  if (error.message.includes('rate limit') || error.message.includes('rate_limit')) {
    return { error: 'Trop de demandes d\'email ont été envoyées. Veuillez patienter quelques minutes.' }
  }
  return null
}

export function handleSignupError(error: AuthError, email: string) {
  const rateLimitError = handleAuthRateLimitError(error)
  if (rateLimitError) return rateLimitError
  
  if (/already (registered|exists|user)/i.test(error.message)) {
    return { error: 'Un compte existe déjà avec cet email.', userExists: true, existingEmail: email }
  }
  
  return { error: error.message }
}
```

**Bénéfices**:
- Validation cohérente entre création et mise à jour
- Plus facile à tester
- Messages d'erreur centralisés et uniformes

---

## 🟡 PROBLÈMES IMPORTANTS (P1)

### 4. Modals Réimplèmentent la Même Logique au Lieu d'Utiliser `<Modal>`

**Impact**: 🟡 IMPORTANT  
**Effort**: 🟡 MOYEN (4h)

#### Problème

3 modals réimplémentent portal + overlay + escape handling alors que `Modal.tsx` existe déjà:

| Composant | Lignes | Problème |
|-----------|--------|----------|
| `LoginModal.tsx` | L24-59 | Overlay + portal custom |
| `WorkoutModal.tsx` | L287-538 | Overlay + header + footer custom |
| `ChatModule.tsx` | L108-321 | Overlay + layout custom |

**Code dupliqué** (close button SVG inline dans 5+ fichiers):

```tsx
// Répété dans LoginForm, WorkoutModal, Modal, CalendarView, ChatModule
<svg className="w-5 h-5" fill="none" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
</svg>
```

#### Solution

1. **Refactoriser les modals existantes pour utiliser `<Modal>`**:

```tsx
// Avant (LoginModal.tsx, 35 lignes)
export default function LoginModal({ isOpen, onClose, mode, onModeChange }: LoginModalProps) {
  // ... useEffect escape, portal, overlay logic ...
  return createPortal(
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-[9999]">
      <div className="...">
        <LoginForm ... />
      </div>
    </div>,
    document.body
  )
}

// Après (10 lignes)
export default function LoginModal({ isOpen, onClose, mode, onModeChange }: LoginModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <LoginForm mode={mode} onModeChange={onModeChange} onClose={onClose} />
    </Modal>
  )
}
```

2. **Créer `IconClose` component**:

```tsx
// components/icons/IconClose.tsx
export function IconClose({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
```

**Bénéfices**:
- Comportement modal cohérent (z-index, escape, overlay)
- Réduction de ~150 lignes de code
- Animations et accessibilité centralisées

---

### 5. Styles de Formulaires Dupliqués (`Input` / `Textarea`)

**Impact**: 🟡 IMPORTANT  
**Effort**: 🟢 FAIBLE (2h)

#### Problème

`Input.tsx` et `Textarea.tsx` définissent les mêmes constantes:

```typescript
// Input.tsx (L8-16)
const BASE_CLASSES = 'w-full px-4 py-3 rounded-xl border ...'
const DISABLED_READONLY_CLASSES = 'bg-stone-100 cursor-not-allowed text-stone-500'
const ERROR_CLASSES = 'border-palette-danger/40 bg-palette-danger-light/30'

// Textarea.tsx (L8-16) - IDENTIQUE avec petite différence sur min-height
const BASE_CLASSES = 'w-full px-4 py-3 rounded-xl border ...'
const DISABLED_READONLY_CLASSES = 'bg-stone-100 cursor-not-allowed text-stone-500'
const ERROR_CLASSES = 'border-palette-danger/40 bg-palette-danger-light/30'
```

#### Solution

Créer `lib/formStyles.ts`:

```typescript
export const FORM_BASE_CLASSES = 'w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:border-palette-forest-dark focus:ring-2 focus:ring-palette-forest-dark/10 transition-all duration-200 outline-none'

export const FORM_DISABLED_READONLY_CLASSES = 'bg-stone-100 cursor-not-allowed text-stone-500 border-stone-200'

export const FORM_ERROR_CLASSES = 'border-palette-danger/40 bg-palette-danger-light/30 focus:border-palette-danger focus:ring-palette-danger/10'
```

Usage:

```typescript
// Input.tsx
import { FORM_BASE_CLASSES, FORM_DISABLED_READONLY_CLASSES, FORM_ERROR_CLASSES } from '@/lib/formStyles'

const classes = cn(
  FORM_BASE_CLASSES,
  isDisabled && FORM_DISABLED_READONLY_CLASSES,
  error && FORM_ERROR_CLASSES,
  className
)
```

---

### 6. Layouts de Pages Dashboard Dupliqués

**Impact**: 🟡 IMPORTANT  
**Effort**: 🟡 MOYEN (3h)

#### Problème

8+ pages dashboard répètent la même structure:

```tsx
// dashboard/page.tsx, coach/page.tsx, objectifs/page.tsx, profile/page.tsx, devices/page.tsx, etc.
<main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
  <PageHeader title="..." rightContent={...} />
  <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
    {/* contenu */}
  </div>
</main>
```

`dashboard/page.tsx` (coach view) utilise un header custom au lieu de `PageHeader` (inconsistance).

#### Solution

Créer `DashboardPageShell`:

```tsx
// components/DashboardPageShell.tsx
interface DashboardPageShellProps {
  title: string
  rightContent?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function DashboardPageShell({ title, rightContent, children, className }: DashboardPageShellProps) {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      <PageHeader title={title} rightContent={rightContent} />
      <div className={cn("flex-1 overflow-y-auto px-6 lg:px-8 py-6", className)}>
        {children}
      </div>
    </main>
  )
}
```

Usage:

```tsx
// Avant (15+ lignes)
<main className="...">
  <PageHeader title="Mon Calendrier" rightContent={...} />
  <div className="...">
    {/* contenu */}
  </div>
</main>

// Après (5 lignes)
<DashboardPageShell title="Mon Calendrier" rightContent={...}>
  {/* contenu */}
</DashboardPageShell>
```

**Bénéfices**:
- Réduction de ~200 lignes de code
- Changements de layout centralisés
- Cohérence visuelle garantie

---

### 7. Styles Sport Dupliqués entre `lib/sportStyles.ts` et `CalendarView.tsx`

**Impact**: 🟡 IMPORTANT  
**Effort**: 🟢 FAIBLE (2h)

#### Problème

`CalendarView.tsx` (L11-119) redéfinit:

- `SPORT_LABELS` (déjà dans `sportStyles.ts`)
- `SPORT_ICONS` (import différent)
- `SPORT_CARD_STYLES` (logique similaire à `SPORT_BADGE_STYLES`)
- `SPORT_COLORS` (palette alternative)

**Conséquence**: modifications de couleurs sport nécessitent 2 endroits.

#### Solution

Étendre `lib/sportStyles.ts`:

```typescript
// lib/sportStyles.ts
export const SPORT_CARD_STYLES: Record<SportType, { borderLeft: string; badge: string; badgeBg: string }> = {
  course: {
    borderLeft: 'border-l-palette-forest-dark',
    badge: 'text-palette-forest-dark',
    badgeBg: 'bg-palette-forest-dark/10',
  },
  // ... autres sports
}

export const SPORT_COLORS: Record<SportType, string> = {
  course: '#627e59',  // palette-forest-dark
  velo: '#8e9856',    // palette-olive
  // ... autres sports
}
```

Supprimer les définitions locales dans `CalendarView.tsx` et importer depuis `@/lib/sportStyles`.

---

### 8. Gestion des Erreurs Inconsistante

**Impact**: 🟡 IMPORTANT  
**Effort**: 🟡 MOYEN (4h)

#### Problèmes

1. **Aucun `error.tsx` boundary** dans tout le projet
2. **Erreurs retournées inconsistentes**:
   - `getMyCoachRequests()` retourne `[]` si non authentifié (masque l'erreur)
   - `getMyCoachRating()` retourne `null` pour "non trouvé" ET "non autorisé"
   - `disconnectStrava()` ignore les erreurs de delete

3. **Messages d'erreur non uniformes**:
   - Parfois "Non connecté."
   - Parfois "Accès refusé."
   - Pas de codes d'erreur structurés

#### Solution

1. **Ajouter error boundaries**:

```tsx
// app/error.tsx
'use client'
export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="max-w-md p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-xl font-bold text-palette-danger mb-4">Une erreur est survenue</h2>
        <p className="text-stone-600 mb-6">{error.message}</p>
        <Button onClick={reset}>Réessayer</Button>
      </div>
    </div>
  )
}

// app/dashboard/error.tsx (même pattern)
```

2. **Créer types d'erreur structurés**:

```typescript
// lib/errors.ts
export type ApiError = {
  error: string
  code?: 'AUTH_REQUIRED' | 'FORBIDDEN' | 'NOT_FOUND' | 'VALIDATION_ERROR' | 'SERVER_ERROR'
}

export type ApiSuccess<T> = {
  data: T
}

export type ApiResult<T> = ApiSuccess<T> | ApiError

export function createError(message: string, code: ApiError['code']): ApiError {
  return { error: message, code }
}
```

3. **Standardiser les retours d'actions**:

```typescript
// Avant (ambigu)
export async function getMyCoachRequests() {
  const user = await getUser()
  if (!user) return []  // ❌ masque l'erreur
  // ...
}

// Après (explicite)
export async function getMyCoachRequests(): Promise<ApiResult<CoachRequest[]>> {
  const user = await getUser()
  if (!user) return createError('Non connecté.', 'AUTH_REQUIRED')
  
  const { data, error } = await supabase...
  if (error) return createError(error.message, 'SERVER_ERROR')
  
  return { data }
}
```

**Bénéfices**:
- Erreurs visibles et exploitables côté client
- Codes d'erreur permettent une gestion fine (retry, redirect, etc.)
- Meilleure expérience utilisateur
- Debugging facilité

---

## 🔵 AMÉLIORATIONS RECOMMANDÉES (P2)

### 9. Loading States Non-Alignés avec les Pages

**Impact**: 🔵 MOYEN  
**Effort**: 🟢 FAIBLE (2h)

#### Problème

`app/dashboard/athletes/[athleteId]/loading.tsx` utilise:

```tsx
<div className="min-h-screen bg-stone-50">  {/* Full page */}
```

Mais la vraie page vit dans le dashboard layout (avec Sidebar + card).

**Résultat**: flash visuel lors du chargement (skeleton ne ressemble pas à la page).

Même problème dans:
- `app/dashboard/loading.tsx` (full page spinner vs dashboard layout)
- `app/admin/members/loading.tsx` (header border différent)

#### Solution

Utiliser le même shell que la page finale:

```tsx
// app/dashboard/athletes/[athleteId]/loading.tsx
export default function Loading() {
  return (
    <main className="flex-1 flex flex-col h-full min-w-0 bg-white/50 rounded-2xl overflow-hidden relative border border-stone-200/50">
      {/* Skeleton PageHeader */}
      <div className="shrink-0 px-6 lg:px-8 h-20 flex items-center justify-between border-b border-stone-100 bg-stone-50/50">
        <div className="h-6 w-48 bg-stone-200 rounded animate-pulse" />
      </div>
      
      {/* Skeleton content */}
      <div className="flex-1 overflow-y-auto px-6 lg:px-8 py-6 space-y-4">
        <div className="h-32 bg-stone-100 rounded-xl animate-pulse" />
        <div className="h-64 bg-stone-100 rounded-xl animate-pulse" />
      </div>
    </main>
  )
}
```

**Bénéfice**: Transitions plus fluides, pas de flash visuel.

---

### 10. Métadonnées SEO Manquantes

**Impact**: 🔵 MOYEN  
**Effort**: 🟢 FAIBLE (1h)

#### Problème

`app/layout.tsx` contient encore les valeurs par défaut:

```tsx
export const metadata: Metadata = {
  title: "Create Next App",  // ❌
  description: "Generated by create next app",  // ❌
}
```

Aucune page n'a de metadata personnalisée.

#### Solution

```tsx
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: "Coach Pro - Coaching sportif personnalisé",
    template: "%s | Coach Pro"
  },
  description: "Plateforme de coaching sportif : programmes d'entraînement sur mesure, suivi en temps réel, synchronisation Strava et messagerie directe avec votre coach.",
  keywords: ["coaching sportif", "entraînement", "running", "cyclisme", "triathlon", "Strava"],
  authors: [{ name: "Coach Pro" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Coach Pro",
  },
}

// app/login/page.tsx
export const metadata: Metadata = {
  title: "Connexion",
}

// app/dashboard/page.tsx
export const metadata: Metadata = {
  title: "Tableau de bord",
}
```

**Bénéfice**: Meilleur référencement, meilleur partage sur réseaux sociaux.

---

### 11. Console.log en Production

**Impact**: 🔵 MOYEN  
**Effort**: 🟢 FAIBLE (30 min)

#### Problème

7 `console.error()` détectés:

- `dashboard/actions.ts:79`
- `dashboard/profile/ProfileForm.tsx:178`
- `dashboard/devices/actions.ts:65,122`
- `api/auth/strava/callback/route.ts:80,111,117`
- `api/auth/strava/route.ts:62`

**Conséquence**: Logs côté client visibles dans la console des utilisateurs.

#### Solution

1. **Créer un logger centralisé**:

```typescript
// lib/logger.ts
export const logger = {
  error: (message: string, error?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(message, error)
    }
    // En production, envoyer à un service de monitoring (Sentry, LogRocket, etc.)
  },
  warn: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(message, data)
    }
  },
  info: (message: string, data?: unknown) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(message, data)
    }
  },
}
```

2. **Remplacer tous les console.error**:

```typescript
// Avant
console.error('Strava refresh token failed:', err)

// Après
logger.error('Strava refresh token failed:', err)
```

**Bénéfice**: Contrôle des logs en production, prêt pour monitoring externe.

---

### 12. Code Mort et Exports Inutilisés

**Impact**: 🔵 FAIBLE  
**Effort**: 🟢 FAIBLE (30 min)

#### Fichiers à nettoyer

| Export | Fichier | Raison |
|--------|---------|--------|
| `formatSportPracticedDisplay` | `RequestCoachButton.tsx:27` | Jamais importé |
| `updateAvatarUrl` | `dashboard/profile/actions.ts:79` | Remplacé par `updateProfile` |
| `export { PRACTICED_SPORTS_OPTIONS }` | `RequestCoachButton.tsx:12` | Ré-export inutile (import direct depuis `lib/sportsOptions`) |
| `onToday` prop | `WeekSelector.tsx` | Jamais passé par les callers |

#### Solution

Supprimer les exports et vérifier avec ESLint:

```bash
npm run lint
```

Configurer ESLint pour détecter les exports non utilisés:

```js
// eslint.config.mjs
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
])
```

---

### 13. Documentation Obsolète

**Impact**: 🔵 FAIBLE  
**Effort**: 🟢 FAIBLE (1h)

#### Problèmes détectés

1. **`docs/DESIGN_SYSTEM_AUDIT.md`**
   - Mentionne `PrimaryButton` (remplacé par `Button`)
   - Mentionne `ProfileMenu` (supprimé)

2. **`docs/DESIGN_SYSTEM_AUDIT_V2.md`**
   - Ligne 21: dit que "Modal.tsx est supprimé" (mais il existe et est utilisé)

3. **`docs/DESIGN_SYSTEM.md`**
   - Lignes 428-436: noms d'icônes incorrects
     - `IconBike` → `IconBiking`
     - `IconTriathlon` → n'existe pas (triathlon utilise `IconSwimming`)
     - `IconSkiNordic` → `IconNordicSki`
     - `IconSkiBackcountry` → `IconBackcountrySki`

4. **`docs/FIX_ATHLETE_MODAL_INTERACTION.md`**
   - Numéros de lignes obsolètes

#### Solution

Mettre à jour ou archiver les docs obsolètes:

```bash
# Déplacer les audits obsolètes
mkdir -p docs/archive
mv docs/DESIGN_SYSTEM_AUDIT.md docs/archive/
mv docs/DESIGN_SYSTEM_AUDIT_V2.md docs/archive/

# Mettre à jour DESIGN_SYSTEM.md avec les bons noms d'icônes
```

---

## 🟢 OPTIMISATIONS FUTURES (P3)

### 14. Opportunités d'Optimisation Performance

**Impact**: 🟢 FAIBLE  
**Effort**: 🟡 MOYEN (4-6h)

#### Opportunités

1. **Images non optimisées**
   - `next.config.ts` n'autorise que `images.unsplash.com`
   - Ajouter le domaine Supabase Storage pour les avatars:
   
   ```typescript
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: 'images.unsplash.com' },
       { protocol: 'https', hostname: '*.supabase.co', pathname: '/storage/**' },  // Avatars
     ],
   }
   ```

2. **Bundle size**: Pas de dynamic imports
   - `ChatModule` et `WorkoutModal` pourraient être chargés dynamiquement:
   
   ```tsx
   const ChatModule = dynamic(() => import('@/components/ChatModule'), { 
     loading: () => <div>Chargement...</div> 
   })
   ```

3. **Supabase queries non optimisées**
   - `dashboard/page.tsx` fait 5+ requêtes séquentielles
   - Les paralléliser avec `Promise.all()`:
   
   ```typescript
   const [workouts, goals, requests, athletes] = await Promise.all([
     getWorkouts(),
     getGoals(),
     getRequests(),
     getAthletes(),
   ])
   ```

4. **Pas de caching côté client**
   - Utiliser React Query / SWR pour cache + revalidation automatique

---

### 15. Tests Unitaires et E2E

**Impact**: 🟢 FAIBLE (mais important long terme)  
**Effort**: 🔴 ÉLEVÉ (20-30h)

#### État actuel

Aucun test présent. Recommandations:

1. **Tests unitaires** (Vitest + Testing Library)
   - Tester les helpers (`lib/dateUtils`, `lib/authHelpers`)
   - Tester les composants (`Button`, `Input`, `Badge`)

2. **Tests d'intégration** (Playwright)
   - Parcours utilisateur complets (signup → login → create workout)
   - Tests de régression sur les modales

**Exemple de test**:

```typescript
// lib/__tests__/dateUtils.test.ts
import { describe, it, expect } from 'vitest'
import { getWeekMonday, toDateStr } from '../dateUtils'

describe('getWeekMonday', () => {
  it('should return Monday for a Wednesday', () => {
    const wednesday = new Date('2026-02-13')  // Mercredi
    const monday = getWeekMonday(wednesday)
    expect(monday.getDay()).toBe(1)  // Lundi
    expect(monday.toISOString().split('T')[0]).toBe('2026-02-10')
  })
})
```

---

### 16. Types Supabase Auto-générés

**Impact**: 🟢 FAIBLE  
**Effort**: 🟢 FAIBLE (1h)

#### Amélioration

Actuellement `types/database.ts` est maintenu manuellement. Utiliser la CLI Supabase:

```bash
npx supabase gen types typescript --project-id <project-id> > types/database-generated.ts
```

Ajouter un script dans `package.json`:

```json
{
  "scripts": {
    "generate:types": "supabase gen types typescript --local > types/database-generated.ts"
  }
}
```

**Bénéfice**: Types toujours synchronisés avec la DB.

---

### 17. Accessibilité (A11y)

**Impact**: 🟢 FAIBLE  
**Effort**: 🟡 MOYEN (4-6h)

#### Problèmes potentiels

1. **Modales sans focus trap**
   - Utiliser `react-focus-lock` ou `@radix-ui/react-dialog`

2. **Pas de labels ARIA sur les boutons d'icône**
   
   ```tsx
   <button aria-label="Fermer">
     <IconClose />
   </button>
   ```

3. **Contraste couleurs**
   - Vérifier que tous les textes respectent WCAG AA (4.5:1)

4. **Navigation clavier**
   - Tester que toutes les actions sont accessibles au clavier (Tab, Enter, Escape)

---

## 📈 MÉTRIQUES DE QUALITÉ

### Code Metrics

| Métrique | Valeur | Cible | Statut |
|----------|--------|-------|--------|
| **Duplication de code** | ~15% | < 5% | 🔴 |
| **Fichiers > 300 lignes** | 6 fichiers | < 3 | 🟡 |
| **Fichiers > 500 lignes** | 2 fichiers | 0 | 🟡 |
| **Fonctions > 50 lignes** | ~12 | < 5 | 🟡 |
| **Complexité cyclomatique max** | ~15 | < 10 | 🟡 |
| **Coverage tests** | 0% | > 70% | 🔴 |
| **Usage de `any`** | 0 | 0 | 🟢 |
| **Console.log en prod** | 7 | 0 | 🟡 |

### Fichiers les Plus Complexes

| Fichier | Lignes | Complexité | Recommandation |
|---------|--------|-----------|----------------|
| `CalendarView.tsx` | 1500+ | Élevée | Découper en sous-composants (`CalendarDay`, `CalendarWeek`, `ActivityCard`) |
| `dashboard/page.tsx` | 380 | Moyenne | Extraire les vues par rôle dans des composants séparés |
| `workouts/actions.ts` | 400+ | Moyenne | Appliquer les helpers auth proposés (réduction à ~250 lignes) |

### Dépendances

| Métrique | Valeur | Commentaire |
|----------|--------|-------------|
| **Dependencies** | 5 | 🟢 Minimaliste |
| **DevDependencies** | 8 | 🟢 Raisonnable |
| **Versions obsolètes** | 0 | 🟢 À jour |
| **Vulnérabilités** | À vérifier | Lancer `npm audit` |

---

## 🎯 TABLEAU DE BORD DES ACTIONS

### Résumé par Priorité

| Priorité | Actions | Effort Total | Impact |
|----------|---------|--------------|--------|
| **P0 (Critique)** | 3 actions | 13h | 🔴 Très élevé |
| **P1 (Important)** | 5 actions | 19h | 🟡 Élevé |
| **P2 (Recommandé)** | 5 actions | 6h | 🔵 Moyen |
| **P3 (Futur)** | 4 actions | 30h+ | 🟢 Faible/Long terme |
| **TOTAL** | **17 actions** | **68h** | - |

### Quick Wins (Gains Rapides)

Actions avec le meilleur ratio impact/effort:

1. **Créer `lib/dateUtils.ts`** (2h, impact élevé) ← **COMMENCER PAR ICI**
2. **Créer `lib/stringUtils.ts`** (1h, impact élevé)
3. **Créer `IconClose` component** (30 min, impact moyen)
4. **Nettoyer exports inutilisés** (30 min, impact faible)
5. **Ajouter métadonnées SEO** (1h, impact moyen)

### Roadmap Suggérée (4 Sprints)

#### Sprint 1 (2 semaines) - FONDATIONS
- ✅ P0.1: Créer utilitaires date/string (`lib/dateUtils.ts`, `lib/stringUtils.ts`)
- ✅ P0.2: Créer helpers auth (`lib/authHelpers.ts`)
- ✅ P0.3: Créer validation workouts (`lib/workoutValidation.ts`)
- ✅ P1.2: Mutualiser styles formulaires (`lib/formStyles.ts`)
- ✅ P2.3: Créer logger centralisé (`lib/logger.ts`)
- ✅ P2.4: Nettoyer code mort

**Résultat**: Code plus maintenable, duplication réduite de 70%

#### Sprint 2 (2 semaines) - COMPOSANTS
- ✅ P1.1: Refactoriser modals pour utiliser `<Modal>`
- ✅ P1.3: Créer `DashboardPageShell`
- ✅ P1.4: Consolider styles sport dans `lib/sportStyles.ts`
- ✅ P2.1: Aligner loading states avec pages
- ✅ P2.2: Ajouter métadonnées SEO

**Résultat**: Composants cohérents, moins de duplication

#### Sprint 3 (2 semaines) - ROBUSTESSE
- ✅ P1.5: Créer error boundaries + types d'erreur structurés
- ✅ P2.5: Mettre à jour documentation
- ✅ P3.1: Optimiser images et bundle size
- ✅ P3.2: Paralléliser requêtes Supabase

**Résultat**: Application plus robuste et rapide

#### Sprint 4 (3-4 semaines) - QUALITÉ
- ✅ P3.3: Ajouter tests unitaires (helpers + composants)
- ✅ P3.4: Ajouter tests E2E (parcours critiques)
- ✅ P3.5: Améliorer accessibilité
- ✅ P3.6: Configurer types Supabase auto-générés

**Résultat**: Application testée et accessible

---

## 📝 RECOMMANDATIONS FINALES

### À Faire IMMÉDIATEMENT (Cette Semaine)

1. ✅ **Créer `lib/dateUtils.ts`** et remplacer toutes les duplications
2. ✅ **Créer `lib/authHelpers.ts`** et refactoriser les actions
3. ✅ **Ajouter error boundaries** (`app/error.tsx` et `app/dashboard/error.tsx`)

**Impact**: Réduction immédiate de ~500 lignes de code dupliqué, meilleure gestion des erreurs.

### À Planifier (Ce Mois)

1. Refactoriser les modals
2. Créer `DashboardPageShell`
3. Consolider les styles sport
4. Ajouter métadonnées SEO
5. Nettoyer console.log

**Impact**: Code plus maintenable, meilleure expérience utilisateur.

### À Considérer (Ce Trimestre)

1. Ajouter une suite de tests (unitaires + E2E)
2. Optimiser les performances (images, bundle, queries)
3. Améliorer l'accessibilité
4. Mettre en place un système de monitoring (Sentry, LogRocket)

**Impact**: Application production-ready de qualité professionnelle.

---

## ✅ CONCLUSION

### Points Clés

1. **Fondations solides** : Architecture Next.js + Supabase bien structurée, TypeScript strict, sécurité de base en place.

2. **Problème principal** : Duplication importante (~15% du code) qui rend la maintenance difficile et augmente le risque de bugs.

3. **Solution rapide** : Créer 3-4 fichiers de helpers dans `/lib` permettra de réduire la duplication de 70% en ~15 heures.

4. **ROI élevé** : Les actions P0 et P1 (32h au total) amélioreront drastiquement la maintenabilité sans refonte majeure.

### Score Final : 7.5/10

**Forces** : Architecture, TypeScript, Sécurité  
**Faiblesses** : Duplication de code, Gestion des erreurs, Tests absents  

**Verdict** : Application bien construite avec des opportunités d'amélioration claires et actionnables. Les problèmes identifiés sont tous résolva bles rapidement sans refonte majeure.

---

*Audit réalisé le 13 février 2026*  
*Prochain audit recommandé : Dans 3 mois (après Sprint 2)*

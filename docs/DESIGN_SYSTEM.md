# 🎨 Design System

**Version :** 1.34  
**Dernière mise à jour :** 12 mai 2026 (**CoachPlatformSubscribeOffersModal** / **CoachPlatformOfferGrid** — choix d’offre avant Stripe ; titres FR/EN via **`coachMsaOffers.byPriceId`** ; précédent : **CoachPlatformSubscriptionOffers**…)

---

## Table des matières

1. [Introduction](#introduction)
2. [Tokens](#tokens)
   - [Couleurs](#couleurs)
   - [Typographie](#typographie)
   - [Espacements](#espacements)
   - [Rayons (Border Radius)](#rayons-border-radius)
   - [Ombres](#ombres)
3. [Composants](#composants)
   - [Button](#button)
   - [Input](#input)
   - [PasswordInput](#passwordinput)
   - [SearchInput](#searchinput)
   - [Textarea](#textarea)
   - [Badge](#badge)
   - [Avatar](#avatar)
   - [AvatarImage](#avatarimage)
   - [SportTileSelectable](#sporttileselectable)
   - [ActivityTile](#activitytile)
   - [TileCard](#tilecard)
   - [Modal](#modal)
   - [CoachReviewsModal](#coachreviewsmodal)
   - [WorkoutFacilityHoursStrip](#workoutfacilityhoursstrip)
   - [AthleteFacilityDetails](#athletefacilitydetails)
   - [CoachAthleteNotesSection](#coachathletenotessection)
   - [CoachAthleteNoteModal](#coachathletenotemodal)
   - [CoachPlatformSubscriptionOffers](#coachplatformsubscriptionoffers)
   - [CoachPlatformOfferGrid](#coachplatformoffergrid)
   - [CoachPlatformSubscribeOffersModal](#coachplatformsubscribeoffersmodal)
   - [DashboardPageShell](#dashboardpageshell)
   - [DashboardTopBar](#dashboardtopbar)
  - [AthleteAccountMenu](#athleteaccountmenu)
  - [CoachAccountMenu](#coachaccountmenu)
  - [Drawer](#drawer)
   - [PublicOrDashboardHeader](#publicordashboardheader)
   - [PublicHeader](#publicheader)
   - [ContactForm](#contactform)
   - [LanguageSwitcher](#languageswitcher)
   - [Dropdown](#dropdown)
   - [Segments](#segments)
   - [DatePickerPopup](#datepickerpopup)
   - [MonthSelector](#monthselector)
   - [ChatAthleteListItem](#chatathletelistitem)
   - [ChatConversationSidebar](#chatconversationsidebar)
   - [AthleteStatsVolumeChart](#athletestatsvolumechart)
4. [Icônes](#icônes)
5. [Guidelines](#guidelines)
6. [FAQ](#faq)

---

## Introduction

Ce design system définit les tokens, composants et conventions visuelles de l'application de coaching sportif. L'objectif est de garantir une cohérence visuelle et faciliter le développement en fournissant des composants réutilisables.

**Principes directeurs :**
- **Cohérence** : Utiliser les tokens plutôt que des valeurs en dur
- **Réutilisabilité** : Privilégier les composants existants
- **Accessibilité** : États disabled, focus, error clairement visibles
- **Nature & Sport** : Palette inspirée de la nature (forêt, olive, sage)

---

## Tokens

### Couleurs

Toutes les couleurs sont définies dans `tailwind.config.ts` et `app/globals.css`.

#### Palette principale

| Token | Hex | Usage | Classes Tailwind |
|-------|-----|-------|------------------|
| `palette-forest-dark` | `#627e59` | Principal (boutons, liens, focus), **préfixe langue EN/FR** | `bg-palette-forest-dark`, `text-palette-forest-dark`, `border-palette-forest-dark`, `bg-palette-forest-dark/10` |
| `palette-forest-darker` | `#506648` | Hover foncé, CTA accentués | `bg-palette-forest-darker`, `hover:bg-palette-forest-darker` |
| `palette-olive` | `#8e9856` | Hover principal, avatar fallback | `bg-palette-olive`, `hover:bg-palette-olive`, `text-palette-olive` |
| `palette-sage` | `#aaaa51` | Accents, randonnée, ski nordique | `bg-palette-sage`, `text-palette-sage` |
| `palette-gold` | `#cbb44b` | Trail, ski de randonnée | `bg-palette-gold`, `text-palette-gold` |
| `palette-amber` | `#c9a544` | Objectifs primaires, triathlon | `bg-palette-amber`, `text-palette-amber` |

#### Couleurs spéciales

| Token | Hex | Usage |
|-------|-----|-------|
| `palette-strava` | `#FC4C02` | Connexion Strava, activités importées |
| `palette-danger` | `#c0564b` | Actions destructives (déconnexion, supprimer) |
| `palette-danger-light` | `#fdf2f1` | Fond d'alerte/erreur |
| `palette-danger-dark` | `#9e3b31` | Hover danger, texte d'erreur |

#### Couleurs neutres (Tailwind stone)

- `stone-50` à `stone-900` : Textes, bordures, fonds
- Usage recommandé :
  - Texte principal : `text-stone-900`
  - Texte secondaire : `text-stone-600`
  - Texte désactivé : `text-stone-500`
  - Bordures : `border-stone-200` (clair), `border-stone-300` (moyen)
  - Fonds désactivés : `bg-stone-100`

#### Sports (couleurs spécifiques)

> Source de vérité : `lib/sportStyles.ts` (`SPORT_CARD_STYLES` / `SPORT_BADGE_STYLES` / **`SPORT_WEEKLY_SUMMARY_BAR`** pour le résumé hebdo).  
> Ce tableau est un repère “design”, pas une liste exhaustive ni contractuelle.

##### Résumé hebdomadaire calendrier (barres « prévu / fait »)

- **Usage :** `components/CalendarView.tsx` — carte totaux par semaine (desktop / mobile) et **bandeau compact** sous le titre de semaine (vue mois non détaillée). Une barre par sport dès qu’il existe du volume **prévu** (`workout_weekly_totals`) et/ou **réalisé** (activités importées / pipeline « fait »).
- **Liste des sports affichés :** alignée sur **`PERSISTED_WORKOUT_SPORT_TYPES`** (`lib/sportsRegistry.ts`), pas sur une liste en dur dans le composant.
- **Styles :** `SPORT_WEEKLY_SUMMARY_BAR` — `Record<SportType, { color: string; bg: string }>` : classes Tailwind pour le **libellé / icône** (`color`, ex. `text-palette-forest-dark`) et le **remplissage de la barre** (`bg`, ex. `bg-palette-forest-dark`). À tenir **cohérent** avec `SPORT_CARD_STYLES` (même famille de couleurs par sport).
- **Icônes :** toujours `SPORT_ICONS[sport]` (donc `components/SportIcons.tsx` en amont).

```ts
import { SPORT_WEEKLY_SUMMARY_BAR, SPORT_ICONS } from '@/lib/sportStyles'
import type { SportType } from '@/types/database'

const { color, bg } = SPORT_WEEKLY_SUMMARY_BAR['trail' satisfies SportType]
const TrailIcon = SPORT_ICONS.trail
// … barre : classe texte/icon `color`, segment rempli `bg`
```

| Sport | Couleur | Token |
|-------|---------|-------|
| Course | Forest | `palette-forest-dark` |
| Vélo | Gold | `palette-gold` |
| Natation | Sky | `sky-50`, `sky-700`, `sky-500` |
| Musculation | Stone | `stone-100`, `stone-600` |
| Trail | Olive | `palette-olive` |
| Randonnée | Sage | `palette-sage` |
| Triathlon | Amber | `palette-amber` |
| Ski nordique | Indigo | `indigo-400`, `indigo-700` |
| Ski de randonnée | Cyan | `cyan-600`, `cyan-700` |
| Patin à glace | Slate | `slate-300`, `slate-600` |
| Escalade | Stone | `stone-600` |
| Méditation | Violet | `violet-200` |
| Canot | Cyan | `cyan-800` |
| Surf | Orange | `orange-400` |
| Golf | Teal | `teal-700` |
| Yoga | Violet | `violet-400` |

---

### Typographie

#### Hiérarchie

| Niveau | Classes | Usage |
|--------|---------|-------|
| Heading 1 | `text-2xl font-bold text-stone-900` | Titres de page (Mon Coach, Dashboard) |
| Heading 2 | `text-lg font-bold text-stone-900` | Sections (Sports coachés, Filtres) |
| Heading 3 | `text-base font-semibold text-stone-800` | Sous-sections |
| Body | `text-sm text-stone-600` | Texte courant |
| Label | `text-xs font-bold uppercase tracking-wider text-stone-400` | Labels de formulaire |
| Caption | `text-xs text-stone-500` | Texte secondaire, descriptions |

#### Polices (font stack)

- **Police principale (sans)** : **Geist Sans** via `next/font` dans `app/[locale]/layout.tsx` (variable CSS `--font-geist-sans`).
- **Police monospace** : **Geist Mono** via `next/font` (variable CSS `--font-geist-mono`).
- **Conventions** :
  - Le `body` doit utiliser **`var(--font-sans)`** (qui pointe sur Geist via `--font-geist-sans`) — pas de fallback “Arial” en dur.
  - Utiliser la monospace uniquement pour les éléments de type code (`font-mono` / `var(--font-mono)`).

#### Exemples (Tailwind)

```tsx
// Texte standard (par défaut) : hérite du body = font-sans
<p className="text-sm text-stone-600">
  Texte courant…
</p>

// Forcer la police sans si besoin (rare, mais explicite)
<h2 className="font-sans text-lg font-bold text-stone-900">
  Titre de section
</h2>

// Monospace : uniquement pour code / identifiants techniques
<code className="font-mono text-xs bg-stone-100 px-1 rounded">
  coach_requests.status
</code>
```

#### Conventions

- **Titres** : `font-bold`
- **Sous-titres** : `font-semibold`
- **Texte important** : `font-medium`
- **Texte courant** : `font-normal`

---

### Espacements

#### Gaps (espacement entre éléments)

| Usage | Classe | Valeur |
|-------|--------|--------|
| Tuiles/badges serrés | `gap-2` | 8px |
| Tuiles sports | `gap-3` | 12px |
| Sections | `gap-6` | 24px |
| Sections larges | `gap-8` | 32px |

#### Padding

| Usage | Classe | Valeur |
|-------|--------|--------|
| Badges | `px-2.5 py-0.5` | 10px / 2px |
| Tuiles sélectionnables | `px-4 py-2` | 16px / 8px |
| Boutons | `px-4 py-2.5` | 16px / 10px |
| Cartes | `p-6` | 24px |
| Sections | `px-6 py-8` ou `p-8` | 24px-32px |

#### Margin

- Sections verticales : `mb-8`, `mt-8`
- Entre éléments : `mb-4`, `mb-6`

---

### Rayons (Border Radius)

| Classe | Valeur | Usage |
|--------|--------|-------|
| `rounded-full` | 9999px | Badges, tuiles sport/langue, avatars |
| `rounded-2xl` | 16px | Cartes principales, sections importantes |
| `rounded-xl` | 12px | Inputs, modales secondaires |
| `rounded-lg` | 8px | Boutons, petites cartes |
| `rounded-md` | 6px | Éléments mineurs (à éviter pour badges) |

**Recommandation :** Privilégier `rounded-full` pour badges/tuiles, `rounded-2xl` pour cartes, `rounded-lg` pour boutons.

---

### Ombres

| Classe | Usage |
|--------|-------|
| `shadow-sm` | Cartes au repos |
| `shadow-md` | Cartes hover légères |
| `shadow-lg` | Cartes hover accentuées |
| `shadow-xl` | Modales, popups |
| `shadow-chat` | Overlay chat (coach), cartes conversation |
| `shadow-chat-inner` | Bulles de messages, avatars dans le chat |
| `shadow-[0_4px_6px_-1px_rgba(98,126,89,0.3)]` | Tuiles sélectionnées (vert forêt) |

---

## Composants

### Button

**Fichier :** `components/Button.tsx`

Bouton avec 8 variantes alignées sur les usages de l'application.

#### Variantes

| Variante | Usage | Exemple |
|----------|-------|---------|
| `primary` | Action principale (Créer un compte, S'inscrire) | Hover olive |
| `primaryDark` | CTA modales (Enregistrer, Envoyer demande) | Hover forest-darker |
| `secondary` | Action secondaire (Se connecter header) | Hover bg-stone-100 |
| `outline` | Action tertiaire (Voir le détail) | Bordure verte, hover fond vert |
| `muted` | Annuler, Refuser, Retour | Bordure stone-300 |
| `ghost` | Bouton icône (fermer X) | Transparent, hover bg-stone-200 |
| `danger` | Actions destructives (Déconnexion, Supprimer) | Hover text-danger + bg-danger-light |
| `strava` | Connexion Strava | Orange Strava |

#### Props

```typescript
type ButtonProps = {
  variant?: 'primary' | 'primaryDark' | 'secondary' | 'outline' | 'muted' | 'ghost' | 'danger' | 'strava'
  fullWidth?: boolean
  loading?: boolean
  loadingText?: string
  success?: boolean  // Affiche ✓ Enregistré
  error?: boolean    // Affiche ✗ + style rouge
  href?: string      // Rend un <a> au lieu de <button>
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  children: React.ReactNode
}
```

#### Exemples

```tsx
// Bouton principal
<Button variant="primary">Créer un compte</Button>

// Bouton modal avec loading
<Button variant="primaryDark" loading={isSubmitting} loadingText="Enregistrement...">
  Enregistrer
</Button>

// Bouton danger
<Button variant="danger" onClick={handleDelete}>
  Supprimer le compte
</Button>

// LogoutButton (variant danger) : utilisé sur la page Profil (zone du bas, au-dessus de « Supprimer mon compte », séparateur horizontal entre les deux) et dans le drawer dashboard (mobile). i18n : auth.logout / auth.loggingOut.

// Bouton pleine largeur
<Button variant="primary" fullWidth>
  Se connecter
</Button>

// Bouton avec état success
<Button variant="primary" success>
  Enregistré
</Button>

// Lien stylé en bouton
<Button variant="outline" href="/coach">
  Voir le profil
</Button>
```

#### États

- **Normal** : Style selon variante
- **Hover** : Transition de couleur
- **Loading** : Spinner + texte optionnel
- **Success** : Icône ✓ + animation
- **Error** : Icône ✗ + style rouge
- **Disabled** : Opacité 50%, cursor not-allowed

---

#### ⚠️ Pattern "Enregistrer" avec Feedback

**Pour tous les formulaires avec bouton "Enregistrer" qui affiche un feedback "✓ Enregistré", un pattern standard OBLIGATOIRE doit être suivi.**

**📘 Documentation complète :**
- **`docs/PATTERN_SAVE_BUTTON.md`** - Pattern détaillé avec explications
- **`.cursor/rules/save-button-pattern.mdc`** - Règle Cursor pour l'IA

**🎯 Résumé du pattern :**

Le feedback "✓ Enregistré" doit s'afficher à **chaque** sauvegarde réussie. Pour cela, il faut détecter la **transition** de `pending: true → false` avec une ref, et utiliser une **clé composite** pour forcer le useEffect à se déclencher à chaque cycle.

```typescript
// Clé composite OBLIGATOIRE
const saveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isSubmitting}`

// Ref pour détecter la transition
const previousIsSubmittingRef = useRef(false)

useEffect(() => {
  const justFinishedSubmitting = previousIsSubmittingRef.current && !isSubmitting
  previousIsSubmittingRef.current = isSubmitting
  
  if (state?.success && justFinishedSubmitting) {
    setShowSavedFeedback(true)
    const timer = setTimeout(() => setShowSavedFeedback(false), 2000)
    return () => clearTimeout(timer)
  }
}, [saveFeedbackKey])
```

**❌ ERREUR COURANTE À ÉVITER :**

```typescript
// ❌ NE PAS FAIRE : Écouter state?.success directement
useEffect(() => {
  if (state?.success) setShowSavedFeedback(true)
}, [state?.success]) // BUG : ne se déclenche pas au 2ème cycle !
```

**✅ Références :**
- `app/dashboard/profile/ProfileForm.tsx` (implémentation de référence)
- `app/dashboard/profile/offers/OffersForm.tsx`
- `components/WorkoutModal.tsx`

---

### Input

**Fichier :** `components/Input.tsx`

Champ de saisie unifié avec support label, erreur, disabled, readOnly. **Styles :** `lib/formStyles.ts` — `FORM_BASE_CLASSES` (inclut `FORM_INPUT_TEXT_SIZE` = `text-sm` pour alignement avec la date affichée dans le date picker, ex. « 13 mars 2026 »), `FORM_INPUT_HEIGHT`, `FORM_DISABLED_READONLY_CLASSES`, `FORM_ERROR_CLASSES`. Les triggers du date picker et tout champ utilisant ces classes partagent la même taille de police.

#### Props

```typescript
type InputProps = {
  label?: string
  labelClassName?: string
  error?: string
  disabled?: boolean
  readOnly?: boolean
  name?: string
  type?: string
  placeholder?: string
  defaultValue?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  className?: string
}
```

#### Exemples

```tsx
// Input simple avec label
<Input 
  label="Prénom" 
  name="first_name" 
  placeholder="Jean"
/>

// Input avec erreur
<Input 
  label="Email" 
  name="email" 
  type="email"
  error={state.errors?.email}
/>

// Input disabled
<Input 
  label="Email (non modifiable)" 
  name="email" 
  value={user.email}
  disabled
/>

// Input read-only
<Input 
  label="ID Utilisateur" 
  value={user.id}
  readOnly
/>
```

#### États visuels

- **Normal** : Bordure `border-stone-200`, fond blanc
- **Focus** : Bordure `ring-palette-forest-dark`
- **Error** : Bordure rouge, texte erreur en dessous
- **Disabled** : Fond `bg-stone-100`, texte `text-stone-500`, cursor not-allowed
- **ReadOnly** : Fond `bg-stone-100`, texte `text-stone-500`

#### Variante : champ avec préfixe langue (EN/FR)

Pour les champs bilingues (ex. offres coach : titre et description en français et anglais), on utilise un **champ dont la zone de saisie est précédée d’un préfixe langue** à l’intérieur du même bloc visuel.

- **Structure** : un conteneur flex avec `rounded-lg border border-stone-300 bg-white` et `focus-within:ring-2 focus-within:ring-palette-forest-dark` ; à gauche un `<span>` préfixe (EN ou FR), à droite l’`<input>` ou `<textarea>` (`border-0 bg-white`).
- **Préfixe EN et FR** : vert principal (même que les boutons) `text-palette-forest-dark bg-palette-forest-dark/10`, typo `text-[10px] font-bold uppercase tracking-wide`, séparateur `border-r border-stone-200`.
- **Champs titre** : conteneur en `flex`, préfixe avec `px-3 py-2.5` et `items-center`.
- **Champs description (textarea)** : conteneur en `flex items-stretch` pour que le préfixe prenne toute la hauteur du champ ; préfixe avec `min-h-full flex items-center justify-center` pour que la couleur couvre toute la hauteur.
- **Disposition** : EN à gauche, FR à droite (grille `grid-cols-2` pour titre et pour description).
- **Usage** : formulaire des offres coach (`app/[locale]/dashboard/profile/offers/OffersForm.tsx`). Pour les **offres publiées**, la zone tarification est en lecture seule : ligne compacte (prix + type) + badge « Non modifiable » (icône cadenas) ; le serveur n’envoie pas `price`/`price_type` à l’update. Une modale de confirmation avant publication rappelle que le prix sera non modifiable.

```tsx
// Exemple : titre bilingue
<div className="flex rounded-lg border border-stone-300 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-palette-forest-dark">
  <span className="shrink-0 px-2.5 py-2.5 text-[10px] font-bold uppercase text-palette-forest-dark bg-palette-forest-dark/10 border-r border-stone-200">EN</span>
  <input name="title_en" className="flex-1 min-w-0 py-2.5 pl-2 pr-4 bg-white border-0 ..." />
</div>
// Exemple : description (préfixe sur toute la hauteur)
<div className="flex rounded-lg border border-stone-300 bg-white overflow-hidden items-stretch focus-within:ring-2 focus-within:ring-palette-forest-dark">
  <span className="shrink-0 px-2.5 min-h-full text-[10px] font-bold uppercase text-palette-forest-dark bg-palette-forest-dark/10 flex items-center justify-center border-r border-stone-200">FR</span>
  <textarea name="description_fr" className="flex-1 min-w-0 py-2.5 pr-4 bg-transparent border-0 ..." />
</div>
```

---

### PasswordInput

**Fichier :** `components/PasswordInput.tsx`

Champ mot de passe avec le même contrat que `Input` (label, erreur, `forwardRef`, styles `lib/formStyles.ts`), plus un bouton à droite pour basculer entre masqué et visible. **Client component** (`'use client'`) — état local `visible` / `type="password"` | `type="text"`.

- **Icônes** : `components/icons/IconEye.tsx` (mot de passe masqué — clic pour afficher), `components/icons/IconEyeClosed.tsx` (mot de passe visible — clic pour masquer). Couleur via `currentColor` (`text-stone-500` sur le bouton).
- **Accessibilité** : `aria-label` via i18n `auth.showPassword` / `auth.hidePassword`, `aria-pressed={visible}`.
- **Usage** : page `app/[locale]/login/page.tsx` (connexion + inscription), modale `components/LoginForm.tsx`.

```tsx
import { PasswordInput } from '@/components/PasswordInput'

<PasswordInput
  id="password"
  label={t('password')}
  name="password"
  autoComplete="current-password"
  required
  placeholder={t('passwordPlaceholder')}
/>
```

---

### SearchInput

**Fichier :** `components/SearchInput.tsx`

Champ de recherche (`type="search"`) avec croix de suppression stylisée en vert (palette). Réutilise `Input` et applique la classe CSS `search-input-clear-green` pour le bouton clear natif (WebKit). Même hauteur, bordure et focus que l’Input (voir `lib/formStyles.ts`).

#### Props

Réutilise les props de `Input` (sans `type`, fixé à `"search"`) : `placeholder`, `value`, `onChange`, `aria-label`, `className`, `disabled`, etc.

```typescript
type SearchInputProps = Omit<React.ComponentProps<typeof Input>, 'type'> & {
  placeholder?: string
  'aria-label'?: string
}
```

#### Exemple

```tsx
import { SearchInput } from '@/components/SearchInput'

<SearchInput
  placeholder="Rechercher un athlète"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  aria-label="Rechercher un athlète"
/>
```

#### Style de la croix

La croix de suppression (bouton clear) est en vert `#627e59` (palette-forest-dark), définie dans `app/globals.css` (`.search-input-clear-green::-webkit-search-cancel-button`). Usage : listes filtrées, barre de recherche.

---

### Textarea

**Fichier :** `components/Textarea.tsx`

Zone de texte multi-lignes, mêmes conventions que Input.

#### Props

```typescript
type TextareaProps = {
  label?: string
  labelClassName?: string
  error?: string
  disabled?: boolean
  readOnly?: boolean
  name?: string
  placeholder?: string
  rows?: number
  defaultValue?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  className?: string
}
```

#### Exemples

```tsx
// Textarea simple
<Textarea 
  label="Présentation" 
  name="presentation"
  rows={5}
  placeholder="Parlez de votre expérience..."
/>

// Textarea avec compteur (custom)
<Textarea 
  label="Présentation" 
  name="presentation"
  maxLength={1000}
  onChange={(e) => setPresentationLength(e.target.value.length)}
/>
<p className="text-xs text-stone-500">{presentationLength} / 1000</p>

// Textarea disabled
<Textarea 
  label="Commentaire admin"
  value={comment}
  disabled
/>
```

---

### Badge

**Fichier :** `components/Badge.tsx`

Étiquettes pour sports, langues, objectifs, statuts.

#### Variantes

| Variante | Couleur | Usage |
|----------|---------|-------|
| `default` | Stone | Langues, étiquettes génériques |
| `primary` | Forest | Recommandations |
| `success` | Forest | Statut complété |
| `warning` | Amber | En attente, objectifs primaires |
| `sport-*` | Variable | Sports avec icônes (voir tableau couleurs sports) |

#### Props

```typescript
type BadgeProps = {
  variant?: 'default' | 'primary' | 'success' | 'warning'
  // Sport badges are fully driven by `lib/sportStyles.ts`.
  // The component also normalizes legacy/alias values (e.g. older DB values).
  sport?: string
  children?: React.ReactNode
  className?: string
}
```

#### Exemples

```tsx
// Badge simple
<Badge variant="default">Français</Badge>

// Badge sport avec icône (automatique)
<Badge sport="course" />  // Affiche icône course + "Course à pied"

// Badge sport avec label custom
<Badge sport="velo">Vélo de route</Badge>

// Badge warning
<Badge variant="warning">Objectif principal</Badge>

// Badge success
<Badge variant="success">Complété</Badge>
```

#### Sports disponibles

Tous les sports ont une icône SVG dédiée (définie dans `components/SportIcons.tsx`) :
- Course (`IconRunning`)
- Vélo (`IconBiking`)
- Natation (`IconSwimming`)
- Musculation (`IconDumbbell`)
- Trail (`IconMountain`)
- Randonnée (`IconPersonHiking`)
- Triathlon (`IconTriathlon`)
- Ski nordique (`IconNordicSki`)
- Ski de randonnée (`IconBackcountrySki`)
- Patin à glace (`IconIceSkating`)
- Escalade (`IconClimb`)
- Méditation (`IconMeditation`)
- Canot (`IconCanoe`)
- Surf (`IconSurf`)
- Golf (`IconGolf`)
- Yoga (`IconYoga`)

**Règle :** Pour afficher un sport, utiliser `<Badge sport="..." />` (ou `SportTileSelectable`) et laisser `Badge` résoudre le label, l’icône et les couleurs via `lib/sportStyles.ts` (`SPORT_TRANSLATION_KEYS`, `SPORT_ICONS`, `SPORT_BADGE_STYLES`, `normalizeSportType`).

---

### Avatar

**Fichier :** `components/Avatar.tsx`

Avatar réutilisable (photo ou initiales) utilisé dans la top bar dashboard, le drawer mobile, et les listes chat.

#### Règles

- **Fallback** : si pas d’image, afficher des initiales (via `getInitials` dans `lib/stringUtils.ts`).
- **Accessibilité** : si l’avatar est purement décoratif, utiliser `alt=""` + `aria-hidden`; sinon un `alt` descriptif.
- **Couleurs** : respecter les tokens (fallback généralement `bg-palette-forest-dark` + `text-white` ou neutres stone).

---

### AvatarImage

**Fichier :** `components/AvatarImage.tsx`

Wrapper image d’avatar (souvent basé sur `next/image`) : gère le rendu rond, le fallback, et la cohérence des tailles.

#### Usage

```tsx
import { AvatarImage } from '@/components/AvatarImage'

<AvatarImage
  src={profile.avatar_url}
  alt=""
  size="sm"
/>
```

---

### SportTileSelectable

**Fichier :** `components/SportTileSelectable.tsx`

Tuile sélectionnable pour sports (profil coach, profil athlète, filtres, demandes). Supporte trois usages : formulaire non contrôlé (`name` + `defaultChecked`), formulaire contrôlé (`name` + `checked` + `onChange` pour mise à jour dynamique, ex. section Objectifs et volume du profil athlète), et mode bouton contrôlé (`selected` + `onChange` sans `name`).

#### États visuels

| État | Apparence |
|------|-----------|
| Non sélectionné | Bordure grise (`border-stone-200`), fond blanc, hover bordure verte |
| Sélectionné | Bordure et fond vert forêt, texte blanc, ombre verte |

#### Props

```typescript
type SportTileSelectableProps =
  // Mode formulaire (uncontrolled ou controlled avec name)
  | {
      value: string
      name: string
      defaultChecked?: boolean
      checked?: boolean
      onChange?: (checked: boolean) => void
      disabled?: boolean
    }
  // Mode bouton contrôlé (sans name)
  | {
      value: string
      selected: boolean
      onChange: () => void
      disabled?: boolean
    }
```

#### Exemples

```tsx
// Mode formulaire (soumission avec FormData)
<form>
  <SportTileSelectable 
    value="course" 
    name="coached_sports"
    defaultChecked={coachedSports.includes('course')}
  />
  <SportTileSelectable 
    value="velo" 
    name="coached_sports"
    defaultChecked={coachedSports.includes('velo')}
  />
  <button type="submit">Enregistrer</button>
</form>

// Mode contrôlé (filtres)
const [selectedSports, setSelectedSports] = useState<string[]>([])
const toggleSport = (sport: string) => {
  setSelectedSports(prev => 
    prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]
  )
}

<SportTileSelectable 
  value="course"
  selected={selectedSports.includes('course')}
  onChange={() => toggleSport('course')}
/>
```

#### Tuiles de langues

Pour les langues, utiliser la même structure visuelle avec des boutons simples :

```tsx
<button
  type="button"
  onClick={() => toggleLanguage('fr')}
  className={`px-4 py-2 rounded-full border text-sm font-medium select-none transition-all ${
    selectedLanguages.includes('fr')
      ? 'border-palette-forest-dark bg-palette-forest-dark text-white shadow-[0_4px_6px_-1px_rgba(98,126,89,0.3)]'
      : 'border-stone-200 bg-white text-stone-600 hover:border-palette-forest-dark'
  }`}
>
  Français
</button>
```

---

### ActivityTile

**Fichier :** `components/ActivityTile.tsx`

Tuile d'activité unifiée pour afficher 3 types de contenus :
- Entraînements planifiés (workout)
- Activités Strava importées (strava)
- Objectifs de course (goal)

Design inspiré du style Strava avec bordure gauche colorée (4px) et badge en haut. La couleur s'adapte automatiquement selon le type d'activité ou de sport.

#### Règles critiques (tuiles entraînement / calendrier)

- **Couleur des tuiles = sport uniquement.** La bordure gauche et les couleurs de badge des tuiles d'entraînement (calendrier, modale, liste) sont **toujours** définies par le **type de sport** via `lib/sportStyles.ts` → `SPORT_CARD_STYLES` (course = forest-dark, vélo = olive, natation = sky, musculation = stone, etc.). Ne jamais utiliser une autre logique (ex. moment de la journée, statut) pour la couleur de la tuile.
- **Icônes sport = `components/SportIcons.tsx` uniquement.** Pour afficher un sport (tuile, formulaire, badge), utiliser les composants d'icône du projet : `IconRunning`, `IconBiking`, `IconSwimming`, `IconDumbbell`, `IconNordicSki`, `IconBackcountrySki`, `IconIceSkating`, etc. — mappés dans `lib/sportStyles.ts` via `SPORT_ICONS`. **Ne pas utiliser d'emojis** (🏃, 🚴, etc.) ni d'autres icônes pour les sports.

#### Types supportés

| Type | Badge | Bordure | Usage |
|------|-------|---------|-------|
| `workout` | Icône sport (variable) | Couleur du sport | Entraînements planifiés par le coach |
| `strava` | Logo Strava + label | Orange (`palette-strava`) | Activités importées depuis Strava |
| `goal` | Icône cible | Amber (principal) / Sage (secondaire) | Objectifs de course/compétition |

#### Props

**Props communes :**
```typescript
{
  title: string              // Titre principal de l'activité
  date?: string              // Date affichée en bas (ex: "Lun. 12 fév.")
  onClick?: () => void       // Fonction appelée au clic
  className?: string         // Classes CSS supplémentaires
}
```

**Props spécifiques par type :**

```typescript
// Type: workout
{
  type: 'workout'
  sportType: SportType       // 'course', 'velo', 'natation', etc.
  metadata?: string[]        // ["1h30", "15 km", "200m D+"] — natation : distance en m (ex. "2500 m")
}

// Type: strava
{
  type: 'strava'
  activityLabel: string      // "Run", "Ride", "Swim", etc.
  metadata?: string[]        // ["10.5 km", "150m D+", "50:24"]
}

// Type: goal
{
  type: 'goal'
  distance: number           // Distance en km (ex: 42.2)
  isPrimary: boolean         // true = amber, false = sage
}
```

#### Exemples

```tsx
// Entraînement planifié
<ActivityTile
  type="workout"
  sportType="course"
  title="Sortie longue en endurance"
  metadata={["1h30", "15 km", "200m D+"]}
  date="Lun. 12 fév."
  onClick={() => openWorkoutModal(workout)}
/>

// Activité Strava
<ActivityTile
  type="strava"
  activityLabel="Run"
  title="Morning run"
  metadata={["10.5 km", "150m D+", "50:24"]}
  date="Sam. 10 fév."
  onClick={() => openStravaDetails(activity)}
/>

// Objectif principal
<ActivityTile
  type="goal"
  isPrimary={true}
  title="Marathon de Paris"
  distance={42.2}
  date="Dim. 7 avr."
  onClick={() => openGoalModal(goal)}
/>

// Objectif secondaire
<ActivityTile
  type="goal"
  isPrimary={false}
  title="Semi-marathon de Lyon"
  distance={21.1}
  date="Sam. 23 mar."
  onClick={() => openGoalModal(goal)}
/>

// Sans date ni métadonnées (minimal)
<ActivityTile
  type="workout"
  sportType="velo"
  title="Sortie vélo"
  onClick={() => console.log('click')}
/>
```

#### États visuels

- **Normal** : Bordure `border-stone-200`, fond blanc, ombre légère (`shadow-sm`)
- **Hover** : Animation identique aux tuiles du calendrier (même comportement pour les 3 types)
  - Légère montée (`translateY(-2px)`)
  - Ombre plus prononcée (`box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)`)
  - Transition fluide (0.2s)
  - **Fond reste blanc** pour tous les types d'activités

**Note technique :** Utilise la classe CSS globale `.training-card` définie dans `app/globals.css`

#### Cas d'usage

**Modale "Activités du jour" (calendrier)**

Lorsqu'un jour contient plusieurs activités (X autres), la modale affiche une liste de tuiles unifiées :

```tsx
<Modal isOpen={modalOpen} onClose={onClose} title="Lundi 12 février">
  <div className="space-y-3 px-6 py-4">
    {activities.map(activity => {
      if (activity.type === 'goal') {
        return (
          <ActivityTile
            key={activity.id}
            type="goal"
            isPrimary={activity.isPrimary}
            title={activity.raceName}
            distance={activity.distance}
            date={activity.dateLabel}
            onClick={() => openGoal(activity)}
          />
        )
      }
      if (activity.type === 'workout') {
        return (
          <ActivityTile
            key={activity.id}
            type="workout"
            sportType={activity.sportType}
            title={activity.title}
            metadata={formatWorkoutMetadata(activity)}
            date={activity.dateLabel}
            onClick={() => openWorkout(activity)}
          />
        )
      }
      if (activity.type === 'strava') {
        return (
          <ActivityTile
            key={activity.id}
            type="strava"
            activityLabel={activity.activityType}
            title={activity.title}
            metadata={formatStravaMetadata(activity)}
            date={activity.dateLabel}
            onClick={() => openStrava(activity)}
          />
        )
      }
    })}
  </div>
</Modal>
```

#### Avantages du composant unifié

- ✅ **Cohérence visuelle** : Toutes les tuiles ont le même style de base
- ✅ **Couleurs adaptées** : La bordure et le badge s'adaptent automatiquement
- ✅ **Flexibilité** : Metadata optionnel pour contextes simplifiés
- ✅ **Accessibilité** : Bouton cliquable avec hover/focus states
- ✅ **Maintenabilité** : Un seul composant à maintenir pour 3 types d'activités

---

### TileCard

**Fichier :** `components/TileCard.tsx`

Conteneur réutilisable qui applique **le même style de tour (bordure)** que les tuiles de la modale « Activités du jour » (ActivityTile). Permet d’uniformiser l’affichage des cartes : page Objectifs, listes d’activités, etc., sans dupliquer les classes de bordure et de forme.

#### Style appliqué

- `rounded-lg` — Coins arrondis
- `border border-l-4` — Bordure générale grise + bordure gauche colorée 4px
- `border-stone-200` — Couleur de la bordure (hors gauche)
- `bg-white p-3 shadow-sm` — Fond, padding, ombre légère
- Optionnel : classe `.training-card` pour le hover (léger lift + ombre)

#### Props

```typescript
type TileCardProps = {
  leftBorderColor: 'amber' | 'sage' | 'forest' | 'strava' | 'gold' | 'olive' | 'stone'
  children: React.ReactNode
  badge?: React.ReactNode   // optionnel : badge à droite (ex. « Archivée », « Terminée »)
- Par défaut : `border border-l-4 border-stone-200` — bordure générale grise + bordure gauche colorée 4px
- Si `borderLeftOnly={true}` : `border-0 border-l-4` — **uniquement la bande gauche** (pas de contour). Utilisé pour les **tuiles résultat** (objectif passé avec résultat).
- `bg-white p-3 shadow-sm` — Fond, padding, ombre légère
- Optionnel : classe `.training-card` pour le hover (léger lift + ombre)

#### Props

```typescript
type TileCardProps = {
  leftBorderColor: 'amber' | 'sage' | 'forest' | 'strava' | 'gold' | 'olive' | 'stone'
  borderLeftOnly?: boolean   // true = bande gauche uniquement (tuiles résultat objectif)
  children: React.ReactNode
  badge?: React.ReactNode   // optionnel : badge à droite (ex. « Archivée », « Terminée »)
  className?: string
  interactive?: boolean   // true = applique training-card (hover)
  as?: 'div' | 'button'
  onClick?: () => void   // utilisé lorsque as="button"
  type?: 'button' | 'submit'
}
```

#### Couleurs de bordure gauche

| Valeur | Token | Usage |
|--------|--------|-------|
| `amber` | `palette-amber` | Objectif principal |
| `sage` | `palette-sage` | Objectif secondaire |
| `forest` | `palette-forest-dark` | Entraînement / action principale |
| `strava` | `palette-strava` | Activité Strava |
| `gold` | `palette-gold` | Trail, ski de randonnée |
| `olive` | `palette-olive` | Vélo, secondaire |
| `stone` | `stone-400` | Résultat objectif (bande grise, avec `borderLeftOnly`) ; archivé / terminé (offres, souscriptions) |
  </div>
</TileCard>

// Carte cliquable avec hover
<TileCard leftBorderColor="sage" interactive as="button" onClick={() => openGoal(goal)}>
  <div className="flex items-center gap-3">...</div>
</TileCard>

// Même style de tour que ActivityTile (objectif secondaire)
<TileCard leftBorderColor="sage" interactive>
  ...
</TileCard>

// Tuile archivée / terminée (badge à droite)
<TileCard leftBorderColor="stone" badge={t('status.archived')}>
  <h3 className="text-sm font-semibold text-stone-800">Titre</h3>
  <p className="text-xs text-stone-500 mt-1">...</p>
</TileCard>
```

#### Cas d’usage

- **Page Objectifs** : Afficher chaque objectif dans une TileCard avec `leftBorderColor="amber"` ou `"sage"` (passé : `stone` + `borderLeftOnly`). **Bloc date** à gauche : première ligne = mois + année (ex. « Mar. 26 »), deuxième ligne = jour ; utiliser **`formatGoalDateBlock`** (`lib/dateUtils.ts`, retourne `monthYear`, `day`). Même bloc sur les tuiles objectif partout (calendrier, modales liste objectifs, demande en attente, détail demande envoyée). Ligne sous la distance : si **objectif de temps** présent → « Objectif : X » ou (passé avec résultat) « Objectif X · Réalisé Y » ; si résultat seul → « distance · temps · place » ; si passé sans résultat → « Aucun résultat saisi » sur la même ligne. **Un seul bouton** d’action par tuile (libellé « Modifier » ou « Ajouter un résultat » selon date et présence de résultat), style **muted**, ouvrant **GoalFullModal** (onglets Objectif | Résultat, sauvegarde combinée `saveGoalFull`). Si date > aujourd’hui : onglet Objectif seul ; si date ≤ aujourd’hui : deux onglets, ouverture sur Résultat. Pas d’opacité sur les tuiles passées. Saisons triées de la plus loin dans le futur en haut. Formulaire d’ajout : champs objectif de temps (facultatif), unités h/min/s ; champs vides = 0. Utilitaires : `lib/goalResultUtils.ts` (hasGoalResult, formatGoalResultTime, hasTargetTime, formatTargetTime ; affichage unité « min » même pour une seule composante), `lib/dateUtils.ts` (formatGoalDateBlock).
- **Listes archivées / terminées** : Offres archivées (page Offres coach), historique des souscriptions (coach et athlète) — utiliser `leftBorderColor="stone"` et `badge` (libellé i18n « Archivée » ou « Terminée »).
- **Listes personnalisées** : Tout contenu qui doit reprendre le style « tuile avec bordure gauche colorée » sans utiliser le contenu prédéfini d’ActivityTile.

---

### Modal


// Tuile résultat (objectif passé avec résultat) — bande grise à gauche uniquement
<TileCard leftBorderColor="stone" borderLeftOnly>
  <div>... 21 km · 1h42 · 24e ...</div>
</TileCard>
```

#### Cas d’usage

- **Page Objectifs** : Objectifs dont la **date > aujourd’hui** → `leftBorderColor="amber"` ou `"sage"`. Dès que **date de l’événement ≤ aujourd’hui** (jour J inclus) → `leftBorderColor="stone"` et **`borderLeftOnly`** (bande grise à gauche uniquement). Ligne sous le nom : « distance km · temps · place » (ou « Aucun résultat saisi » si passé sans résultat). Un seul bouton d’action (Modifier / Ajouter un résultat), variant muted, ouvre **GoalFullModal**. Pas d’opacité réduite sur les tuiles passées (même rendu cliquable). Voir **Project_context.md §4.7** et archive `docs/archive/design-objectif-vs-resultat/`.

|| Taille | Largeur max | Usage |
||--------|-------------|-------|
|| `sm` | 384px | Confirmations simples, alertes |
|| `md` | 448px | Par défaut, formulaires standards |
|| `workout` | 644px (40.25rem) | Modales entraînement (md + ~44 %) |
|| `lg` | 512px | Formulaires étendus |
|| `xl` | 576px | Contenu riche |
|| `2xl` | 672px | Large contenu |
|| `3xl` | 768px | Détails coach, galeries |
|| `4xl` | 896px | Vues larges (détails coach complets) |
|| `full` | 95vw | Plein écran (chat, panels) |

#### Alignements

- `center` : Centré (défaut)
- `top` : En haut de l'écran
- `right` : À droite (pour chat, panels latéraux)

#### Props

```typescript
type ModalProps = {
  isOpen: boolean
  onClose: () => void
  /** Niveau d'empilement pour modale sur modale (0 = défaut, 1 = au-dessus d'une autre modale) */
  layer?: number
  size?: 'sm' | 'md' | 'workout' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'
  alignment?: 'center' | 'top' | 'right'
  title?: string
  icon?: React.ReactNode
  iconRaw?: boolean   // true = icône rendue telle quelle (ex. tuile sport pill), sans wrapper rond
  titleWrap?: boolean // true = titre sur plusieurs lignes sur petit écran (pas de truncate)
  headerRight?: React.ReactNode
  hideCloseButton?: boolean
  disableOverlayClose?: boolean
  disableEscapeClose?: boolean
  footer?: React.ReactNode
  /** Zone fixe entre le corps scrollable et le footer (ex. bandeau horaires installations) */
  preFooter?: React.ReactNode
  className?: string
  contentClassName?: string
  titleId?: string
  children: React.ReactNode
}
```

**Usage avancé :** La modale entraînement (`WorkoutModal`) utilise la taille `workout` (644px), `iconRaw` et `titleWrap`. **Création et édition coach :** date à gauche (sans titre ni icône check), badge statut à droite ; corps : Sport, titre, **Moment de la journée** (segments Non précisé | Matin | Midi | Soir, même style que Temps/Distance), objectifs, description. **Athlète (saisie + preview) et coach lecture seule :** corps construit autour de **`WorkoutTargetActualCards`** (deux cartes côte-à-côte Objectif vs Réalisé hero) suivi de **`WorkoutFeedbackSummary`** (3 tuiles feedback distribuées full-width). Tuile sport en en-tête : taille **`text-xs`**, icône **`w-3 h-3`**, padding **`px-3 py-1.5`**, gap **`gap-1.5`** (réduction ~15 % par rapport au pattern initial pour ne pas surcharger l'en-tête). **Athlète (saisie) :** section feedback `WorkoutFeedbackSection` (statut = Réalisé) — trois échelles optionnelles avec **couleurs sémantiques par valeur** issues de `lib/workoutFeedbackColors.ts` (voir ci-dessous). **Lecture seule** (athlète / coach passé) : tuile pill du sport + titre de la séance à gauche (titre peut passer sur deux lignes sur petit écran), badge statut à droite ; pas de form ni boutons. Styles formulaires : `lib/formStyles.ts`.

### WorkoutTargetActualCards

**Fichier :** `components/workout-modal/WorkoutTargetActualCards.tsx`

Deux cartes responsive côte-à-côte (`grid-cols-1 md:grid-cols-2`) qui résument l'**Objectif** (planifié) et le **Réalisé** (saisi par l'athlète) d'une séance. Utilisé dans `AthleteWorkoutModalView` (avec live preview) et `CoachReadOnlyWorkoutModalView` (lecture seule).

**Carte Objectif** (light, `bg-stone-50`) : header `Target` icon + titre, lignes `min-h-7` durée / distance / allure / D+ selon sport, description en bas avec séparateur `pt-4 border-t border-stone-200 mt-4` si présente. Layout interne : `space-y-3.5` quand la carte Réalisé est visible, sinon `grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5` pour aérer.

**Carte Réalisé hero** (dark, `bg-palette-forest-dark`, ombre `shadow-palette-forest-dark/20`, icône `Trophy` opacité 10 % en background) : header `CheckCircle2` + titre, lignes `min-h-7` valeur en `text-xl font-black` blanc + chip delta optionnelle (`±M:SS/km`, `±N km/h`, `±N,N km`, `±N min`) ; **commentaire athlète** intégré en bas avec séparateur `border-white/20` si métriques au-dessus. La carte est rendue dès qu'il y a au moins une métrique réalisée **ou** un commentaire athlète.

**Format des deltas** (centralisé dans `lib/workoutFormatting.ts`, testé via Vitest) :
- Durée : `±NhMM` ou `±N min`
- Distance : `±N,N km` (ou `±N m` natation)
- Allure (course / trail) : `±M:SS/km` (format mm:ss aligné sur la valeur affichée `4:55 min/km`)
- Allure (natation) : `±M:SS/100m`
- Vitesse (vélo / triathlon / canot) : `±N,N km/h`
- D+ : `±N m`
- Tolérance : delta `null` (chip masquée) si écart négligeable après arrondi.

**Props :**

| Prop | Type | Description |
|------|------|-------------|
| `workout` | `Workout` | Données séance (targets + actuals + sport + status). |
| `liveActual` | `LiveActualMetrics` (optionnel) | Override des `actual_*` pour le live preview athlète. |
| `athleteComment` | `string \| null` (optionnel) | Affiché en bas de la card Réalisé (lecture seule). Non passé côté athlète saisie. |
| `locale` | `'fr' \| 'en'` | Locale d'affichage (formatage nombres). |
| `tWorkouts` | `(key: string) => string` | Fonction de traduction pour le namespace `workouts`. |

### WorkoutFeedbackSummary

**Fichier :** `components/workout-modal/WorkoutFeedbackSummary.tsx`

Trois tuiles read-only (Ressenti / Intensité RPE / Plaisir) **distribuées full-width** (`flex flex-col sm:flex-row gap-6`, chaque enfant en `flex-1 min-w-0`). Chaque tuile : `w-12 h-12 rounded-xl border` colorée selon la valeur via `lib/workoutFeedbackColors.ts` (voir Feedback colors), avec icône Lucide (Angry → Laugh pour 1–5) ou nombre (intensité 1–10) à gauche, label texte à droite. Composant entièrement masqué si les trois feedbacks sont `null`.

### WorkoutFeedbackSection (athlète, picker)

**Fichier :** `components/workout-modal/WorkoutFeedbackSection.tsx`

Picker athlète pour la saisie des trois feedbacks (statut = Réalisé). Trois rangées `flex w-full gap-2`. Boutons sélectionnés colorés via `lib/workoutFeedbackColors.ts` :
- Feeling / Pleasure : `border-2` + fond léger (`FEELING_PICKER_SELECTED_BG`), icône + label colorés (`FEELING_PICKER_SELECTED_TEXT`) — couleur miroir de la tuile read-only correspondante.
- Intensité (10 cases) : fond plein saturé + texte blanc (`INTENSITY_PICKER_SELECTED`) pour lisibilité immédiate dans une rangée compacte.

Boutons non sélectionnés : neutres `border-stone-200 bg-white text-stone-500/600` (interaction au hover : `bg-stone-50`).

### Feedback colors — `lib/workoutFeedbackColors.ts`

**Source unique de vérité** pour les couleurs sémantiques des feedbacks (Ressenti, Intensité RPE, Plaisir). Mutualisée entre la tuile read-only coach (`WorkoutFeedbackSummary`) et le picker athlète (`WorkoutFeedbackSection`).

Records statiques (classes Tailwind écrites en clair pour JIT) :
- `FEELING_TILE_CLASSES` (1–5) : tuile read-only — bg/text/border léger, dégradé 1 = `palette-danger` → 5 = `palette-forest-dark`.
- `INTENSITY_TILE_CLASSES` (1–10) : tuile read-only — dégradé 1–2 = `palette-forest-dark`, 3–4 = `palette-sage`, 5–7 = `palette-amber` (5 = orange exact), 8–10 = `palette-danger`.
- `FEELING_PICKER_SELECTED_BG` (1–5) : picker sélectionné — `border-palette-X bg-palette-X/10-20`.
- `FEELING_PICKER_SELECTED_TEXT` (1–5) : couleur icône + label sélectionnés.
- `INTENSITY_PICKER_SELECTED` (1–10) : picker sélectionné — fond plein `bg-palette-X text-white`.

Toutes les classes utilisent les tokens `palette-*` du design system (`palette-forest-dark`, `palette-sage`, `palette-amber`, `palette-danger`). Aucun hex.

#### Exemples

```tsx
// Modale simple
const [isOpen, setIsOpen] = useState(false)

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modifier le profil"
>
  <div className="px-6 py-4">
    <p>Contenu de la modale...</p>
  </div>
</Modal>

// Modale avec icône et footer
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Enregistrer les modifications"
  icon={
    <svg className="h-5 w-5" {...}>
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  }
  footer={
    <div className="flex gap-3 w-full">
      <Button variant="muted" onClick={() => setIsOpen(false)} className="flex-1">
        Annuler
      </Button>
      <Button variant="primaryDark" onClick={handleSave} className="flex-1">
        Enregistrer
      </Button>
    </div>
  }
>
  <div className="px-6 py-4">
    {/* Formulaire ou contenu */}
  </div>
</Modal>

// Confirmation de suppression (petite)
<Modal
  isOpen={confirmOpen}
  onClose={() => setConfirmOpen(false)}
  title="Confirmer la suppression ?"
  size="sm"
  footer={
    <div className="flex gap-3 w-full">
      <Button variant="muted" onClick={() => setConfirmOpen(false)} className="flex-1">
        Annuler
      </Button>
      <Button variant="danger" onClick={handleDelete} className="flex-1">
        Supprimer
      </Button>
    </div>
  }
>
  <div className="px-6 py-4">
    <p className="text-sm text-stone-600">
      Cette action est irréversible. Continuer ?
    </p>
  </div>
</Modal>

// Modale large (détails coach)
<Modal
  isOpen={detailsOpen}
  onClose={() => setDetailsOpen(false)}
  size="4xl"
  title="Détails du coach"
  headerRight={
    <Button variant="outline" onClick={handleContact}>
      Contacter
    </Button>
  }
>
  <div className="px-6 py-4">
    {/* Contenu large avec colonnes, images, etc. */}
  </div>
</Modal>
```

#### Caractéristiques

- **Overlay** : Fond gris foncé avec flou (`backdrop-blur-sm`)
- **Escape** : Fermeture automatique avec Escape (désactivable)
- **Clic overlay** : Fermeture au clic sur l'overlay (désactivable)
- **Body overflow** : Gestion automatique du `overflow: hidden` sur body
- **Portal** : Rendu dans `document.body` avec `createPortal`
- **Accessibilité** : `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- **Z-index** : Overlay et contenu ont un z-index de base (90 / 100) ; prop **`layer`** (ex. `layer={1}`) augmente le z-index pour les modales ouvertes **au-dessus d’une autre** (demande de coaching → Ajouter objectif, Voir plus, Modifier le résultat), évitant masquage et scroll de la modale sous-jacente.

#### Structure

```tsx
<Modal> contient automatiquement :
  - Header (si title ou headerRight fournis)
    - Icône optionnelle (badge vert forêt)
    - Titre
    - Contenu custom à droite (headerRight)
    - Bouton fermer (X) par défaut
  - Corps scrollable (children)
  - preFooter optionnel (fixe, entre corps et footer — bandeau contextuel générique)
  - Footer optionnel (fixe, ne scroll pas)
```

#### Modales auth dérivées

- **EmailValidatedModal** (`components/EmailValidatedModal.tsx`) : modale affichée après confirmation d’email (landing avec `?emailConfirmed=1`). Taille `md`, titre i18n « Email validé », message « Vous pouvez vous connecter », formulaire de connexion (email, mot de passe, bouton Se connecter) dans la modale. Utilise `Modal`, `Input`, `Button`, action `login` ; fermeture par overlay/Escape. i18n : `auth.emailValidatedTitle`, `auth.emailValidatedMessage`.
- **HomeEmailConfirmedTrigger** (`components/HomeEmailConfirmedTrigger.tsx`) : composant client rendu sur la page d’accueil ; reçoit `showEmailConfirmedModal={true}` quand l’URL contient `emailConfirmed=1` ; ouvre `EmailValidatedModal` à l’affichage. Utilisé par `app/[locale]/page.tsx`.

```tsx
// Page d'accueil : après callback confirmation email
<HomeEmailConfirmedTrigger showEmailConfirmedModal={emailConfirmed} />
```

### CoachReviewsModal

**Fichier :** `components/CoachReviewsModal.tsx`

Liste des avis publics pour un coach (note 1–5, date, commentaire ou libellé « Pas de commentaire »). Données via RPC Supabase `get_coach_public_reviews` (server action `getCoachPublicReviews` dans `app/[locale]/dashboard/find-coach/reviewsActions.ts`). S’ouvre au clic sur « (N avis) » dans `CoachTile` ou dans l’en-tête de la modale détail coach (`FindCoachSection` / `CoachDetailModal`). Utilise `Modal` taille `lg` ; **`layer={1}`** lorsque la modale détail coach est déjà ouverte. i18n : `findCoach.reviewsModal`.

```tsx
import { CoachReviewsModal } from '@/components/CoachReviewsModal'

<CoachReviewsModal
  isOpen={open}
  onClose={() => setOpen(false)}
  coachId={coachId}
  coachDisplayName={displayName}
/>
```

### WorkoutFacilityHoursStrip

**Fichier :** `components/workout-modal/WorkoutFacilityHoursStrip.tsx`

Modale workout **coach** : rendu **sous la date** dans l’en-tête (`variant="compact"`) ; sinon usage avec `variant="default"`. Une ligne par installation : **icône bâtiment** (`IconBuilding`, identique pour toutes) · **nom** · **créneaux** ou fermé (`facilities.hours.closed`). Données : `lib/workoutFacilityHours.ts` (`getWorkoutFacilityDisplayLines`, `facilityType` pour filtrage / clés).

### AthleteFacilityDetails

**Fichier :** `components/AthleteFacilityDetails.tsx`

Affichage **lecture seule** d’une installation athlète : badge type (couleur sport via `Badge sport={…}`), nom, adresse complète, grille horaires sur 7 jours (ouverts / fermés, créneaux formatés via `lib/facilityHoursUtils`). i18n : `facilities.facilityTypes`, `facilities.days`, `facilities.hours`. **En-tête** : en colonne sur mobile, ligne à partir de `sm` pour éviter que badge + titre ne compressent les boutons `headerRight`.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `facility` | `AthleteFacility` | Données installation |
| `headerRight` | `ReactNode` (optionnel) | Zone à droite du titre (ex. boutons Modifier / Supprimer sur Mon profil) |
| `footer` | `ReactNode` (optionnel) | Sous le bloc adresse + horaires (ex. message d’erreur suppression) |

#### Usage

- **Page Mon profil — Installations** : `AthleteFacilityCard` compose `AthleteFacilityDetails` avec `headerRight` (actions) et `footer` si erreur.
- **Calendrier coach (onglet Installations)** : si `canEdit`, même `AthleteFacilityCard` + `AthleteFacilityModal` (édition / suppression pour l’athlète) ; sinon `AthleteFacilityDetails` seul.

```tsx
import { AthleteFacilityDetails } from '@/components/AthleteFacilityDetails'

<AthleteFacilityDetails facility={facility} />

<AthleteFacilityDetails
  facility={facility}
  headerRight={<>{/* boutons */}</>}
  footer={<p className="mt-3 text-sm text-palette-danger">{deleteError}</p>}
/>
```

---

### CoachAthleteNotesSection

**Fichier :** `components/CoachAthleteNotesSection.tsx`

Liste des **notes privées coach** sur l’onglet **Notes** du calendrier athlète (`CoachAthleteCalendarPage`) : première ligne = CTA pleine largeur « Nouvelle note » (bordure en pointillés `palette-forest-dark`), puis tuiles `TileCard` (`leftBorderColor="sage"`), titre + corps en `line-clamp-3`, actions **Modifier** / **Supprimer**. État vide sous le CTA. i18n : `coachAthleteNotes`. Données : table `coach_athlete_notes` (auteur = coach connecté uniquement).

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `athleteId` | `string` | ID athlète |
| `initialNotes` | `CoachAthleteNote[]` | Notes chargées côté serveur (`updated_at` desc) |
| `onNotesChanged` | `() => void` | Après CRUD réussi (ex. `router.refresh()`) |

---

### CoachAthleteNoteModal

**Fichier :** `components/CoachAthleteNoteModal.tsx`

Modale **création / édition** de note (`Modal` taille `lg`) : champs `Input` titre et `Textarea` corps (obligatoires), boutons Annuler / Enregistrer ; en édition, **Supprimer la note** (variant `danger`) avec confirmation navigateur. Actions serveur : `createCoachAthleteNote`, `updateCoachAthleteNote`, `deleteCoachAthleteNote`. i18n : `coachAthleteNotes` + `coachAthleteNotes.validation`.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | |
| `onClose` | `() => void` | |
| `athleteId` | `string` | |
| `note` | `CoachAthleteNote \| null` | `null` = création |
| `onSaved` | `() => void` | Rafraîchissement liste parent |

---

### CoachPlatformSubscriptionOffers

**Fichier :** `components/CoachPlatformSubscriptionOffers.tsx`

Section **client** de la page **`/dashboard/coach-platform-subscription`** : enveloppe `<section>` + **`CoachPlatformOfferGrid`** avec `showOffersHeading` ; checkout via **`createCoachPlatformCheckoutSession`**. Données : `CoachPlatformCatalogOffer[]` côté serveur. Libellés marketing par offre : **`coachMsaOffers.byPriceId`** (repli sur nom / description produit Stripe).

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `offers` | `CoachPlatformCatalogOffer[]` | Prix Stripe autorisés par env |

---

### CoachPlatformOfferGrid

**Fichier :** `components/CoachPlatformOfferGrid.tsx`

Grille responsive **`grid-cols-1 md:grid-cols-2`** : cartes offre (titre / description affichés via **`enrichCoachPlatformOffersForDisplay`** + `useMessages().coachMsaOffers.byPriceId`), prix `Intl`, intervalle (**`coachMsaSubscription`**), CTA **Souscrire** / **Redirection…**. Réutilisé par la page abonnement et la modale souscription.

#### Props principales

| Prop | Type | Description |
|------|------|-------------|
| `offers` | `CoachPlatformCatalogOffer[]` | |
| `showOffersHeading` | `boolean` (déf. `false`) | Bandeau « Offres disponibles » |
| `pendingPriceId` / `isPending` | | État bouton actif |
| `error` | `string \| null` | Erreur checkout |
| `onSubscribe` | `(priceId: string) => void` | |

---

### CoachPlatformSubscribeOffersModal

**Fichier :** `components/CoachPlatformSubscribeOffersModal.tsx`

**`Modal`** taille **`3xl`** : chargement catalogue (**`loadCoachPlatformCatalogForCoach`**), erreur catalogue, liste vide, puis **`CoachPlatformOfferGrid`**. Intro optionnelle (`introSlot`, ex. demande en attente). Fermeture / overlay / Escape désactivés pendant redirection. i18n : **`coachMsaOffers`**.

#### Props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | |
| `onClose` | `() => void` | |
| `introSlot` | `React.ReactNode` | Contexte au-dessus de la grille (optionnel) |

---

### DashboardPageShell

**Fichier :** `components/DashboardPageShell.tsx`

Shell standard des pages dashboard. **Règle projet :** une page dashboard doit utiliser `DashboardPageShell` (pas de `<main>` custom).

#### Rôle

- Fournit le **conteneur** et le **padding** cohérents du contenu.
- Ne duplique pas le layout global (top bar / drawer) : c’est géré par `app/[locale]/dashboard/layout.tsx`.
- Peut accepter un `contentClassName` pour des variantes (ex. pages avec padding réduit).

#### Exemple

```tsx
import { DashboardPageShell } from '@/components/DashboardPageShell'

export default function Page() {
  return (
    <DashboardPageShell>
      <div className="space-y-6">
        {/* contenu */}
      </div>
    </DashboardPageShell>
  )
}
```

---

### DashboardTopBar

**Fichier :** `components/DashboardTopBar.tsx`

Top bar du dashboard.

**Bandeau :** `sticky top-0 z-50`, hauteur `h-14`, fond blanc, `border-b border-stone-200` — même logique de persistance au défilement que `PublicHeader` lorsque la barre est utilisée sur des pages à scroll long (ex. pages marketing avec `PublicOrDashboardHeader`).

#### Comportement attendu

- **Desktop / tablette** : logo à gauche, navigation centrée, à droite selon le rôle :
  - **Athlète** : liens principaux centrés (Trouver mon coach si besoin, Mon calendrier, Mes objectifs) + **`AthleteAccountMenu`** (avatar, nom, chevron) : panneau avec entrées secondaires, séparateur, Mes informations, déconnexion.
  - **Coach / admin** : liens centrés + lien direct **profil** (avatar + nom) vers `/dashboard/profile`.
- **Mobile** : titre de page au centre, bouton “menu” à droite ; clic ouvre un **Drawer**.
- **Rôles** : navigation adaptée au rôle (athlete/coach/admin). Drawer athlète : mêmes blocs que le menu compte (séparateurs `border-stone-200`).

#### Composants associés

- `DashboardNavLinks` / `DashboardNavIcons` : configuration et rendu des liens (`onItemClick` optionnel pour fermer le drawer).
- `AthleteAccountMenu` : menu compte desktop athlète uniquement.
- `Drawer` : menu mobile.
- `LogoutButton` : déconnexion (variant `danger`).

---

### AthleteAccountMenu

**Fichier :** `components/AthleteAccountMenu.tsx`

Menu compte **desktop (md+)** pour l’**athlète** : trigger avatar + nom tronqué + chevron ; panneau aligné sous le trigger (`absolute right-0`, `z-40`), fermeture clic extérieur / Escape / navigation. Contenu : appareils, Mon coach (si `coach_id`), historique souscriptions ; **séparateur** ; **Contactez-nous** (`/contact`, `getContactPublicNavItem`) ; **séparateur** ; Mes informations (`/dashboard/profile`) ; **LogoutButton**. Styles de lignes alignés sur `DashboardNavLinks` (actif = vert forêt). Source des entrées : `getAthleteAccountNavItems`, `getAthleteProfileNavItem` dans `lib/dashboardNavConfig.ts`.

```tsx
import { AthleteAccountMenu } from '@/components/AthleteAccountMenu'

<AthleteAccountMenu
  profile={profile}
  displayName={displayName}
  profileLabel={profileLabel}
  initials={initials}
/>
```

---

### CoachAccountMenu

**Fichier :** `components/CoachAccountMenu.tsx`

Menu compte **desktop (md+)** pour le **coach** : même pattern que `AthleteAccountMenu` (trigger, panneau, fermeture). Contenu : **Mes informations** (`/dashboard/profile`) ; **Contactez-nous** (`/contact`) ; **LogoutButton**. Trigger actif sur `/dashboard/profile` ou `/contact` (`isCoachAccountMenuTriggerActive`). Utilisé par `DashboardTopBar` à la place du simple lien profil pour le rôle coach.

```tsx
import { CoachAccountMenu } from '@/components/CoachAccountMenu'

<CoachAccountMenu
  profile={profile}
  displayName={displayName}
  profileLabel={profileLabel}
  initials={initials}
/>
```

---

### Drawer

**Fichier :** `components/Drawer.tsx`

Overlay latéral (principalement pour le menu mobile dashboard). Le Drawer est un “panel” qui apparaît depuis la droite.

#### Règles

- **Accessibilité** : `role="dialog"`, `aria-modal="true"`, focus visible, fermeture Escape.
- **Overlay** : fond semi-opaque avec blur (`backdrop-blur-sm`) cohérent avec `Modal`.
- **Z-index** : doit rester cohérent avec la hiérarchie des overlays (`Modal` au-dessus si nécessaire).

#### Exemple

```tsx
import { Drawer } from '@/components/Drawer'

<Drawer isOpen={isOpen} onClose={onClose} title="Menu">
  <div className="p-4">{/* navigation */}</div>
</Drawer>
```

---

### PublicOrDashboardHeader

**Fichier :** `components/PublicOrDashboardHeader.tsx`

Composant **serveur** : si session active (`getOptionalUserWithProfile`), rendu de `DashboardTopBar` (même barre que le dashboard) ; sinon `PublicHeader`. Utilisé sur l’accueil, contact, politique de confidentialité, CGU et réinitialisation mot de passe.

```tsx
import { PublicOrDashboardHeader } from '@/components/PublicOrDashboardHeader'

<div className="min-h-screen flex flex-col">
  <PublicOrDashboardHeader />
  <main className="flex-1">...</main>
</div>
```

---

### PublicHeader

**Fichier :** `components/PublicHeader.tsx`

En-tête public pour **visiteurs** : logo My Sport Ally (lien vers `/`), LanguageSwitcher, séparateur vertical, AuthButtons (Se connecter, Créer un compte). Classes : `sticky top-0 z-50 border-b border-stone-200 bg-background/95 backdrop-blur-md`, conteneur `max-w-7xl h-16`.

**Usage :** Rendu indirectement via `PublicOrDashboardHeader` sur les pages marketing ; ne pas l’utiliser seul sur ces routes sauf cas exceptionnel. Référence design archivée : `docs/archive/design-reset-password-header/DESIGN_RESET_PASSWORD_HEADER.md`.

```tsx
import { PublicHeader } from '@/components/PublicHeader'

<div className="min-h-screen flex flex-col">
  <PublicHeader />
  <main className="flex-1">...</main>
</div>
```

---

### ContactForm

**Fichier :** `components/ContactForm.tsx`

Formulaire **public** de contact support (`/contact`, `/en/contact`) : prénom, nom, e-mail, téléphone optionnel, **motif** (`Dropdown` + `CONTACT_REASON_KEYS` / `lib/contactReasons.ts`), message (`Textarea`). **Plafonds** alignés avec l’action serveur via `lib/contactFormConstraints.ts` (`CONTACT_MAX_NAME`, `CONTACT_MAX_MESSAGE`, `CONTACT_EMAIL_RE`, etc.) et attributs `maxLength` sur les champs. Bouton **Envoyer** désactivé tant que les champs requis ne sont pas valides. Succès : encart avec référence `MSA-…` (tokens `palette-forest-*`). Erreurs serveur : `contact.errors` (dont messages séparés **vide** vs **trop long** pour prénom, nom, message). Champs cachés : `_locale`, honeypot `website`. Action : `submitContact` (`app/[locale]/contact/actions.ts`).

---

### LanguageSwitcher

**Fichier :** `components/LanguageSwitcher.tsx`

Sélecteur de langue (FR/EN) basé sur le composant **Dropdown** : trigger compact (icône globe + code FR/EN + chevron), menu avec libellés « Français » / « English », option active en vert (sans coche). Utilise `Dropdown` avec `valueDisplay`, `triggerPrefix` (Globe), `hideLabel` et `minWidth="5.5rem"`. Affiché dans le header public (page d'accueil, reset-password) et dans la page profil. Aperçu dans la page Design System (admin).

```tsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

<LanguageSwitcher />
```

---

### Dropdown

**Fichier :** `components/Dropdown.tsx`

Menu déroulant : label au-dessus, bouton trigger (même style que Input via `FORM_BASE_CLASSES`), panneau d’options avec fermeture au clic extérieur. États des options alignés sur la sidebar (ChatConversationSidebar) : **sélectionné** = fond vert `bg-palette-forest-dark` texte blanc + ombre ; **non sélectionné** = `text-stone-500` avec hover `hover:bg-stone-50 hover:text-palette-forest-dark`. Curseur pointer sur les options.

#### Props

```typescript
type DropdownOption = { value: string; label: string }

type DropdownProps = {
  id: string
  label: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  ariaLabel?: string
  minWidth?: string   // ex. "200px"
  className?: string
  hideLabel?: boolean  // masquer le label (ex. calendrier en-tête)
  valueDisplay?: string   // texte dans le trigger à la place du label (ex. "FR" pour LanguageSwitcher)
  triggerPrefix?: React.ReactNode   // contenu avant le label dans le trigger (ex. icône globe)
  showCheckmark?: boolean   // coche sur l’option sélectionnée dans le menu
}
```

#### Exemple

```tsx
import { Dropdown } from '@/components/Dropdown'

const options = [
  { value: 'name_asc', label: 'Nom (A–Z)' },
  { value: 'planned_until_asc', label: 'Date planifiée' },
]

<Dropdown
  id="sort-trigger"
  label="Trier par"
  options={options}
  value={sortMode}
  onChange={setSortMode}
  ariaLabel="Trier par"
  minWidth="200px"
/>
```

#### Comportement

- Clic sur le trigger : ouverture/fermeture du panneau.
- Clic sur une option : `onChange(value)` puis fermeture.
- Clic à l’extérieur : fermeture (useEffect + mousedown).
- Accessibilité : `role="listbox"`, `aria-expanded`, `aria-selected` sur les options.
- **Panneau d’options** : `max-h-64 overflow-y-auto` pour limiter la hauteur et permettre le scroll lorsque la liste est longue (ex. liste des mois du calendrier).
- **hideLabel** : quand `true`, le label n’est pas rendu (usage dans le popup calendrier, en-tête).
- **valueDisplay** : si fourni, affiché dans le trigger à la place du label de l’option (ex. code langue).
- **triggerPrefix** : rendu avant le label dans le trigger (ex. icône Globe pour LanguageSwitcher).
- **showCheckmark** : quand `true`, une coche est affichée sur l’option sélectionnée dans le menu.

---

### Segments

**Fichier :** `components/Segments.tsx`

Groupe de choix exclusif par segments (offres, dispo, stats, moment de la journée séance coach, onglets sous calendrier coach, etc.). **Conteneur :** `bg-white`, bordure `border-white`, coins `rounded-lg`. **Sélectionné :** `bg-palette-forest-dark`, texte blanc, ombre légère. **Non sélectionné :** `bg-white`, `text-stone-600`, bordure `stone-200`, survol aligné nav dashboard : `hover:bg-stone-50` + `hover:text-palette-forest-dark`. **Tailles :** `md` (défaut, `text-sm`, min-h 42px), `sm` (`text-xs`, blocs compacts), `lg` (`text-base font-bold`, icône + libellé, ex. onglets objectifs / installations / notes). Focus clavier : anneau `palette-forest-dark` sur le segment via `peer-focus-visible`.

#### Props

```typescript
type SegmentOption = { value: string; label: React.ReactNode }

type SegmentsProps = {
  options: SegmentOption[]
  value: string
  onChange: (value: string) => void
  name: string
  ariaLabel?: string
  size?: 'sm' | 'md' | 'lg'   // md = text-sm min-h 42px (défaut), sm = text-xs, lg = text-base font-bold (onglets calendrier coach)
  className?: string
}
```

#### Exemple

```tsx
import { Segments } from '@/components/Segments'

<Segments
  name="price-type"
  options={[
    { value: 'monthly', label: t('priceTypes.monthly') },
    { value: 'one_time', label: t('priceTypes.oneTime') },
    { value: 'free', label: t('priceTypes.free') },
  ]}
  value={priceType}
  onChange={setPriceType}
  ariaLabel={t('recurrence')}
/>

// Taille compacte (bloc récurrence)
<Segments name="recurrence" options={[...]} value={...} onChange={...} size="sm" />
```

#### Comportement

- Inputs radio masqués (sr-only), labels cliquables ; un seul choix possible.
- **size="md"** (défaut) : hauteur min 42px, texte `text-sm`.
- **size="sm"** : `text-xs` pour blocs secondaires (ex. récurrence, filtres stats, statut séance athlète).
- **size="lg"** : `text-base font-bold`, disposition `gap-2` pour libellé + icône (onglets sous le calendrier coach).
- Sur petits écrans, les labels peuvent être rendus sur 2 lignes (ex. types d’installation) ; à partir de `sm`, rendu compact sur une ligne.
- Les segments gardent une hauteur interne homogène via `min-h-*` même si un libellé tient sur une seule ligne.

---

### DatePickerPopup

**Fichier :** `components/DatePickerPopup.tsx`

Popup calendrier pour la sélection d’une date. **Deux Dropdown** (Mois, Année) + deux boutons flèche réduits, grille de jours (semaine lundi–dimanche), date sélectionnée en `bg-palette-forest-dark text-white`, lien « Aujourd'hui » au pied (pas de bouton Effacer — date obligatoire). Style **compact** : padding `p-3`, largeur `min(280px, 90vw)`, cellules `h-8` / `min-w-[2rem]` / `text-xs`, dropdowns avec `triggerClassName="py-2 px-3 text-xs"` et `optionClassName="text-xs py-2 px-3"`, pied `mt-3 pt-2`. Plage années : **−4 / +4** par rapport à l'année courante. **Utilisé partout** : modale entraînement (WorkoutModal), disponibilités (AvailabilityModal), objectifs (page, GoalEditModal, GoalFullModal, ObjectifsTable), demande de coaching (RequestGoalAddModal). Trigger du champ date : même hauteur que les champs (`FORM_INPUT_HEIGHT`) et même taille de police (`FORM_INPUT_TEXT_SIZE` = text-sm) ; affichage de la date **sans jour de la semaine** (`formatDateFr(..., false)`). i18n : `calendar.chooseMonth`, `chooseYear`, `prevMonth`, `nextMonth`, `today`. Design archivé : `docs/archive/design-date-picker-compact/` (DESIGN_DATE_PICKER_COMPACT.md, SPEC, MOCKUP_*).

#### Props

```typescript
type DatePickerPopupProps = {
  value: string              // YYYY-MM-DD
  onChange: (dateStr: string) => void
  locale: string             // ex. 'fr-FR', 'en-US'
  minDate?: string           // YYYY-MM-DD optionnel
  maxDate?: string           // YYYY-MM-DD optionnel
  monthDropdownId?: string
  yearDropdownId?: string    // défaut : ${monthDropdownId}-year
  className?: string
}
```

#### Exemple

```tsx
import { DatePickerPopup } from '@/components/DatePickerPopup'

<DatePickerPopup
  value={editableDate}
  onChange={setEditableDate}
  locale={locale === 'fr' ? 'fr-FR' : 'en-US'}
  minDate={toDateStr(new Date())}
  monthDropdownId="workout-date-picker-month"
/>
```

#### Usage

- **Intégration dans WorkoutModal** : au clic sur le champ date (coach, séance modifiable), le calendrier s’ouvre en **popover** positionné sous le champ (pas une deuxième modale). Overlay transparent en z-[105], contenu en z-[110] ; fermeture par clic extérieur ou touche Escape.
- **Dans une modale (ex. Ajouter objectif)** : ne pas utiliser d’overlay pleine page (pour garder le scroll de la modale). Rendre le popup en `createPortal` avec positionnement **dynamique** (clamp dans le viewport, flip au-dessus du champ si pas de place en dessous) ; fermeture au clic extérieur, Escape, scroll ou resize. Référence : `RequestGoalAddModal`, `ObjectifsTable`.
- **Dropdown Mois** : 12 mois (libellés selon `locale`), filtrés par `minDate`/`maxDate`. Value = `"01"`..`"12"`. **Dropdown Année** : années courante − 4 à + 4 (9 ans), filtrées par min/max ; si la vue est hors plage (flèches), l'année affichée est ajoutée aux options. **Flèches** : style réduit (`p-1.5`, icône `w-4 h-4`). i18n : `chooseMonth`, `chooseYear`, `prevMonth`, `nextMonth`, `today`.

---

### MonthSelector

**Fichier :** `components/MonthSelector.tsx`

Barre compacte **mois précédent | libellé mois + année | mois suivant** pour le calendrier **desktop** (`md` et plus), à la place du sélecteur de semaine. Libellé via `Intl.DateTimeFormat` (mois long + année, première lettre en majuscule). Boutons `Button` variant `ghost`, `aria-label` passés en props (i18n côté parent : `calendar.prevMonth` / `calendar.nextMonth`). Désactivés pendant `isAnimating`. Style : fond `bg-stone-50`, bordure `border-stone-200`, chevrons `text-stone-500` / hover `text-palette-forest-dark`. Intégration : `CalendarViewWithNavigation` + `AthleteCalendarPage` / `CoachAthleteCalendarPage` (avec `WeekSelector` inchangé sur mobile).

#### Props

```typescript
type MonthSelectorProps = {
  year: number
  monthIndex: number
  onPrevMonth: () => void
  onNextMonth: () => void
  isAnimating: boolean
  prevMonthAriaLabel: string
  nextMonthAriaLabel: string
}
```

#### Exemple

```tsx
import { MonthSelector } from '@/components/MonthSelector'

<MonthSelector
  year={calendarMonth.year}
  monthIndex={calendarMonth.month}
  onPrevMonth={() => onNavigateMonth(-1)}
  onNextMonth={() => onNavigateMonth(1)}
  isAnimating={isAnimating}
  prevMonthAriaLabel={t('prevMonth')}
  nextMonthAriaLabel={t('nextMonth')}
/>
```

---

### ChatAthleteListItem

**Fichier :** `components/ChatAthleteListItem.tsx`

Ligne cliquable pour la liste d'athlètes dans l'overlay chat (état 1). Utilisé quand le coach n'a aucune conversation : affiche les athlètes avec souscription active (avatar ou initiales, nom, label optionnel « Démarrer » au hover). Réutilise `AvatarImage` et `getInitials` (`lib/stringUtils.ts`). Tokens : `palette-olive`, `palette-sage`, `palette-forest-light`, `shadow-chat-inner`.

#### Props

```typescript
type ChatAthleteListItemProps = {
  displayName: string
  avatarUrl?: string | null
  actionLabel?: string        // ex. "Démarrer"
  onClick?: () => void
  avatarVariant?: 'olive' | 'sage' | 'stone'
  className?: string
}
```

#### Exemple

```tsx
import { ChatAthleteListItem } from '@/components/ChatAthleteListItem'

<ChatAthleteListItem
  displayName="Jean Dupont"
  actionLabel="Démarrer"
  avatarVariant="olive"
  onClick={() => openConversation(athleteId)}
/>
```

Référence : `docs/CHAT_COACH_START_CONVERSATION_DESIGN.md`, mockup état 1.

---

### ChatConversationSidebar

**Fichier :** `components/ChatConversationSidebar.tsx`

Sidebar des conversations dans l'overlay chat (états 2a/2b). Liste verticale d'items (avatar + nom) ; bouton chevron pour réduire (avatars seuls) ou étendre. Clic sur un item pour sélectionner la conversation. **État sélectionné** : identique à la sidebar principale du site (`bg-palette-forest-dark text-white shadow-lg shadow-palette-forest-dark/20`). Pas de bouton Fermer dans les lignes. Réutilise `AvatarImage` et `getInitials`.

#### Props

```typescript
type ChatConversationSidebarItem = { id: string; displayName: string; avatarUrl?: string | null }

type ChatConversationSidebarProps = {
  items: ChatConversationSidebarItem[]
  selectedId: string | null
  onSelectItem: (id: string) => void
  labels?: { reduceList?: string; expandList?: string }
  className?: string
}
```

#### Exemple

```tsx
import { ChatConversationSidebar } from '@/components/ChatConversationSidebar'

<ChatConversationSidebar
  items={conversations}
  selectedId={selectedId}
  onSelectItem={setSelectedId}
  labels={{ reduceList: 'Réduire la liste', expandList: 'Étendre la liste' }}
/>
```

Référence : `docs/CHAT_COACH_START_CONVERSATION_DESIGN.md`, mockup états 2a et 2b.

---

### AthleteStatsVolumeChart

**Fichier :** `components/athlete/AthleteStatsVolumeChart.tsx`

Graphique **volume réalisé** (Nivo `ResponsiveLine`, import client ; montage après première frame pour mesure). Plusieurs années = plusieurs lignes (`ATHLETE_STATS_LINE_COLORS`). **Pas de légende Nivo** sous le graphe. **Tranches verticales** (`enableSlices="x"`) : survol = `sliceTooltip`. **Encart permanent** sous le graphe : titre *Volume annuel* / *Annual volume*, liste des années avec **total sur l’année** (somme des points de la série selon la granularité), pastilles de couleur alignées sur les lignes (`athleteStats.sliceDetail.annualVolumeTitle`, `yearValue`, `panelAria`, `weekTooltip`).

**Filtre sport (page `/dashboard/stats`) :** la liste d’options est **dynamique** : uniquement les sports persistés qui ont des données sur la période sélectionnée (totaux « fait » non nuls). La liste est dérivée du registre (`PERSISTED_WORKOUT_SPORT_TYPES`) filtré par les totaux (`getStatsAvailableSportsFromWeeklyTotals`).

**Skeletons :** `components/athlete/AthleteStatsChartSkeleton.tsx` — `AthleteStatsChartPlotSkeleton` (zone courbe avec gouttière Y, quadrillage, courbes factices, axe X) pendant l’hydratation du graphique ; `AthleteStatsChartFullSkeleton` (+ message `statusMessage`, encart annuel factice à *n* lignes selon les années sélectionnées) lors du refetch sur la page stats.

**Thème Nivo :** `lib/athleteStatsNivoTheme.ts` + variables `--chart-*` dans `app/globals.css` (quadrillage / axes / tooltip), sans hex dans le composant.

---

## Icônes

### Sports

Toutes les icônes de sports sont définies dans `components/SportIcons.tsx` et utilisent `currentColor` pour être colorables via CSS.

**Règle obligatoire :** Pour tout affichage de sport (profil, calendrier, formulaires, listes, rapports, mockups de design), **toujours utiliser les icônes du site** — `components/SportIcons.tsx`, via le mapping `SPORT_ICONS` dans `lib/sportStyles.ts`. Ne jamais utiliser d’emojis (🏃, 🚴, etc.) ni d’icônes externes pour représenter un sport.

**Centralisation :** Les associations sport → icône sont dans `lib/sportStyles.ts` (`SPORT_ICONS`).

**Taille recommandée :** `w-3.5 h-3.5` pour badges/tuiles, `w-8 h-8` pour sélecteurs modaux.

### Autres icônes

- **`components/icons/IconClose`** : fermeture (X). Utilisée dans les modales, headers.
- **`components/icons/IconHourglass`** : sablier (en attente). Utilisée dans la modale détail demande envoyée (pill « En attente »).
- **`components/icons/IconSend`** : envoi (avion). Utilisée dans le bouton « Demande envoyée » de la tuile coach (Trouver un coach).
- Utiliser des SVG inline pour les icônes custom (CheckIcon, CrossIcon, CrownIcon, etc.)
- Pour les icônes génériques, Heroicons est disponible si besoin

---

## Guidelines

### 1. Utiliser les tokens plutôt que des valeurs en dur

❌ **Mauvais :**
```tsx
<button className="bg-[#627e59] text-white">Valider</button>
```

✅ **Bon :**
```tsx
<Button variant="primary">Valider</Button>
```

### 2. Privilégier les composants existants

❌ **Mauvais :**
```tsx
<input className="border border-stone-200 rounded-xl px-4 py-2" />
```

✅ **Bon :**
```tsx
<Input label="Nom" name="name" />
```

### 3. États disabled et readOnly

- **Disabled** : Fond gris (`bg-stone-100`), curseur `not-allowed`, non soumis dans FormData
- **ReadOnly** : Fond gris (`bg-stone-100`), valeur soumise dans FormData

### 4. Hiérarchie des bordures arrondies

- `rounded-full` : Badges, tuiles, avatars
- `rounded-2xl` : Cartes principales
- `rounded-xl` : Inputs, modales
- `rounded-lg` : Boutons

### 5. Cohérence des gaps

- `gap-2` (8px) : Langues, petits éléments
- `gap-3` (12px) : Sports, badges multiples
- `gap-6` (24px) : Sections

### 6. Typographie

- Titres de page : `text-2xl font-bold`
- Sections : `text-lg font-bold`
- Labels : `text-xs font-bold uppercase tracking-wider`
- Corps de texte : `text-sm`

### 7. Breakpoint responsive projet (`md` = 768px)

**Règle commune à appliquer dans le projet :**
- **Mobile** : `< 768px` (en dessous de `md`)
- **Desktop/Tablette large** : `>= 768px` (à partir de `md`)

Ce breakpoint `md` est le breakpoint de référence pour les bascules de layout structurantes.

**Usages actuels documentés :**
- **Top bar dashboard** : barre en haut (`DashboardTopBar`) — logo My Sport Ally à gauche, liens de navigation au centre (tablette/desktop, centrés). **Athlète** : liens principaux seuls au centre ; à droite `AthleteAccountMenu` (menu compte : appareils, coach si lié, historique ; séparateur ; Contact ; Mes informations ; déconnexion). **Coach** : à droite `CoachAccountMenu` (Mes informations, Contact, déconnexion). **Admin** : lien profil direct à droite. **Mobile :** titre de la page au centre, bouton hamburger à droite ; **Drawer** athlète = liens secondaires, contact, Mes informations, déconnexion ; **coach** = liste nav, carte profil, contact, déconnexion ; **admin** = liste nav, carte profil, déconnexion. **Admin** : nav = Gestion des membres + Design System uniquement. Fichiers : `DashboardTopBar.tsx`, `AthleteAccountMenu.tsx`, `CoachAccountMenu.tsx`, `DashboardNavLinks.tsx`, `Drawer.tsx`, `lib/dashboardNavConfig.ts`. **Pages dashboard** : `DashboardPageShell` fournit uniquement le padding de contenu — pas de titre en tête de page ni conteneur carte. Fichier : `components/DashboardPageShell.tsx`.
- **Page « Mon profil »** (`/dashboard/profile`) : sur **mobile**, marges latérales réduites (wrapper `-mx-3` + `contentClassName` `!px-2 sm:!px-6 lg:!px-8` sur le shell) ; section Volumes hebdomadaires : grille **responsive** `grid-cols-1 sm:grid-cols-2` (1 colonne en dessous de `sm`, 2 colonnes à partir de `sm`) ; champs temps à allouer et volumes par sport : largeur `w-[6.5rem]`, padding droit réduit (pr-10 / pr-11 / pr-12) pour le suffixe. **Section Facilities Used :** cards en 2 blocs (adresse 1/3, horaires 2/3), table horaires compacte avec badge open/closed aligné ; modal add/edit en `size="2xl"` avec cartes jour bordées et fallback mobile (ligne 1 : jour + badge, ligne 2 : créneaux pleine largeur) pour éviter le débordement. Fichiers : `app/[locale]/dashboard/profile/page.tsx`, `ProfileForm.tsx`, `installations/*`.
- **Calendrier (athlète + coach)** : sous `md`, en-tête sur 2 lignes + **WeekSelector** + bloc totaux de la semaine (volume horaire total + barres par sport : sports = **`PERSISTED_WORKOUT_SPORT_TYPES`**, styles barre **`SPORT_WEEKLY_SUMMARY_BAR`**, voir § Tokens sports) + **1 semaine** en stack (inchangé ; archives `calendar-mobile-44`, `calendar-mobile-weekly-total`). À partir de `md`, **mois civil étendu** en **semaines ISO** (lundi–dimanche), jours hors mois en atténuation ; navigation **MonthSelector** ; une carte totaux par semaine ISO visible ; en-tête de semaine non détaillée : **bandeau compact** fait/prévu par sport (même liste + styles). Chargement = `getExtendedCalendarMonthGridBounds` + `fetchCalendarDataBundle`. Fichiers : `CalendarView.tsx`, `CalendarViewWithNavigation.tsx`, `MonthSelector.tsx`, `lib/dateUtils.ts`, `lib/calendarViewDayHeights.ts`, `lib/sportsRegistry.ts`. Récap produit : `docs/CALENDAR_MONTH_VIEW.md`. **Structure du jour :** **disponibilités athlète** (tuiles Disponible/Indisponible) → objectifs → entraînements → Strava ; puis sections **Matin** / **Midi** / **Soir** pour les entraînements avec moment ; couleurs et icônes des tuiles entraînement = sport uniquement. **Tuile entraînement dans la grille (pas la modale au clic) :** si statut **Réalisé** (`completed`), les durée / distance / allure ou vitesse (km/h pour vélo, triathlon, canot — via `workoutHasPaceField` + dérivation) / D+ affichés proviennent des **`actual_*`** uniquement (`getCalendarWorkoutTileMetrics`, `lib/workoutFormatting.ts`) ; sinon affichage des objectifs. **Tuiles disponibilité :** bordure fine (vert / orange), icône calendrier, libellé Disponible/Indisponible en `text-xs font-semibold` (sans `uppercase`) + plage horaire précédée d'une icône horloge (`ClockIcon`), ou note ; pas de récurrence. **Modales :** `AvailabilityModal` (création/édition : Segments type, date en en-tête, Début/Fin en Dropdown 15 min, Note ; athlète : bouton « + » sur jours futurs, clic tuile → édition avec Supprimer + Enregistrer) ; `AvailabilityDetailModal` (lecture seule coach : détail créneau, bouton Fermer). **Natation :** totaux et métadonnées en **mètres (m)** ; icône commentaire sur tuiles entraînement (`calendar.tile.athleteCommentLabel`). Détail : `Project_context.md` §4.5.
- **Sélecteur de semaine (WeekSelector, calendrier sous `md`)** : utilisé sous le breakpoint `md` sur les pages calendrier. Zone centrale à largeur fixe (80px sous `lg`, 150px à partir de `lg`) ; plage de dates sur une ligne à partir de `lg` (1024px), sur deux lignes sous `lg`. Boutons gauche/droite : largeur fixe 40px sous 400px, 80px à partir de 400px ; les dates « semaine précédente/suivante » dans les boutons sont affichées à partir de 400px et masquées en dessous pour que le sélecteur tienne sur les écrans étroits. Fichier : `components/WeekSelector.tsx`. À partir de `md`, le calendrier utilise **MonthSelector** (voir section MonthSelector).
- **Chat coach (overlay)** : sous `md`, navigation mobile en 2 écrans (liste des conversations puis conversation avec bouton Retour) ; à partir de `md`, layout desktop avec sidebar + panneau conversation.
- **Page « Trouver mon coach »** (`/dashboard/find-coach`, athlète sans coach) : page dédiée avec son propre skeleton (filtres + grille). Bloc Filtres avec recherche par nom ou prénom (temps réel), grille Sport coaché / Langue parlée en 2 colonnes à partir de `md` (768px) ; liste des tuiles : 1 colonne par défaut, 2 colonnes à partir de `md`, 3 colonnes à partir de `xl` (1280px). Fichiers : `app/[locale]/dashboard/find-coach/page.tsx`, `FindCoachSection.tsx`.
- **Page « My offers »** (offres du coach) : 1 colonne en tout temps (toutes largeurs). Fichier : `app/[locale]/dashboard/profile/offers/OffersForm.tsx`.
- **Page « Mes athlètes » (My Athletes)** (`/dashboard/athletes`, coach) : page dédiée avec son propre skeleton (titre, filtre, grille). Titre de page : « My Athletes » / « Mes Athlètes » (namespace `navigation.athletes`). **Bandeaux en tête de page :** si profil coach incomplet → bandeau « Compléter le profil » (lien profil) ; si **aucune** offre `published` → bandeau invitant à gérer les offres (lien `/dashboard/profile/offers`) — le bandeau profil est **au-dessus** du bandeau offre. Puis section **Demandes en attente** (si présente), puis liste. Filtre par nom (champ de recherche inline à côté du titre « Mes athlètes (X) », temps réel, insensible à la casse et aux accents ; message « aucun résultat » si aucune correspondance). Effectifs à côté des titres de section (« Mes athlètes (X) », « Demandes en attente (X) »). **Erreur chargement liste athlètes :** message dans un encart `bg-palette-danger-light`, bordure `palette-danger`, texte `palette-danger-dark` (`athletes.listLoadError`), pas l’état vide. **Demandes en attente (PendingRequestTile)** : bordure gauche ambre ; en-tête : avatar, **nom · offre** (offre en police plus petite), badges sport, boutons Discuter / Refuser / Accepter ; corps en **2 colonnes** : « Message de l’athlète » (coaching_need) | « Objectifs et volume (athlète) » (temps à allouer + volumes par sport depuis le profil : lignes « Sport : valeur unité » avec bordure gauche et icône par sport, D+ dans le même bloc que Course ; si vide « Non renseigné »). Modales de confirmation avant Refuser/Accepter ; sur mobile les boutons sont en bas de la tuile. Grille des tuiles athlètes : 1 colonne par défaut, 2 colonnes à partir de `sm`, **3 colonnes à partir de `xl` uniquement**. Fichiers : `app/[locale]/dashboard/athletes/page.tsx`, `CoachAthletesListWithFilter.tsx`, `PendingRequestTile.tsx`.

### 8. Sports et labels

Toujours utiliser `lib/sportStyles.ts` (et les helpers i18n) pour obtenir le label d'un sport — **aucun label en dur**.

```tsx
// Client Component
import { useSportLabel } from '@/lib/hooks/useSportLabel'

const getSportLabel = useSportLabel()
const sportLabel = getSportLabel('course') // FR: "Course" / EN: "Running"
```

```tsx
// Server Component
import { getSportLabel } from '@/lib/getSportLabel'

const sportLabel = await getSportLabel('course')
```

### 9. Espacements cohérents

- Padding cartes : `p-6`
- Padding sections : `px-6 lg:px-8 py-8`
- Margin entre sections : `mb-8`

---

## FAQ

### Comment ajouter une nouvelle couleur ?

1. Ajouter dans `tailwind.config.ts` (section `theme.extend.colors`)
2. Ajouter la variable CSS dans `app/globals.css`
3. Documenter l'usage ici

### Comment ajouter un nouveau sport ?

1. Créer l'icône SVG dans `components/SportIcons.tsx`
2. Ajouter le type dans `lib/sportStyles.ts` (`SportType`)
3. Ajouter la clé de traduction dans `lib/sportStyles.ts` (`SPORT_TRANSLATION_KEYS`)
4. Ajouter l'icône dans `lib/sportStyles.ts` (`SPORT_ICONS`)
5. Ajouter les couleurs dans `lib/sportStyles.ts` (`SPORT_BADGE_STYLES` + `SPORT_CARD_STYLES` + **`SPORT_WEEKLY_SUMMARY_BAR`** : paire `color` / `bg` pour le résumé hebdo calendrier)
6. Ajouter les traductions dans `messages/fr.json` et `messages/en.json` (namespace `sports`)
7. Étendre **`PERSISTED_WORKOUT_SPORT_TYPES`** (et migrations BDD `sport_type` / totaux hebdo) si le sport est une séance persistée

### Comment gérer un formulaire avec tuiles sélectionnables ?

Utiliser `SportTileSelectable` en mode uncontrolled avec `name` et `defaultChecked`. Le CSS global `.chip-checkbox:checked + div` gère l'état visuel automatiquement.

### Quelle variante de Button utiliser ?

- Action principale de page : `primary`
- Action de modal/CTA : `primaryDark`
- Action secondaire : `secondary` ou `outline`
- Annulation : `muted`
- Danger : `danger`

### Comment afficher un compteur de résultats ?

Actuellement, utiliser un span custom :
```tsx
<span className="bg-stone-200 text-stone-600 text-xs py-0.5 px-2 rounded-full">
  {count}
</span>
```

*Note : Une variante `Badge variant="counter"` pourrait être créée pour standardiser.*

---

## Maintenance

### Fichiers clés

- **Tokens couleurs** : `tailwind.config.ts`, `app/globals.css`
- **Styles formulaires** : `lib/formStyles.ts` (FORM_BASE_CLASSES, FORM_INPUT_TEXT_SIZE, FORM_INPUT_HEIGHT, etc.)
- **Composants** : `components/Button.tsx`, `components/Input.tsx`, `components/PasswordInput.tsx`, `components/SearchInput.tsx`, `components/Textarea.tsx`, `components/Badge.tsx`, `components/Avatar.tsx`, `components/AvatarImage.tsx`, `components/SportTileSelectable.tsx`, `components/ActivityTile.tsx`, `components/Modal.tsx`, `components/CoachReviewsModal.tsx`, `components/workout-modal/WorkoutFacilityHoursStrip.tsx`, `components/workout-modal/WorkoutTargetActualCards.tsx`, `components/workout-modal/WorkoutFeedbackSummary.tsx`, `components/workout-modal/WorkoutFeedbackSection.tsx`, `components/AthleteFacilityDetails.tsx`, `components/CoachAthleteNotesSection.tsx`, `components/CoachAthleteNoteModal.tsx`, `components/DashboardPageShell.tsx`, `components/DashboardTopBar.tsx`, `components/AthleteAccountMenu.tsx`, `components/CoachAccountMenu.tsx`, `components/ContactForm.tsx`, `components/Drawer.tsx`, `components/PublicOrDashboardHeader.tsx`, `components/PublicHeader.tsx`, `components/EmailValidatedModal.tsx`, `components/HomeEmailConfirmedTrigger.tsx`, `components/Dropdown.tsx`, `components/Segments.tsx`, `components/DatePickerPopup.tsx`, `components/MonthSelector.tsx`, `components/CalendarView.tsx`, `components/CalendarViewWithNavigation.tsx`, `lib/calendarViewDayHeights.ts`, `components/AvailabilityModal.tsx`, `components/AvailabilityDetailModal.tsx`, `components/ChatAthleteListItem.tsx`, `components/ChatConversationSidebar.tsx`, `components/CoachPlatformSubscriptionOffers.tsx`, `components/CoachPlatformOfferGrid.tsx`, `components/CoachPlatformSubscribeOffersModal.tsx`
- **Page Mon Abonnement MySportAlly (coach)** : `app/[locale]/dashboard/coach-platform-subscription/page.tsx`, `loading.tsx` ; libs **`lib/stripeCoachPlatformCatalog.ts`**, **`lib/stripeCoachPlatformBillingHistory.ts`**, **`lib/stripeCoachPlatformPriceIds.ts`**, **`lib/coachPlatformCheckoutReturnPath.ts`**, **`lib/coachMsaOfferDisplay.ts`**
- **Page Mes athlètes (coach)** : `app/[locale]/dashboard/athletes/page.tsx` (bandeaux profil / offre publiée, erreur chargement liste), `components/CoachPlatformStripeBanner.tsx`, `components/CoachPlatformCheckoutVerification.tsx`, `CoachAthletesListWithFilter.tsx`, `PendingRequestTile.tsx` ; actions Checkout **`app/[locale]/dashboard/athletes/coachPlatformActions.ts`**
- **Sports** : `lib/sportStyles.ts` (`SPORT_CARD_STYLES`, `SPORT_BADGE_STYLES`, **`SPORT_WEEKLY_SUMMARY_BAR`**, `SPORT_ICONS`, `SPORT_TRANSLATION_KEYS`), `lib/sportsRegistry.ts` (`PERSISTED_WORKOUT_SPORT_TYPES`, `workoutIsTimeOnlySport`), `lib/sportsOptions.ts`, `components/SportIcons.tsx`
- **Stats athlète (Nivo)** : `lib/athleteStatsNivoTheme.ts`, `lib/athleteStatsColors.ts`, `components/athlete/AthleteStatsVolumeChart.tsx`
- **Horaires modale workout (coach)** : `lib/workoutFacilityHours.ts` (filtre sport ↔ type d’installation, jour, tri alphabétique)
- **Modale workout — formats & couleurs** : `lib/workoutFormatting.ts` (format absolu et delta des métriques workout — durée, distance, allure mm:ss, vitesse km/h, dénivelé ; tests Vitest `lib/workoutFormatting.test.ts`), `lib/workoutFeedbackColors.ts` (dégradé sémantique tuiles + picker feedback : Ressenti / Intensité RPE / Plaisir)
- **Design system page** : `app/dashboard/admin/design-system/page.tsx`

### Évolutions futures

- Créer variante `Badge variant="counter"` pour compteurs
- Composant `Card` pour cartes standardisées
- Documenter animations (transitions, keyframes)
- Migrer progressivement les modales existantes vers le composant `Modal`

---

**Pour toute question ou suggestion d'amélioration, consulter l'équipe de développement.**

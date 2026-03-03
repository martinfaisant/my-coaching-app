# 🎨 Design System

**Version :** 1.8  
**Dernière mise à jour :** 2 mars 2026 (disponibilités athlète : modales + tuiles calendrier ; Segments pour type Disponible/Indisponible ; pas de récurrence)

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
   - [SearchInput](#searchinput)
   - [Textarea](#textarea)
   - [Badge](#badge)
   - [SportTileSelectable](#sporttileselectable)
   - [ActivityTile](#activitytile)
   - [TileCard](#tilecard)
   - [Modal](#modal)
   - [PublicHeader](#publicheader)
   - [LanguageSwitcher](#languageswitcher)
   - [Dropdown](#dropdown)
   - [Segments](#segments)
   - [DatePickerPopup](#datepickerpopup)
   - [ChatAthleteListItem](#chatathletelistitem)
   - [ChatConversationSidebar](#chatconversationsidebar)
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

| Sport | Couleur | Token |
|-------|---------|-------|
| Course | Forest | `palette-forest-dark` |
| Vélo | Olive | `palette-olive` |
| Natation | Sky | `sky-50`, `sky-700`, `sky-500` |
| Musculation | Stone | `stone-100`, `stone-600` |
| Trail | Gold | `palette-gold` |
| Randonnée | Sage | `palette-sage` |
| Triathlon | Amber | `palette-amber` |
| Ski nordique | Sage | `palette-sage` |
| Ski de randonnée | Gold | `palette-gold` |
| Patin à glace | Cyan | `cyan-50`, `cyan-700` |

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

Champ de saisie unifié avec support label, erreur, disabled, readOnly.

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
  sport?: 'course' | 'velo' | 'natation' | 'musculation' | 'trail' | 'randonnee' | 'triathlon' | 'nordic_ski' | 'backcountry_ski' | 'ice_skating'
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
- Ski nordique (`IconNordicSki`)
- Ski de randonnée (`IconBackcountrySki`)
- Patin à glace (`IconIceSkating`)

---

### SportTileSelectable

**Fichier :** `components/SportTileSelectable.tsx`

Tuile sélectionnable pour sports (profil coach, filtres, demandes). Supporte deux modes : formulaire (uncontrolled) et état React (controlled).

#### États visuels

| État | Apparence |
|------|-----------|
| Non sélectionné | Bordure grise (`border-stone-200`), fond blanc, hover bordure verte |
| Sélectionné | Bordure et fond vert forêt, texte blanc, ombre verte |

#### Props

```typescript
type SportTileSelectableProps =
  // Mode formulaire (uncontrolled)
  | {
      value: string
      name: string
      defaultChecked?: boolean
      disabled?: boolean
    }
  // Mode contrôlé (React state)
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
    value="course_route" 
    name="coached_sports"
    defaultChecked={coachedSports.includes('course_route')}
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
  value="course_route"
  selected={selectedSports.includes('course_route')}
  onChange={() => toggleSport('course_route')}
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
| `stone` | `stone-400` | État archivé / terminé (offres archivées, historique souscriptions) |

#### Exemples

```tsx
// Carte statique (ex. objectif sur la page Objectifs)
<TileCard leftBorderColor="amber">
  <div className="flex items-center gap-3">
    <div className="...">...</div>
    <div>
      <h3 className="font-semibold text-stone-900">Marathon de Paris</h3>
      <p className="text-sm text-stone-500">42 km</p>
    </div>
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

- **Page Objectifs** : Afficher chaque objectif dans une TileCard avec `leftBorderColor="amber"` ou `"sage"` pour avoir le même contour que les tuiles de la modale Activités du jour. Pour les objectifs passés avec résultat : afficher « distance · [icône horloge] temps · place » sur la même ligne que la distance ; boutons « Saisir le résultat » (outline) / « Modifier le résultat » (secondary). Modale résultat : `GoalResultModal` (titre = nom de la course), champs temps (h/min/s), place, note ; formatage via `lib/goalResultUtils.ts`.
- **Listes archivées / terminées** : Offres archivées (page Offres coach), historique des souscriptions (coach et athlète) — utiliser `leftBorderColor="stone"` et `badge` (libellé i18n « Archivée » ou « Terminée »).
- **Listes personnalisées** : Tout contenu qui doit reprendre le style « tuile avec bordure gauche colorée » sans utiliser le contenu prédéfini d’ActivityTile.

---

### Modal

**Fichier :** `components/Modal.tsx`

Composant modal réutilisable avec overlay, gestion automatique Escape + body overflow, portail DOM.

#### Variantes de taille

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
  className?: string
  contentClassName?: string
  titleId?: string
  children: React.ReactNode
}
```

**Usage avancé :** La modale entraînement (`WorkoutModal`) utilise la taille `workout` (644px), `iconRaw` et `titleWrap`. **Création et édition coach :** date à gauche (sans titre ni icône check), badge statut à droite ; corps : Sport, titre, **Moment de la journée** (segments Non précisé | Matin | Midi | Soir, même style que Temps/Distance), objectifs, description. **Lecture seule** (athlète / coach passé) : tuile pill du sport + titre de la séance à gauche (titre peut passer sur deux lignes sur petit écran), badge statut à droite ; corps : date (+ « · Matin » etc. si moment renseigné), objectifs, description. Styles formulaires : `lib/formStyles.ts`.

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
- **Z-index** : Overlay `z-[90]`, contenu `z-[100]`

#### Structure

```tsx
<Modal> contient automatiquement :
  - Header (si title ou headerRight fournis)
    - Icône optionnelle (badge vert forêt)
    - Titre
    - Contenu custom à droite (headerRight)
    - Bouton fermer (X) par défaut
  - Corps scrollable (children)
  - Footer optionnel (fixe, ne scroll pas)
```

#### Modales auth dérivées

- **EmailValidatedModal** (`components/EmailValidatedModal.tsx`) : modale affichée après confirmation d’email (landing avec `?emailConfirmed=1`). Taille `md`, titre i18n « Email validé », message « Vous pouvez vous connecter », formulaire de connexion (email, mot de passe, bouton Se connecter) dans la modale. Utilise `Modal`, `Input`, `Button`, action `login` ; fermeture par overlay/Escape. i18n : `auth.emailValidatedTitle`, `auth.emailValidatedMessage`.
- **HomeEmailConfirmedTrigger** (`components/HomeEmailConfirmedTrigger.tsx`) : composant client rendu sur la page d’accueil ; reçoit `showEmailConfirmedModal={true}` quand l’URL contient `emailConfirmed=1` ; ouvre `EmailValidatedModal` à l’affichage. Utilisé par `app/[locale]/page.tsx`.

```tsx
// Page d'accueil : après callback confirmation email
<HomeEmailConfirmedTrigger showEmailConfirmedModal={emailConfirmed} />
```

---

### PublicHeader

**Fichier :** `components/PublicHeader.tsx`

En-tête public partagé pour les pages non connectées : page d'accueil, réinitialisation mot de passe. Structure identique sur toutes ces pages : logo My Sport Ally (lien vers `/`), LanguageSwitcher, séparateur vertical, AuthButtons (Se connecter, Créer un compte). Classes : `sticky top-0 z-50 border-b border-stone-200 bg-background/95 backdrop-blur-md`, conteneur `max-w-7xl h-16`.

**Usage :** Page d'accueil (`app/[locale]/page.tsx`), page reset-password (`app/[locale]/reset-password/page.tsx`). Référence design archivée : `docs/archive/design-reset-password-header/DESIGN_RESET_PASSWORD_HEADER.md`.

```tsx
import { PublicHeader } from '@/components/PublicHeader'

<div className="min-h-screen flex flex-col">
  <PublicHeader />
  <main className="flex-1">...</main>
</div>
```

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

Groupe de choix exclusif par segments (style offres coach : / Mois | Unique | Gratuit). Utilisé pour le type de tarification des offres, le type disponibilité/indisponibilité et la récurrence dans la modale disponibilité. Style : conteneur `bg-stone-100` bordure `border-stone-200`, options en `flex-1` ; option sélectionnée = `bg-palette-forest-dark` texte blanc + ombre ; non sélectionnée = `bg-white` `text-stone-600` bordure `border-stone-200` avec hover.

#### Props

```typescript
type SegmentOption = { value: string; label: string }

type SegmentsProps = {
  options: SegmentOption[]
  value: string
  onChange: (value: string) => void
  name: string
  ariaLabel?: string
  size?: 'sm' | 'md'   // md = py-2 text-sm (défaut), sm = py-1.5 text-xs
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
- **size="sm"** : `py-1.5` `text-xs` pour blocs secondaires (ex. récurrence dans une modale).

---

### DatePickerPopup

**Fichier :** `components/DatePickerPopup.tsx`

Popup calendrier pour la sélection d’une date. Conforme au design system : **Dropdown** pour le mois (avec `hideLabel`), grille de jours (semaine lundi–dimanche), date sélectionnée en `bg-palette-forest-dark text-white`, lien « Aujourd'hui » au pied (pas de bouton Effacer — date obligatoire). Référence (archives) : `docs/archive/design-workout-modal-calendar/` (mockup-calendar-popup.html, DESIGN_CALENDAR_POPUP.md).

#### Props

```typescript
type DatePickerPopupProps = {
  value: string              // YYYY-MM-DD
  onChange: (dateStr: string) => void
  locale: string             // ex. 'fr-FR', 'en-US'
  minDate?: string           // YYYY-MM-DD optionnel
  maxDate?: string           // YYYY-MM-DD optionnel
  monthDropdownId?: string
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
- **Liste des mois (Dropdown)** : du **mois actuel** au **mois actuel + 2 ans** (25 mois). Si l’utilisateur navigue avec les flèches hors de cette plage, le mois affiché est ajouté aux options et la liste est triée par date.
- Mois : composant **Dropdown** du design system (options = mois formatés, value = `YYYY-MM`). Le panneau du Dropdown a `max-h-64 overflow-y-auto` pour permettre le scroll.

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

## Icônes

### Sports

Toutes les icônes de sports sont définies dans `components/SportIcons.tsx` et utilisent `currentColor` pour être colorables via CSS.

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
- **Sidebar dashboard** : la tuile Profil (avatar + nom en bas de la colonne) affiche le même état sélectionné que les autres entrées du menu (`bg-palette-forest-dark text-white shadow-md`) lorsque l'utilisateur est sur la page Profil (`/dashboard/profile`) ; en mode replié (desktop), seul l'avatar est affiché et centré. Logo « My Sport Ally » : marge conditionnelle (`ml-3` quand texte visible, `ml-0` quand replié) pour centrer l’icône. Fichier : `components/Sidebar.tsx`.
- **Calendrier (athlète + coach)** : sous `md`, en-tête sur 2 lignes + bloc totaux de la semaine (volume horaire total + barres par sport, identique au mode étendu desktop) + 1 semaine en stack ; à partir de `md`, layout desktop (3 semaines, grille 7 colonnes). **Structure du jour :** **disponibilités athlète** (tuiles Disponible/Indisponible) → objectifs → entraînements → Strava ; puis sections **Matin** / **Midi** / **Soir** pour les entraînements avec moment ; couleurs et icônes des tuiles entraînement = sport uniquement. **Tuiles disponibilité :** bordure fine (vert / orange), icône calendrier, libellé + plage horaire ou note ; pas de récurrence. **Modales :** `AvailabilityModal` (création/édition : Segments type, date en en-tête, Début/Fin en Dropdown 15 min, Note ; athlète : bouton « + » sur jours futurs, clic tuile → édition avec Supprimer + Enregistrer) ; `AvailabilityDetailModal` (lecture seule coach : détail créneau, bouton Fermer). **Natation :** totaux et métadonnées en **mètres (m)** ; icône commentaire sur tuiles entraînement (`calendar.tile.athleteCommentLabel`). Détail : `Project_context.md` §4.5.
- **Sélecteur de semaine (WeekSelector, calendrier)** : zone centrale à largeur fixe (80px sous `lg`, 150px à partir de `lg`) ; plage de dates sur une ligne à partir de `lg` (1024px), sur deux lignes sous `lg`. Boutons gauche/droite : largeur fixe 40px sous 400px, 80px à partir de 400px ; les dates « semaine précédente/suivante » dans les boutons sont affichées à partir de 400px et masquées en dessous pour que le sélecteur tienne sur les écrans étroits. Fichier : `components/WeekSelector.tsx`.
- **Chat coach (overlay)** : sous `md`, navigation mobile en 2 écrans (liste des conversations puis conversation avec bouton Retour) ; à partir de `md`, layout desktop avec sidebar + panneau conversation.
- **Page « Trouver mon coach »** (`/dashboard/find-coach`, athlète sans coach) : page dédiée avec son propre skeleton (filtres + grille). Bloc Filtres avec recherche par nom ou prénom (temps réel), grille Sport coaché / Langue parlée en 2 colonnes à partir de `md` (768px) ; liste des tuiles : 1 colonne par défaut, 2 colonnes à partir de `md`, 3 colonnes à partir de `xl` (1280px). Fichiers : `app/[locale]/dashboard/find-coach/page.tsx`, `FindCoachSection.tsx`.
- **Page « My offers »** (offres du coach) : 1 colonne en tout temps (toutes largeurs). Fichier : `app/[locale]/dashboard/profile/offers/OffersForm.tsx`.
- **Page « Mes athlètes » (My Athletes)** (`/dashboard/athletes`, coach) : page dédiée avec son propre skeleton (titre, filtre, grille). Titre de page : « My Athletes » / « Mes Athlètes » (namespace `navigation.athletes`). Filtre par nom (champ de recherche inline à côté du titre « Mes athlètes (X) », temps réel, insensible à la casse et aux accents ; message « aucun résultat » si aucune correspondance). Effectifs à côté des titres de section (« Mes athlètes (X) », « Demandes en attente (X) »). **Demandes en attente** : tuile type ActivityTile (bordure gauche ambre), avatar athlète, badges sport, message besoin pleine largeur ; boutons Discuter (secondaire), Refuser (danger), Accepter (primary) ; modales de confirmation avant Refuser/Accepter ; sur mobile les boutons sont en bas de la tuile (Discuter pleine largeur, Refuser et Accepter côte à côte 50/50). Grille des tuiles athlètes : 1 colonne par défaut, 2 colonnes à partir de `sm`, **3 colonnes à partir de `xl` uniquement** (pas de 3 colonnes avant xl). Fichiers : `app/[locale]/dashboard/athletes/page.tsx`, `CoachAthletesListWithFilter.tsx`, `PendingRequestTile.tsx`.

### 8. Sports et labels

Toujours utiliser `lib/sportStyles.ts` pour obtenir le label d'un sport :

```tsx
import { SPORT_LABELS } from '@/lib/sportStyles'

const sportLabel = SPORT_LABELS['course'] // "Course à pied"
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
3. Ajouter le label dans `SPORT_LABELS`
4. Ajouter l'icône dans `SPORT_ICONS`
5. Ajouter les couleurs dans `SPORT_BADGE_STYLES`

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
- **Composants** : `components/Button.tsx`, `components/Input.tsx`, `components/SearchInput.tsx`, `components/Textarea.tsx`, `components/Badge.tsx`, `components/SportTileSelectable.tsx`, `components/ActivityTile.tsx`, `components/Modal.tsx`, `components/PublicHeader.tsx`, `components/EmailValidatedModal.tsx`, `components/HomeEmailConfirmedTrigger.tsx`, `components/Dropdown.tsx`, `components/Segments.tsx`, `components/DatePickerPopup.tsx`, `components/AvailabilityModal.tsx`, `components/AvailabilityDetailModal.tsx`, `components/ChatAthleteListItem.tsx`, `components/ChatConversationSidebar.tsx`
- **Sports** : `lib/sportStyles.ts`, `lib/sportsOptions.ts`, `components/SportIcons.tsx`
- **Design system page** : `app/dashboard/admin/design-system/page.tsx`

### Évolutions futures

- Créer variante `Badge variant="counter"` pour compteurs
- Composant `Card` pour cartes standardisées
- Documenter animations (transitions, keyframes)
- Migrer progressivement les modales existantes vers le composant `Modal`

---

**Pour toute question ou suggestion d'amélioration, consulter l'équipe de développement.**

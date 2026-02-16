# 🎨 Design System

**Version :** 1.2  
**Dernière mise à jour :** 16 février 2026

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
   - [Textarea](#textarea)
   - [Badge](#badge)
   - [SportTileSelectable](#sporttileselectable)
   - [ActivityTile](#activitytile)
   - [TileCard](#tilecard)
   - [Modal](#modal)
   - [LanguageSwitcher](#languageswitcher)
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
- **Usage** : formulaire des offres coach (`app/[locale]/dashboard/profile/offers/OffersForm.tsx`).

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
  metadata?: string[]        // ["1h30", "15 km", "200m D+"]
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
  leftBorderColor: 'amber' | 'sage' | 'forest' | 'strava' | 'gold' | 'olive'
  children: React.ReactNode
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
```

#### Cas d’usage

- **Page Objectifs** : Afficher chaque objectif dans une TileCard avec `leftBorderColor="amber"` ou `"sage"` pour avoir le même contour que les tuiles de la modale Activités du jour.
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
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'full'
  alignment?: 'center' | 'top' | 'right'
  title?: string
  icon?: React.ReactNode
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

---

### LanguageSwitcher

**Fichier :** `components/LanguageSwitcher.tsx`

Dropdown de changement de langue (FR/EN) : bouton avec icône globe, code langue courante (FR/EN) et chevron ; menu déroulant avec libellés « Français » / « English » et coche sur la langue active. Utilise les tokens `palette-forest-dark`, `stone-*`, `rounded-lg` / `rounded-xl`. Affiché dans le header de la page d'accueil et dans la sidebar du dashboard. Aperçu dans la page Design System (admin).

```tsx
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

<LanguageSwitcher />
```

---

## Icônes

### Sports

Toutes les icônes de sports sont définies dans `components/SportIcons.tsx` et utilisent `currentColor` pour être colorables via CSS.

**Centralisation :** Les associations sport → icône sont dans `lib/sportStyles.ts` (`SPORT_ICONS`).

**Taille recommandée :** `w-3.5 h-3.5` pour badges/tuiles, `w-8 h-8` pour sélecteurs modaux.

### Autres icônes

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

### 7. Sports et labels

Toujours utiliser `lib/sportStyles.ts` pour obtenir le label d'un sport :

```tsx
import { SPORT_LABELS } from '@/lib/sportStyles'

const sportLabel = SPORT_LABELS['course'] // "Course à pied"
```

### 8. Espacements cohérents

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
- **Composants** : `components/Button.tsx`, `components/Input.tsx`, `components/Textarea.tsx`, `components/Badge.tsx`, `components/SportTileSelectable.tsx`, `components/ActivityTile.tsx`, `components/Modal.tsx`
- **Sports** : `lib/sportStyles.ts`, `lib/sportsOptions.ts`, `components/SportIcons.tsx`
- **Design system page** : `app/dashboard/admin/design-system/page.tsx`

### Évolutions futures

- Créer variante `Badge variant="counter"` pour compteurs
- Composant `Card` pour cartes standardisées
- Documenter animations (transitions, keyframes)
- Migrer progressivement les modales existantes vers le composant `Modal`

---

**Pour toute question ou suggestion d'amélioration, consulter l'équipe de développement.**

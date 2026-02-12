# 🎨 Design System

**Version :** 1.0  
**Dernière mise à jour :** 12 février 2026

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
   - [Modal](#modal)
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
| `palette-forest-dark` | `#627e59` | Principal (boutons, liens, focus) | `bg-palette-forest-dark`, `text-palette-forest-dark`, `border-palette-forest-dark` |
| `palette-forest-darker` | `#506648` | Hover foncé, CTA accentués | `bg-palette-forest-darker`, `hover:bg-palette-forest-darker` |
| `palette-olive` | `#8e9856` | Hover principal, avatar fallback | `bg-palette-olive`, `hover:bg-palette-olive` |
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
- Vélo (`IconBike`)
- Natation (`IconSwimming`)
- Musculation (`IconDumbbell`)
- Trail (`IconMountain`)
- Randonnée (`IconPersonHiking`)
- Triathlon (`IconTriathlon`)
- Ski nordique (`IconSkiNordic`)
- Ski de randonnée (`IconSkiBackcountry`)
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
- **Composants** : `components/Button.tsx`, `components/Input.tsx`, `components/Textarea.tsx`, `components/Badge.tsx`, `components/SportTileSelectable.tsx`, `components/Modal.tsx`
- **Sports** : `lib/sportStyles.ts`, `lib/sportsOptions.ts`, `components/SportIcons.tsx`
- **Design system page** : `app/dashboard/admin/design-system/page.tsx`

### Évolutions futures

- Créer variante `Badge variant="counter"` pour compteurs
- Composant `Card` pour cartes standardisées
- Documenter animations (transitions, keyframes)
- Migrer progressivement les modales existantes vers le composant `Modal`

---

**Pour toute question ou suggestion d'amélioration, consulter l'équipe de développement.**

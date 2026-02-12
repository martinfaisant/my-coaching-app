# 🔍 Audit Design System – CoachApp

Date : Février 2025

---

## 1. Inventaire des composants

### 1.1 Composants réutilisables (`/components`)

| Composant | Rôle | Réutilisé |
|-----------|------|-----------|
| **PrimaryButton** | Bouton principal (vert) | ✅ LoginForm, RequestCoachButton, dashboard, modales |
| **PageHeader** | En-tête de page avec titre | ✅ Calendrier, objectifs, profil coach |
| **Avatar** | Initiales uniquement (fallback) | Via AvatarImage |
| **AvatarImage** | Avatar avec image ou initiales | Partout (sidebar, cartes coach, demandes, etc.) |
| **LoginForm** | Formulaire login/signup/mot de passe oublié | LoginModal, page login |
| **LoginModal** | Modal d'authentification | Page d'accueil |
| **LogoutButton** | Bouton déconnexion (sidebar) | Layout dashboard |
| **ProfileMenu** | Menu déroulant profil | Ancien, peut-être remplacé par Sidebar |
| **Modal** | **Vide** – non utilisé | ❌ À supprimer ou implémenter |
| **Sidebar** | Navigation latérale | Layout dashboard |
| **SportIcons** | Icônes SVG par sport (course, vélo, natation, etc.) | CalendarView, profil |
| **ChatModule** | Bouton flottant + overlay chat | Layout dashboard |
| **WorkoutModal** | Modal création/édition entraînement | CalendarView |
| **CalendarView** | Vue calendrier (entraînements) | AthleteCalendarPage |
| **CalendarViewWithNavigation** | Calendrier + navigation semaines | CalendarView |
| **WeekSelector** | Sélecteur de semaine | CalendarView |
| **AthleteCalendarPage** | Page calendrier athlète | Route `/dashboard/calendar` |
| **CoachAthleteCalendarPage** | Page calendrier coach pour un athlète | Route `/dashboard/athletes/[id]` |

### 1.2 Composants spécifiques (`/app/dashboard`, etc.)

| Composant | Emplacement | Rôle |
|-----------|-------------|------|
| FindCoachSection | dashboard | Recherche/filtrage coachs + cartes |
| RequestCoachButton | dashboard | Bouton + modal demande coach |
| RespondToRequestButtons | dashboard | Accepter/Refuser demande |
| ProfileForm | profile | Formulaire profil (coach/athlète) |
| OffersForm | profile/offers | Gestion des offres coach |
| ObjectifsTable | objectifs | Table des objectifs |
| MembersList | admin/members | Liste membres admin |
| CoachRatingForm | coach | Formulaire note coach |
| StravaDevicesSection | devices | Connexion Strava |

---

## 2. Couleurs

### 2.1 Palette actuelle

| Token | Valeur | Usage |
|-------|--------|-------|
| **forest-dark** | `#627e59` | Principal (boutons, liens, focus) |
| **olive** | `#8e9856` | Hover principal, avatar fallback |
| **sage** | `#aaaa51` | Calendrier (objectif secondaire, ski) |
| **gold** | `#cbb44b` | Calendrier (ski rando) |
| **amber** | `#c9a544` | Objectif primaire, badges |
| **forest-darker** (non défini) | `#506648` | Hover plus foncé, utilisé en dur dans 15+ endroits |
| **Strava orange** | `#FC4C02` / `#f05222` | Strava, activités importées |
| **Stone** | Tailwind stone-50 à stone-950 | Fonds, bordures, texte |

### 2.2 Sources des couleurs

- **tailwind.config.ts** : `palette.forest-dark`, `palette.olive`, etc. (5 couleurs)
- **globals.css** : `--palette-*` + classes `.bg-palette-*`, `.text-palette-*`, etc.
- **Valeurs en dur** : `#627e59`, `#506648`, `#8e9856`, `#aaaa51`, `#cbb44b`, `#c9a544`, `#FC4C02`, `#f05222` dans ~80+ occurrences

### 2.3 Incohérences

| Problème | Exemple |
|----------|---------|
| **#506648 non défini** | Utilisé comme `hover:bg-[#506648]` ou `hover:text-[#506648]` partout au lieu d'un token |
| **Duplication tailwind vs globals.css** | Palette définie 2 fois (config + CSS custom) |
| **Opacités divergentes** | `bg-[#627e59]/5`, `bg-[#627e59]/10`, `border-[#627e59]/30`, etc. sans tokens |

---

## 3. Typographie

### 3.1 Échelle utilisée

| Usage | Classes | Exemples |
|-------|---------|----------|
| Titre page | `text-xl font-bold` / `text-2xl font-semibold` | PageHeader, modales |
| Sous-titre | `text-lg font-bold` | FindCoachSection |
| Corps | `text-sm` | Labels, descriptions |
| Petits labels | `text-xs` | Badges, chips |
| Très petit | `text-[10px]` | Calendrier, objectifs |

### 3.2 Font

- **globals.css** : `font-family: Arial, Helvetica, sans-serif`
- **@theme** référence `font-geist-sans` / `font-geist-mono` mais non utilisés

### 3.3 Incohérences

- Mélange `font-bold` / `font-semibold` / `font-medium` sans règle claire
- `text-[9px]`, `text-[10px]` utilisés ponctuellement
- Pas de scale typo formalisée

---

## 4. Espacement

### 4.1 Padding boutons

| Variante | Padding | Fichiers |
|----------|---------|----------|
| Standard | `px-4 py-2.5` | PrimaryButton, plupart des boutons |
| Large | `px-4 py-3` ou `py-3 px-4` | Login, WorkoutModal submit |
| Petit | `px-3 py-2` ou `px-3 py-1.5` | RespondToRequestButtons |
| Icône | `p-2` ou `p-1.5` | Boutons fermer, navigation |

### 4.2 Padding inputs

- **Standard** : `px-4 py-2.5` (majorité)
- **Textearea** : `p-4` ou `px-4 py-2.5`

### 4.3 Gaps et marges

- Formulaires : `space-y-5` ou `space-y-4`
- Grilles : `gap-3`, `gap-4`, `gap-6`
- Cards : `p-4`, `p-6`, `p-8`

---

## 5. Bordures & rayons

### 5.1 Rayons (border-radius)

| Valeur | Usage |
|--------|-------|
| `rounded-lg` | Boutons, inputs, cartes petites |
| `rounded-xl` | Cartes, modales, avatars |
| `rounded-2xl` | Containers principaux, layout |
| `rounded-md` | Chips, sélecteurs (FindCoachSection) |
| `rounded-full` | Avatars circulaires, bouton chat, badges |
| `rounded` | Petits badges (sans suffixe) |

### 5.2 Bordures

- **Standard** : `border border-stone-200` ou `border-stone-300`
- **Focus / accent** : `border-2 border-palette-forest-dark`
- **Gauche colorée** : `border-l-4 border-l-[#627e59]` (calendrier)
- **Demande en attente** : `border-l-4 border-l-amber-400`

---

## 6. Boutons

### 6.1 Variantes observées

| Type | Style | Usage |
|------|-------|-------|
| **Primary** | `bg-palette-forest-dark` + `hover:bg-palette-olive` | PrimaryButton |
| **Primary hover foncé** | `hover:bg-[#506648]` | ObjectifsTable, FindCoachSection, WorkoutModal |
| **Secondary / outline** | `border-2 border-palette-forest-dark` + fond blanc | RespondToRequestButtons |
| **Ghost** | `border border-stone-300` + `hover:bg-stone-50` | Annuler, Retour |
| **Danger** | `text-red-500 hover:bg-red-50` | Logout |
| **Strava** | `bg-[#FC4C02]` | Connexion Strava |

### 6.2 Incohérences

- **Hover primary** : `hover:bg-palette-olive` vs `hover:bg-[#506648]` selon les composants
- **Focus ring** : `focus:ring-palette-olive` vs `focus:ring-[#627e59]` vs `focus:ring-[#627e59]/20`
- **Taille** : `py-2.5` vs `py-3` selon les contextes

---

## 7. Inputs / Formulaires

### 7.1 Champs texte (input, textarea)

| Variante | Classes principales |
|----------|---------------------|
| **Standard** | `border border-stone-200/300`, `rounded-lg`, `px-4 py-2.5` |
| **Focus** | `focus:ring-2 focus:ring-palette-forest-dark` ou `focus:ring-[#627e59]/20` |
| **Background** | `bg-white` ou `bg-stone-50` (focus: `focus:bg-white`) |
| **Disabled** | `bg-stone-100`, `cursor-not-allowed` |

### 7.2 Bugs détectés

- **`border-stone-200border-stone-700`** : typo (classe invalide, espace manquant) — LoginForm, ResetPasswordForm
- **`bg-whitebg-palette-forest-dark`** : idem — ResetPasswordForm, MembersList
- **`text-white0`** : typo (classe invalide) — LoginForm, ChatModule, MembersList, ResetPasswordForm

---

## 8. Cartes (Cards)

### 8.1 Patterns

| Contexte | Style |
|----------|-------|
| Carte coach | `rounded-2xl border border-stone-200 shadow-sm` |
| Carte athlète (dashboard) | `rounded-xl border border-stone-200 bg-section` |
| Demande en attente | `rounded-xl border-l-4 border-l-amber-400 bg-section` |
| Formulaire | `rounded-2xl shadow-xl border border-stone-100` |
| Zone vide | `rounded-2xl border border-dashed border-stone-200` |

### 8.2 Incohérences

- `bg-section` vs `bg-white` vs `bg-stone-50` pour fonds de cartes
- Ombres : `shadow-sm` vs `shadow-xl` vs `shadow-lg` sans règle

---

## 9. Modales

### 9.1 Pattern commun

- **Overlay** : `fixed inset-0 bg-palette-forest-dark/50 backdrop-blur-sm z-[90]`
- **Contenu** : `max-w-md` ou `max-w-md max-h-[90vh]`, `rounded-xl` ou `rounded-2xl`, `border border-stone-100`
- **Bouton fermer** : `p-2 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-50`

### 9.2 Composants modaux

- LoginModal, RequestCoachButton (2 modales), WorkoutModal, FindCoachSection (présentation + détail), ObjectifsTable (édition), ProfileForm (avatar crop), OffersForm (ajout offre)

---

## 10. Synthèse des incohérences

### Critiques (à corriger)

| # | Problème | Impact |
|---|----------|--------|
| 1 | **`text-white0`** (typo) | Texte invisible ou style cassé |
| 2 | **`border-stone-200border-stone-700`** (typo) | Bordure peut-être incorrecte |
| 3 | **`#506648` non défini** | Répété 15+ fois en dur |
| 4 | **`Modal.tsx` vide** | Composant mort |

### Moyennes

| # | Problème |
|---|----------|
| 5 | Hover primary : olive vs #506648 |
| 6 | Focus ring : palette-olive vs [#627e59] vs [#627e59]/20 |
| 7 | Rayons : mélange rounded-lg / rounded-xl / rounded-md |
| 8 | Padding boutons : py-2.5 vs py-3 |

### Mineures

| # | Problème |
|---|----------|
| 9 | Duplication palette (tailwind + globals.css) |
| 10 | Font Geist référencée mais non chargée |

---

## 11. Recommandations pour la phase 2 (Tokens)

1. **Ajouter `forest-darker: #506648`** dans tailwind + globals
2. **Créer des tokens sémantiques** : `primary`, `primary-hover`, `primary-focus`
3. **Externaliser Strava** : `strava: #FC4C02`
4. **Corriger les typos** : `text-white0` → `text-stone-400`, `border-stone-200border-stone-700` → `border-stone-200`
5. **Supprimer ou implémenter** `Modal.tsx`

---

## 12. Fichiers à modifier (priorité)

| Priorité | Fichier | Action |
|----------|---------|--------|
| 1 | LoginForm.tsx | Corriger typos |
| 2 | ResetPasswordForm.tsx | Corriger typos |
| 3 | ChatModule.tsx | Corriger text-white0 |
| 4 | MembersList.tsx | Corriger typos |
| 5 | tailwind.config.ts | Ajouter forest-darker, strava |
| 6 | globals.css | Aligner avec tokens |

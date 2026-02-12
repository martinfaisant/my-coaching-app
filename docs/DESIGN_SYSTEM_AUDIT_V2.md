# 🔍 Audit Design System v2 – Point d'étape

**Date :** Février 2025 (mise à jour 12 fév. 2026)  
**État :** Phases 1, 2, 3.1–3.4 terminées.

---

## ✅ Réalisé

### Phase 1 – Tokens couleurs ✅

- **tailwind.config.ts** et **globals.css** : palette complète
  - `palette-forest-dark`, `palette-forest-darker`, `palette-olive`, `palette-sage`, `palette-gold`, `palette-amber`, `palette-strava`
  - `palette-danger` / `palette-danger-light` / `palette-danger-dark` (#c0564b)
- Remplacement des couleurs hex en dur par les tokens
- Mention dans `Project_context.md`

### Phase 2 – Corrections critiques ✅

- **2.1 Typos** : `text-white0`, `border-stone-200border-stone-700`, `bg-whitebg-palette-forest-dark` → corrigés
- **2.2 Modal.tsx** : fichier supprimé (vide, non utilisé)

### Phase 3.1 – Boutons ✅

- Composant `Button` avec variantes : `primary`, `primaryDark`, `secondary`, `outline`, `muted`, `ghost`, `danger`, `strava`
- Migration complète : LoginForm, WorkoutModal, ProfileForm, ChatModule, Sidebar, RespondToRequestButtons, StravaDevicesSection, ObjectifsTable, MembersList, FindCoachSection, etc.
- Page design system : ButtonShowcase

### Phase 3.2 – Input / Textarea ✅

- **Composant `Input`** : `label`, `labelClassName`, `error`, états `disabled` / `readOnly` unifiés
  - disabled/readOnly : `bg-stone-100`, `text-stone-500`, `border-stone-200` (visuellement distinct des champs actifs)
- **Composant `Textarea`** : même logique, mêmes états désactivés
- **Migration complète** : LoginForm, ResetPasswordForm, login/page, ProfileForm, WorkoutModal, OffersForm, CoachRatingForm, RequestCoachButton, FindCoachSection, ObjectifsTable
- **OffersForm** : tarification (prix + récurrence) alignée design system, sélecteur récurrence (tuiles)
- **ProfileForm** : suppression `input-group` pour cohérence focus
- Page design system : InputShowcase, TextareaShowcase

### Phase 3.3 – Badges / Chips ✅

- **Composant `Badge`** : variantes `default`, `primary`, `sport-*`, `success`, `warning`
- **Sports** : prop `sport="course" | "velo" | "natation" | ...` avec icônes (`SportIcons`) et couleurs alignées calendrier
  - `lib/sportStyles.ts` : config partagée (SPORT_ICONS, SPORT_LABELS, SPORT_BADGE_STYLES)
  - course (forest), vélo (olive), natation (sky), musculation (stone), trail (gold, icône montagne), randonnée (sage, icône randonneur), triathlon (amber), ski (sage/gold), patin (cyan)
- BadgeShowcase dans la page design system
- **Migration** : dashboard/page.tsx (sports pratiqués), FindCoachSection (cartes coaches)

### Phase 3.4 – Tuiles sélectionnables (Sports & Langues) ✅

- **Composant `SportTileSelectable`** : tuile réutilisable pour sports avec états cliquable/sélectionné
  - Mode uncontrolled (formulaire avec hidden checkbox)
  - Mode controlled (React state avec button)
  - États : non sélectionné (bordure grise, hover vert), sélectionné (fond vert forêt, texte blanc, ombre)
- **Centralisation** : `lib/sportsOptions.ts` pour COACHED_SPORTS_OPTIONS, PRACTICED_SPORTS_OPTIONS, LANGUAGES_OPTIONS
- **Migration complète** :
  - ✅ ProfileForm : sports coachés/pratiqués avec `SportTileSelectable`, langues avec tuiles `rounded-full px-4 py-2`
  - ✅ FindCoachSection : filtres sports avec `SportTileSelectable`, filtres langues avec boutons cohérents `rounded-full px-4 py-2`
  - ✅ RequestCoachButton : sélection sports pratiqués avec `SportTileSelectable`
  - ✅ WorkoutModal : icônes sports alignées design system (course, vélo, natation, musculation)
  - ✅ coach/page.tsx (Mon Coach) : affichage sports coachés et langues avec style non-cliquable cohérent `rounded-full px-4 py-2`
- **CSS global** : `.chip-checkbox:checked + div` pour état sélectionné automatique

---

## 🟡 Phase 4 – Composants restants et optimisations

### 4.1 Badge compteur (style custom)

- **FindCoachSection** ligne 172 : Badge de compteur "Résultats" utilise classes custom inline
  ```tsx
  <span className="bg-stone-200 text-stone-600 text-xs py-0.5 px-2 rounded-full">
  ```
- **À faire :** Créer variante `Badge variant="counter"` pour réutilisation

### 4.2 Cartes coach (cohérence hover/states)

- **FindCoachSection** : Cartes coaches avec styles custom pour hover/états
- **À faire :** Documenter ou créer composant `CoachCard` réutilisable

### 4.3 Modales

- Modales utilisent des styles inline cohérents mais non composés
- **À faire :** Créer composant `Modal` réutilisable avec variantes (ou documenter le pattern actuel)

---

## 🟢 Phase 5 – Documentation et cohérence ✅

### 5.1 Documentation DESIGN_SYSTEM.md ✅

- ✅ **Fichier créé** : `docs/DESIGN_SYSTEM.md`
- ✅ Tokens (couleurs, typographie, espacements, rayons, ombres)
- ✅ Composants (Button, Input, Textarea, Badge, SportTileSelectable)
- ✅ Icônes sports avec centralisation
- ✅ Guidelines et conventions
- ✅ Exemples d'utilisation
- ✅ FAQ et maintenance

### 5.2 Typographie ✅

- Conventions documentées : heading-1 (`text-2xl font-bold`), heading-2 (`text-lg font-bold`), labels (`text-xs font-bold uppercase`), body (`text-sm`)
- Hiérarchie claire dans DESIGN_SYSTEM.md

### 5.3 Rayons (border-radius) ✅

- Usage documenté : `rounded-full` (badges/tuiles), `rounded-2xl` (cartes), `rounded-xl` (inputs), `rounded-lg` (boutons)
- Guidelines dans DESIGN_SYSTEM.md

### 5.4 Ombres ✅

- Usage documenté : `shadow-sm` (cartes au repos), `shadow-lg` (hover), `shadow-xl` (modales)
- Ombre custom pour tuiles sélectionnées : `shadow-[0_4px_6px_-1px_rgba(98,126,89,0.3)]`

### 5.5 Espacements ✅

- Conventions documentées : `gap-2` (langues, 8px), `gap-3` (sports, 12px), `gap-6` (sections, 24px)
- Padding tuiles : `px-4 py-2`
- Padding badges : `px-2.5 py-0.5`

---

## 🧹 Phase 6 – Nettoyage

### 6.1 Code mort potentiel

- ~~Modal.tsx~~ ✅ (supprimé)
- **ProfileMenu** : vérifier si importé/utilisé → supprimer si inutilisé
- **input-group** (globals.css) : classe orpheline depuis suppression du profil → à supprimer ou documenter

### 6.2 Duplication configuration

- Réduire duplication entre `tailwind.config.ts` et `globals.css` (variables CSS)

---

## 📋 Plan d'action – Prochaines étapes

| Priorité | Tâche | Effort | Impact | Statut |
|----------|-------|--------|--------|--------|
| 1 | ~~Créer Badge + SportTileSelectable~~ | — | — | ✅ |
| 2 | ~~Migrer tuiles sports/langues~~ | — | — | ✅ |
| 3 | Créer variante Badge `counter` | Faible | Faible | 🟡 |
| 4 | Documenter design system (DESIGN_SYSTEM.md) | Moyen | Élevé | 🔴 |
| 5 | Composant Modal réutilisable | Moyen | Moyen | 🟡 |
| 6 | Composant CoachCard | Moyen | Faible | 🟡 |
| 7 | Nettoyage : ProfileMenu, input-group | Faible | Faible | 🟡 |
| 8 | Documenter typographie, rayons, ombres | Faible | Moyen | 🟡 |
| 9 | Unifier espacements (gaps) | Faible | Faible | 🟡 |

---

## 📊 Résumé

### ✅ Complété (100%)

**Tokens & Fondations :**
- Palette couleurs complète avec tokens
- Corrections typos critiques

**Composants de base :**
- ✅ Button (8 variantes)
- ✅ Input / Textarea (avec états disabled/readOnly)
- ✅ Badge (variantes default, primary, sport-*, success, warning)
- ✅ SportTileSelectable (états cliquable/sélectionné)

**Migrations :**
- ✅ Tous les formulaires (Login, Profile, Workout, Offers, Goals, etc.)
- ✅ Tuiles sports & langues (Profile, FindCoach, RequestCoach, MonCoach)
- ✅ Icônes sports alignées (Calendar, WorkoutModal, Badges)

### 🟡 En cours / À prioriser

1. **Documentation DESIGN_SYSTEM.md** (HAUTE PRIORITÉ)
   - Centraliser tokens, composants, conventions
   - Exemples d'utilisation
   - Guidelines typographie, espacements, rayons

2. **Optimisations mineures**
   - Variante Badge `counter` pour compteurs
   - Composant Modal réutilisable
   - Nettoyage code mort (ProfileMenu, input-group)

### 🎯 État actuel

Le design system est **opérationnel et cohérent** pour :
- Boutons, champs de formulaire, badges, tuiles sélectionnables
- Couleurs, sports avec icônes, états interactifs

**Prochaine étape recommandée :** Rédiger DESIGN_SYSTEM.md pour documenter l'ensemble et faciliter la maintenance future.

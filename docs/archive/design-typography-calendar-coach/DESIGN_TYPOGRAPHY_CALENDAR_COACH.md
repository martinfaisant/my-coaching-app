# Design – Uniformisation typographie page calendrier athlète (vue coach)

**Date :** 18 mars 2026  
**Mode :** Designer  
**Périmètre :** Page calendrier d'un athlète vue par le coach (CoachAthleteCalendarPage) — mobile, tablette, desktop.

---

## 1. Besoin reformulé

Uniformiser les **tailles et styles de police** sur la page calendrier athlète (vue coach) pour un rendu plus **professionnel et cohérent** sur toutes les vues (mobile, tablette, ordinateur). L’objectif est d’établir une hiérarchie typographique claire et reproductible.

---

## 2. Analyse de l’écran existant

### Structure actuelle

La page est composée de :

1. **En-tête** : bouton retour, avatar athlète, nom athlète, sélecteur de semaine (WeekSelector)
2. **Zone calendrier** : sections par semaine (SEMAINE PRÉCÉDENTE / Semaine actuelle / SEMAINE SUIVANTE), grille 7 colonnes (desktop) ou liste verticale (mobile), totaux hebdomadaires (volume horaire, km par sport)
3. **Section Objectifs de l’athlète** : titres de saison (SAISON 2026), tuiles objectifs (date, titre, badges Principal/Secondaire, métadonnées)

### Typographie actuelle (incohérences repérées)

| Zone | Actuel | Problème |
|------|--------|----------|
| Nom athlète | `text-lg font-bold` | Peut paraître petit sur desktop |
| Titre semaine actuelle | `text-xl font-bold text-palette-forest-dark` | OK |
| Titre semaine secondaire | `text-xs font-bold uppercase text-stone-500` | Contraste fort avec semaine actuelle |
| En-têtes de jour (desktop) | `text-xs font-medium uppercase` + `text-sm font-semibold` | Variantes selon contexte |
| En-têtes de jour (mobile) | `text-sm font-semibold` | Différent du desktop |
| Titre entraînement (tuile) | `text-xs font-semibold` ou `text-sm font-bold` | Incohérence selon vue |
| Section MIDI/Matin/Soir | `text-[9px]` ou `text-[10px]` | Trop petit, variable |
| Métadonnées (1h10, 14 km) | `text-[10px] font-semibold` | Variable |
| Badge statut (Planifié) | `text-[10px] font-semibold` | OK |
| Titre objectif | `text-base font-bold` | OK |
| Bloc date objectif | `text-[10px]` + `text-xl font-bold` | OK |
| Saison | `text-sm font-bold uppercase text-stone-400` | OK |

---

## 3. Hiérarchie typographique proposée (7 niveaux)

Alignée sur le design system (`docs/DESIGN_SYSTEM.md`) et les maquettes fournies :

| Niveau | Nom | Mobile | Tablette/Desktop | Usage |
|--------|-----|--------|------------------|-------|
| **H1** | Titre page / Athlète | `text-base font-bold text-stone-900` | `text-base font-bold text-stone-900` | Nom de l’athlète (plus grand élément de la page) |
| **H2** | Titre section principale | `text-base font-bold text-palette-forest-dark` | `text-base font-bold text-palette-forest-dark` | « Semaine actuelle » |
| **H2-secondary** | Titre section secondaire | `text-xs font-bold uppercase tracking-wider text-stone-500` | `text-xs font-bold uppercase tracking-wider text-stone-500` | « SEMAINE PRÉCÉDENTE », « SEMAINE SUIVANTE », « SAISON 2026 » |
| **H3** | En-tête jour / Titre carte | `text-sm font-semibold text-stone-800` | `text-sm font-semibold text-stone-800` | « VEN. 20 mars », titre entraînement « Zone 2 », titre objectif « test 2 » |
| **H4** | Sous-titre / Moment | `text-xs font-semibold uppercase tracking-wider text-stone-500` | `text-xs font-semibold uppercase tracking-wider text-stone-500` | « MIDI », « Matin », « Soir » — **en dehors** de la tuile entraînement |
| **Body** | Description / Corps | `text-xs text-stone-500` | `text-xs text-stone-500` | Description entraînement, « Sortie longue fait toi plaisir » |
| **Caption** | Métadonnées / Stats | `text-[10px] text-stone-500` | `text-[10px] text-stone-500` | « 1h10 », « 14 km », « Planifié » ; Disponible/Indisponible |

### Règles de cohérence

- **Titres** : `font-bold` ou `font-semibold`
- **Labels / sections secondaires** : `text-xs font-bold uppercase tracking-wider text-stone-500` (ou `text-stone-400` pour plus discret)
- **Métadonnées** : `text-xs text-stone-500` (ou `font-medium` si besoin d’accent)
- **Badges** : `text-xs font-semibold` ou `text-[10px] font-bold uppercase` pour badges courts (DISPONIBLE, Planifié, etc.)

---

## 4. Composants à utiliser et à faire évoluer

### Utiliser tels quels

- **DashboardPageShell** / layout parent
- **AvatarImage** (avatar athlète)
- **TileCard** (objectifs)
- **Button** (boutons)
- **WeekSelector** (structure conservée, typo ajustée)

### À faire évoluer

| Composant | Modifications typo |
|-----------|--------------------|
| **CoachAthleteCalendarPage** | Nom athlète : `text-base font-bold text-stone-900` |
| **CalendarView** | Section semaine : H2 vs H2-secondary selon type ; en-têtes jour : H3 ; titres carte : H3 ; moment : H4 ; description : Body ; métadonnées : Caption |
| **WeekSelector** | Labels prev/next : `text-xs text-stone-500` ; plage centrale : `text-sm font-bold text-stone-800` (lg) |
| **Tuiles objectifs** (CoachAthleteCalendarPage) | Titre : `text-sm font-bold` (même taille que titre workout) ; métadonnées : `text-xs text-stone-500` ; badges : `text-[10px] font-semibold uppercase` ; **bloc date** : `w-12 h-12`, mois `text-[10px]`, jour `text-sm` |

---

## 5. Breakpoints et responsive

| Breakpoint | Largeur | Layout principal |
|------------|---------|------------------|
| Mobile | &lt; 768px | En-tête 2 lignes ; liste verticale des jours ; semaine actuelle seule ; objectifs en dessous |
| Tablette | 768px – 1023px | En-tête 1 ligne ; grille 7 colonnes ; 3 semaines visibles ; objectifs en dessous |
| Desktop | ≥ 1024px | Idem tablette ; plage de dates sur une ligne dans WeekSelector ; **objectifs toujours en dessous** (pas de sidebar à droite) |

---

## 6. Mockups proposés

Trois fichiers HTML mockups illustrent le rendu cible :

- **MOCKUP_TYPOGRAPHY_CALENDAR_MOBILE.html** — Vue mobile (~375px)
- **MOCKUP_TYPOGRAPHY_CALENDAR_TABLET.html** — Vue tablette (~768px)
- **MOCKUP_TYPOGRAPHY_CALENDAR_DESKTOP.html** — Vue desktop (~1200px)

Chaque mockup montre la page complète avec la typographie uniformisée.

---

## 6bis. Variantes possibles (à valider)

**Option A (proposée, validée)** : Nom athlète `text-lg` sur tous les breakpoints ; sections principales `text-base` ; titres secondaires `text-xs uppercase`.

**Option C** : Titre « Objectifs de l'athlète » en H2-secondary (gris uppercase) au lieu de H2 (vert) pour réduire la concurrence visuelle avec « Semaine actuelle ».

---

## 7. Points à trancher en implémentation

1. **Nom athlète** : `text-lg` sur tous les breakpoints (validé — tailles réduites).
2. **Badges statut** : conserver `text-[10px]` pour les badges très compacts (Planifié, Réalisé) ou passer à `text-xs` partout ?
3. **Section Objectifs** : le titre « Objectifs de l’athlète » doit-il être H2 (vert) ou H2-secondary (gris) ?

---

## 8. Checklist avant livraison

- [x] Design system consulté
- [x] Mockup validé visuellement (à valider par le PO)
- [ ] Chaque US liée à une zone du mockup (si découpage en US)
- [x] Composants utilisés/modifiés listés

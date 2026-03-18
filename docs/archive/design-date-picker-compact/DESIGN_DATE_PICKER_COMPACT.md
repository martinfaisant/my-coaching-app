# Design — Date picker : mois/année séparés et plus compact

**Mode :** Designer  
**Date :** 17 mars 2026  
**Composant concerné :** `DatePickerPopup` (`components/DatePickerPopup.tsx`)

---

## 1. Reformulation du besoin

Modifier le composant **DatePickerPopup** pour :

1. **Sélection mois et année séparée**  
   Aujourd’hui un seul Dropdown affiche « Mois Année » (ex. « Mars 2026 »). Le PO souhaite **deux contrôles distincts** : un pour le mois, un pour l’année, afin de pouvoir changer le mois sans parcourir une longue liste et l’année indépendamment.

2. **Version plus compacte**  
   Réduire l’encombrement visuel du popup (padding, taille des cellules, largeur, espacements) pour qu’il prenne moins de place à l’écran, notamment dans les modales (WorkoutModal, AvailabilityModal, objectifs, demande de coaching).

---

## 2. Contexte actuel

- **Fichier :** `components/DatePickerPopup.tsx`
- **Design system :** `docs/DESIGN_SYSTEM.md` § DatePickerPopup
- **Usages :**
  - **WorkoutModal** : date de la séance (popover sous le champ date)
  - **AvailabilityModal** : date du créneau
  - **ObjectifsTable** : date de l’objectif (formulaire ajout objectif)
  - **RequestGoalAddModal** : date objectif dans la demande de coaching

**Structure actuelle :**
- Un **Dropdown** unique (value = `YYYY-MM`, label = « mars 2026 ») + deux boutons flèche (mois précédent / suivant)
- Une ligne des **jours de la semaine** (narrow)
- Une **grille 7×6** de boutons jour (42 cellules), hauteur 9, `min-w-[2.25rem]`, gap 1
- Pied avec lien **« Aujourd’hui »** uniquement
- Conteneur : `p-4`, `w-[min(320px,90vw)]`, `rounded-xl`, `shadow-xl`, `border border-stone-200`

---

## 3. Cas à couvrir

| Cas | Description |
|-----|-------------|
| **Nominal** | L’utilisateur choisit le mois via le dropdown mois, l’année via le dropdown année, puis le jour dans la grille. La date sélectionnée reste affichée (jour mis en évidence). |
| **Contraintes min/max** | Si `minDate` / `maxDate` sont fournis, les options des dropdowns mois/année et les jours désactivés respectent ces bornes (comportement actuel à conserver). |
| **Accessibilité** | Deux ids dédiés (ex. `monthDropdownId`, `yearDropdownId`), `aria-label` sur chaque dropdown (« Choisir le mois », « Choisir l’année »). |
| **Mobile** | Le popup reste en `min(…, 90vw)` ; une version plus compacte améliore l’affichage sur petit écran. |
| **i18n** | Noms des mois via `locale` (déjà le cas). Années en chiffres (pas de traduction). Lien « Aujourd’hui » : namespace `calendar` (existant). |

---

## 4. Décisions PO (17 mars 2026)

| Question | Décision |
|----------|----------|
| **Plage d’années** | Afficher **4 ans dans le passé** et **4 ans dans le futur** par rapport à l’année courante (9 années au total). |
| **Flèches** | **Solution B** : deux dropdowns (Mois, Année) + boutons flèche réduits. |
| **Compacité** | Jouer uniquement sur le **padding** et la **taille de police / cellules** (pas de réduction du nombre de lignes de la grille). |

**Référence mockup retenue :** `MOCKUP_DATE_PICKER_SOLUTION_B.html`

---

## 5. Composants design system

- **À utiliser tels quels :**
  - **Dropdown** : deux instances (une pour le mois, une pour l’année), avec `hideLabel`, style trigger aligné sur l’existant (`FORM_BASE_CLASSES` ou équivalent via le Dropdown).
  - **Tokens** : `palette-forest-dark`, `palette-forest-darker`, `stone-*`, `rounded-lg`, `shadow-xl`, etc.
  - Lien « Aujourd’hui » (comportement et i18n existants).
  - Logique métier : `buildCalendarCells`, `minDate` / `maxDate`, `value` / `onChange`.

- **À faire évoluer :**
  - **DatePickerPopup** :
    - Remplacer le Dropdown unique (mois+année) par **deux Dropdown** (mois, année).
    - Réduire **padding** du popup (ex. `p-4` → `p-3`).
    - Réduire **taille des cellules** de la grille (ex. `h-9` → `h-8`, `min-w-[2.25rem]` → `min-w-[2rem]` ou équivalent).
    - Réduire **largeur** du popup (ex. 320px → 280px ou 272px).
    - Pied plus compact (ex. `mt-4 pt-3` → `mt-3 pt-2`).
    - Optionnel : retirer les flèches ou les garder avec boutons plus petits (Solution A vs B).

---

## 6. Propositions de solutions (mockups)

Deux solutions UI sont proposées ; les mockups HTML sont dans le même dossier.

### Solution A — Deux dropdowns uniquement (mois + année), sans flèches

- **En-tête :** deux Dropdown côte à côte : **Mois** (ex. « Mars ») puis **Année** (ex. « 2026 »). Pas de boutons flèche.
- **Compacité :** popup `p-3`, largeur `min(280px, 90vw)`, grille avec cellules plus petites (`h-8`, `min-w-[2rem]`), jours de la semaine en `text-[11px]`, pied `mt-3 pt-2`.
- **Avantage :** interface épurée, moins d’éléments ; navigation rapide vers n’importe quel mois/année.
- **Inconvénient :** pas de navigation « mois précédent / suivant » en un clic (il faut rouvrir les dropdowns ou changer le mois manuellement).

**Référence mockup :** `MOCKUP_DATE_PICKER_SOLUTION_A.html`

---

### Solution B — Deux dropdowns + flèches réduites

- **En-tête :** même disposition que A (Mois | Année) avec en plus deux **petits boutons flèche** à droite (icônes plus petites, padding réduit) pour garder la navigation mois par mois.
- **Compacité :** identique à A (même padding, largeur, grille).
- **Avantage :** choix mois/année séparé + navigation rapide mois précédent/suivant pour les utilisateurs qui en ont l’habitude.
- **Inconvénient :** légèrement plus d’éléments dans l’en-tête.

**Référence mockup :** `MOCKUP_DATE_PICKER_SOLUTION_B.html`

---

## 7. Synthèse

| Élément | Actuel | Solution A | Solution B |
|--------|--------|------------|------------|
| Mois | Dropdown combiné mois+année | Dropdown Mois seul | Dropdown Mois seul |
| Année | (idem) | Dropdown Année seul | Dropdown Année seul |
| Flèches | Oui (2 boutons) | Non | Oui (2 boutons réduits) |
| Largeur popup | 320px | 280px | 280px |
| Padding popup | p-4 | p-3 | p-3 |
| Cellules grille | h-9, min-w-2.25rem | h-8, min-w-2rem | h-8, min-w-2rem |
| Pied | mt-4 pt-3 | mt-3 pt-2 | mt-3 pt-2 |

---

## 8. User stories

**Référence visuelle :** `MOCKUP_DATE_PICKER_SOLUTION_B.html` (en-tête + grille + pied).

### US1 — Dropdown Mois séparé

En tant qu’utilisateur, je peux choisir le **mois** via un dropdown dédié (liste des 12 mois, libellés selon la locale), afin de naviguer rapidement vers un mois sans parcourir une liste mois+année combinée.

**Critères d’acceptation :**
- Un premier Dropdown affiche uniquement le mois courant (ex. « Mars »). Les options sont les 12 mois, formatés selon `locale` (ex. `toLocaleDateString` avec `month: 'long'`), capitalisés.
- La valeur du dropdown mois est cohérente avec la vue courante du calendrier ; le changement de mois met à jour la grille des jours.
- Si `minDate` / `maxDate` sont fournis, les mois hors plage sont exclus des options (ou désactivés) pour éviter de naviguer vers une période sans jour sélectionnable.
- **Référence mockup :** zone en-tête, dropdown de gauche (Mois).

**Composants :** `Dropdown` (design system), `hideLabel` ; i18n via `locale` pour les noms des mois.

---

### US2 — Dropdown Année séparé

En tant qu’utilisateur, je peux choisir l’**année** via un dropdown dédié (de « année courante − 4 » à « année courante + 4 »), afin de changer d’année indépendamment du mois.

**Critères d’acceptation :**
- Un second Dropdown affiche l’année courante (ex. « 2026 »). Les options vont de **année courante − 4** à **année courante + 4** (9 années).
- La valeur du dropdown année est cohérente avec la vue courante ; le changement d’année met à jour la grille.
- Si `minDate` / `maxDate` sont fournis, les années hors plage sont exclues (ou désactivées) des options.
- **Référence mockup :** zone en-tête, dropdown de droite (Année), largeur réduite (ex. 72px ou `w-[72px]`).

**Composants :** `Dropdown` (design system), `hideLabel`.

---

### US3 — Flèches mois précédent / suivant (réduites)

En tant qu’utilisateur, je peux naviguer d’un mois à l’autre via deux **boutons flèche** à droite des dropdowns, en conservant une interface compacte.

**Critères d’acceptation :**
- Deux boutons (mois précédent, mois suivant) sont affichés à droite des dropdowns Mois et Année. Au clic, la vue change d’un mois (et la sélection de date reste inchangée sauf si le jour n’existe pas dans le nouveau mois).
- Style réduit : padding `p-1.5`, icône `w-4 h-4`, `rounded-md`, hover `text-palette-forest-dark` / `bg-stone-100`. Pas de changement de la plage d’années des options en naviguant aux flèches (la vue peut sortir temporairement de la plage ; à la prochaine ouverture des dropdowns, les options restent -4 / +4).
- **Référence mockup :** zone en-tête, deux flèches à droite.

**Composants :** boutons icône (style design system), accessibilité `aria-label` « Mois précédent » / « Mois suivant » (i18n si besoin).

---

### US4 — Compacité visuelle (padding, police, cellules)

En tant qu’utilisateur, je vois un date picker **plus compact** (moins de padding, cellules et textes plus petits), sans changement du nombre de lignes affichées dans la grille.

**Critères d’acceptation :**
- **Conteneur popup :** padding réduit (`p-4` → `p-3`). Largeur : `min(280px, 90vw)` (ou conservée à 320px si le PO préfère ; le mockup B utilise 280px).
- **Jours de la semaine :** taille de police réduite (ex. `text-xs` ou `text-[11px]`), espacement vertical réduit (`py-0.5`, `mb-0.5`).
- **Grille des jours :** cellules plus petites : hauteur `h-8` (au lieu de `h-9`), largeur min `min-w-[2rem]` (au lieu de `min-w-[2.25rem]`), texte en `text-xs`, gap `gap-0.5`. La grille reste en **6 lignes** (42 cellules).
- **Pied :** espacement réduit (`mt-4 pt-3` → `mt-3 pt-2`), lien « Aujourd’hui » en `text-xs`.
- **Référence mockup :** `MOCKUP_DATE_PICKER_SOLUTION_B.html` (ensemble du popup).

**Composants :** `DatePickerPopup` uniquement (pas de nouveau composant). Tokens : `palette-forest-dark`, `stone-*`, `rounded-lg`, etc.

---

### US5 — Accessibilité et contraintes min/max

En tant qu’utilisateur (y compris avec lecteur d’écran ou contraintes de date), le date picker reste **accessible** et **respecte les bornes** min/max.

**Critères d’acceptation :**
- **Ids :** le composant accepte `monthDropdownId` et `yearDropdownId` (ou un seul `monthDropdownId` conservé + nouvel optional `yearDropdownId`) pour l’association label/trigger. Les usages existants (WorkoutModal, AvailabilityModal, ObjectifsTable, RequestGoalAddModal) passent un id pour le mois ; ajouter un id pour l’année (dérivé ou prop dédiée).
- **Aria :** chaque Dropdown a un `aria-label` explicite (« Choisir le mois », « Choisir l’année »). Texte à mettre en i18n (namespace `calendar` ou commun).
- **minDate / maxDate :** les options des dropdowns Mois et Année ne proposent que les mois/années pour lesquels au moins un jour est dans la plage [minDate, maxDate]. Les jours hors plage restent désactivés (gris, non cliquables).
- **Référence mockup :** comportement (pas de zone visuelle spécifique).

**i18n :** ajouter si nécessaire les clés pour les aria-labels (ex. `calendar.chooseMonth`, `calendar.chooseYear`) dans `messages/fr.json` et `messages/en.json`. Référence : `docs/I18N.md`.

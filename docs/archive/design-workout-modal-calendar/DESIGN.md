# Design — Calendrier / sélecteur de date dans la modale entraînement modifiable

**Contexte :** Modale d’entraînement (`WorkoutModal`) lorsque l’entraînement est **modifiable** (coach, séance à venir). Un sélecteur de date permet de changer la date de la séance. Il doit respecter le **design system** (tokens, composants, `lib/formStyles.ts`).

**Références :**
- Design system : `docs/DESIGN_SYSTEM.md` (Input, Modal, tokens)
- Styles formulaires : `lib/formStyles.ts` (FORM_BASE_CLASSES, FORM_LABEL_CLASSES)
- Modale workout (en-tête) : `docs/design-workout-modal-sport-header/mockup-a-badge-header.html`
- Implémentation actuelle : `components/WorkoutModal.tsx` (bloc date dans `headerRight`)

---

## 1. Besoin reformulé

- **Cas nominal :** En mode édition (coach, séance à venir), l’utilisateur voit et peut modifier la **date** de l’entraînement. Le contrôle doit être clairement identifiable comme un champ de formulaire et respecter les tokens (couleurs, rayons, focus, typo).
- **Cas secondaires :** Date en lecture seule (athlète ou coach séance passée/réalisée) : pas de calendrier, simple texte formaté (déjà aligné mockup badge-header).
- **Contraintes :** Pas de librairie calendrier externe ; usage du `input type="date"` natif (optionnellement masqué avec `showPicker()` au clic sur un bouton/zone).

---

## 2. Composants design system à utiliser / faire évoluer

| Élément | Utilisation |
|--------|-------------|
| **Tokens** | `border-stone-300`, `rounded-lg`, `focus:ring-2 focus:ring-palette-forest-dark`, `text-stone-900` / `text-stone-600`, `bg-white` |
| **formStyles** | `FORM_BASE_CLASSES` pour l’apparence “champ” (bordure, radius, focus) ; `FORM_LABEL_CLASSES` si label visible |
| **Input** | Peut être réutilisé en `type="date"` si le champ est dans le corps du formulaire (Solution B) |
| **Modal** | Inchangé ; le bloc date est soit dans `headerRight`, soit dans le contenu |
| **Badge** | Déjà utilisé pour le statut à droite du bloc date ; à conserver |

À faire évoluer éventuellement :
- **Aucun nouveau composant** si on se contente d’un bloc HTML sémantique (label + div/input) stylé avec les tokens et formStyles.
- Si on souhaite réutiliser ce “bloc date compact” ailleurs : extraction possible en composant type `DatePickerDisplay` (affichage formaté + bouton calendrier déclenchant l’input natif), documenté dans le design system.

---

## 3. Propositions UI (3 solutions)

### Solution A — Champ date compact dans l’en-tête (aligné tokens)

- **Où :** Le bloc date reste dans le **header** de la modale (`headerRight`), à côté du badge statut.
- **Style :** Même vocabulaire visuel qu’un Input sans label : `border border-stone-300 rounded-lg bg-white`, `focus-within:ring-2 focus-within:ring-palette-forest-dark`, padding cohérent (`px-3 py-2` ou `py-2.5`). Affichage = **texte formaté** (ex. “lundi 3 mars 2025”) + **icône calendrier** à droite ; au clic sur la zone ou l’icône, ouverture du picker natif (`input type="date"` en sr-only + `showPicker()`).
- **Typo :** `text-sm font-medium text-stone-900` pour la date, icône en `text-stone-400` avec hover `text-palette-forest-dark` / `bg-stone-100`.
- **Composants :** Réutiliser les tokens et les classes de `formStyles` pour le conteneur (pas le composant `Input` lui-même, pour garder un format compact en header).

**À utiliser tels quels :** Tokens, formStyles (bordures, focus), icône calendrier (SVG existant).  
**À faire évoluer :** Aucun composant ; s’assurer que le conteneur du bloc date utilise bien les mêmes classes que les champs (border, rounded-lg, focus-within).

---

### Solution B — Date dans le corps comme premier champ

- **Où :** La date **quitte le header** et devient le **premier champ** du formulaire dans le corps de la modale, avec un label “Date de la séance” (i18n).
- **Style :** Composant **Input** avec `type="date"`, `FORM_BASE_CLASSES` et `FORM_LABEL_CLASSES` (comme sur la page Objectifs). Le header ne contient plus que le titre, le badge sport (pill) et le badge statut (sans date).
- **Composants :** `Input` tel quel avec `label`, `name="date"`, `type="date"`.

**À utiliser tels quels :** `Input`, `FORM_LABEL_CLASSES`, `FORM_BASE_CLASSES`.  
**À faire évoluer :** Aucun. Comportement et style 100 % alignés sur le design system et sur Objectifs.

---

### Solution C — En-tête avec “mini Input” explicite (formStyles)

- **Où :** Comme en A, le bloc date reste dans l’**en-tête**.
- **Style :** Conteneur qui reprend **explicitement** les mêmes classes qu’un Input pour la bordure et le focus : `rounded-lg border border-stone-300 bg-white focus-within:ring-2 focus-within:ring-palette-forest-dark focus-within:border-transparent transition`, avec un padding légèrement réduit pour l’en-tête (`px-3 py-2`) pour ne pas surcharger. Contenu : span (date formatée) + bouton icône calendrier. Pas de label dans le header.
- **Différence avec A :** A et C sont très proches ; C insiste sur l’usage des mêmes classes que `FORM_BASE_CLASSES` (sans `w-full` ni `px-4 py-2.5`) pour garantir la cohérence avec les autres champs.

**À utiliser tels quels :** formStyles (sous-ensemble : border, rounded-lg, focus-within), icône calendrier.  
**À faire évoluer :** Aucun composant ; éventuellement ajouter dans `formStyles.ts` une constante `FORM_INLINE_DATE_CLASSES` pour ce bloc compact si on veut le réutiliser ailleurs.

---

## 4. Synthèse et recommandation

| Critère | Solution A | Solution B | Solution C |
|--------|------------|------------|------------|
| Cohérence design system | Bonne (tokens) | Maximale (Input) | Bonne (formStyles explicites) |
| En-tête allégé | Non (date dans header) | Oui (date dans le corps) | Non (date dans header) |
| Réutilisation Objectifs | — | Même pattern qu’Objectifs | — |
| En-tête identique lecture seule / édition | Non (présence du bloc date seulement en édition) | Oui (header sans date) | Non (idem A) |

- **Recommandation :** **Solution B** si l’on privilégie la cohérence avec le reste des formulaires (Objectifs, etc.) et un header identique en lecture seule et en édition. **Solution A ou C** si l’on souhaite garder la date dans l’en-tête pour un accès rapide sans scroller ; dans ce cas, **C** renforce l’alignement avec `formStyles`.

---

## 5. Critères d’acceptation (pour les user stories)

- Le sélecteur de date (modale entraînement modifiable) utilise **uniquement** les tokens du design system (couleurs, rayons, focus) et, si dans le corps, le composant **Input** avec **formStyles**.
- En lecture seule (athlète ou coach séance passée/réalisée), la date reste affichée en texte seul (pas de calendrier), comme dans le mockup badge-header.
- Accessibilité : le champ date est associé à un label (visible en B, ou `aria-label` en A/C) ; le focus au clavier et le focus visible sont conformes (ring palette-forest-dark).
- i18n : libellés “Date de la séance” et “Choisir la date” (ou équivalent) pris dans les namespaces existants (ex. `workouts`).

---

## 6. Fichiers concernés

- **Design / mockup :** `docs/design-workout-modal-calendar/` (ce document + mockup HTML).
- **Implémentation :** `components/WorkoutModal.tsx` (bloc date dans `coachModifiableHeaderRight` ou déplacement dans le formulaire selon la solution retenue).

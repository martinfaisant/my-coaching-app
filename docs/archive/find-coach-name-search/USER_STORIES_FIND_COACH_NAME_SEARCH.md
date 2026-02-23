# User stories — Recherche par nom ou prénom (Trouver mon coach)

**Référence design :** `PROPOSAL_FIND_COACH_NAME_SEARCH.md`  
**Mockup validé :** Solution A dans `MOCKUP_FIND_COACH_NAME_SEARCH.html` (champ en tête du bloc Filtres, pleine largeur).

**Comportement retenu :** Un champ unique « Nom ou prénom », filtre **temps réel** (à chaque frappe), correspondance **contient** (substring), insensible à la casse, trim.

---

## US 1 — Affichage du champ de recherche

**En tant qu’** athlète sur la page « Trouver mon coach »,  
**je veux** voir un champ me permettant de rechercher un coach par nom ou prénom,  
**afin de** réduire rapidement la liste aux coachs dont le nom ou le prénom correspond.

### Critères d’acceptation

- [ ] Un champ de saisie (type search) est affiché **en première position** dans le bloc blanc « Filtres », **au-dessus** de la grille « Sport coaché » / « Langue parlée » (zone « Solution A » du mockup).
- [ ] Le champ est en **pleine largeur** dans le bloc, avec les styles du design system (Input, `FORM_BASE_CLASSES` de `lib/formStyles.ts`).
- [ ] Un **placeholder** explicite est affiché (ex. « Ex. Martin, Dupont… »), et le champ a un **label** accessible (visible ou `sr-only`) et un `aria-label` pour les technologies d’assistance.
- [ ] **i18n :** Le label et le placeholder sont traduits (namespace `findCoach`, ex. `filters.nameSearchPlaceholder`). FR et EN.

### Référence mockup

Section **« Solution A »** de `MOCKUP_FIND_COACH_NAME_SEARCH.html` : bloc Filtres avec le champ en tête, puis grille Sport / Langue.

### Composants / Fichiers

- **Utiliser tels quels :** `Input` (`components/Input.tsx`), `lib/formStyles.ts`.
- **Modifier :** `FindCoachSection.tsx` (ajout du champ dans le bloc Filtres) ; `messages/fr.json` et `messages/en.json` (clés `findCoach.filters.nameSearchLabel`, `findCoach.filters.nameSearchPlaceholder` ou équivalent).

---

## US 2 — Filtrage temps réel par nom ou prénom

**En tant qu’** athlète sur la page « Trouver mon coach »,  
**je veux** que la liste des coachs se mette à jour à chaque frappe dans le champ nom/prénom,  
**afin de** voir immédiatement les coachs correspondants sans cliquer sur un bouton.

### Critères d’acceptation

- [ ] La liste des coachs affichée (tuiles) est filtrée en **temps réel** selon la valeur du champ « Nom ou prénom ».
- [ ] La recherche s’applique sur **first_name** et **last_name** : un coach est affiché si au moins l’un des deux contient la chaîne saisie (après trim).
- [ ] La correspondance est **insensible à la casse** (ex. « martin » ou « MARTIN » donne les mêmes résultats).
- [ ] **Champ vide :** si le champ est vide (ou uniquement des espaces), aucun filtre sur le nom n’est appliqué ; les filtres sport et langue restent seuls actifs.
- [ ] Le filtre nom est **combiné** avec les filtres sport coaché et langue parlée : seuls les coachs qui satisfont les trois critères (nom + sport + langue) sont affichés.
- [ ] Le **badge de nombre** de résultats (à côté de « Résultats ») reflète le nombre de coachs après application de tous les filtres (nom, sport, langue).
- [ ] Si aucun coach ne correspond : le message existant « Aucun coach ne correspond à vos critères… » s’affiche (aucun changement de texte).

### Référence mockup

Même bloc que US 1 ; le comportement (temps réel, combinaison avec sport/langue) est décrit dans la spec, pas visible dans le HTML statique.

### Composants / Fichiers

- **Modifier :** `FindCoachSection.tsx` : état local pour la valeur du champ (ex. `searchName`), fonction de filtre `matchesName(coach, query)` (trim, insensible à la casse, test sur `first_name` et `last_name`), et `filteredCoaches` qui inclut `matchesName` en plus de `matchesSport` et `matchesLanguage`.

---

## US 3 — Réinitialiser inclut le champ nom

**En tant qu’** athlète ayant saisi un nom et/ou des filtres sport/langue,  
**je veux** que le bouton « Réinitialiser » vide aussi le champ de recherche par nom,  
**afin de** repartir d’une liste non filtrée par le nom en un clic.

### Critères d’acceptation

- [ ] Au clic sur **« Réinitialiser »**, le champ « Nom ou prénom » est **vidé** en plus des sélections « Sport coaché » et « Langue parlée ».
- [ ] Après réinitialisation, la liste affichée est celle de tous les coachs (sans filtre nom, sport ni langue).

### Référence mockup

Bouton « Réinitialiser » en haut à droite du bloc Filtres (Solution A). Comportement décrit dans la spec.

### Composants / Fichiers

- **Modifier :** `FindCoachSection.tsx` : dans la fonction `clearFilters`, ajouter la réinitialisation de l’état du champ recherche nom (ex. `setSearchName('')`).

---

## Récapitulatif pour l’Architecte / Développeur

| Fichier | Rôle | Action |
|--------|------|--------|
| `app/[locale]/dashboard/FindCoachSection.tsx` | Liste coachs + filtres | Ajout état `searchName`, champ Input (Solution A), `matchesName`, inclusion dans `filteredCoaches`, `clearFilters` vide `searchName`. |
| `messages/fr.json` | i18n FR | Ajout clés `findCoach.filters.nameSearchLabel`, `findCoach.filters.nameSearchPlaceholder` (ou regroupement sous `filters`). |
| `messages/en.json` | i18n EN | Idem. |
| `components/Input.tsx` | Champ formulaire | Utilisation telle quelle. |
| `lib/formStyles.ts` | Styles formulaire | Utilisation telle quelle. |

**Design system :** Tokens couleur (pas de hex en dur), `Input`, `FORM_BASE_CLASSES`. Pas de nouveau composant à documenter dans `DESIGN_SYSTEM.md` (réutilisation de l’Input existant).

**i18n :** Voir `docs/I18N.md` pour la checklist ; namespace `findCoach`.

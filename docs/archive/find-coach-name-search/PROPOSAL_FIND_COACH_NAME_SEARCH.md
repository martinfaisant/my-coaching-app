# Mode Designer — Filtre / recherche par nom et prénom (Trouver mon coach)

## 1. Besoin reformulé

Sur la page **« Trouver mon coach »**, l’athlète peut déjà filtrer par **sport coaché** et **langue parlée**. Il manque un moyen de **filtrer ou rechercher les coachs par nom et/ou prénom** (ex. taper « Martin » pour n’afficher que les coachs dont le nom ou le prénom contient « Martin »).

## 2. Cas couverts

| Cas | Description |
|-----|-------------|
| **Nominal** | L’utilisateur saisit du texte → la liste des coachs est filtrée sur `first_name` et `last_name` (recherche insensible à la casse, trim, type « contient »). |
| **Champ vide** | Champ vide = aucun filtre sur le nom (comportement actuel pour sport/langue). |
| **Aucun résultat** | Combinaison nom + sport + langue ne donne aucun coach → message existant « Aucun coach ne correspond à vos critères ». |
| **Réinitialiser** | Le bouton « Réinitialiser » vide aussi le champ recherche nom. |
| **Accessibilité** | Label ou placeholder explicite + `aria-label` pour le champ. |

## 3. Questions au PO (avant validation)

1. **Un seul champ ou deux ?**  
   - **Un champ unique** « Nom ou prénom » qui cherche dans les deux champs (recommandé : plus simple, une seule zone de saisie).  
   - Ou **deux champs** « Prénom » et « Nom » pour affiner séparément ?

2. **Temps réel ou validation explicite ?**  
   - **Temps réel** : la liste se met à jour à chaque frappe (comme les filtres sport/langue actuels).  
   - Ou **validation explicite** : bouton « Rechercher » ou touche Entrée pour appliquer (utile si la liste des coachs est très longue côté serveur).

3. **Correspondance** : la recherche « contient » (substring) suffit-elle, ou souhaitez-vous aussi « commence par » / correspondance exacte ?

---

## 4. Propositions UI (3 solutions)

Trois options de placement du champ de recherche, avec **un seul champ « Nom ou prénom »** et **filtre temps réel** (hypothèse par défaut). Les mockups HTML sont dans le même dossier : **`MOCKUP_FIND_COACH_NAME_SEARCH.html`**.

---

### Solution A — Recherche en tête du bloc Filtres (pleine largeur)

**Idée :** Le champ de recherche est **en première position** dans le bloc blanc « Filtres », en pleine largeur au-dessus de la grille Sport coaché / Langue parlée.

**Composants à utiliser tels quels :**
- **Input** (`components/Input.tsx`) avec `label` optionnel masqué pour accessibilité, `placeholder` visible, `type="search"`.
- **formStyles** : `FORM_BASE_CLASSES` pour cohérence.
- **Bloc Filtres** actuel (titre, Réinitialiser, grille) inchangé en structure.

**À faire évoluer :**
- Aucun composant à modifier ; uniquement ajout d’un champ dans `FindCoachSection` et extension de la logique de filtrage (`filteredCoaches` inclut le critère nom).

**Avantages :** Très lisible, hiérarchie claire « d’abord la recherche, puis les filtres ».  
**Inconvénient :** Prend une ligne dédiée.

---

### Solution B — Recherche sur la même ligne que le titre « Filtres » (desktop)

**Idée :** Sur **une seule ligne** : à gauche le titre « Filtres », au centre un champ de recherche (flex-1), à droite le lien « Réinitialiser ». Sur mobile, passage en **colonne** : titre, champ, réinitialiser.

**Composants à utiliser tels quels :**
- **Input** sans label visible (placeholder uniquement), `type="search"`.
- **formStyles** : `FORM_BASE_CLASSES`.

**À faire évoluer :**
- **Bloc Filtres** dans `FindCoachSection` : remplacer la ligne actuelle (titre + Réinitialiser) par un flex/grid qui intègre le champ au milieu ; prévoir breakpoint pour empiler sur petit écran.

**Avantages :** Compact, tout en un coup d’œil.  
**Inconvénient :** Ligne peut être chargée sur très petit écran ; le placeholder doit rester court.

---

### Solution C — Bandeau recherche au-dessus du bloc Filtres

**Idée :** Un **bandeau léger** (fond `stone-50`, bordure basse) **au-dessus** du bloc blanc « Filtres », contenant uniquement le champ de recherche (et optionnellement une icône loupe). Le bloc « Filtres » reste tel quel en dessous.

**Composants à utiliser tels quels :**
- **Input** avec placeholder, `type="search"`.
- **formStyles** : `FORM_BASE_CLASSES`.
- Icône : pas de composant IconSearch existant ; on peut utiliser un SVG inline loupe ou le type `search` du navigateur (style natif).

**À faire évoluer :**
- Aucun composant partagé ; ajout d’une section wrapper dans `FindCoachSection` (bandeau + bloc Filtres actuel).

**Avantages :** Séparation nette « recherche » vs « filtres », bonne hiérarchie.  
**Inconvénient :** Un bloc de plus dans la page.

---

## 5. Synthèse et recommandation

| Critère | Solution A | Solution B | Solution C |
|--------|------------|------------|------------|
| Simplicité d’implémentation | ✅ Très simple | ⚠️ Layout à adapter | ✅ Simple |
| Lisibilité / hiérarchie | ✅ Très claire | ✅ Compacte | ✅ Très claire |
| Cohérence avec l’existant | ✅ Même bloc Filtres | ✅ Même bloc | ✅ Bloc dédié |
| Mobile | ✅ Champ pleine largeur | ⚠️ Empiler proprement | ✅ Bandeau pleine largeur |

**Recommandation :** **Solution A** — recherche en tête du bloc Filtres, pleine largeur. Peu de changements (un champ + logique de filtre), alignée avec le design system et l’existant.

---

## 6. Choix PO (validé)

- **Champ :** Un seul champ « Nom ou prénom » qui cherche dans `first_name` et `last_name`.
- **Comportement :** Temps réel — la liste se met à jour à chaque frappe (comme sport/langue).
- **Correspondance :** « Contient » (substring), insensible à la casse, trim.
- **Solution UI :** Solution A — recherche en tête du bloc Filtres, pleine largeur (mockup : section « Solution A » dans `MOCKUP_FIND_COACH_NAME_SEARCH.html`).

---

## 7. Prochaines étapes

- Découpage en user stories : voir **`USER_STORIES_FIND_COACH_NAME_SEARCH.md`**.
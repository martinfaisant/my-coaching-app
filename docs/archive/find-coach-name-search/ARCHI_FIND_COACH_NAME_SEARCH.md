# Spec technique — Recherche par nom ou prénom (Trouver mon coach)

**Mode :** Architecte  
**Référence :** User stories `USER_STORIES_FIND_COACH_NAME_SEARCH.md`, mockup Solution A dans `MOCKUP_FIND_COACH_NAME_SEARCH.html`.

---

## 1. Contexte et périmètre

- **Page concernée :** Dashboard athlète sans coach → « Trouver mon coach » (`app/[locale]/dashboard/page.tsx` rend `FindCoachSection` avec la liste des coachs).
- **Données :** La liste des coachs est déjà chargée côté serveur (select `profiles` avec `first_name`, `last_name`, etc.) et passée en props à `FindCoachSection`. Aucun nouvel appel API ni requête BDD pour cette feature.
- **Comportement :** Filtrage **côté client** uniquement (état local + `useMemo`), comme pour les filtres sport et langue existants.

---

## 2. Architecture et flux

- **Entrée :** L’utilisateur saisit dans un champ « Nom ou prénom » (Solution A : en tête du bloc Filtres).
- **État :** Un état local `searchName` (string) dans `FindCoachSection`, mis à jour à chaque frappe.
- **Filtrage :** `filteredCoaches` = `coaches.filter(c => matchesName(c, searchName) && matchesSport(c, selectedSports) && matchesLanguage(c, selectedLanguages))`.
- **Réinitialiser :** `clearFilters` remet à zéro `searchName`, `selectedSports`, `selectedLanguages`.
- **Sortie :** Liste des tuiles coach et badge de nombre mis à jour en temps réel ; message « Aucun coach ne correspond à vos critères » si `filteredCoaches.length === 0` (existant).

Aucun flux serveur supplémentaire, aucun nouveau module API ou action.

---

## 3. Table des fichiers

| Fichier | Rôle | Action |
|---------|------|--------|
| `app/[locale]/dashboard/FindCoachSection.tsx` | Section Trouver mon coach (filtres + liste) | **Modifier** : état `searchName`, Input (Solution A), `matchesName()`, `filteredCoaches` inclut le critère nom, `clearFilters` vide `searchName`. |
| `messages/fr.json` | Traductions FR | **Modifier** : ajout sous `findCoach.filters` de `nameSearchLabel` et `nameSearchPlaceholder`. |
| `messages/en.json` | Traductions EN | **Modifier** : idem. |
| `components/Input.tsx` | Champ formulaire | **Utiliser tel quel.** |
| `lib/formStyles.ts` | Classes formulaire | **Utiliser tel quel.** |

**Aucun fichier à créer.** Aucune migration, aucun changement RLS, aucune modification de `page.tsx` (les champs `first_name` / `last_name` sont déjà sélectionnés).

---

## 4. Modèle de données

**Aucun changement BDD.**

- Les champs `first_name` et `last_name` existent déjà sur `profiles` et sont déjà renvoyés par la requête dashboard (voir `page.tsx` : `select('user_id, email, first_name, last_name, ...')`).
- Le type `CoachForList` dans `FindCoachSection.tsx` contient déjà `first_name: string | null` et `last_name: string | null`. Aucune évolution de type nécessaire.

---

## 5. RLS (Row Level Security)

**Aucun changement RLS.**

- La liste des coachs est lue via la politique existante (profils avec `role = 'coach'`, déjà exposée pour « trouver un coach »). Le filtrage par nom est purement côté client sur ces données déjà autorisées.

---

## 6. Logique métier

### 6.1 Fonction `matchesName(coach, query)`

- **Entrées :** `coach: CoachForList`, `query: string`.
- **Règles :**
  - Si `query` après trim est vide → retourner `true` (pas de filtre nom).
  - Sinon : normaliser `query` en `q = query.trim().toLowerCase()`.
  - Pour le coach : `first = (coach.first_name ?? '').trim().toLowerCase()`, `last = (coach.last_name ?? '').trim().toLowerCase()`.
  - Retourner `true` si `first.includes(q)` **ou** `last.includes(q)`.
- **Null-safety :** `first_name` / `last_name` null traités comme chaîne vide (aucun match sauf si query vide).

### 6.2 Combinaison des filtres

- `filteredCoaches = coaches.filter(c => matchesName(c, searchName) && matchesSport(c, selectedSports) && matchesLanguage(c, selectedLanguages))`.
- Ordre des critères dans le filtre sans importance (ET logique). L’ordre d’affichage des tuiles reste celui de la liste serveur (ex. `order('email')`), pas de tri côté client à prévoir pour cette feature.

### 6.3 Réinitialisation

- `clearFilters` : `setSearchName('')`, `setSelectedSports([])`, `setSelectedLanguages([])`.

### 6.4 UI (alignée Solution A)

- Dans le bloc blanc « Filtres », **en première position** (au-dessus de la grille Sport coaché / Langue parlée) : un seul champ de recherche.
- Composant : `Input` avec `type="search"`, `label` (visible ou `sr-only` au choix implémentation), `placeholder` et `aria-label` pour l’accessibilité.
- Styles : `FORM_BASE_CLASSES` / design system (pas de hex en dur). Pleine largeur dans le bloc.

---

## 7. i18n

- **Namespace :** `findCoach`.
- **Clés à ajouter (sous `findCoach.filters`) :**
  - `nameSearchLabel` — label du champ (ex. « Rechercher par nom ou prénom »).
  - `nameSearchPlaceholder` — placeholder (ex. « Ex. Martin, Dupont… »).
- **Fichiers :** `messages/fr.json` et `messages/en.json` (même structure pour les deux langues).

Référence : `docs/I18N.md` (checklist nouvelles features).

---

## 8. Cas limites et points d’attention

| Cas | Comportement |
|-----|--------------|
| `first_name` ou `last_name` null | Traité comme chaîne vide ; le coach matche uniquement si la query est vide (pas de filtre nom). |
| Query uniquement espaces | Trim → query vide → pas de filtre nom (tous les coachs passent le critère nom). |
| Casse / accents | Insensible à la casse (`.toLowerCase()`). Pas de normalisation Unicode explicite (NFC/NFD) prévue ; à trancher en implémentation si besoin (ex. "e" vs "é"). |
| Performance | Filtrage en mémoire (useMemo) ; liste coachs typiquement petite. Si la liste dépassait plusieurs centaines d’entrées, envisager debounce ou pagination côté serveur (hors périmètre actuel). |

**Points à trancher en implémentation (optionnel) :**

- Label du champ : visible au-dessus du champ ou masqué (`sr-only`) avec seul placeholder visible ; les deux sont acceptables tant que `aria-label` ou association label + input est correcte.

---

## 9. Tests manuels recommandés

1. **Affichage :** En tant qu’athlète sans coach, ouvrir « Trouver mon coach » → le champ « Nom ou prénom » est en tête du bloc Filtres, pleine largeur ; placeholder et label (ou aria-label) présents.
2. **Temps réel :** Saisir quelques caractères → la liste et le badge nombre se mettent à jour sans clic.
3. **Contient + casse :** Saisir une partie d’un prénom ou d’un nom (minuscules/majuscules) → les bons coachs restent affichés.
4. **Champ vide :** Vider le champ → tous les coachs (sous filtres sport/langue éventuels) réapparaissent.
5. **Combinaison :** Activer un sport + une langue + un nom → seuls les coachs qui satisfont les trois critères sont affichés ; le badge reflète le bon nombre.
6. **Réinitialiser :** Remplir nom et/ou sport/langue → clic « Réinitialiser » → champ nom vidé, sport et langue décochés, liste complète.
7. **Aucun résultat :** Filtres tels qu’aucun coach ne matche → message « Aucun coach ne correspond à vos critères… ».
8. **i18n :** Vérifier FR et EN (label + placeholder) selon la locale.

---

## 10. Checklist avant livraison (Architecte)

- [x] Aucun changement BDD (modèle et migrations).
- [x] RLS inchangées (filtrage client sur données déjà autorisées).
- [x] Table des fichiers : créée/modifiée listée.
- [x] Logique métier et cas limites décrits.
- [x] Tests manuels recommandés indiqués.
- [x] i18n et namespace précisés.

La spec est prête pour le **mode Développeur** (implémentation dans `FindCoachSection.tsx` + messages).

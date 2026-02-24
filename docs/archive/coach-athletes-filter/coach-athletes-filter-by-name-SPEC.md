# Spec technique – Filtre par nom (Mes athlètes, coach)

**Mode :** Architecte  
**Référence :** User stories dans `docs/design/coach-athletes-filter-by-name.md` (solution A validée).

---

## 1. Vue d’ensemble

- **Fonctionnalité :** Sur la page dashboard (vue coach), la section « Mes athlètes » affiche un champ de recherche inline à côté du titre. La liste des athlètes est filtrée en temps réel par nom affiché (displayName) ; aucun résultat → message dédié. Pas de persistance du filtre (réinitialisation à la sortie de la page).
- **Modèle de données :** Aucun changement BDD. Pas de nouvelles tables, pas de migration, pas de RLS.
- **Sécurité :** Aucun impact. Les données sont déjà filtrées côté serveur par RLS (coach ne voit que ses athlètes). Le filtre est purement côté client sur la liste déjà chargée.

---

## 2. Architecture et flux

- **Page dashboard** (`app/[locale]/dashboard/page.tsx`) : reste un **Server Component**. Elle construit la liste des athlètes (comme aujourd’hui), puis passe cette liste à un **Client Component** qui gère l’état du filtre et le rendu (champ de recherche + liste filtrée ou message « aucun résultat »).
- **Nouveau Client Component** : reçoit la liste complète (chaque élément contient au minimum `displayName` et toutes les props nécessaires pour `CoachAthleteTileWithModal`). Il garde en state la valeur du champ de recherche, calcule la liste filtrée (côté client, `useMemo`), et affiche soit la grille de tuiles soit le bloc « aucun résultat ».
- **Données :** Pas de nouvel appel API. Filtrage sur la liste déjà chargée (displayName = prénom + nom ou email, via `getDisplayName` déjà utilisé côté serveur).

---

## 3. Table des fichiers

| Fichier | Rôle | Créer / Modifier |
|---------|------|-------------------|
| `app/[locale]/dashboard/CoachAthletesListWithFilter.tsx` | Client Component : state filtre, input search, liste filtrée, message « aucun résultat », rendu des tuiles | **Créer** |
| `app/[locale]/dashboard/page.tsx` | Construire la liste « athlete tiles » (même logique qu’aujourd’hui), rendre `CoachAthletesListWithFilter` à la place du bloc coach actuel (titre + grille) ; conserver l’état vide (0 athlète) et la section demandes en attente | **Modifier** |
| `messages/fr.json` | Clés i18n `athletes.nameFilterPlaceholder`, `athletes.noMatchForSearch` | **Modifier** |
| `messages/en.json` | Idem (EN) | **Modifier** |

Aucun autre fichier à créer ou modifier (pas de changement dans `CoachAthleteTileWithModal`, `AthleteTile`, `Input`, ni design system).

---

## 4. Modèle de données / BDD

**Aucun changement.** Pas de migration, pas de RLS. Les profils athlètes sont déjà récupérés et filtrés par le serveur (RLS existantes).

---

## 5. Détail des modifications

### 5.1 Nouveau composant `CoachAthletesListWithFilter.tsx`

- **'use client'**, donc Client Component.
- **Props :**
  - `athletes` : tableau d’objets, chaque élément contient au minimum `displayName` (string) et toutes les props attendues par `CoachAthleteTileWithModal` (athlete, subscription, subscriptionTitle, locale, currentUserId, athleteHref, practicedSports, nextGoal, plannedUntil, isUpToDate, labels, viewPlanningLabel). Type recommandé : définir un type `CoachAthleteTileItem` (ou réutiliser une forme dérivée des props de `CoachAthleteTileWithModal`) pour garder un typage strict.
  - `showDivider?: boolean` : si `true`, afficher le séparateur (border-t) au-dessus du bloc « Mes athlètes » + recherche (cas où il y a des demandes en attente au-dessus).
- **State :** `searchQuery` (string), initialisée à `''`.
- **Logique filtre :**  
  - `filteredAthletes = useMemo(() => athletes.filter(a => displayNameMatches(a.displayName, searchQuery)), [athletes, searchQuery])`.  
  - **`displayNameMatches(displayName, query)`** — **normalisation accents obligatoire** : « e » et « é » (et autres variantes accentuées) sont considérés comme identiques. Implémentation : normaliser les deux chaînes en NFD puis supprimer les caractères de combinaison (diacritiques), puis `toLowerCase()`, puis trim sur la requête ; si requête vide retourner `true` ; sinon `normalizedDisplayName.includes(normalizedQuery)`.
- **Rendu (aligné mockup Solution A) :**
  1. Si `showDivider` → `<div className="border-t border-stone-200 my-8" />`.
  2. Bloc titre + champ : conteneur `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4`, contenant un titre de section avec **effectif** : `t('myAthletesWithCount', { count: athletes.length })` (ex. « Mes athlètes (3) ») et un `<Input type="search" placeholder={t('nameFilterPlaceholder')} value={searchQuery} onChange=... aria-label=... />` (largeur `w-full sm:w-64` sur le conteneur du champ).
  3. Si `filteredAthletes.length === 0` → bloc « aucun résultat » : `rounded-xl border border-stone-200 bg-stone-50 p-6` avec texte `t('noMatchForSearch')` (style `text-stone-600`).
  4. Sinon → grille existante `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6` avec `filteredAthletes.map(...)` rendant `CoachAthleteTileWithModal` pour chaque élément.
- **i18n :** `useTranslations('athletes')` pour `myAthletesWithCount` (titre section avec count), `nameFilterPlaceholder`, `noMatchForSearch`. Les labels des tuiles sont passés en props par la page (serveur).
- **Composants utilisés :** `Input` (design system), `CoachAthleteTileWithModal` (existant). Tokens Tailwind du design system (pas de couleurs en dur).

### 5.2 Modifications de `page.tsx` (dashboard)

- **Titre de la page (header h1) :** Pour le rôle coach, **ne plus afficher le nombre d’athlètes** dans le titre principal. Utiliser un libellé générique sans count, ex. `t('dashboard')` (« Tableau de bord » / « Dashboard »), au lieu de `t('pageTitle', { count: athleteCount })`.
- **Section « Demandes en attente » :** Afficher le **nombre** à côté du titre de section : ex. « Demandes en attente (2) ». Utiliser une clé i18n avec paramètre `count` (ex. `pendingRequests.titleWithCount`) pour le titre de la section.
- **Données :** Pour chaque `p` dans `visibleProfiles` (quand `current.profile.role === 'coach'` et `visibleProfiles.length > 0`), construire un objet « tile » avec : `displayName`, `avatarUrl`, `athleteHref`, `practicedSports`, `nextGoal`, `plannedUntil`, `isUpToDate`, `subscription`, `subscriptionTitle`, `locale`, `currentUserId`, `labels`, `viewPlanningLabel` (comme aujourd’hui pour `CoachAthleteTileWithModal`), plus `displayName` explicite pour le filtre.
- **Rendu :** Remplacer le fragment actuel (optionnel divider + h2 + grille) par :  
  `<CoachAthletesListWithFilter athletes={athleteTiles} showDivider={pendingRequests.length > 0} />`.  
  Conserver : état « 0 athlète » (encadré « noAthletes ») inchangé. Le titre de section « Mes athlètes » avec le count est géré dans `CoachAthletesListWithFilter` (ex. « Mes athlètes (3) »).

### 5.3 i18n

- **Namespace :** `athletes`.
- **Clés à ajouter (FR) :**
  - `nameFilterPlaceholder` : « Rechercher un athlète »
  - `noMatchForSearch` : « Aucun athlète ne correspond à votre recherche »
  - `myAthletesWithCount` : « Mes athlètes ({count}) » (titre de section avec effectif)
  - Sous `pendingRequests` : `titleWithCount` : « Demandes en attente ({count}) »
- **Clés à ajouter (EN) :**
  - `nameFilterPlaceholder` : « Search for an athlete »
  - `noMatchForSearch` : « No athlete matches your search »
  - `myAthletesWithCount` : « My Athletes ({count}) »
  - Sous `pendingRequests` : `titleWithCount` : « Pending requests ({count}) »

Pour le titre de page coach (sans count), réutiliser la clé existante `athletes.dashboard` (« Tableau de bord ») ou équivalent. Référence : `docs/I18N.md`.

---

## 6. RLS et sécurité

- Aucune modification RLS. La liste des athlètes est déjà restreinte côté serveur (requête Supabase avec les politiques existantes). Le filtre par nom ne fait que masquer/afficher des lignes déjà autorisées.

---

## 7. Cas limites et comportements

- **Champ vide :** Afficher tous les athlètes (pas de filtre).
- **Espaces uniquement :** Traiter comme vide (trim).
- **Casse :** Comparaison insensible à la casse.
- **Accents :** « e » et « é » (et autres lettres accentuées) sont considérés comme identiques. Normalisation NFD + suppression des diacritiques sur la requête et sur le displayName avant comparaison.
- **0 athlète (liste vide) :** Le composant `CoachAthletesListWithFilter` n’est pas rendu ; la page affiche l’état actuel « noAthletes » (aucun champ de recherche).
- **Réinitialisation :** Pas de persistance (pas de query param, pas de sessionStorage). À la sortie de la page, le state est perdu ; au retour, le champ est vide et toute la liste s’affiche.

---

## 8. Tests manuels recommandés

1. **Coach, plusieurs athlètes :** Ouvrir le dashboard, vérifier que le titre « Mes athlètes » et le champ de recherche sont sur une ligne (desktop) ou empilés (mobile). Taper un prénom ou un nom partiel → la liste se restreint. Vider le champ → toute la liste revient.
2. **Coach, un seul athlète :** Taper un texte qui ne matche pas → affichage du message « Aucun athlète ne correspond à votre recherche ». Retaper un texte qui matche ou vider → la grille réapparaît.
3. **Coach, 0 athlète :** L’encadré « Vos demandes de coaching… » s’affiche, pas de champ de recherche.
4. **Demandes en attente + athlètes :** Vérifier que le séparateur apparaît au-dessus du bloc « Mes athlètes » + recherche ; le titre « Demandes en attente (X) » affiche le bon nombre.
5. **Titre de page (coach) :** Le h1 affiche « Tableau de bord » (ou équivalent) sans nombre ; le nombre d’athlètes apparaît uniquement à côté du titre de section « Mes athlètes (X) ».
6. **Filtre avec accents :** Taper « e » doit matcher un athlète dont le nom contient « é » (et inversement).
7. **Locale FR/EN :** Vérifier placeholder, message « aucun résultat », titres avec count dans les deux langues.
8. **Accessibilité :** Le champ de recherche a un `aria-label` (ou label associé) pour les lecteurs d’écran.

---

## 9. Points à trancher en implémentation

- Aucun point ouvert : accents (e = é) et titre avec count en permanence sont validés par le PO.

---

## 10. Checklist livraison Architecte

- [x] Migrations / BDD : aucun changement.
- [x] RLS : aucune modification ; rappel que les données sont déjà protégées.
- [x] Table des fichiers : créations et modifications listées.
- [x] Cas limites et réinitialisation du filtre décrits.
- [x] Tests manuels recommandés indiqués.
- [x] Points à trancher en implémentation (accents, affichage du titre) signalés.

---

**Prochaine étape :** Mode Développeur pour l’implémentation (respect du design system, i18n, mockup Solution A, pas de `console.log`, usage de `DashboardPageShell` si pertinent ; la page dashboard utilise actuellement un `<main>` dédié, à conserver tel quel sauf directive PO).

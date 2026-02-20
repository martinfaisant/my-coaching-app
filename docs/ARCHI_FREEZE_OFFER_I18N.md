# Note d’architecture : freeze offre en FR et EN (demande + souscription)

**Mode :** Architecte  
**Date :** 19 février 2026  
**Constat :** Lors du freeze d’une offre au moment de la demande (et à l’acceptation dans les souscriptions), seules **une** langue est figée (celle de la locale de l’athlète au moment de la demande). Les titres et descriptions en français et anglais ne sont **pas** tous deux sauvegardés.

---

## 1. État actuel

### 1.1 Modèle

- **coach_offers** : `title_fr`, `title_en`, `description_fr`, `description_en` (i18n complet).
- **coach_requests** : `frozen_title`, `frozen_description` (un seul texte chacun).
- **subscriptions** : `frozen_title`, `frozen_description` (un seul texte chacun).

### 1.2 Remplissage

- **createCoachRequest** (dashboard/actions.ts) :  
  Selon la `locale` de la requête, on copie soit la version EN soit la version FR de l’offre dans `frozen_title` et `frozen_description`.  
  → Une seule langue est figée.

- **respondToCoachRequest** :  
  Copie `frozen_title` et `frozen_description` de `coach_requests` vers `subscriptions`.  
  → Même contenu mono-langue.

### 1.3 Conséquences

- Si l’athlète (ou le coach) change de langue après la demande, l’affichage de la souscription (Mon Coach, historique, page Souscriptions coach) reste dans la langue figée au moment de la demande.
- Pas de cohérence avec une règle du type « toujours afficher le titre/description de la souscription dans la langue d’affichage courante ».

---

## 2. Objectif

Figer le **titre et la description dans les deux langues** au moment de la demande, puis les conserver dans les souscriptions, afin d’afficher toujours le texte dans la langue de l’utilisateur (FR/EN) sans dépendre de la locale au moment de la création.

---

## 3. Évolution proposée

### 3.1 Modèle de données

#### 3.1.1 Table `coach_requests`

- **Ajouter** (sans supprimer les colonnes existantes pour la rétrocompatibilité et le backfill) :
  - `frozen_title_fr TEXT`
  - `frozen_title_en TEXT`
  - `frozen_description_fr TEXT`
  - `frozen_description_en TEXT`
- **Conserver** `frozen_title` et `frozen_description` pour l’instant (backfill et fallback).
- **Rôle** : snapshot du titre et de la description de l’offre en FR et EN au moment de la demande.

#### 3.1.2 Table `subscriptions`

- **Ajouter** les mêmes colonnes :
  - `frozen_title_fr TEXT`
  - `frozen_title_en TEXT`
  - `frozen_description_fr TEXT`
  - `frozen_description_en TEXT`
- **Conserver** `frozen_title` et `frozen_description` pour le même usage backfill/fallback.
- **Rôle** : même contenu figé que dans `coach_requests`, copié à l’acceptation.

### 3.2 Règles de remplissage

- **createCoachRequest** (quand une offre est choisie) :  
  Copier depuis l’offre :
  - `frozen_title_fr` = `offer.title_fr` (trim, null si vide)
  - `frozen_title_en` = `offer.title_en` (idem)
  - `frozen_description_fr` = `offer.description_fr` (idem)
  - `frozen_description_en` = `offer.description_en` (idem)  
  Et pour rétrocompatibilité / backfill : garder le remplissage actuel de `frozen_title` et `frozen_description` selon la locale (comportement inchangé pour les anciennes lignes qui n’auront que ces colonnes).

- **respondToCoachRequest** (à l’acceptation) :  
  Copier depuis `coach_requests` vers `subscriptions` :
  - `frozen_title_fr`, `frozen_title_en`, `frozen_description_fr`, `frozen_description_en`  
  ainsi que les champs existants (`frozen_title`, `frozen_description`, etc.).

### 3.3 Affichage côté application

- Partout où l’on affiche le titre ou la description figés d’une demande ou d’une souscription :
  - Utiliser la **locale courante** pour choisir :
    - `frozen_title_fr` ou `frozen_title_en` → titre affiché
    - `frozen_description_fr` ou `frozen_description_en` → description affichée
  - **Fallback** si la colonne pour la locale est vide : utiliser l’autre langue, puis éventuellement `frozen_title` / `frozen_description` pour les données existantes avant migration.

### 3.4 Migration SQL

- **Une migration** (ex. `042_coach_requests_subscriptions_frozen_i18n.sql`) :
  1. Ajouter les 4 colonnes sur `coach_requests` avec commentaires.
  2. Ajouter les 4 colonnes sur `subscriptions` avec commentaires.
  3. Backfill optionnel sur les lignes existantes :
     - `coach_requests` :  
       `frozen_title_fr = frozen_title`, `frozen_title_en = frozen_title` (idem pour description) lorsque `frozen_title` / `frozen_description` sont non null, pour que l’affichage actuel reste valide dans les deux langues jusqu’à ce que de nouvelles données aient les vrais FR/EN.
     - `subscriptions` : même règle de backfill à partir de `frozen_title` / `frozen_description`.

### 3.5 Types TypeScript

- Mettre à jour les types (ou interfaces) des lignes `coach_requests` et `subscriptions` pour inclure :
  - `frozen_title_fr`, `frozen_title_en`, `frozen_description_fr`, `frozen_description_en` (nullable string).
- Prévoir un helper ou une petite utilitaire (ex. `getFrozenTitleForLocale(row, locale)`) pour centraliser la logique titre/description + fallback.

---

## 4. Synthèse pour le Développeur

| Élément | Action |
|--------|--------|
| **Migration** | 042 : ajout des 4 colonnes sur `coach_requests` et `subscriptions` + backfill depuis `frozen_title` / `frozen_description`. |
| **createCoachRequest** | Remplir `frozen_title_fr/en`, `frozen_description_fr/en` depuis l’offre (conserver aussi le remplissage actuel de `frozen_title` / `frozen_description`). |
| **respondToCoachRequest** | Copier les 4 champs de `coach_requests` vers `subscriptions`. |
| **Affichage** | Partout où on lit `frozen_title` / `frozen_description` (Mon Coach, historique, page Souscriptions, etc.) : utiliser la locale pour choisir `_fr` / `_en` avec fallback sur l’autre langue puis sur `frozen_title` / `frozen_description`. |
| **Types** | Ajouter les 4 champs aux types DB/application et, si utile, un helper `getFrozenTitleForLocale` / `getFrozenDescriptionForLocale`. |

---

**Document de référence pour la phase Développeur (implémentation du freeze i18n).**

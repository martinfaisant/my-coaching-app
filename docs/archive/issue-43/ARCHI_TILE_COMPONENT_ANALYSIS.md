# Analyse architecte : composant générique pour les tuiles « style liste »

**État :** Implémenté (21 février 2026). TileCard étendu avec `leftBorderColor="stone"` et `badge` ; utilisé dans OffersForm, CoachSubscriptionsContent, subscriptions/history. Référence : **docs/DESIGN_SYSTEM.md** § TileCard.

**Mode :** Architecte  
**Date :** 21 février 2026  
**Contexte :** Issue #43 (tuile offre archivée) + question PO sur l'existence / pertinence d'un composant générique pour ces tuiles.

---

## 1. Réponse courte

**Oui**, il existe déjà un composant générique pour une partie de ces tuiles : **`TileCard`** (`components/TileCard.tsx`).  
**Mais** il ne couvre **pas** le style « archivé / terminé » (bordure gauche grise `border-l-stone-400` + badge optionnel). Ce style est aujourd'hui **dupliqué** en dur dans plusieurs écrans.  
**Oui**, il est **pertinent** d'étendre ce composant (ou d'en unifier l'usage) pour couvrir aussi le cas « archivé » et réduire la duplication.

---

## 2. État des lieux

### 2.1 Composant existant : TileCard

- **Fichier :** `components/TileCard.tsx`
- **Style de base :** `rounded-lg border border-l-4 border-stone-200 bg-white p-3 shadow-sm`
- **API actuelle :**
  - `leftBorderColor` : `'amber' | 'sage' | 'forest' | 'strava' | 'gold' | 'olive'` → **uniquement des couleurs « vives »**, pas de neutre (stone/gris).
  - `children`, `className`, `interactive`, `as` ('div' | 'button'), `onClick`, `type`.

**Utilisé aujourd'hui dans :**
- `ObjectifsTable.tsx` (objectifs avec bordure amber / sage)
- `CoachAthleteCalendarPage.tsx` (tuiles calendrier)

**Documentation :** `docs/DESIGN_SYSTEM.md` (section TileCard).

### 2.2 Tuiles « archivées / terminées » (non couvertes par TileCard)

Même pattern visuel répété à la main :
- **Bordure gauche grise :** `border-l-stone-400`
- **Conteneur :** `rounded-lg border border-l-4 border-stone-200 bg-white p-3 shadow-sm`
- **Structure :** contenu à gauche + **badge à droite** (ex. « Terminée », « Archivée »)

**Lieux concernés :**

| Fichier | Contexte | Badge |
|--------|----------|--------|
| `CoachSubscriptionsContent.tsx` | Section « Historique » (souscriptions terminées, coach) | « Terminée » |
| `app/.../subscriptions/history/page.tsx` | Page Historique souscriptions (athlète) | « Terminée » |
| `OffersForm.tsx` (après issue #43) | Section « Offres archivées » (coach) | « Archivée » |

Soit **3 endroits** avec le même bloc de classes et une structure très proche (contenu + badge), sans composant partagé.

### 2.3 Autres tuiles à bordure gauche (hors TileCard)

- **CoachSubscriptionsContent** : souscriptions actives (`border-l-palette-forest-dark`), résiliation programmée (`border-l-palette-amber`) — tuiles **cliquables**, `p-4`, pas de badge. Structure différente (boutons à droite).
- **ActivityTile** : tuiles d'activité (modale « Activités du jour ») — composant dédié avec contenu métier.
- **CalendarView / dashboard** : tuiles calendrier ou blocs dashboard — contextes différents (grille, densité).

Ces cas sont soit déjà couverts par TileCard (objectifs, calendrier coach/athlète), soit ont une structure ou un rôle trop spécifique pour être fusionnés dans un seul composant « liste ».

---

## 3. Faut-il créer ou étendre un composant ?

### 3.1 Option A : Étendre TileCard (recommandé)

- Ajouter une valeur **`stone`** (ou **`neutral`**) à `leftBorderColor` → `border-l-stone-400`.
- Ajouter une prop optionnelle **`badge?: React.ReactNode`** : si fournie, le rendu utilise une structure type `flex justify-between` avec `children` à gauche et le badge à droite (même style que le badge actuel : `inline-flex ... rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200`).
- Les 3 écrans (historique coach, historique athlète, offres archivées) utilisent alors `<TileCard leftBorderColor="stone" badge={…}>…</TileCard>` au lieu de répéter les classes.

**Avantages :** un seul composant « tuile liste » dans le design system ; cohérence visuelle et maintenance centralisée.  
**Inconvénient mineur :** TileCard prend une prop de plus et un variant de couleur de plus.

### 3.2 Option B : Nouveau composant dédié (ex. ArchivedTile)

- Créer un composant qui encapsule uniquement le style « bordure stone + badge » et la structure (contenu + badge).
- Les 3 écrans l'utilisent ; TileCard reste inchangé.

**Avantages :** responsabilité très claire « tuile archivée / terminée ».  
**Inconvénients :** deux composants pour un même pattern de base (bordure gauche + boîte), risque de divergence de détail (padding, ombre, radius) si on ne fait pas attention.

### 3.3 Recommandation

**Recommandation : Option A (étendre TileCard).**

- Le pattern est le **même** (tuile avec bordure gauche 4px, fond blanc, ombre) ; seule la **couleur** (stone vs couleurs existantes) et la **présence d'un badge** changent.
- Une seule source de vérité pour les classes de base et la structure « contenu + badge » évite les dérives (comme l'ancienne tuile offre archivée en `rounded-xl` / `bg-stone-50`).
- Le design system mentionne déjà TileCard pour les tuiles à bordure ; documenter « stone = état archivé / terminé » et l'usage de `badge` reste simple.

**Périmètre suggéré pour l'extension :**
1. `TileCard` : ajout de `leftBorderColor: 'stone'` (→ `border-l-stone-400`) et `badge?: React.ReactNode`.
2. Si `badge` est fourni : wrapper interne en `flex items-start justify-between gap-2`, `children` dans un `div` (ex. `min-w-0 flex-1`), badge dans un `span` avec les classes du badge actuel (éventuellement en constante partagée ou en prop optionnelle `badgeClassName` pour rester flexible).
3. Mise à jour de la doc : `docs/DESIGN_SYSTEM.md` (TileCard) + `docs/ISSUE_43_ARCHIVED_OFFER_TILE_SPEC.md` pour préciser que l'implémentation peut s'appuyer sur TileCard.

**Refactorisation conseillée (dans un second temps ou dans le même lot) :**
- Remplacer les blocs « tuile historique / archivée » dans `CoachSubscriptionsContent.tsx`, `subscriptions/history/page.tsx` et `OffersForm.tsx` par `<TileCard leftBorderColor="stone" badge={…}>…</TileCard>`.

---

## 4. Synthèse

| Question | Réponse |
|----------|--------|
| Existe-t-il un composant générique pour ces tuiles ? | **Oui** : TileCard, mais il ne couvre pas le style « archivé » (bordure stone + badge). |
| Est-il pertinent d'en créer un ? | Pas besoin d'en **créer** un nouveau : il est **pertinent d'étendre** TileCard avec `leftBorderColor="stone"` et `badge?: React.ReactNode`, puis de l'utiliser pour les 3 listes (historique coach, historique athlète, offres archivées). |

Cette extension peut être spécifiée dans une petite spec (ou intégrée à l'issue #43) et implémentée soit dans le cadre de l'issue #43, soit dans une issue dédiée « Refactor: utiliser TileCard pour les tuiles archivées ».

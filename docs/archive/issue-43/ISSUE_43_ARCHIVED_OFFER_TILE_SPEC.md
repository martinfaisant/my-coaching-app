# Issue #43 – Alignement UI tuile offre archivée / souscription archivée

**État :** Implémenté (21 février 2026). Comportement décrit dans **docs/DESIGN_SYSTEM.md** (TileCard, variante `stone` + prop `badge`).

**Mode :** Architecte  
**Source :** [GitHub Issue #43](https://github.com/martinfaisant/my-coaching-app/issues/43)  
**Date :** 21 février 2026

---

## 1. Synthèse du besoin (issue #43)

- **Titre :** UI de la tuile offre archivée  
- **Demande :** *« Je veux que le design d'une tuile archivée [offre] soit le même que le design d'une tuile pour une souscription qui a été archivée. »*

Objectif : **cohérence visuelle** entre la liste des offres archivées (côté coach, page Offres) et la liste des souscriptions terminées / archivées (côté coach, section Historique des souscriptions).

---

## 2. État des lieux

### 2.1 Tuile « offre archivée » (actuelle)

**Fichier :** `app/[locale]/dashboard/profile/offers/OffersForm.tsx` (lignes 682–706)

- **Conteneur :**  
  `bg-stone-50 rounded-xl border border-stone-200 p-4 flex flex-wrap items-center justify-between gap-2`
- **Contenu :**
  - Bloc gauche : titre (font-medium text-stone-800), prix (text-sm text-stone-500)
  - À droite : date d'archivage (text-xs text-stone-400)
- **Pas de** bordure gauche accentuée, pas de badge « Archivée », pas de shadow.

### 2.2 Tuile « souscription terminée / archivée » (référence)

**Fichier :** `app/[locale]/dashboard/subscriptions/CoachSubscriptionsContent.tsx` (lignes 167–204)

- **Conteneur :**  
  `rounded-lg border border-l-4 border-stone-200 border-l-stone-400 bg-white p-3 shadow-sm`
- **Structure :**  
  `flex items-start justify-between gap-2` avec contenu à gauche et badge à droite.
- **Contenu gauche :**
  - Ligne 1 : nom athlète + « · Athlete » (font-semibold text-stone-900, text-sm)
  - Titre offre : h3 `text-sm font-semibold text-stone-800 mt-1`
  - Description optionnelle : `text-xs text-stone-600 mt-1 line-clamp-2`
  - Ligne période : `text-xs text-stone-500 mt-1.5` (prix · dates début–fin)
- **Badge à droite :**  
  `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200`  
  Texte : `tHistory('terminatedBadge')` → « Terminée » / « Ended ».

---

## 3. Spécification technique

### 3.1 Principe

Réutiliser **le même pattern visuel** que la tuile souscription terminée pour la tuile offre archivée : même conteneur (bordure gauche grise, fond blanc, ombre), même structure (contenu + badge à droite), sans introduire de nouveau composant global (spécifique à ces deux listes « archivées »).

### 3.2 Modifications à apporter

**Fichier unique à modifier :** `app/[locale]/dashboard/profile/offers/OffersForm.tsx`

1. **Conteneur de la tuile (`<li>`)**
   - Remplacer les classes actuelles par celles de la tuile historique souscriptions :
     - `rounded-lg border border-l-4 border-stone-200 border-l-stone-400 bg-white p-3 shadow-sm`
   - Structure interne : `flex items-start justify-between gap-2` (au lieu de `flex flex-wrap items-center justify-between gap-2`).

2. **Structure du contenu**
   - **Bloc gauche (`min-w-0 flex-1`) :**
     - Titre de l'offre en **h3** : `text-sm font-semibold text-stone-800` (sans mt si premier élément ; cohérent avec la tuile souscription).
     - Prix : `text-xs text-stone-500 mt-1` (ou mt-0.5 selon hiérarchie souhaitée).
     - Date d'archivage : `text-xs text-stone-500 mt-1.5` (même style que la ligne « période » côté souscriptions).
   - **Bloc droit (badge) :**
     - Badge « Archivée » avec les **mêmes classes** que le badge « Terminée » :  
       `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 shrink-0`
     - Texte : utiliser la clé i18n existante du namespace `coachOffers` pour le statut archivé (ex. `t('status.archived')` → « Archivée » / « Archived »). Les clés sont déjà présentes dans `messages/fr.json` et `messages/en.json` sous `coachOffers.status.archived`.

### 3.3 i18n

- **Aucune nouvelle clé** : réutiliser `coachOffers.status.archived` pour le libellé du badge.
- Namespace déjà utilisé dans `OffersForm` : `useTranslations('coachOffers')` → `t('status.archived')`.

### 3.4 Comportement et accessibilité

- La tuile reste **non cliquable** (pas d'action au clic sur une offre archivée), comme la tuile souscription terminée.
- Conserver l'ordre des offres archivées (tri par `archived_at` décroissant) et le `key={archived.id}`.
- Pas de changement de structure HTML sémantique (section, heading, listes) : uniquement le style et la disposition de la tuile.

### 3.5 Récapitulatif des classes (référence)

| Élément        | Classes (alignées sur tuile souscription terminée) |
|----------------|-----------------------------------------------------|
| `<li>`         | `rounded-lg border border-l-4 border-stone-200 border-l-stone-400 bg-white p-3 shadow-sm` |
| Wrapper interne | `flex items-start justify-between gap-2`          |
| Bloc gauche    | `min-w-0 flex-1`                                   |
| Titre          | `text-sm font-semibold text-stone-800`             |
| Prix           | `text-xs text-stone-500 mt-1`                       |
| Date archivage | `text-xs text-stone-500 mt-1.5`                     |
| Badge          | `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200 shrink-0` |

---

## 4. Périmètre et non‑changement

- **Un seul fichier** : `OffersForm.tsx` (section « Offres archivées »).
- **Aucune** modification du modèle de données, des RLS, des actions ou des routes.
- **Aucune** modification de `CoachSubscriptionsContent.tsx` (la tuile souscription reste la référence visuelle, pas à toucher pour cette issue).
- **Aucun** nouveau composant partagé imposé : le design est recopié localement pour garder l'issue à portée limitée ; si plus tard on souhaite factoriser une « tuile archivée » commune, ce pourra faire l'objet d'une refactorisation séparée.

---

## 5. Critères d'acceptation (pour le Développeur)

- [x] Dans la section « Offres archivées » de la page Offres (coach), chaque tuile a le même rendu que une tuile de la section « Historique » des souscriptions : bordure gauche grise (`border-l-stone-400`), fond blanc, ombre, badge « Archivée » à droite.
- [x] Le libellé du badge provient de l'i18n (`coachOffers.status.archived`).
- [x] Titre, prix et date d'archivage restent affichés et lisibles ; la hiérarchie typographique (titres / secondaire) est alignée sur la tuile souscription terminée.
- [x] Implémentation via TileCard (`leftBorderColor="stone"`, `badge`) dans les 3 écrans (OffersForm, CoachSubscriptionsContent, subscriptions/history).

---

## 6. Questions / points pour le PO

- **Aucune question bloquante** pour implémenter l'alignement visuel décrit ci‑dessus.
- Optionnel : souhaitez-vous qu'à terme on extraie un petit composant réutilisable (ex. `ArchivedTile`) pour les deux listes (offres archivées + souscriptions terminées) afin d'éviter la duplication des classes ? Ce n'est pas prévu dans le périmètre de l'issue #43. → **Réalisé** : extension TileCard (stone + badge) utilisée dans les 3 écrans.

---

**Document produit en mode Architecte.** Implémentation réalisée par le Développeur (TileCard étendu + 3 écrans unifiés). Référence courante : docs/DESIGN_SYSTEM.md § TileCard.

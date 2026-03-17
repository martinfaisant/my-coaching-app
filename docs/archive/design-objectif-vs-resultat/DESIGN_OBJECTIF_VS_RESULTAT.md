# Design : Différenciation visuelle objectif vs résultat

**Mode :** Designer  
**Date :** 16 mars 2026  
**Contexte :** Sur la page Objectifs (et partout où objectifs et résultats passés sont affichés), différencier clairement un **objectif** (course à venir) d’un **résultat** (course passée avec temps/place). Conserver la différenciation **objectif primaire** (amber) / **objectif secondaire** (sage).

---

## 1. Besoin reformulé

- **Objectif** = course/événement à venir (ou passé sans résultat). Affichage actuel : TileCard, bordure gauche amber (principal) ou sage (secondaire), badge « Principal » / « Secondaire », date, nom, distance. Si l’objectif a un **objectif de temps** (temps cible, champs `target_time_*`, migration 056), l’afficher sur la tuile (ex. « 42 km · Objectif 3h30 ») ; voir `lib/goalResultUtils.ts` (`hasTargetTime`, `formatTargetTime`).
- **Résultat** = objectif dont la date est passée et pour lequel un résultat est renseigné (temps, place, note). Actuellement affiché dans la **même** tuile que l’objectif (temps · place en ligne sous la distance), avec une légère opacité. Si l’objectif avait aussi un **objectif de temps**, afficher les deux (ex. « Objectif 3h30 · Réalisé 3h45 · 24e »).
- **Souhait** : Différencier **facilement** visuellement objectif vs résultat, **sans** perdre la distinction primaire (amber) / secondaire (sage), et **sans** s’éloigner du design actuel (tokens, TileCard, badges existants).

---

## 2. Design actuel (rappel)

- **Tuile objectif** : `TileCard` avec `leftBorderColor={isPrimary ? 'amber' : 'sage'}`.
- **Badges priorité** : Principal = `bg-palette-amber/10 text-palette-amber border-palette-amber` ; Secondaire = `bg-palette-sage/10 text-palette-sage border-palette-sage`.
- **Résultat** : même tuile, `opacity-75` si passé ; ligne « distance · temps · place » en `text-stone-500` avec icônes Map / Clock.
- **Référence** : `ObjectifsTable.tsx`, `TileCard.tsx`, `docs/DESIGN_SYSTEM.md` (tokens amber / sage).

---

## 3. Trois propositions

Trois options sont proposées ci‑dessous. Les mockups HTML sont dans le même dossier :

- **Proposition A** : `MOCKUP_OBJECTIF_RESULTAT_PROP_A.html` — Fond différencié pour les résultats
- **Proposition B** : `MOCKUP_OBJECTIF_RESULTAT_PROP_B.html` — Badge « Résultat » + encadré temps/place
- **Proposition C** : `MOCKUP_OBJECTIF_RESULTAT_PROP_C.html` — Icône « résultat » + ligne résultat mise en avant

Pour chaque mockup : 4 tuiles (Objectif principal, Objectif secondaire, Résultat principal, Résultat secondaire) pour vérifier la lisibilité des deux axes (objectif/résultat et primaire/secondaire).

---

### Proposition A — Fond différencié pour les résultats

- **Objectif (à venir)** : inchangé — fond blanc, bordure gauche amber/sage, badge Principal/Secondaire, date, nom, distance (et optionnel « J‑X »).
- **Résultat (passé avec résultat)** : même structure, **fond légèrement teinté** selon priorité :
  - Principal : `bg-palette-amber/5` (ou `bg-stone-50` pour rester neutre).
  - Secondaire : `bg-palette-sage/5` (ou `bg-stone-50`).
  - Bordure gauche et badge Principal/Secondaire **inchangés** (amber/sage).
  - Option : petit label caption « Résultat » au-dessus de la ligne temps · place (i18n).
- **Avantage** : Différenciation immédiate par la couleur de fond sans toucher aux badges. Très proche de l’existant.
- **Inconvénient** : Sur écran très clair, la différence peut être subtile.

**Composants à utiliser tels quels :** `TileCard`, badges existants, `formatGoalResultTime` / `formatGoalResultPlaceOrdinal`.  
**À faire évoluer :** `ObjectifsTable` (et vues similaires) — appliquer une `className` conditionnelle sur la TileCard selon `hasGoalResult(goal)` (ex. fond `bg-stone-50` ou `bg-palette-amber/5` / `bg-palette-sage/5`) ; optionnel : afficher un label « Résultat » (i18n).

---

### Proposition B — Badge « Résultat » + encadré temps/place

- **Objectif (à venir)** : inchangé.
- **Résultat (passé avec résultat)** : même TileCard, bordure et badge Principal/Secondaire inchangés. En plus :
  - Un **second badge** discret « Résultat » (style stone : `bg-stone-100 text-stone-600 border-stone-200`) à côté de Principal/Secondaire.
  - La ligne **temps · place** est placée dans un **petit encadré** (fond `bg-stone-50`, `rounded-lg`, `px-2.5 py-1.5`, bordure `border-stone-100`) pour former un bloc visuel « résultat ».
- **Avantage** : Double signal (badge + bloc) ; la ligne résultat est clairement identifiée.
- **Inconvénient** : Un badge de plus peut encombrer sur mobile si mal positionné.

**Composants à utiliser tels quels :** `TileCard`, badges priorité, `goalResultUtils`.  
**À faire évoluer :** `ObjectifsTable` — pour les objectifs avec résultat : ajouter le badge « Résultat » (i18n) et envelopper la ligne temps/place dans un div avec les classes d’encadré.

---

### Proposition C — Icône « résultat » + ligne résultat mise en avant

- **Objectif (à venir)** : inchangé.
- **Résultat (passé avec résultat)** : même TileCard, bordure et badge Principal/Secondaire inchangés. En plus :
  - Une **icône** « résultat » (médaille ou check dans un cercle) en début de ligne résultat (à côté de l’icône horloge), ou au-dessus du bloc date/nom pour indiquer « ceci est un résultat ».
  - La ligne **temps · place** en **gras** ou `text-stone-700` (au lieu de `text-stone-500`) pour en faire l’élément d’accroche.
- **Avantage** : Pas de nouveau badge, pas de changement de fond ; léger et cohérent avec l’existant.
- **Inconvénient** : L’icône doit être petite et claire (éviter la surcharge).

**Composants à utiliser tels quels :** `TileCard`, badges priorité, `goalResultUtils`.  
**À faire évoluer :** `ObjectifsTable` — pour les objectifs avec résultat : ajouter une icône (ex. `SportIcons` ou icône médaille/check du design system) devant la ligne résultat et appliquer `font-semibold text-stone-700` à la ligne temps · place.

---

## 4. Récapitulatif

| Proposition | Différenciation objectif / résultat | Primaire / secondaire conservé | Évolution par rapport à l’actuel |
|-------------|--------------------------------------|----------------------------------|-----------------------------------|
| **A**       | Fond teinté (stone-50 ou amber/5, sage/5) + option label « Résultat » | Oui (bordure + badge) | Mineure (className + option label) |
| **B**       | Badge « Résultat » + encadré autour de temps · place | Oui (bordure + badge) | Modérée (nouveau badge + wrapper) |
| **C**       | Icône résultat + ligne temps/place en gras | Oui (bordure + badge) | Mineure (icône + style texte) |

---

## 5. Proposition retenue (PO) — Bande colorée pour objectifs, bande grise pour résultats

Suite au retour PO : conserver la **bande colorée** (orange/amber ou sage) pour les **objectifs** ; mettre la bande **grise** pour les **résultats**. Le résultat (temps · place) reste sur **la même ligne** que la distance.

### Règles

- **Objectifs** (date de l’événement **strictement après** la date du jour) : on **garde la bande colorée** — **orange/amber** pour principal, **sage** pour secondaire. Pas de gris.
- **Résultats** (date de l’événement **égale ou antérieure** à la date du jour) : **uniquement la bande grise à gauche** — pas de contour. Dès le jour J de l’événement, l’affichage passe en gris (sans attendre la saisie d’un résultat).
- **Badge Principal** : fond **blanc**, texte et contour amber (`bg-white`, `text-palette-amber`, `border-palette-amber`).
- **Badge Secondaire** : fond **blanc**, **texte et contour vert/sage** (`bg-white`, `text-palette-sage`, `border-palette-sage`).

| Type        | Borde gauche (TileCard) | Badge priorité | Ligne sous le nom |
|-------------|--------------------------|----------------|-------------------|
| **Objectif** (date > aujourd’hui) | **`amber`** (orange) ou **`sage`** — bande colorée conservée | Principal : fond blanc, amber. Secondaire : fond blanc, texte + contour vert. | `distance km` (et optionnel **Objectif 3h30** si temps cible ; J‑X) |
| **Résultat** (date ≤ aujourd’hui, dès le jour J) | **`stone`** — bande grise à gauche **uniquement** (pas de contour) | Idem | `distance km · temps · place` sur **une seule ligne** ; si objectif de temps présent : « Objectif 3h30 · Réalisé 3h45 · place » |

### Mockup

- **Fichier :** `MOCKUP_OBJECTIF_RESULTAT_BANDE_GRISE.html`

### Implémentation

- **TileCard** : pour les **objectifs** (date > aujourd’hui), `leftBorderColor={isPrimary ? 'amber' : 'sage'}` (bande colorée). Pour les **résultats** (date ≤ aujourd’hui), `leftBorderColor="stone"` et **`borderLeftOnly`** (bande grise à gauche uniquement). Condition : **`goal.date <= today`** (et non plus « a un résultat saisi »).
- **Badges** : Principal = `bg-white text-palette-amber border-palette-amber` ; Secondaire = `bg-white text-palette-sage border-palette-sage`.
- **Ligne distance + résultat** : garder le bloc actuel en une seule ligne : `distance km` · `temps` · `place` (déjà le cas dans `ObjectifsTable.tsx`), sans saut de ligne ni encadré.
- **Fichiers à mettre à jour :** `ObjectifsTable.tsx`, `CoachAthleteCalendarPage.tsx`, `CalendarView.tsx` (tuiles + modale détail objectif), et les blocs Objectifs / Résultats dans les tuiles demande (PendingRequestTile, etc.).

---

## 6. Suite

- Validation visuelle du mockup `MOCKUP_OBJECTIF_RESULTAT_BANDE_GRISE.html`.
- Passage en implémentation (mode Développeur) selon la spec ci‑dessus.

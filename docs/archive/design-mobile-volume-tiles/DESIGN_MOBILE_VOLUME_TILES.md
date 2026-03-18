# Design : Affichage mobile — section Objectifs et volume par sport

**Mode :** Designer  
**Date :** 17 mars 2026  
**Contexte :** Dépassement horizontal sur mobile sur la page Mon profil (et formulaire de demande), section « Objectifs et volume par sport ».

---

## 1. Reformulation du besoin

**Problème :** Sur vue mobile, la section « Objectifs et volume par sport » provoque un **défilement horizontal**. Les tuiles (Course, Vélo, Natation, Musculation, etc.) sont affichées en **2 colonnes fixes** (`grid grid-cols-2`). La largeur disponible par tuile est insuffisante pour contenir : icône + libellé sport + un ou deux champs (volume + suffixe km/sem., D+/sem., h/sem.), ce qui pousse le contenu au-delà de l’écran.

**Objectif :** Adapter la disposition pour que, sur mobile, **aucun défilement horizontal** ne soit nécessaire, tout en restant cohérent avec le design system et l’existant desktop.

---

## 2. Cas couverts

| Cas | Description |
|-----|-------------|
| **Nominal mobile** | L’utilisateur consulte ou édite la section sur un écran étroit (< ~640px). Toutes les tuiles et champs restent visibles sans scroll horizontal. |
| **Nominal desktop** | Sur écran plus large, l’affichage reste lisible ; on peut conserver 2 colonnes si la solution le prévoit. |
| **Tuile Course + Trail** | La tuile Course peut afficher 2 champs (km/sem. + D+/sem.) ; la disposition doit rester utilisable sur mobile. |
| **Limite** | Pas de changement de structure des champs (names, validation) ni du design system (tokens, composants) hors layout de la grille et éventuellement layout interne des tuiles. |

---

## 3. Analyse de l’écran existant

**Fichiers concernés :**

- **`app/[locale]/dashboard/profile/ProfileForm.tsx`**  
  Section « Objectifs et volume (athlète uniquement) » : titre, ligne « Temps à allouer / semaine » (input + h/sem.), puis **grille** `grid grid-cols-2 gap-3` contenant une div par sport avec bordure gauche colorée (`SPORT_CARD_STYLES`), icône (`SPORT_ICONS`), libellé, et un ou deux inputs (volume + optionnel D+ pour Course).

- **`app/[locale]/dashboard/FindCoachSection.tsx`**  
  Même section « Objectifs et volume par sport » dans le formulaire de demande (CoachDetailModal) : même grille `grid grid-cols-2 gap-3` et même structure de tuiles.

**Composants / styles utilisés :**

- Design system : `docs/DESIGN_SYSTEM.md` (tokens, gap-3, tuiles avec `border-l-4`, `rounded-xl`, `lib/sportStyles.ts` pour couleurs et icônes).
- Pas de composant générique « tuile volume » : le bloc est du JSX inline dans ProfileForm et FindCoachSection (structure identique).

**Cause du bug :** La grille en 2 colonnes impose environ 50 % de largeur par tuile. Sur mobile, cette largeur est trop faible pour le contenu (icône + texte + input(s) + suffixe), d’où overflow horizontal.

---

## 4. Solutions UI proposées

### Solution A — Grille responsive (1 colonne sur mobile, 2 sur plus large)

**Idée :** Remplacer `grid grid-cols-2 gap-3` par une grille responsive : **une colonne** sur les petits écrans, **deux colonnes** à partir d’un breakpoint (ex. `sm` 640px ou `md` 768px).

- **Mobile :** tuiles empilées verticalement → toute la largeur pour chaque tuile → plus de dépassement.
- **Desktop / tablette :** 2 colonnes comme aujourd’hui.

**Composants à utiliser tels quels :**  
Aucun nouveau composant. Styles existants des tuiles (bordure gauche, icône, inputs) inchangés.

**À faire évoluer :**  
- **ProfileForm.tsx** : conteneur de la grille des tuiles volume → remplacer `grid grid-cols-2 gap-3` par `grid grid-cols-1 sm:grid-cols-2 gap-3` (ou `md:grid-cols-2` selon préférence projet).  
- **FindCoachSection.tsx** : même changement sur le conteneur de la grille des tuiles volume.

**Mockup :** `MOCKUP_MOBILE_VOLUME_SOLUTION_A.html` (section seule, vue mobile simulée avec 1 colonne).

---

### Solution B — Toujours une colonne

**Idée :** Garder une **seule colonne** pour les tuiles volume, sur tous les écrans (`grid grid-cols-1 gap-3`).

- Comportement identique mobile et desktop : tuiles toujours empilées.
- Plus de risque d’overflow ; lecture très prévisible.
- Sur grand écran, la section est plus longue verticalement (pas de gain de place en largeur).

**Composants à utiliser tels quels :**  
Même structure de tuiles qu’aujourd’hui.

**À faire évoluer :**  
- **ProfileForm.tsx** : `grid grid-cols-2 gap-3` → `grid grid-cols-1 gap-3`.  
- **FindCoachSection.tsx** : idem.

**Mockup :** `MOCKUP_MOBILE_VOLUME_SOLUTION_B.html`.

---

### Solution C — Tuiles compactes sur mobile (layout interne adaptatif)

**Idée :** Conserver une grille 2 colonnes (éventuellement responsive), mais **adapter le layout interne** de chaque tuile sur mobile : par exemple **bloc label + icône au-dessus**, **champs en dessous** sur une ou deux lignes, pour réduire la largeur minimale de la tuile et éviter l’overflow.

- Nécessite des classes conditionnelles (ex. `flex-col` sur mobile, `flex-row` / `justify-between` sur desktop) ou un wrapper avec breakpoint.
- Plus de travail d’évolution (structure interne des tuiles à modifier dans ProfileForm et FindCoachSection) et risque d’écarts visuels par rapport au mockup actuel.

**Composants à utiliser tels quels :**  
Tokens, `SPORT_CARD_STYLES`, `SPORT_ICONS`, champs (names, validation).

**À faire évoluer :**  
- **ProfileForm.tsx** et **FindCoachSection.tsx** : structure interne de chaque tuile (ordre et disposition des blocs icône+label vs champs) selon breakpoint.  
- Optionnel : extraire la « tuile volume » en petit composant réutilisable pour éviter la duplication.

**Mockup :** Pas de fichier HTML dédié ; décrit en texte. Si le PO souhaite un visuel, un mockup pourra être ajouté.

---

## 5. Synthèse et recommandation

| Solution | Effort | Mobile | Desktop | Cohérence design system |
|----------|--------|--------|---------|--------------------------|
| **A** — Grille responsive | Faible (2 fichiers, 1 ligne chacun) | 1 colonne, pas d’overflow | 2 colonnes comme aujourd’hui | Totale |
| **B** — Une colonne partout | Faible (2 fichiers, 1 ligne chacun) | 1 colonne | 1 colonne (section plus longue) | Totale |
| **C** — Tuiles compactes | Moyen (layout interne + 2 endroits) | 2 colonnes possibles si tuiles plus étroites | Inchangé ou proche | À vérifier (layout différent) |

**Recommandation Designer :** **Solution A**. Elle supprime le problème mobile sans changer le rendu desktop, avec un impact minimal (grille responsive). La solution B est un bon compromis si on préfère un comportement unique (toujours une colonne) partout.

---

## 6. Fichiers impactés (après validation PO)

- **ProfileForm.tsx** : conteneur grille tuiles volume (ligne ~688).  
- **FindCoachSection.tsx** : conteneur grille tuiles volume (ligne ~920).  
- **Design system / docs :** préciser dans `DESIGN_SYSTEM.md` (ou doc dédiée) que la section « Objectifs et volume par sport » utilise une grille responsive sur mobile (1 col) pour éviter l’overflow, si solution A ou B retenue.

---

## 7. Checklist avant livraison (Designer)

- [x] Design system et écran existant analysés  
- [x] Mockups A et B fournis (HTML)  
- [x] Composants à utiliser / à faire évoluer indiqués pour chaque solution  
- [ ] Solution validée par le PO  
- [ ] Si validation : découpage en user stories optionnel (changement limité à 2 lignes de classe CSS)

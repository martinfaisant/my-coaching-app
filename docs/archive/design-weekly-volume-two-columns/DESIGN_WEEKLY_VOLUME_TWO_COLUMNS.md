# Design : Volume actuel + Volume maximum (deux colonnes)

**Mode :** Designer  
**Date :** 17 mars 2026  
**Contexte :** Profil athlète (Mon profil) et formulaire de demande de coaching — section « Volumes hebdomadaires ».

---

## 1. Reformulation du besoin

- **Où :** Dans le **profil de l’athlète** (Mon profil) et dans le **formulaire de demande de coaching** (Trouver un coach → demande).
- **Changements demandés :**
  1. **Ajouter** un champ **Volume actuel** (heures/semaine actuellement pratiquées).
  2. **Renommer** le champ existant « Temps à allouer / semaine » en **Volume maximum**.
  3. **Renommer** la section « Objectifs et volume par sport » en **Volumes hebdomadaires**.
  4. **Disposition :** Les deux champs sont affichés en **deux colonnes** (comme pour les volumes par sport) : **Volume actuel à gauche**, **Volume maximum à droite**.

---

## 2. Analyse de l’écran existant

### Profil athlète (`ProfileForm.tsx`)

- Section « Volumes hebdomadaires » (titre à mettre à jour, ex. `weeklyVolumesSectionTitle`).
- **Actuellement :** une seule ligne en barre grise (`rounded-xl bg-stone-50 border`) : label « Temps à allouer / semaine » + input `w-28` + suffixe « h/sem. ».
- En dessous : `grid grid-cols-2 gap-3` avec les tuiles volume par sport (Course, Vélo, Natation, etc.), chaque tuile avec bordure gauche colorée, icône, nom du sport, input + suffixe (km/sem., m/sem., h/sem.).

### Formulaire de demande (`FindCoachSection.tsx`)

- Même section « Volumes hebdomadaires » entre Sports pratiqués et Objectifs de course / résultats passés.
- Même structure : une ligne « Temps à allouer / semaine » remplacée par deux colonnes (Volume actuel | Volume maximum) + grille 2 colonnes pour les volumes par sport.

### Tuile demande en attente (coach) (`PendingRequestTile.tsx`)

- Bloc « Volumes hebdomadaires » (ou « Objectifs et volume » selon i18n) en lecture seule : afficher **deux lignes** — « Volume actuel : X h/sem. » et « Volume maximum : Y h/sem. » — puis les volumes par sport.

---

## 3. Cas d’usage et questions de clarification

| Cas | Description |
|-----|-------------|
| **Nominal** | L’athlète renseigne Volume actuel (ex. 6 h) et Volume maximum (ex. 10 h). Les deux sont enregistrés (profil et/ou snapshot demande). Le coach voit les deux dans la demande. |
| **Champs vides** | Volume actuel et Volume maximum sont **obligatoires** (profil + demande), comme l’ancien « Temps à allouer ». |
| **Validation** | Mêmes règles que l’actuel « temps à allouer » : nombre positif, plafond raisonnable (ex. ≤ 168 h). **Pas de règle** « Volume actuel ≤ Volume maximum » : le volume actuel peut être supérieur au volume maximum. |
| **Vue coach** | Dans la tuile « Demande en attente », afficher les deux lignes : « Volume actuel : X h/sem. » et « Volume maximum : Y h/sem. ». |

**Réponses PO (validées) :** 1) Obligatoire. 2) Non — pas de validation actuel ≤ max. 3) Oui — afficher les deux lignes côté coach.

---

## 4. Proposition de solutions UI

### Solution A (recommandée) — Deux blocs côte à côte, même style que les tuiles volume

- **Disposition :** Une grille **2 colonnes** (`grid grid-cols-2 gap-3`), comme pour les tuiles volume par sport.
  - **Colonne 1 (gauche) :** un bloc visuel identique à l’actuelle barre (rounded-xl, bg-stone-50, border) avec label **« Volume actuel »** + input (même largeur `w-28`) + suffixe **« h/sem. »**.
  - **Colonne 2 (droite) :** même bloc avec label **« Volume maximum »** + input + **« h/sem. »**.
- **En dessous :** la grille des tuiles volume par sport inchangée.
- **Titre de section :** « Volumes hebdomadaires » (remplace « Objectifs et volume par sport »).
- **Réutilisation :** même pattern input + suffixe que dans `ProfileForm` / `FindCoachSection`, tokens (stone, forest-dark pour focus), pas de nouveau composant partagé obligatoire.
- **Responsive :** Sur très petit écran, les deux blocs peuvent passer en colonne (grid-cols-1) comme les tuiles sport pour rester lisible.

**Composants à utiliser tels quels :** `Input` (ou champs natifs avec classes `formStyles` / design system), `SPORT_ICONS` / `SPORT_CARD_STYLES` pour les tuiles volume, structure de section existante.

**À faire évoluer :**  
- `ProfileForm.tsx` : remplacer la ligne unique « Temps à allouer / semaine » par la grille 2 colonnes (Volume actuel | Volume maximum) ; titre section « Volumes hebdomadaires ».  
- `FindCoachSection.tsx` : idem.  
- `PendingRequestTile.tsx` : afficher les deux lignes (Volume actuel + Volume maximum) dans le bloc.  
- i18n : clés pour « Volumes hebdomadaires », « Volume actuel », « Volume maximum » (ex. `weeklyVolumesSectionTitle`, `weeklyCurrentHoursLabel`, `weeklyMaxHoursLabel`) + messages de validation et obligatoire.

---

### Solution B — Une seule barre avec deux « cellules » côte à côte

- Une seule barre horizontale (rounded-xl bg-stone-50) contenant deux zones : à gauche « Volume actuel » + input, à droite « Volume maximum » + input.
- Moins aligné avec la grille 2 colonnes des tuiles sport ; peut être plus serré sur mobile si les libellés sont longs.

**Recommandation :** Solution A pour cohérence visuelle avec les tuiles volume (deux colonnes) et lisibilité.

---

## 5. Mockup

Voir **`MOCKUP_WEEKLY_VOLUME_TWO_COLUMNS.html`** : section « Volumes hebdomadaires » avec les deux champs en deux colonnes (Volume actuel | Volume maximum) puis la grille des volumes par sport (extrait de page Mon profil / formulaire demande). Le mockup montre l’écran complet (contexte profil) avec la modification intégrée.

---

## 6. User stories

Voir **`USER_STORIES_WEEKLY_VOLUME_TWO_COLUMNS.md`** pour le détail des user stories avec critères d’acceptation et référence au mockup :

- **US1** — Profil athlète : affichage des deux champs en deux colonnes (Volume actuel | Volume maximum), section « Volumes hebdomadaires ».
- **US2** — Profil athlète : enregistrement des deux valeurs (profil + préremplissage).
- **US3** — Formulaire de demande : même section « Volumes hebdomadaires » en deux colonnes, préremplissage, snapshot demande.
- **US4** — Validation : les deux champs obligatoires, plafond (ex. ≤ 168 h) ; **pas** de règle actuel ≤ max.
- **US5** — Vue coach (PendingRequestTile) : affichage des deux lignes « Volume actuel » et « Volume maximum » en lecture seule.

---

## 7. Checklist avant livraison (Designer)

- [x] Design system et écran existant analysés
- [x] Besoin reformulé, cas et réponses PO intégrés
- [x] 2 solutions proposées (A recommandée), composants existants indiqués
- [x] Mockup fourni (section en contexte)
- [x] User stories découpées avec critères d’acceptation et référence au mockup
- [x] Validation PO : obligatoire, pas actuel ≤ max, deux lignes côté coach

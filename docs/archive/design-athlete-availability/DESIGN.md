# Design : Disponibilités et indisponibilités athlète

**Mode :** Designer  
**Date :** 2 mars 2026

---

## 1. Reformulation du besoin

L’athlète doit pouvoir **communiquer au coach** ses **disponibilités** et **indisponibilités** par jour, avec créneaux horaires optionnels et texte libre, afin que le coach programme plus facilement les entraînements.

**Fonctionnalités demandées :**

- **Calendrier (jours futurs)** : un **bouton « + »** pour l’athlète (comme pour le coach), qui ouvre une modale pour créer une **disponibilité** ou une **indisponibilité** pour la journée.
- **Une même journée** peut avoir **plusieurs** disponibilités et/ou indisponibilités.
- **Contenu d’une entrée** : type (disponible / indisponible), **heures de début et fin**, **texte libre**, et optionnellement une **récurrence avec date de fin**.
- **Affichage dans le calendrier** : chaque entrée s’affiche comme une **tuile** dans la colonne du jour.
- **Couleurs** : tuile **disponible = vert**, tuile **indisponible = orange**.
- **Différenciation** : les tuiles dispo/indispo doivent se distinguer **facilement** des tuiles d’entraînement (ex. fond différent du blanc, transparence ou couleur).

---

## 2. Cas d’usage identifiés

| Cas | Description |
|-----|-------------|
| **Nominal – création** | L’athlète clique sur « + » sur un jour futur → modale épurée → type (dispo / indispo), heures optionnelles, note (description), récurrence (1/2/3/4 semaines) + date de fin → Enregistrer. Une tuile apparaît dans le calendrier. |
| **Plusieurs par jour** | Pour un même jour, l’athlète peut ajouter plusieurs créneaux. Tous s’affichent comme tuiles distinctes. |
| **Récurrence** | L’athlète choisit la récurrence : **toutes les 1, 2, 3 ou 4 semaines** (même jour de la semaine) jusqu’à une date de fin. Les occurrences sont affichées sur le calendrier. |
| **Calendrier** | Ordre dans la colonne du jour : **dispos/indispos → objectifs → entraînements → Strava**. Tuiles dispo/indispo : fond blanc transparent + contour coloré + icône calendrier (analogue à la tuile entraînement avec icône sport). |
| **Vue coach** | Le coach voit les tuiles dispo/indispo en **lecture seule** (pas de création ni modification). |
| **Édition / suppression** | **OUI.** L’athlète clique sur une tuile dispo/indispo → modale détail avec Modifier / Supprimer. |
| **Sans heures** | Si pas d’heures renseignées : afficher « Disponible » / « Indisponible » + **note** (affichée comme la description d’un événement). |
| **Jours passés** | Pas de bouton « + » sur les jours passés ; tuiles existantes en lecture seule. |

---

## 3. Décisions PO (validées)

- **Ordre colonne du jour** : dispos/indispos → objectifs → entraînements → Strava.
- **Clic sur tuile dispo/indispo** : OUI — ouvrir modale détail pour éditer ou supprimer.
- **Sans heures** : afficher « Disponible » / « Indisponible » + note (comme description d’événement).
- **Coach** : lecture seule uniquement (pas de création/modification).
- **Récurrence** : choix parmi **toutes les 1 semaine**, **2 semaines**, **3 semaines**, **4 semaines** (même jour de semaine jusqu’à date de fin).
- **Style tuile** : **fond blanc transparent + contour (bordure) coloré autour de la tuile + icône calendrier** (proche de la tuile entraînement avec icône sport).

---

## 4. Proposition modale « Ajouter disponibilité / indisponibilité »

- **Déclencheur** : bouton « + » sur un **jour futur** (vue athlète uniquement).
- **En-tête** : comme la modale entraînement — **date à gauche** avec le **composant calendrier** (DatePickerPopup au clic sur le champ date), bouton fermer à droite.
- **Composants** : `Modal` (taille `workout` comme WorkoutModal), `Button`, **Dropdown** (design system), `Textarea`, segments type, `DatePickerPopup`.
- **Champs** :
  - **Type** : Disponible | Indisponible (segments).
  - **Date** : dans l’en-tête, sélectionnable via le calendrier (composant comme pour un entraînement).
  - **Début** / **Fin** : **double Dropdown** (même style que le Dropdown du design system) — options créneaux horaires avec **pas de 15 min** (ex. 06:00 à 23:45).
  - **Note** : champ **Textarea** du design system (label « Note »), optionnel ; affichée comme description sur la tuile si pas d’heures.
  - **Récurrence** : **bloc** comme « Objectifs de la séance » (fond `bg-stone-50`, `rounded-xl`, `border border-stone-100`). Titre « Récurrence » + **segments « Non récurrent » | « Récurrent »**. Si « Récurrent » : à **gauche** = **Dropdown** fréquence (1 / 2 / 3 / 4 semaines), à **droite** = **Date de fin** (DatePickerPopup).
- **Footer** : Annuler + Enregistrer (pattern `docs/PATTERN_SAVE_BUTTON.md`).
- **Style** : `lib/formStyles.ts` (FORM_BASE_CLASSES, FORM_LABEL_CLASSES), design system.

---

## 5. Style des tuiles dispo/indispo (validé)

Les tuiles d’**entraînement** ont : fond blanc, **bordure gauche** épaisse couleur sport, **icône sport**, badge, ombre.

**Choix validé pour les tuiles disponibilité / indisponibilité** :

- **Fond blanc transparent** (`bg-white/90` ou équivalent) + **contour (bordure) coloré autour de toute la tuile** (pas seulement gauche) — vert pour disponible, orange pour indisponible.
- **Icône calendrier** sur la tuile (analogue à l’icône sport sur la tuile d’entraînement).
- Badge ou libellé « Disponible » / « Indisponible ».
- Si pas d’heures : affichage de la **note comme description** (comme la description d’un événement).

**Couleurs** : Disponible → `palette-forest-dark` (contour + icône). Indisponible → orange (token à définir : `palette-amber` ou `palette-unavailable`).

**Style retenu (option D)** : **bordure très fine uniquement** — `border border-palette-forest-dark/40` (dispo) ou `border border-orange-500/40` (indispo), pas de `border-l-4`. Fond blanc transparent, icône calendrier en cercle, rounded-2xl. Référence : `MOCKUP_CALENDAR_AVAILABILITY_TILES.html` option D.

---

## 6. Composants design system à utiliser / faire évoluer

| Composant | Usage |
|-----------|--------|
| **Modal** | Modale taille `workout` (comme WorkoutModal). En-tête : date + calendrier (DatePickerPopup) à gauche, fermer à droite. |
| **Button** | Annuler (variant `muted`), Enregistrer (variant `primaryDark`). |
| **Dropdown** | **Récurrence** : options 1 / 2 / 3 / 4 semaines. **Début** et **Fin** : double Dropdown avec créneaux horaires (même style que Dropdown design system : trigger FORM_BASE_CLASSES, panneau options). |
| **Textarea** | Champ **Note** (label « Note »). `FORM_LABEL_CLASSES` + `FORM_BASE_CLASSES` + `TEXTAREA_SPECIFIC_CLASSES`. |
| **Segments** | Type Disponible / Indisponible (2 choix). |
| **DatePickerPopup** | Date dans l’en-tête (comme entraînement) ; date de fin de récurrence dans le corps. |
| **CalendarView** | Ordre jour : dispos/indispos → goals → workouts → Strava. Bouton « + » athlète sur jours futurs. Clic tuile dispo/indispo → modale détail (éditer/supprimer). |
| **AvailabilityTile** (ou styles dédiés) | Fond blanc transparent, **contour coloré** (border tout autour), icône calendrier, badge « Disponible »/« Indisponible », plage horaire ou description (note). Documenter dans `DESIGN_SYSTEM.md` si réutilisable. |

---

## 7. Fichiers mockups

- **`MOCKUP_AVAILABILITY_MODAL.html`** : en-tête avec date + calendrier (comme entraînement), type (segments), double Dropdown Début/Fin, champ **Note** (Textarea), Dropdown Récurrence + date de fin, footer Annuler / Enregistrer.
- **`MOCKUP_CALENDAR_AVAILABILITY_TILES.html`** : colonne jour, **ordre** dispos/indispos → objectifs → entraînements → Strava ; **4 options** de tuiles (A, B, C, **D** : bordure très fine seule, sans border-l-4).

Ouvrir dans un navigateur pour validation visuelle (Tailwind CDN + palette projet).

---

## 8. User stories (option D validée)

### US1 – Bouton « + » sur les jours futurs (vue athlète)

**En tant qu’** athlète, **je veux** voir un bouton « + » sur les jours futurs du calendrier **afin de** pouvoir ajouter une disponibilité ou une indisponibilité pour ce jour.

**Critères d’acceptation :**
- Sur le calendrier (vue athlète, mon calendrier), chaque jour **futur** affiche un bouton « + » (même principe que le bouton d’ajout d’entraînement pour le coach).
- Le clic sur « + » ouvre la modale « Disponibilité ou indisponibilité » avec la date du jour pré-remplie dans l’en-tête.
- Les jours **passés** n’affichent pas le bouton « + ».
- Référence : `MOCKUP_CALENDAR_AVAILABILITY_TILES.html` (bouton + en bas de la colonne jour).

---

### US2 – Modale de création (en-tête, type, heures, note, récurrence)

**En tant qu’** athlète, **je veux** remplir une modale pour créer une disponibilité ou une indisponibilité **afin de** communiquer mes créneaux au coach.

**Critères d’acceptation :**
- **En-tête** : date sélectionnable via le composant calendrier (DatePickerPopup), comme pour un entraînement ; bouton fermer à droite. Référence : `MOCKUP_AVAILABILITY_MODAL.html` (header).
- **Type** : segments « Disponible » | « Indisponible » (un seul sélectionnable).
- **Début** / **Fin** : deux Dropdown (style design system), options en **pas de 15 min** (ex. 06:00 à 23:45). Champs optionnels ; si vides = journée entière.
- **Note** : champ Textarea (label « Note »), optionnel.
- **Récurrence** : bloc visuel comme « Objectifs de la séance » (fond stone-50, rounded-xl, bordure). Segments « Non récurrent » | « Récurrent ». Si « Récurrent » : à gauche Dropdown fréquence (1 / 2 / 3 / 4 semaines), à droite champ « Jusqu’au » avec DatePickerPopup.
- **Footer** : Annuler (ferme sans sauvegarder), Enregistrer (pattern `docs/PATTERN_SAVE_BUTTON.md`).
- Tous les textes visibles en i18n (namespace dédié, ex. `availability` ou `calendar`).
- Référence : `MOCKUP_AVAILABILITY_MODAL.html` (formulaire complet).

---

### US3 – Enregistrement et affichage des tuiles (ordre, style option D)

**En tant qu’** athlète, **je veux** que ma disponibilité ou indisponibilité enregistrée apparaisse dans le calendrier **afin que** le coach la voie.

**Critères d’acceptation :**
- Après enregistrement réussi, la modale se ferme et la (ou les) tuile(s) apparaît/apparaissent sur le/les jour(s) concerné(s).
- Si récurrence choisie : une tuile par occurrence (même jour de la semaine, selon la fréquence, jusqu’à la date de fin).
- **Ordre dans la colonne du jour** : dispos/indispos → objectifs → entraînements → Strava. Référence : `MOCKUP_CALENDAR_AVAILABILITY_TILES.html` (option D, ordre des tuiles).
- **Style des tuiles (option D)** : bordure très fine uniquement (`border` coloré, pas de `border-l-4`), fond blanc transparent, icône calendrier, libellé « Disponible » ou « Indisponible », plage horaire si renseignée, sinon note affichée comme description.
- Couleur dispo : vert (ex. `palette-forest-dark`). Couleur indispo : orange (token à définir).
- Référence : `MOCKUP_CALENDAR_AVAILABILITY_TILES.html` (option D).

---

### US4 – Plusieurs créneaux par jour, sans heures

**En tant qu’** athlète, **je veux** pouvoir ajouter plusieurs disponibilités ou indisponibilités pour un même jour **afin de** préciser plusieurs créneaux.

**Critères d’acceptation :**
- Plusieurs tuiles dispo/indispo peuvent coexister sur un même jour (chaque enregistrement = une tuile).
- Si aucune heure (Début/Fin) n’est renseignée : la tuile affiche uniquement « Disponible » ou « Indisponible » + la **note** (affichée comme la description d’un événement). Pas de plage horaire affichée.
- Référence : `MOCKUP_CALENDAR_AVAILABILITY_TILES.html` (ex. tuile « Journée libre, préférence matin » sans heure).

---

### US5 – Vue coach (lecture seule)

**En tant que** coach, **je veux** voir les disponibilités et indisponibilités de l’athlète sur son calendrier **afin de** programmer les entraînements en conséquence.

**Critères d’acceptation :**
- Sur le calendrier d’un athlète (vue coach), les tuiles dispo/indispo sont **visibles** avec le même style (option D) et le même ordre (dispos/indispos → objectifs → entraînements → Strava).
- Le coach **ne voit pas** le bouton « + » pour ajouter une dispo/indispo (réservé à l’athlète).
- Le coach **ne peut pas** créer, modifier ni supprimer les dispos/indispos de l’athlète. Clic sur une tuile = ouverture en lecture seule (modale détail sans actions Modifier/Supprimer pour le coach).

---

### US6 – Édition et suppression (athlète)

**En tant qu’** athlète, **je veux** pouvoir modifier ou supprimer une disponibilité ou une indisponibilité **afin de** mettre à jour mes créneaux.

**Critères d’acceptation :**
- Clic sur une tuile dispo/indispo (vue athlète) ouvre une **modale détail** affichant les informations (date, type, créneau, note, récurrence éventuelle).
- La modale détail propose les actions **Modifier** (réouvre le formulaire avec les données pré-remplies) et **Supprimer** (avec confirmation si besoin).
- Après modification ou suppression, le calendrier se met à jour (tuiles ajoutées/modifiées/supprimées).
- Référence comportement : même logique que clic sur une tuile d’entraînement pour le coach (modale détail + actions).

---

### Récapitulatif et checklist

| ID | Titre court |
|----|--------------|
| US1 | Bouton « + » jours futurs (athlète) |
| US2 | Modale création (date, type, heures 15 min, note, récurrence) |
| US3 | Affichage tuiles (ordre jour, style option D) |
| US4 | Plusieurs créneaux par jour, affichage sans heures |
| US5 | Vue coach lecture seule |
| US6 | Édition / suppression (modale détail athlète) |

**Checklist avant livraison Designer :** design system consulté ✓ ; mockups créés ✓ ; option D validée ✓ ; chaque US avec critères d’acceptation et référence mockup ✓ ; composants design system cités §6 ✓.

---

## 9. Spec technique (Architecte)

Voir **`docs/design-athlete-availability/SPEC_ARCHITECTURE.md`** pour :
- Modèle de données (table `athlete_availability_slots`), migration `052_athlete_availability_slots.sql`
- RLS (athlète : tout ; coach : SELECT uniquement)
- Table des fichiers (créer / modifier), flux, logique récurrence, tests manuels, points à trancher en implémentation.

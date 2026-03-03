# Design : Moment de la journée (Matin / Midi / Soir) sur les entraînements

**Mode :** Designer  
**Date :** 2 mars 2026

---

## 1. Reformulation du besoin

Le coach doit pouvoir indiquer **optionnellement** pour chaque entraînement un **moment de la journée** : **Matin**, **Midi** ou **Soir**. Cette information sert à :

- **Structure de la journée dans le calendrier** : la journée est **découpée en sections** (pas d’info matin/midi/soir sur les tuiles). En haut : objectifs, dispo, entraînements sans moment, Strava **sans titre de section** ; puis les sections **Matin**, **Midi**, **Soir** (avec titre uniquement pour ces trois). Une **section vide (Matin/Midi/Soir) n’est pas affichée**.
- **Clarté pour l’athlète** : voir en un coup d’œil les créneaux de la journée et les contenus associés.

**Contraintes :**

- Le champ est **facultatif** : si le coach ne renseigne rien, le comportement actuel est conservé (ordre par défaut, ex. `created_at`).
- Un seul moment par entraînement (pas de plage horaire).
- Pas d’impact sur les créneaux d’offres ou de réservation : c’est une indication d’affichage uniquement.

---

## 2. Cas d’usage identifiés

| Cas | Description |
|-----|-------------|
| **Nominal** | Le coach crée ou modifie un entraînement et choisit « Matin », « Midi » ou « Soir » (ou ne choisit rien). À l’enregistrement, la valeur est sauvegardée. Dans le calendrier, les séances du jour sont triées Matin → Midi → Soir ; les séances sans moment sont affichées après (ou avant, à trancher). |
| **Calendrier** | La journée est affichée en bloc(s) : d’abord objectifs, dispo, entraînements sans moment, Strava **sans titre** ; puis sections **Matin**, **Midi**, **Soir** avec titre discret. **Section vide = non affichée**. Les tuiles ne portent pas de libellé moment. |
| **Lecture seule** | En modale lecture seule (athlète ou coach, séance passée/réalisée), le moment est affiché si renseigné (ex. « Matin » à côté de la date ou dans l’en-tête). |
| **Existant** | Les entraînements déjà en base sans moment : affichés dans le premier bloc (sans titre de section). |
| **Limite** | Un seul créneau par séance : pas de « Matin + Midi » pour une même séance. |

---

## 3. Questions au PO (clarifications)

1. **Vue athlète – modale « Mon entrainement »**  
   Le moment doit-il être affiché dans la modale (ex. sous la date : « Lundi 3 mars · Matin ») ou seulement reflété par l’ordre dans le calendrier ?

2. **Modale « Activités du jour »** (liste quand il y a plusieurs activités)  
   Confirmer que dans cette liste aussi l’ordre doit être : objectifs (goals) puis entraînements (Matin → Midi → Soir) puis activités Strava importées (ordre actuel) ?

---

## 4. Propositions UI (mockups)

### 4.1 Formulaire coach – Segments avec option « Non précisé »

- **Composant :** Segments (même style que le toggle Temps/Distance dans WorkoutModal : `flex bg-stone-200 p-0.5 rounded-lg`).
- **Placement :** dans le corps du formulaire, après Titre (ou après Sport/Titre).
- **Choix :** **4 segments** : [ **Non précisé** ] [ Matin ] [ Midi ] [ Soir ]. Un seul sélectionnable ; « Non précisé » = valeur par défaut (pas de moment enregistré).
- **Label :** « Moment de la journée » (i18n : `workouts.form.timeOfDay`).
- **Comportement :** sélection « Non précisé » → `time_of_day = null` en base ; sinon matin / midi / soir.

### 4.2 Calendrier – Journée découpée en sections

- **Pas d’info moment sur les tuiles** : les tuiles d’entraînement restent inchangées (couleur = sport, pas de badge Matin/Midi/Soir).
- **Structure de la colonne jour :** la journée est découpée en bloc(s) affichés de haut en bas :
  1. **Premier bloc (sans titre)** : objectifs (goals), éventuellement dispo, **entraînements sans moment** (time_of_day null), activités Strava importées.
  2. **Section « Matin »** (titre affiché) : entraînements avec moment = matin.
  3. **Section « Midi »** (titre affiché) : entraînements avec moment = midi.
  4. **Section « Soir »** (titre affiché) : entraînements avec moment = soir.
- **Section vide = non affichée** : si une section Matin/Midi/Soir n’a aucun contenu, elle n’est pas rendue (pas de titre ni zone vide).
- **Modale « Activités du jour » :** même logique (premier bloc sans titre, puis sections Matin / Midi / Soir avec titre si non vides).

---

## 5. Règles design system (rappel)

- **Couleur des tuiles = sport.** Les tuiles d'entraînement (calendrier, modale) utilisent la bordure et le badge selon le **sport** (`SPORT_CARD_STYLES`). Le moment (Matin/Midi/Soir) **n’est pas affiché sur la tuile** : il structure la journée en sections (Matin / Midi / Soir avec titre ; premier bloc sans titre).
- **Icônes sport = `components/SportIcons.tsx`.** Utiliser `IconRunning`, `IconBiking`, `IconSwimming`, `IconDumbbell`, etc. (via `SPORT_ICONS`), pas d'emojis.

---

## 6. Composants design system à utiliser / faire évoluer

| Composant | Usage |
|-----------|--------|
| **Segments (toggle)** | Moment de la journée : 4 segments [ Non précisé | Matin | Midi | Soir ], même style que Temps/Distance dans `WorkoutModal` (`flex bg-stone-200 p-0.5 rounded-lg`). |
| **WorkoutModal** | Ajout du champ « Moment » (segments avec option Non précisé) dans le formulaire coach ; en lecture seule, affichage du moment si présent (ex. sous la date). |
| **CalendarView** | Découpage de la colonne jour : premier bloc **sans titre** (objectifs, dispo, workouts sans moment, Strava), puis sections **Matin**, **Midi**, **Soir** avec titre. Afficher uniquement les sections Matin/Midi/Soir qui ont du contenu. Les tuiles ne changent pas (pas de libellé moment). |

---

## 7. Fichiers mockups

Les mockups sont **alignés sur le site actuel** (WorkoutModal, CalendarView, Modal, tuiles entraînement) : mêmes classes Tailwind, structure d’en-tête (date + badge), corps formulaire (sport, titre, objectifs), tuiles avec `border-l-4`, badge sport, métadonnées et badge statut.

- **`MOCKUP_FORM_TIME_OF_DAY.html`** : modale type workout, corps avec Sport, Titre, **Moment** = segments [ Non précisé | Matin | Midi | Soir ] (même style que Temps/Distance), bloc Objectifs, footer.
- **`MOCKUP_CALENDAR_DAY_ORDER.html`** : colonne jour : premier bloc sans titre (objectifs, Strava), puis sections Matin / Midi / Soir avec titre discret ; tuiles sans libellé moment (couleur = sport). Sections vides non affichées.

Ouvrir dans un navigateur pour validation visuelle (Tailwind CDN + palette projet).

---

## 8. User stories

### US1 – Formulaire coach : choix du moment (segments)

**En tant que** coach, **je veux** pouvoir indiquer optionnellement le moment de la journée (Matin, Midi, Soir) lors de la création ou de l’édition d’un entraînement **afin que** le calendrier de l’athlète affiche la journée structurée par créneaux.

**Référence mockup :** `MOCKUP_FORM_TIME_OF_DAY.html` – bloc « Moment de la journée ».

**Critères d’acceptation :**
- Dans la modale de création et d’édition d’entraînement (WorkoutModal), un champ « Moment de la journée » est affiché après le titre (ou à un emplacement défini dans la spec technique).
- Le champ est un **segment** (même style que Temps/Distance) avec **4 options** : **Non précisé**, **Matin**, **Midi**, **Soir**.
- Par défaut, « Non précisé » est sélectionné (création) ; en édition, la valeur enregistrée est pré-sélectionnée.
- La sélection est persistée à l’enregistrement du formulaire (voir US2).
- Texte et libellés sont en i18n (namespace `workouts`, ex. `workouts.form.timeOfDay`, `workouts.form.timeOfDay.unspecified`, etc.).

---

### US2 – Persistance du moment en base

**En tant que** système, **je veux** stocker le moment de la journée pour chaque entraînement (ou l’absence de moment) **afin que** le calendrier et les modales puissent afficher la bonne structure.

**Critères d’acceptation :**
- Une colonne (ou champ) `time_of_day` existe sur la table (ou entité) des entraînements, avec les valeurs possibles : `null` (non précisé), `morning`, `noon`, `evening` (ou équivalent : matin, midi, soir).
- À la création / mise à jour d’un entraînement, la valeur choisie (Non précisé → `null`, Matin → morning, etc.) est enregistrée.
- Les entraînements existants sans cette info sont considérés comme `time_of_day = null` (compatibilité ascendante).

---

### US3 – Calendrier : journée en sections (Matin / Midi / Soir)

**En tant qu’**athlète ou coach, **je veux** voir la journée du calendrier découpée en sections Matin, Midi, Soir **afin de** repérer rapidement les créneaux et les entraînements associés.

**Référence mockup :** `MOCKUP_CALENDAR_DAY_ORDER.html` – colonne jour.

**Critères d’acceptation :**
- Pour chaque jour, le contenu est affiché dans l’ordre suivant :
  1. **Premier bloc (sans titre)** : objectifs (goals), éventuellement dispo, entraînements dont `time_of_day` est null, activités Strava importées (ordre métier existant à conserver).
  2. **Section « Matin »** : titre de section discret (ex. « Matin » en petit, uppercase), puis liste des entraînements avec moment = matin.
  3. **Section « Midi »** : idem pour moment = midi.
  4. **Section « Soir »** : idem pour moment = soir.
- **Une section Matin, Midi ou Soir sans contenu n’est pas affichée** (pas de titre ni zone vide).
- Les tuiles d’entraînement restent inchangées visuellement : **pas de libellé Matin/Midi/Soir sur les tuiles** ; couleur et icône = sport (SPORT_CARD_STYLES, SportIcons).
- Comportement identique en vue calendrier (grille 3 semaines) et en vue mobile (journées empilées) si applicable.

---

### US4 – Modale lecture seule : affichage du moment

**En tant qu’**athlète ou coach, **je veux** voir le moment de la journée (Matin, Midi, Soir) dans la modale de détail d’un entraînement lorsque celui-ci est renseigné **afin de** confirmer le créneau.

**Critères d’acceptation :**
- En modale lecture seule (séance passée ou réalisée, ou vue athlète « Mon entrainement »), si l’entraînement a un `time_of_day` renseigné, le moment est affiché (ex. à côté de la date : « Lundi 3 mars · Matin » ou équivalent).
- Si `time_of_day` est null, aucun libellé moment n’est affiché.
- Libellés en i18n.

---

### US5 – Modale « Activités du jour » : structure par sections

**En tant qu’**athlète ou coach, **je veux** que la modale listant les activités d’un jour (quand il y a plusieurs activités) reprenne la même structure par sections **afin de** garder la cohérence avec le calendrier.

**Critères d’acceptation :**
- Dans la modale « Activités du jour » (ou équivalent), l’ordre d’affichage est le même que dans la colonne jour : premier bloc sans titre (objectifs, entraînements sans moment, Strava), puis sections Matin, Midi, Soir avec titre si elles ont du contenu.
- Les sections vides (Matin, Midi, Soir) ne sont pas affichées.
- Les tuiles ne portent pas de libellé moment.

---

**Checklist avant livraison Designer :** design system consulté ✓ ; mockups créés ✓ ; chaque US liée à une zone du mockup ✓ ; composants design system cités §5 ✓.

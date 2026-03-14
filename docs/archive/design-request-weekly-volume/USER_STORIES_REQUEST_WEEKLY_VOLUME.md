# User Stories — Temps à allouer et volumes dans la demande de coach

**Mode :** Designer  
**Date :** 14 mars 2026  
**Référence design :** `DESIGN_REQUEST_WEEKLY_VOLUME.md`  
**Mockups :** `MOCKUP_REQUEST_FORM.html`, `MOCKUP_PAGE_ATHLETES_TILES_COMPLETES.html`

---

## US 1 — Formulaire de demande : section Objectifs et volume (affichage et préremplissage)

**En tant qu'** athlète, **je veux** voir dans le formulaire de demande de coach une section « Objectifs et volume par sport » (temps à allouer / semaine + volumes par sport) **afin de** renseigner ou ajuster ces infos au moment de ma demande.

**Référence mockup :** `MOCKUP_REQUEST_FORM.html` — section entre « Sports pratiqués » et « Besoin de coaching ».

**Critères d'acceptation :**
- La section « Objectifs et volume par sport » est affichée dans le formulaire de demande (CoachDetailModal), entre « Sports pratiqués » et « Besoin de coaching ».
- Titre et libellés réutilisés depuis Mon profil (Temps à allouer / semaine, h/sem., unités par sport). i18n : namespace `profile` ou `findCoach`.
- Champ temps à allouer + tuiles volume dynamiques selon sports sélectionnés (triathlon → 3 tuiles ; trail → D+/sem. dans tuile Course).
- Si le profil a déjà `weekly_target_hours` et/ou `weekly_volume_by_sport`, les champs sont préremplis à l'ouverture.
- Styles alignés Mon profil : `SPORT_ICONS`, `SPORT_CARD_STYLES`, `getWeeklyVolumeUnit` (`lib/sportStyles.ts`).

**Composants :** Structure/styles section Objectifs et volume de `ProfileForm.tsx`. `SportTileSelectable` pour sports pratiqués.

---

## US 2 — Formulaire de demande : champs obligatoires et validation

**En tant qu'** athlète, **je veux** que le temps à allouer et les volumes par sport soient obligatoires et validés comme sur Mon profil **afin que** le coach reçoive des infos cohérentes.

**Référence mockup :** `MOCKUP_REQUEST_FORM.html` — bouton Envoyer désactivé si champs invalides ou vides.

**Critères d'acceptation :**
- Champs temps à allouer et volumes (par sport sélectionné) obligatoires : bouton « Envoyer la demande » désactivé ou message d'erreur à la soumission.
- Validation : temps ≥ 0, ≤ 168 ; volumes ≥ 0. Messages d'erreur i18n (`profile` ou `coachRequests.validation`).
- Comportement identique à la validation section Objectifs et volume sur Mon profil.

---

## US 3 — Soumission : mise à jour profil puis création demande

**En tant qu'** athlète, **je veux** que les valeurs temps/volumes saisies soient enregistrées dans mon profil puis que la demande soit créée **afin que** profil et demande soient cohérents.

**Critères d'acceptation :**
- À la soumission, l'action met à jour le profil (`weekly_target_hours`, `weekly_volume_by_sport`) puis crée la demande (`coach_requests`).
- En cas d'échec mise à jour profil, la demande n'est pas créée ; message d'erreur affiché.
- Champs envoyés cohérents avec sports sélectionnés (et trail : `course_elevation_m` si besoin).

**Composants :** Action `createCoachRequest` étendue (params `weeklyTargetHours`, `weeklyVolumeBySport` + update profil avant insert).

---

## US 4 — Page Trouver un coach : données profil pour préremplissage

**En tant qu'** athlète, **je veux** que la page Trouver un coach charge mon temps à allouer et mes volumes **afin que** le formulaire les affiche préremplis.

**Critères d'acceptation :**
- La page find-coach charge `weekly_target_hours` et `weekly_volume_by_sport` du profil athlète.
- Ces valeurs sont passées au formulaire (ex. `initialWeeklyTargetHours`, `initialWeeklyVolumeBySport`) pour préremplir la section Objectifs et volume (US 1).

---

## US 5 — Vue coach : tuile demande avec nom, offre, sports, message, objectifs/volume

**En tant que** coach, **je veux** voir dans chaque tuile de demande (Mes athlètes) le nom, l'offre, les sports, le message et les objectifs/volumes **afin de** décider sans modale.

**Référence mockup :** `MOCKUP_PAGE_ATHLETES_TILES_COMPLETES.html` — en-tête (nom · offre sur une ligne, badges sport, boutons) ; corps 2 colonnes (Message | Objectifs et volume).

**Critères d'acceptation :**
- En-tête : avatar, **nom et offre sur la même ligne** (ex. « Jean Dupont · Suivi complet — 49€/mois »), puis badges sport, puis Discuter / Refuser / Accepter.
- Corps 2 colonnes : bloc « Message de l'athlète » ; bloc « Objectifs et volume (athlète) » (temps à allouer + volumes par sport).
- Données objectifs/volume lues depuis le **profil athlète**. Si non renseigné : « Non renseigné » ou section vide.
- Pas de modale. Design system : labels `text-xs font-bold uppercase tracking-wider text-stone-400`, blocs `rounded-lg border border-stone-200`, boutons `px-4 py-2.5 rounded-lg`.

**Composants :** `PendingRequestTile.tsx` à enrichir. `Badge`, `Button`, `AvatarImage`. Données : profil athlète (requête ou liste demandes avec profils).

**i18n :** `athletes` ou `coachRequests` (Message de l'athlète, Objectifs et volume).

---

## US 6 — (Optionnel) Vue athlète : objectifs/volume dans « Ma demande envoyée »

**En tant qu'** athlète, **je veux** voir dans la modale « Demande envoyée » les objectifs et volumes que j'ai indiqués **afin de** retrouver le résumé de ma demande.

**Critères d'acceptation :**
- Dans `AthleteSentRequestDetailModal`, section « Objectifs et volume » en lecture seule (temps à allouer + volumes). Données depuis profil athlète.
- Si profil sans ces champs : section masquée ou « Non renseigné ».

**Composants :** `AthleteSentRequestDetailModal.tsx`. **i18n :** `athleteSentRequest`.

---

## US 7 — (À trancher) Formulaire RequestCoachButton (Contexte 2)

**Périmètre :** Uniquement si le PO décide d'ajouter temps + volumes dans la modale « Choisir ce coach » (sans offre). Voir `EXEMPLES_DEUX_CONTEXTES_FORMULAIRE.html` — Contexte 2.

**Critères d'acceptation (si retenu) :** Même section Objectifs et volume que US 1, obligatoire, préremplissage et mise à jour profil à l'envoi.

---

## Récapitulatif

| US | Titre court | Priorité |
|----|-------------|----------|
| US 1 | Section Objectifs et volume dans formulaire | P0 |
| US 2 | Validation et champs obligatoires | P0 |
| US 3 | Mise à jour profil + création demande | P0 |
| US 4 | Données profil pour préremplissage | P0 |
| US 5 | Tuile coach avec objectifs/volume | P0 |
| US 6 | Objectifs/volume dans Ma demande envoyée | P1 |
| US 7 | Contexte 2 (RequestCoachButton) | À trancher |

**Checklist :** Design validé, mockups référencés par US, composants design system cités, i18n identifiée.

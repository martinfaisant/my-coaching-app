# Design : Temps à allouer et volumes dans la demande de coach

**Mode :** Designer  
**Date :** 14 mars 2026  
**Contexte :** L’athlète remplit déjà « Objectifs et volume par sport » sur Mon profil (`weekly_target_hours`, `weekly_volume_by_sport`). On souhaite que ces informations soient visibles et éditables dans le formulaire de demande de coach, puis visibles par le coach dans la demande.

---

## 1. Reformulation du besoin

- **Quand** l’athlète envoie une demande de coaching à un coach, le **formulaire de demande** doit afficher :
  - **Temps à allouer par semaine** (une valeur globale en h/sem.)
  - **Volumes de distance par semaine** (par sport : km, m ou h selon sport, comme sur Mon profil).
- Si l’athlète a **déjà renseigné** ces champs sur Mon profil, ils doivent être **préremplis** dans le formulaire.
- À la soumission de la demande, ces valeurs sont **enregistrées dans le profil** athlète (`profiles.weekly_target_hours`, `profiles.weekly_volume_by_sport`).
- Le **coach** doit pouvoir **voir** ces informations (temps à allouer + volumes par sport) **dans la demande** (tile « Demande en attente » et/ou détail de la demande).

---

## 2. Cas d’usage identifiés

| Cas | Description |
|-----|-------------|
| **Nominal** | Athlète a déjà un profil avec temps/volumes → formulaire prérempli ; il peut modifier puis envoyer ; profil mis à jour ; coach voit temps + volumes dans la demande. |
| **Profil vide** | Athlète n’a jamais rempli temps/volumes → champs vides dans le formulaire ; il les remplit (optionnel ou obligatoire à trancher) ; à l’envoi, profil mis à jour ; coach voit les valeurs envoyées. |
| **Modification avant envoi** | Athlète modifie temps ou volumes dans le formulaire de demande → à l’envoi, le profil est mis à jour avec ces nouvelles valeurs. |
| **Erreur / limites** | Validation identique à Mon profil (ex. temps ≤ 168 h, nombres positifs). Message d’erreur si invalide. |
| **Vue coach** | Sur « Mes athlètes », **tout dans la tile** : offre choisie, sports, message, objectifs et volume (temps à allouer + volumes par sport) en lecture seule. Pas de modale. |

---

## 3. Réponses du PO (clarifications)

1. **Obligation des champs**  
   **Obligatoire** : temps à allouer et volumes par sport sont requis pour envoyer la demande.

2. **Deux formulaires de demande**  
   Aujourd’hui il existe :
   - **CoachDetailModal** (page Trouver un coach) : choix d’une offre + sports + besoin (+ prénom/nom si profil incomplet).
   - **RequestCoachButton** (modale standalone) : sports + besoin, sans offre.  
   → Voir **EXEMPLES_DEUX_CONTEXTES_FORMULAIRE.html** pour illustrer les deux contextes. À trancher : ajouter temps + volumes dans les deux ou uniquement dans le Contexte 1.

3. **Source d’affichage côté coach**  
   Pour afficher « temps à allouer + volumes » dans la demande :
   - **Option A** : Lecture du **profil** athlète à l’affichage (toujours à jour).
   - **Option B** : **Snapshot** dans `coach_requests` à la création de la demande (comme pour l’offre frozen_*), pour garder la trace de ce que l’athlète a indiqué au moment de la demande.  
   **Réponse PO :** Lire le profil de l'athlète (pas de snapshot).

4. **Triathlon / Trail**  
   **Oui, même logique** que Mon profil : triathlon → 3 tuiles (Course, Vélo, Natation) ; trail → D+/sem. dans la tuile Course.

---

## 4. Analyse de l’existant

### 4.1 Formulaire de demande (athlète)

- **CoachDetailModal** (`FindCoachSection.tsx`) : après sélection d’une offre, formulaire avec (selon cas) Prénom/Nom, **Sports pratiqués** (tuiles `SportTileSelectable`), **Besoin de coaching** (Textarea), bouton Envoyer. Pas de temps ni volumes.
- **RequestCoachButton** : modale avec Sports pratiqués + Besoin uniquement.
- Données envoyées : `createCoachRequest(coachId, sports, need, offerId?, locale?, firstName?, lastName?)`. Pas de `weekly_target_hours` ni `weekly_volume_by_sport`.

### 4.2 Profil athlète (Mon profil)

- Section **« Objectifs et volume par sport »** dans `ProfileForm.tsx` :
  - **Temps à allouer / semaine** : un champ numérique avec suffixe « h/sem. » (ou « h/week » EN).
  - **Volume par sport** : tuiles dynamiques selon `selectedPracticedSports` ; chaque tuile = sport + champ (km/sem., m/sem. ou h/sem. selon `getWeeklyVolumeUnit(sport)`). Trail → champ **D+/sem.** en plus dans la tuile Course.
- Composants / styles : `SPORT_ICONS`, `SPORT_CARD_STYLES`, `getWeeklyVolumeUnit` (`lib/sportStyles.ts`), labels i18n `profile.weeklyTargetSectionTitle`, `profile.weeklyTargetLabel`, `profile.suffixHoursPerWeek`, etc.

### 4.3 Vue coach (demande en attente)

- **PendingRequestTile** (`PendingRequestTile.tsx`) : une carte par demande avec avatar, nom, badges sports, ligne offre (titre + prix), message (« coaching_need »), boutons Discuter / Refuser / Accepter. Pas de temps ni volumes.
- Il n’existe pas aujourd’hui de modale « Détail demande » côté coach ; toute l’info est sur la tile. **Décision PO :** Pas de modale. Toutes les infos (offre, sports, message, objectifs et volume) sont affichées directement dans la tuile sur la page Mes athlètes.

---

## 5. Proposition de solutions UI

### Solution A — Section dédiée « Objectifs et volume » (alignée Mon profil)

- Dans le formulaire de demande (CoachDetailModal et éventuellement RequestCoachButton), ajouter une **section** entre « Sports pratiqués » et « Besoin de coaching » :
  - Titre : même libellé que sur Mon profil (ex. « Objectifs et volume par sport »).
  - **Temps à allouer / semaine** : une ligne avec label + champ numérique + suffixe « h/sem. » (réutilisation du style profil : `rounded-xl bg-stone-50 border border-stone-100`, label à gauche, champ à droite).
  - **Volumes par sport** : tuiles dynamiques **uniquement pour les sports déjà sélectionnés** dans « Sports pratiqués » du formulaire (Course, Vélo, Natation, etc.) avec même rendu que Mon profil (icône + nom sport + champ avec unité ; Trail → D+/sem. dans la tuile Course).
- **Composants** : réutiliser `SportTileSelectable` pour les sports ; pour temps + volumes, réutiliser la **structure et styles** de `ProfileForm` (pas de composant dédié aujourd’hui, donc soit extraire un petit bloc réutilisable « WeeklyTargetAndVolumes » pour profil + demande, soit dupliquer le markup avec les mêmes classes).
- **Avantage** : Cohérence forte avec Mon profil, l’athlète retrouve la même logique.  
- **Inconvénient** : Formulaire plus long ; sur mobile il faut scroller.

### Solution B — Bloc compact (une ligne temps + résumé volumes)

- **Temps à allouer** : une seule ligne (label + input h/sem.) comme en A.
- **Volumes** : au lieu de tuiles complètes, une **liste compacte** (ex. « Course 42 km/sem., Vélo 120 km/sem., Natation 2 500 m/sem. ») avec champs éditables inline ou petits inputs côte à côte, selon les sports sélectionnés.
- **Avantage** : Moins de hauteur, formulaire plus court.  
- **Inconvénient** : Moins aligné avec le visuel « tuiles » du profil ; unités (km/m/h) à bien indiquer pour chaque ligne.

### Solution C — Temps + volumes dans un bloc repliable

- Même contenu qu’en A (section complète temps + tuiles volumes), mais dans un **bloc repliable** (ex. « Objectifs et volume par sport ▼ »). Ouvert par défaut si au moins une valeur est préremplie, fermé sinon.
- **Avantage** : Réduit la longueur perçue du formulaire pour ceux qui ne remplissent pas ces champs.  
- **Inconvénient** : Un composant « accordion » ou dépliable à réutiliser ; risque d’être ignoré si fermé par défaut.

---

## 6. Recommandation et composants

- **Recommandation** : **Solution A** pour la cohérence avec Mon profil et la réutilisabilité des mêmes libellés/unités. Champs **obligatoires** (réponse PO). Si le formulaire devient trop long, on pourra ensuite introduire un repli (Solution C) sans changer le contenu.
- **Composants à utiliser tels quels** : `Button`, `Input`, `Textarea`, `SportTileSelectable`, `Badge` (côté coach), `Modal`, `AvatarImage` ; tokens et `lib/formStyles.ts` si applicable ; `SPORT_ICONS`, `SPORT_CARD_STYLES`, `getWeeklyVolumeUnit` depuis `lib/sportStyles.ts`.
- **Composants / blocs à faire évoluer ou extraire** :
  - **Formulaire de demande** : `CoachDetailModal` dans `FindCoachSection.tsx` (et éventuellement `RequestCoachButton.tsx`) — ajout de la section temps + volumes ; passage des props `initialWeeklyTargetHours`, `initialWeeklyVolumeBySport` depuis la page (profil athlète).
  - **Profil** : Optionnel — extraire un sous-composant « WeeklyTargetAndVolumes » partagé entre `ProfileForm` et le formulaire de demande pour éviter duplication (évolution douce).
  - **Vue coach** : Données **lecture profil athlète**. **Tout dans la tuile**, pas de modale. En-tête : avatar, nom, **tuiles sport (badges)** au-dessus de la ligne offre (ex. Suivi complet 49€/mois), puis boutons. Corps en **deux colonnes** : Message de l'athlète | Objectifs et volume (pas de bloc Offre ni bloc Sports en dessous). Alignement design system (labels, rounded-lg, border-stone-200, boutons px-4 py-2.5). Voir **MOCKUP_PAGE_ATHLETES_TILES_COMPLETES.html**.

---

## 7. Mockups

- **MOCKUP_REQUEST_FORM.html** : Formulaire de demande (Contexte 1) avec section Objectifs et volume (Solution A), champs obligatoires. **EXEMPLES_DEUX_CONTEXTES_FORMULAIRE.html** : illustre les deux contextes pour trancher où ajouter temps + volumes.
- **MOCKUP_PAGE_ATHLETES_TILES_COMPLETES.html** : Page Mes athlètes. Tuile : en-tête (nom, badges sport, ligne offre, actions) ; corps 2 colonnes (Message de l'athlète | Objectifs et volume). Pas de bloc Offre ni bloc Sports dans le corps. Design system respecté. Pas de modale.

**Note :** L’athlète voit sa demande dans `AthleteSentRequestDetailModal` (« Demande envoyée > »). Pour cohérence, on peut y afficher aussi temps à allouer + volumes en lecture seule (même source que côté coach).

---

## 8. User stories et prochaines étapes

- Répondre aux questions §3 (obligation, deux formulaires, snapshot vs profil, triathlon/trail).
- **User stories :** voir **USER_STORIES_REQUEST_WEEKLY_VOLUME.md**. **Spec technique (Architecte) :** voir **SPEC_REQUEST_WEEKLY_VOLUME.md** (fichiers, flux, BDD, RLS, logique métier). Découpage en **user stories** avec critères d’acceptation et référence aux mockups (quelle zone du mockup pour chaque US).
- Passation Architecte pour schéma BDD (snapshot ou pas), RLS, actions, puis Développeur pour implémentation.

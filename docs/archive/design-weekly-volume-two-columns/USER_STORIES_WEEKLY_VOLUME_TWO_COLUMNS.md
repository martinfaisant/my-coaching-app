# User Stories — Volume actuel + Volume maximum (Volumes hebdomadaires)

**Mode :** Designer  
**Date :** 17 mars 2026  
**Référence design :** `DESIGN_WEEKLY_VOLUME_TWO_COLUMNS.md`  
**Mockup :** `MOCKUP_WEEKLY_VOLUME_TWO_COLUMNS.html` (section « Volumes hebdomadaires » — deux colonnes horaires + grille volumes par sport)

---

## US 1 — Profil athlète : affichage des deux champs en deux colonnes

**En tant qu’** athlète, **je veux** voir dans Mon profil une section « Volumes hebdomadaires » avec **Volume actuel** (gauche) et **Volume maximum** (droite) en deux colonnes **afin de** renseigner mon volume actuel et mon volume maximum par semaine.

**Référence mockup :** `MOCKUP_WEEKLY_VOLUME_TWO_COLUMNS.html` — zone des deux blocs gris (rounded-xl bg-stone-50) avec label + input + « h/sem. » chacun.

**Critères d’acceptation :**
- La section **« Volumes hebdomadaires »** (titre de section) affiche en **première ligne** une **grille 2 colonnes** (`grid grid-cols-2 gap-3`), comme pour les tuiles volume par sport.
- **Colonne gauche :** label « Volume actuel » + champ de saisie (heures) + suffixe « h/sem. » (même style que l’actuel champ temps à allouer : input `w-28`, rounded-lg, suffixe à droite).
- **Colonne droite :** label « Volume maximum » + champ de saisie (heures) + suffixe « h/sem. » (même style).
- En dessous, la grille des tuiles volume par sport (Course, Vélo, Natation, etc.) est inchangée.
- Design system : tokens (stone, palette-forest-dark pour focus), `lib/formStyles.ts` si pertinent ; pas de couleur en dur.
- i18n : titre « Volumes hebdomadaires » (ex. `weeklyVolumesSectionTitle`), libellés « Volume actuel » et « Volume maximum » (ex. `weeklyCurrentHoursLabel`, `weeklyMaxHoursLabel`), FR et EN.

**Composants :** Structure actuelle de `ProfileForm.tsx` (section Objectifs et volume) ; réutilisation du pattern input + suffixe existant. Évolution : remplacer la ligne unique « Temps à allouer / semaine » par la grille 2 colonnes (Volume actuel | Volume maximum) et renommer le titre en « Volumes hebdomadaires ».

---

## US 2 — Profil athlète : enregistrement Volume horaire actuel et Volume horaire max possible

**En tant qu’** athlète, **je veux** que les valeurs « Volume horaire actuel » et « Volume horaire max possible » soient enregistrées avec mon profil **afin que** elles soient disponibles pour les demandes de coaching et pour le coach.

**Référence mockup :** Même section que US1 ; bouton « Enregistrer » existant en tête de formulaire.

**Critères d’acceptation :**
- À la soumission du formulaire profil (bouton Enregistrer), les deux champs sont envoyés et persistés (nouveau champ « Volume actuel » + champ existant pour « Volume maximum », ex. `weekly_target_hours` conservé pour le max).
- Feedback succès/erreur identique au reste du formulaire (message validation profil).
- Préremplissage à l’ouverture de la page si des valeurs existent déjà.

**Données :** Nouveau champ en base pour « Volume actuel » (à définir en spec Architecte, ex. `weekly_current_hours`). Champ existant `weekly_target_hours` = « Volume maximum ».

---

## US 3 — Formulaire de demande de coaching : section Volumes hebdomadaires en deux colonnes

**En tant qu’** athlète, **je veux** voir dans le formulaire de demande de coach la même disposition (Volume actuel à gauche, Volume maximum à droite) **afin de** renseigner ou ajuster ces infos au moment de ma demande.

**Référence mockup :** `MOCKUP_WEEKLY_VOLUME_TWO_COLUMNS.html` — même zone deux colonnes ; contexte = formulaire dans la modale de demande (FindCoachSection).

**Critères d’acceptation :**
- Dans le formulaire de demande (CoachDetailModal / FindCoachSection), la section **« Volumes hebdomadaires »** affiche la **grille 2 colonnes** (Volume actuel | Volume maximum), puis la grille des volumes par sport.
- Libellés et suffixe « h/sem. » identiques au profil (i18n partagé).
- Si le profil contient déjà les deux valeurs, les champs sont **préremplis** à l’ouverture.
- À l’envoi de la demande : mise à jour du profil athlète (comme aujourd’hui) + snapshot dans la demande (coach_requests ou équivalent) pour les deux champs (actuel + max).

**Composants :** `FindCoachSection.tsx` — même évolution que `ProfileForm.tsx` pour la section « Volumes hebdomadaires ».

---

## US 4 — Formulaire de demande : obligatoire et validation

**En tant qu’** athlète, **je veux** que les champs Volume actuel et Volume maximum soient obligatoires et validés **afin que** le coach reçoive des données cohérentes.

**Référence mockup :** Même formulaire ; bouton « Envoyer la demande » désactivé ou message d’erreur si invalide.

**Critères d’acceptation :**
- **Les deux champs sont obligatoires** (profil + demande).
- Règles de validation : nombres positifs, plafond raisonnable (ex. ≤ 168 h) pour les deux champs. **Pas de règle** « Volume actuel ≤ Volume maximum » (le volume actuel peut être supérieur au volume maximum).
- Bouton « Envoyer la demande » désactivé ou message d’erreur à la soumission lorsque l’un des deux (ou les volumes par sport) est vide/invalide.
- Messages d’erreur en i18n (namespace profil ou findCoach), FR et EN.

---

## US 5 — Vue coach : affichage des deux lignes dans la demande en attente

**En tant que** coach, **je veux** voir dans la tuile « Demande en attente » (PendingRequestTile) les deux lignes « Volume actuel » et « Volume maximum » en lecture seule **afin de** mieux évaluer la demande.

**Référence mockup :** Zone « Volumes hebdomadaires » (ou équivalent) de la tuile demande — afficher deux lignes (actuel + max).

**Critères d’acceptation :**
- Dans le bloc Objectifs et volume / Volumes hebdomadaires de `PendingRequestTile`, affichage de **deux lignes** lorsque les données sont présentes :
  - « Volume actuel : X h/sem. »
  - « Volume maximum : Y h/sem. »
- Style cohérent avec l’existant (ligne avec icône horloge ou équivalent, texte stone-800).
- Si une seule valeur est renseignée, n’afficher que la ligne correspondante.
- i18n : libellés courts pour la vue coach (ex. `pendingRequests.weeklyCurrentHoursLabel`, `pendingRequests.weeklyMaxHoursLabel`), FR et EN.

**Composants :** `PendingRequestTile.tsx` — évolution du bloc (lecture seule).

---

## Synthèse des zones du mockup

| Zone | Fichier mockup | Contenu |
|------|----------------|--------|
| Titre section | `MOCKUP_WEEKLY_VOLUME_TWO_COLUMNS.html` | « Volumes hebdomadaires » |
| Ligne des deux champs horaires | Idem | Grille 2 colonnes : Volume actuel (gauche), Volume maximum (droite), chaque bloc avec label + input + « h/sem. » |
| Grille volumes par sport | Idem | Tuiles Course, Vélo, Natation, Musculation (inchangées) |

---

## Éléments du design system à utiliser

- **Tokens :** `stone-50`, `stone-100`, `stone-200`, `stone-300`, `stone-700`, `stone-800`, `palette-forest-dark` (focus).
- **Composants existants :** Input (ou champs natifs avec classes du design system), `SPORT_ICONS`, `SPORT_CARD_STYLES` pour les tuiles volume.
- **Styles formulaire :** `lib/formStyles.ts` (FORM_BASE_CLASSES, etc.) ; pattern input + suffixe comme dans `ProfileForm.tsx` / `FindCoachSection.tsx`.
- **Pas de nouveau composant partagé obligatoire** ; si extraction d’un sous-composant « champ avec suffixe » réutilisable, le documenter dans `docs/DESIGN_SYSTEM.md`.

---

## Checklist avant livraison (Designer)

- [x] Design system consulté
- [x] Mockup validé visuellement (section « Volumes hebdomadaires » avec deux colonnes + volumes sport)
- [x] Chaque US liée à une zone du mockup
- [x] Éléments du design system à utiliser cités
- [x] Réponses PO intégrées : libellés « Volume actuel », « Volume maximum », « Volumes hebdomadaires » ; obligatoire ; pas de règle actuel ≤ max ; deux lignes côté coach

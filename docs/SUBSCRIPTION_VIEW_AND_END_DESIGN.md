# Vue et résiliation de la souscription – Brief design & User stories

**Mode :** Designer  
**Date :** 18 février 2026  
**Statut :** Validé PO (réponses aux questions de clarification)

---

## 1. Récapitulatif des décisions PO

| Question | Décision |
|----------|----------|
| **Historique** | Athlète et coach ont un **historique des souscriptions passées** dans un **endroit dédié** (section/page « Historique »), séparé de la souscription active. |
| **Données après fin** | Rien n’est perdu. L’athlète **conserve l’accès à son historique** (entraînements passés, etc.). Le coach **conserve les entraînements créés** mais **n’a plus accès aux données live** de cet athlète (activités réalisées, volumes horaires). L’athlète est traité comme **« archivé »** dans un historique côté coach. |
| **Confirmation** | **Modal de confirmation** avant d’exécuter « Mettre fin à la souscription ». |
| **Date de fin** | **Free ou tarification unique** → fin **immédiate**. **Paiement mensuel** → fin **au prochain cycle de facturation** (ex. : début 4 mars, résiliation 7 juin → contrat jusqu’au 4 juillet). |
| **Coach – Où voir la souscription ?** | (1) Sur la **tuile athlète** : identifier la souscription + moyen d’aller au détail. (2) **Page dédiée** pour visualiser l’ensemble des souscriptions (affichage simple pour l’instant ; statistiques dans une feature ultérieure). |
| **Athlète – Où voir la souscription ?** | Dans **Mon Coach** : bloc « Ma souscription » (ou équivalent) sur la page existante. |

---

## 2. Règles métier à respecter

### 2.1 Fin de souscription

- **`price_type` free ou one_time**  
  - Résiliation → **fin immédiate** : `status = 'cancelled'`, `end_date = NOW()` (ou date du jour).

- **`price_type` monthly**  
  - Résiliation → **fin au prochain cycle** : `end_date` = date anniversaire du cycle suivant (ex. : `start_date` = 4 mars → si résiliation le 7 juin, `end_date` = 4 juillet).  
  - Jusqu’à `end_date`, la souscription reste **active** (accès inchangés).  
  - **Prérequis technique :** la souscription doit connaître le type de tarification (ex. `frozen_price_type` sur `subscriptions` et/ou sur `coach_requests` au snapshot). À préciser en phase Architecte.

### 2.2 Après la fin (archivage)

- **Côté athlète**  
  - Garde l’accès à : calendrier / historique des entraînements passés, objectifs, historique de souscription.  
  - N’a plus de « coach actif » : `profiles.coach_id` remis à `null` (ou équivalent selon modèle).  
  - Redirigé vers « Trouver un coach » / dashboard athlète sans coach (comportement actuel quand `!coach_id`).

- **Côté coach**  
  - Garde : les entraînements déjà créés pour cet athlète (données conservées).  
  - Perd : accès aux **données live** de cet athlète (activités réalisées, volumes horaires, etc.).  
  - L’athlète apparaît dans une liste **« Athlètes archivés » / Historique** (pas dans la liste « Mes athlètes » actifs).

### 2.3 Historique dédié

- **Athlète** : une section ou page **« Historique des souscriptions »** (dédiée) listant les souscriptions passées (cancelled), avec détail possible (offre figée, dates, coach). Pas de mélange avec la souscription active.
- **Coach** : une section ou page **« Historique des souscriptions »** (ou intégrée à la page « Souscriptions » avec onglet/filtre) listant les souscriptions passées par athlète. Les athlètes concernés sont « archivés » (liste séparée des athlètes actifs).

---

## 3. Solutions UI (mockups décrits)

Composants et tokens à réutiliser : `docs/DESIGN_SYSTEM.md` (Button, Badge, Modal, DashboardPageShell, TileCard, palette, typo).

**Couleur de la bordure gauche des tuiles souscription (règle visuelle) :**
- **Souscription active** → **vert** : `border-l-palette-forest-dark`
- **Souscription terminée** (historique) → **gris** : `border-l-stone-400`

---

### 3.1 Athlète – Page « Mon Coach »

- **Emplacement :** Sur la page existante **Mon Coach** (`/dashboard/coach`), après le bloc profil du coach (sports, langues, présentation) et **avant** la section « Avis ».
- **Bloc « Ma souscription »** (titre H2, style cohérent avec la page) :
  - **Si souscription active :**
    - Titre de l’offre figée (`frozen_title`).
    - Description courte si besoin (`frozen_description` tronquée ou sur une ligne).
    - Prix / type : affichage selon `frozen_price` et type (free / one_time / monthly) – ex. « Gratuit », « 50 € (unique) », « 30 € / mois ».
    - Dates : « Du [start_date] » et, si monthly et résiliation programmée : « Fin prévue le [end_date] », sinon « En cours ».
    - **Bouton** : « Mettre fin à la souscription » (variant `outline` ou `muted`, style secondaire). Au clic → **ouverture de la modal de confirmation**.
  - **Si pas de souscription active** (cas rare sur cette page car on n’y accède qu’avec un coach) : ne pas afficher le bloc ou afficher un message court du type « Aucune souscription active ».
- Il n’y a **pas** de bouton « Voir l’historique des souscriptions » sur cette page. L’historique est accessible via une **page dédiée dans la sidebar** athlète (voir 3.2).

**Modal de confirmation (athlète et coach)**  
- Titre : type « Mettre fin à la souscription ? »  
- Corps : rappel des conséquences (ex. « Vous n’aurez plus accès au programme et au chat avec [Coach]. Votre historique restera consultable. ») et, si monthly : « La souscription restera active jusqu’au [end_date]. »  
- Boutons : « Annuler » (variant `muted`), « Mettre fin » (variant **`danger`** du design system : `text-stone-700` au repos, `hover:text-palette-danger hover:bg-palette-danger-light` — pas de fond rouge plein).  
- Composant : **Modal** du design system.

---

### 3.2 Athlète – Historique des souscriptions (endroit dédié)

- **Emplacement :** Page dédiée, ex. `/dashboard/subscriptions/history`, accessible via un **item dédié dans la sidebar** athlète (« Historique des souscriptions »). Pas de lien depuis Mon Coach.
- **En-tête :** Identique aux autres pages du site (même composant / même style que les autres pages dashboard). Voir design system et éventuelle US « Cohérence des en-têtes ».
- **Contenu :** Liste simple des souscriptions **passées** (status = cancelled), la plus récente en premier.
- **Tuile historique (identique athlète et coach) :** style **TileCard** avec **bordure gauche grise** (`border-l-stone-400`) pour les souscriptions terminées. **Même structure** pour les deux rôles. Contenu : **nom** (coach pour l’athlète, athlète pour le coach) + libellé rôle, **titre de l’offre**, **descriptif** (frozen_description, tronqué sur 2 lignes max), **prix/type** et **période** (start_date → end_date) sur une seule ligne, badge « Terminée ». **Mise en page compacte** pour limiter l’espace vide (bloc unique, hiérarchie claire, pas de lignes vides inutiles).
- Pas d’action « Mettre fin » (déjà terminée).
- **Affichage simple** : pas de stats pour cette feature ; évolution prévue plus tard.

---

### 3.3 Coach – Tuile athlète (liste « Mes athlètes »)

- **Emplacement :** Sur chaque **AthleteTile** de la page dashboard coach (`/dashboard`), en plus des infos existantes (objectif, planifié jusqu’à, lien « Voir le planning »).
- **Ajout :**
  - À la place d’un badge « Souscription active », afficher le **titre de la souscription** (frozen_title) avec une **petite flèche** à droite. Pas de bouton « Voir la souscription ».
  - **Au clic sur la tuile** (ou sur la zone souscription), ouverture du **détail de la souscription dans une modale** (voir 3.5).
- Les athlètes **archivés** (souscription terminée) ne sont **pas** dans cette liste ; ils sont dans la section « Historique / Athlètes archivés » (voir 3.4).

---

### 3.4 Coach – Page dédiée « Souscriptions »

- **Emplacement :** Nouvelle page, ex. `/dashboard/subscriptions`. Entrée dans la **sidebar** coach : nouvel item « Souscriptions » (icône + libellé).
- **En-tête :** Identique aux autres pages du site (cohérence avec le design system).
- **Contenu (affichage simple pour cette feature) :**
  - **Souscriptions actives** : liste/cartes des souscriptions avec status = active. Tuiles au style **TileCard** avec **bordure gauche verte** (`border-l-palette-forest-dark`) pour les actives.
    - Pour chaque entrée : nom de l’athlète (lien vers fiche athlète ou clic pour ouvrir détail en modale), offre figée (titre, prix/type), dates (début, fin prévue si monthly résilié), bouton « Mettre fin » (→ même modal de confirmation que côté athlète).
  - **Historique** : souscriptions passées avec la **même tuile** que l’athlète (voir 3.2) : titre, **descriptif** (tronqué), prix/type, période, badge Terminée ; **bordure gauche grise** (`border-l-stone-400`) pour les terminées.
- **Évolution prévue** : statistiques et enrichissements dans une feature ultérieure ; rester simple ici (liste, filtres basiques si besoin).

---

### 3.5 Coach – Détail d’une souscription (modale)

- **Accès :** Au **clic sur la tuile athlète** (zone souscription avec titre + flèche) ou depuis la page « Souscriptions » (clic sur une ligne/carte).
- **Affichage :** Le détail s’ouvre dans une **modale** (composant Modal du design system), pas dans une page dédiée.
- **Contenu de la modale :** Même type d’informations que le bloc « Ma souscription » côté athlète : nom de l’athlète, offre figée (titre, description, prix/type), dates (début, fin prévue si applicable), bouton « Mettre fin à la souscription » (ouvre la modal de confirmation).

---

### 3.6 Coach – Athlètes archivés / Historique

- **Principe :** Les athlètes dont la souscription est terminée (cancelled) sont **exclus** de la liste « Mes athlètes » (dashboard principal) et listés dans un **espace dédié** « Athlètes archivés » ou « Historique des souscriptions ».
- **Emplacement :** Soit onglet/section sur la page « Souscriptions » (liste « Historique »), soit page dédiée « Athlètes archivés » avec liste en lecture seule (nom, période de souscription, pas d’accès aux données live).  
- **Comportement :** Le coach peut voir qu’il a coaché cet athlète et la période, mais ne peut plus accéder à son calendrier / activités / volumes. Les entraînements déjà créés restent stockés (pour l’athlète qui les voit dans son historique).

---

## 4. User stories et critères d’acceptation

### US1 – Athlète : voir la souscription active sur Mon Coach

**En tant qu’** athlète ayant un coach et une souscription active,  
**je veux** voir les détails de ma souscription (offre, prix/type, dates) sur la page Mon Coach,  
**afin de** savoir à quoi je suis engagé.

**Critères d’acceptation :**
- Sur `/dashboard/coach`, un bloc « Ma souscription » (ou libellé i18n équivalent) affiche la souscription active liée à mon coach.
- Sont affichés : titre de l’offre figée, description (éventuellement tronquée), prix et type (free / one_time / monthly), date de début, et si applicable « Fin prévue le [date] ».
- Si je n’ai pas de souscription active, le bloc n’affiche pas de souscription active (ou message explicite).
- Il n’y a pas de lien « Voir l’historique » sur cette page ; l’historique est accessible via la sidebar (voir US3).

---

### US2 – Athlète : mettre fin à la souscription (avec confirmation)

**En tant qu’** athlète,  
**je veux** pouvoir mettre fin à ma souscription depuis Mon Coach, avec une confirmation claire,  
**afin de** résilier en connaissance de cause.

**Critères d’acceptation :**
- Depuis le bloc « Ma souscription » sur Mon Coach, un bouton « Mettre fin à la souscription » ouvre une **modal de confirmation**.
- La modal décrit les conséquences (plus d’accès au programme et au chat avec le coach ; historique conservé) et, pour un abonnement **monthly**, indique que la souscription restera active jusqu’au [date de fin de cycle].
- Actions : « Annuler » (ferme la modal) et « Mettre fin » (confirme).
- Après confirmation :
  - **Free / one_time** : fin immédiate (status cancelled, end_date = jour de l’action).
  - **Monthly** : end_date fixée au prochain cycle ; la souscription reste active jusqu’à cette date.
- Après prise en compte de la fin (immédiate ou à end_date), l’athlète n’a plus de coach actif (comportement existant sans coach) et retrouve le flux « Trouver un coach » / dashboard sans coach.
- En cas d’erreur serveur, un message d’erreur est affiché et la modal peut être fermée sans changer l’état.

---

### US3 – Athlète : consulter l’historique des souscriptions (endroit dédié)

**En tant qu’** athlète,  
**je veux** consulter mes souscriptions passées dans un endroit dédié « Historique »,  
**afin de** revoir les offres et périodes sans mélanger avec la souscription active.

**Critères d’acceptation :**
- Une page dédiée « Historique des souscriptions » est accessible via un **item dans la sidebar** athlète (pas depuis Mon Coach).
- L’en-tête de la page est **identique** aux autres pages du site (design system).
- Les entrées utilisent la **tuile historique** (TileCard, **bordure gauche grise** `border-l-stone-400`), **identique à celle du coach** (voir page Souscriptions > Historique).
- Chaque entrée affiche : coach (nom), titre de l’offre, **descriptif** (tronqué), prix/type, période (start_date → end_date), badge « Terminée ». Mise en page **compacte** pour limiter l’espace vide.
- Aucune action « Mettre fin » sur les souscriptions déjà terminées.

---

### US4 – Coach : identifier la souscription sur la tuile athlète et accéder au détail

**En tant que** coach,  
**je veux** voir sur chaque tuile athlète qu’une souscription est en cours et pouvoir ouvrir son détail,  
**afin de** gérer rapidement les souscriptions depuis la liste des athlètes.

**Critères d’acceptation :**
- Sur la page « Mes athlètes » (dashboard coach), chaque tuile d’athlète avec souscription active affiche le **titre de la souscription** (frozen_title) avec une **flèche** à droite. Pas de bouton « Voir la souscription ».
- Au **clic sur la tuile** (ou sur la zone souscription), le **détail de la souscription** s’ouvre dans une **modale**.
- Le détail en modale affiche : athlète, offre figée (titre, description, prix/type), dates (début, fin prévue si applicable), bouton « Mettre fin à la souscription ».

---

### US5 – Coach : page dédiée « Souscriptions » (liste simple)

**En tant que** coach,  
**je veux** une page dédiée listant mes souscriptions (actives puis historique),  
**afin de** avoir une vue d’ensemble simple (à enrichir plus tard avec des stats).

**Critères d’acceptation :**
- Une page **Souscriptions** (ex. `/dashboard/subscriptions`) est accessible depuis la **sidebar** coach (nouvel item de menu).
- L’en-tête de la page est **identique** aux autres pages du site.
- La page affiche au moins :
  - **Souscriptions actives** : tuiles au style TileCard avec **bordure gauche verte** (`border-l-palette-forest-dark`) ; athlète, offre figée, dates ; clic pour ouvrir détail en modale ; bouton « Mettre fin ».
  - **Historique** : **même tuile** que l’athlète (titre, descriptif tronqué, prix/type, période, badge Terminée) ; **bordure gauche grise** (`border-l-stone-400`).
- Affichage simple (pas de stats pour cette feature).

---

### US6 – Coach : mettre fin à la souscription (avec confirmation)

**En tant que** coach,  
**je veux** pouvoir mettre fin à une souscription (depuis le détail ou la page Souscriptions), avec une modal de confirmation,  
**afin de** résilier proprement.

**Critères d’acceptation :**
- Depuis le **détail en modale** d’une souscription active ou depuis la page Souscriptions, un bouton « Mettre fin à la souscription » ouvre la **même modal de confirmation** que côté athlète (texte adapté : conséquences pour l’athlète et pour le coach – archivage, plus d’accès aux données live).
- Le bouton « Mettre fin » dans la modal utilise le variant **danger** du design system (texte stone au repos, hover danger + fond danger-light).
- Règles de date de fin identiques : **free / one_time** → immédiat ; **monthly** → fin au prochain cycle.
- Après confirmation, la souscription passe en cancelled et `end_date` est renseigné.
- L’athlète concerné est retiré de la liste « Mes athlètes » actifs et apparaît dans l’**historique / athlètes archivés** (voir US7).
- Gestion d’erreur : message affiché en cas d’échec, modal fermable sans changer l’état.

---

### US7 – Coach : athlètes archivés (historique dédié)

**En tant que** coach,  
**je veux** que les athlètes dont la souscription est terminée soient listés dans un espace « Athlètes archivés » / Historique, sans accès à leurs données live,  
**afin de** conserver la trace sans mélanger avec les athlètes actifs.

**Critères d’acceptation :**
- Les athlètes dont la souscription est **cancelled** (et end_date passée si on gère la fin au cycle) **n’apparaissent plus** dans la liste « Mes athlètes » du dashboard principal.
- Ils sont listés dans un **espace dédié** « Athlètes archivés » ou « Historique des souscriptions » (page ou section), en lecture seule : nom, période de souscription, pas d’accès au calendrier / activités / volumes de cet athlète.
- Les entraînements déjà créés pour cet athlète restent en base ; l’athlète peut toujours les voir dans son historique.

---

### US8 – Design system : cohérence des en-têtes

**En tant que** équipe produit,  
**je veux** que toutes les pages dashboard utilisent le même style d’en-tête (composant et classes),  
**afin de** garantir une cohérence visuelle et éviter les écarts (ex. hauteur, bordure, fond).

**Critères d’acceptation :** voir la **user story technique** détaillée dans la spec : `docs/SUBSCRIPTION_VIEW_AND_END_SPEC.md` section 9 « User story technique – Cohérence des en-têtes (US8) ». En résumé : design system documente l’en-tête canonique ; nouvelles pages utilisent `DashboardPageShell` / `PageHeader` ; revue des pages existantes et checklist pour les futures pages.

---

### US9 – Données et modèle (pour l’Architecte)

**Prérequis techniques pour la logique de fin :**
- La souscription doit porter le **type de tarification** (free / one_time / monthly) pour calculer la fin au prochain cycle. Si absent aujourd’hui, ajouter ex. `frozen_price_type` sur `subscriptions` (et éventuellement sur `coach_requests` au snapshot).
- **RLS / policies :** l’athlète doit pouvoir **mettre à jour** sa souscription (status, end_date) pour l’action « Mettre fin » ; aujourd’hui seul le coach peut UPDATE. À définir (policy UPDATE pour athlete_id = auth.uid()).
- **Archivage coach :** règles d’accès aux données « live » (activités, volumes) pour les athlètes archivés : exclusion dans les requêtes ou flag « archivé » selon le modèle retenu.

---

## 5. Synthèse pour la phase Architecte

- **Nouveaux écrans / routes :**  
  - Athlète : bloc sur Mon Coach (sans lien historique) ; **item sidebar « Historique des souscriptions »** ; page `/dashboard/subscriptions/history` avec tuiles TileCard.  
  - Coach : item sidebar « Souscriptions » ; page `/dashboard/subscriptions` (actives + historique, tuiles avec couleurs actives vs inactives) ; **détail souscription en modale** (pas de page dédiée) ; espace « Athlètes archivés » / historique.
- **Modèle / données :**  
  - `frozen_price_type` (ou équivalent) sur `subscriptions` ; snapshot possible sur `coach_requests`.  
  - RLS : UPDATE subscription par l’athlète pour résiliation.  
  - Règles d’archivage : `profiles.coach_id` à null à la fin ; exclusion des athlètes archivés de la liste « Mes athlètes » et des données live.
- **i18n :** Tous les libellés (Ma souscription, Mettre fin, Historique, modal, etc.) en FR/EN via next-intl (`docs/I18N.md`).
- **Composants :** Réutilisation de Modal, Button (variant danger pour « Mettre fin »), Badge, DashboardPageShell, **TileCard** (bordure gauche colorée pour listes souscriptions), cartes et tokens du design system.

---

**Document à utiliser en entrée de la phase Architecte** pour la spec technique (tables, migrations, RLS, flux) puis en entrée Développeur pour l’implémentation.

---

→ **Spec technique (Architecte) :** `docs/SUBSCRIPTION_VIEW_AND_END_SPEC.md`


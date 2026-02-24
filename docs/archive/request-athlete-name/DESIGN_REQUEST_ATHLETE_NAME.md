# Design : Nom et prénom obligatoires pour une demande de coaching

**Mode :** Designer  
**Date :** 23 février 2026  
**Contexte :** Lorsqu’un athlète envoie une demande à un coach, le coach doit pouvoir l’identifier par nom et prénom. Aujourd’hui ces champs sont optionnels dans le profil ; on souhaite **forcer** la saisie de nom et prénom au moment de la demande.

---

## 1. Reformulation du besoin

- **Objectif :** Garantir que toute demande de coaching soit associée à un athlète ayant renseigné **prénom** et **nom** (affichés côté coach dans les demandes en attente, chat, etc.).
- **Contraintes :** Ne pas bloquer définitivement l’athlète ; proposer un parcours clair (compléter l’info puis envoyer la demande).
- **Périmètre :** Points d’entrée actuels de la demande :
  - **RequestCoachButton** : bouton « Choisir ce coach » sur la carte coach → modale (sports pratiqués + besoin).
  - **CoachDetailModal** : détail d’un coach (offres, bio) → formulaire (sport + besoin + choix d’offre).

---

## 2. Cas à couvrir

| Cas | Description |
|-----|-------------|
| **Nominal (profil complet)** | L’athlète a déjà `first_name` et `last_name` dans son profil → envoi de demande sans étape supplémentaire. |
| **Profil incomplet** | L’athlète n’a pas renseigné prénom et/ou nom → on doit collecter ces infos avant ou pendant la demande. |
| **Erreur / validation** | Champs vides, trop longs, caractères non souhaités → messages d’erreur clairs (i18n). |
| **Limites** | Un seul « profil » par utilisateur : les infos nom/prénom sont stockées dans `profiles` et réutilisées partout (demandes, chat, liste coach). |

---

## 3. Questions au PO (avant de figer une solution)

1. **Source de vérité :** Souhaitez-vous que le nom/prénom saisi soit **toujours enregistré dans le profil** (pour réutilisation partout : chat, « Mes athlètes », etc.) ou acceptez-vous un envoi ponctuel uniquement dans la demande (stockage limité à la demande) ?  
   → Oui il faut l,enregistrer dans le profil. Dailleurs il ne faut demander l'info que si celle-ci n'est pas renseigné dans le profil.

2. **Moment de la vérification :**  
   → **Au clic sur « Voir le détail »** (ouverture de la modale détail coach). On vérifie alors si le profil athlète a prénom et nom ; si non, le formulaire dans la modale affiche les champs Prénom/Nom (solution B).

3. **Bandeau dashboard athlète :** Souhaitez-vous un bandeau type « Complétez votre profil (nom, prénom) pour pouvoir envoyer des demandes » sur le dashboard quand le profil est incomplet (comme pour le coach « Complétez votre profil »), en plus du flow dans la modale ? non

---

## 4. Contexte retenu : modale détail coach uniquement

Le flux de demande (avec ou sans collecte du nom/prénom) se fait **dans la modale où figurent la présentation du coach et les offres** (CoachDetailModal). Les mockups B et C ci‑dessous reproduisent ce contexte : header coach (avatar, nom, note, sports, langues), bio, grille d’offres, puis formulaire.

---

## 5. Propositions de flow UX (B et C — A écartée)

**Solution A (redirection vers le profil)** a été écartée par le PO. Les solutions B et C sont détaillées et mockupées **dans le contexte de la modale détail coach** (présentation + offres).

---

### Solution A — Blocage + redirection vers le profil (écartée)

**Principe :** Si l’athlète n’a pas prénom et nom dans le profil, on n’ouvre pas le formulaire de demande. On affiche une modale (ou un message dans la modale) qui explique qu’il faut compléter le profil, avec un seul CTA : « Compléter mon profil » → redirection vers `/dashboard/profile`.

**Flow :**
1. Clic « Choisir ce coach » ou ouverture détail coach + « Envoyer une demande ».
2. Vérification côté client (ou serveur) : `first_name` et `last_name` renseignés ?
   - **Oui** → ouvrir le formulaire de demande habituel (sports, besoin, offre si détail).
   - **Non** → afficher une modale « Pour envoyer une demande, indiquez votre prénom et nom » + bouton « Compléter mon profil » (lien vers `/dashboard/profile`). Pas de formulaire de demande.
3. Après complétion du profil, l’athlète revient sur le dashboard et peut rouvrir la demande.

**Composants à utiliser tels quels :**  
`Button`, `Modal` (ou overlay + contenu type modal), design tokens (couleurs, typo).

**Composants à faire évoluer :**  
- `RequestCoachButton` : avant d’ouvrir la modale formulaire, vérifier (via props ou fetch) si le profil a nom/prénom ; si non, afficher la modale « Compléter profil ».  
- `FindCoachSection` / `CoachDetailModal` : idem (vérification avant affichage du formulaire d’envoi).  
- Optionnel : passer depuis la page dashboard les props `athleteFirstName`, `athleteLastName` (ou `isProfileNameComplete`) pour éviter un appel supplémentaire.

**Mockup A — Modale « Compléter votre profil » (profil incomplet) :**  
Voir fichier `docs/design-request-athlete-name/mockup-a-redirect-profile.html`.

---

### Solution B — Champs Prénom / Nom dans la modale de demande

**Principe :** Le formulaire de demande (RequestCoachButton et CoachDetailModal) inclut toujours deux champs **Prénom** et **Nom**, préremplis depuis le profil si déjà renseignés, obligatoires. À l’envoi : mise à jour du profil (first_name, last_name) puis création de la demande comme aujourd’hui.

**Flow :**
1. Ouverture de la modale de demande (carte coach ou détail).
2. Formulaire : **Prénom**, **Nom** (en tête), puis sports pratiqués, besoin, (et choix d’offre dans le détail). Tous obligatoires.
3. Submit : (1) mise à jour du profil si prénom/nom modifiés ou vides côté profil, (2) création de la demande. Pas de redirection.

**Composants à utiliser tels quels :**  
`Input`, `Button`, `Textarea`, `SportTileSelectable`, `Modal` (ou structure actuelle), `lib/formStyles.ts`, tokens.

**Composants à faire évoluer :**  
- `RequestCoachButton` : ajouter deux champs `Input` (Prénom, Nom), état local + préremplissage si on reçoit les valeurs du profil en props.  
- `CoachDetailModal` : idem.  
- Server action `createCoachRequest` : accepter optionnellement `firstName`, `lastName` (ou les lire du formulaire) et faire un `update` sur `profiles` avant l’`insert` dans `coach_requests`.  
- Page dashboard : passer `athleteFirstName`, `athleteLastName` à `FindCoachSection` pour préremplir.

**Mockups B (contexte modale détail coach) :**  
- **Un seul écran** : même modale que l’actuelle (header coach, bio, offres), avec le formulaire « Complétez votre demande » qui inclut **Prénom** et **Nom** en tête lorsque le profil ne les a pas encore (cf. réponses PO §3.1 : ne demander l’info que si non renseignée). Si le profil est déjà complet, le formulaire s’affiche sans ces champs (comme l’écran 2 de la solution C). Le mockup montre le cas « profil incomplet ».  
- Fichier : `docs/design-request-athlete-name/mockup-b-coach-detail-full.html`.

---

### Solution C — Étape « Identité » puis formulaire de demande

**Principe :** Si le profil n’a pas prénom/nom, la modale affiche d’abord une **première étape** « Comment vous appeler ? » (Prénom + Nom). Bouton « Continuer » enregistre dans le profil puis affiche le formulaire de demande (sports, besoin, offre). Si le profil est déjà complet, on affiche directement le formulaire de demande (une seule étape).

**Flow :**
1. Clic « Choisir ce coach » ou ouverture détail + envoi demande.
2. Vérification : profil avec prénom et nom ?
   - **Oui** → afficher directement le formulaire de demande (comportement actuel + validation côté serveur).
   - **Non** → afficher l’étape 1 : titre « Comment vous appeler ? », champs Prénom, Nom, bouton « Continuer ».
3. Clic « Continuer » : sauvegarde profil (first_name, last_name), puis affichage du formulaire de demande (étape 2) dans la même modale.
4. Envoi du formulaire de demande comme aujourd’hui.

**Composants à utiliser tels quels :**  
`Input`, `Button`, `Textarea`, `SportTileSelectable`, `Modal` (ou structure actuelle), `lib/formStyles.ts`, tokens.

**Composants à faire évoluer :**  
- `RequestCoachButton` : état `step` (1 = identité, 2 = demande) ; si profil incomplet → step 1, sinon step 2. Step 1 : formulaire Prénom/Nom + action « save profile » puis passage à step 2.  
- `CoachDetailModal` : même logique à deux étapes.  
- Nouvelle server action (ou réutilisation) pour « update profile name only » (prénom, nom) appelée depuis l’étape 1.  
- Page dashboard : passer `isProfileNameComplete` (ou first_name/last_name) pour décider de l’étape initiale.

**Mockups C (contexte modale détail coach) — deux écrans :**  
- **Écran 1** (profil incomplet) : même header coach ; le corps de la modale affiche uniquement l’étape « Comment vous appeler ? » (Prénom, Nom, bouton « Continuer ») et un indicateur d’étape (1/2).  
  - Fichier : `docs/design-request-athlete-name/mockup-c-coach-detail-step1.html`.  
- **Écran 2** (après « Continuer ») : même header ; le corps affiche le contenu actuel : bio, offres, formulaire (sports, besoin, Envoyer) **sans** champs Prénom/Nom (déjà saisis à l’étape 1).  
  - Fichier : `docs/design-request-athlete-name/mockup-c-coach-detail-step2.html`.

---

## 6. Synthèse comparative

| Critère | A — Redirection profil | B — Champs dans la modale | C — Étape identité |
|--------|-------------------------|----------------------------|---------------------|
| **Friction** | Plus forte (quitter la page) | Faible (tout dans la modale) | Moyenne (une étape de plus si incomplet) |
| **Cohérence profil** | Très forte (une seule source) | Forte (mise à jour à l’envoi) | Forte (mise à jour à « Continuer ») |
| **Clarté** | Très claire (« allez compléter votre profil ») | Claire (champs visibles dans le formulaire) | Claire (étape dédiée « identité ») |
| **Implémentation** | Vérification + modale simple | Champs + update profil dans action | Deux étapes + action update profil |
| **Réutilisation** | Réutilise page profil existante | Réutilise composants formulaire | Nouvelle micro-étape dans la modale |

---

## 7. Choix retenu (PO)

- **Solution B** : champs Prénom / Nom dans la modale de demande (affichés uniquement si le profil ne les a pas encore).
- **Vérification au clic sur « Voir le détail »** : à l’ouverture de la modale détail coach, on sait déjà si le profil a prénom et nom (données passées par la page). Le formulaire affiche ou non les champs en conséquence.

---

## 8. Fichiers des mockups (HTML statiques, design system)

Les mockups sont des fichiers HTML autonomes, non intégrés à l’app, pour validation visuelle. Contexte : **modale détail coach** (présentation + offres).

### Index (tous les écrans)

- **`docs/design-request-athlete-name/index.html`** — Page d’accès à tous les écrans (B et C en contexte détail coach, plus anciens mockups).

### Solution B (contexte détail coach)

- **`mockup-b-coach-detail-full.html`** — Modale complète : header coach, bio, offres, formulaire avec Prénom/Nom en tête.

### Solution C (contexte détail coach)

- **`mockup-c-coach-detail-step1.html`** — Écran 1 : « Comment vous appeler ? » (Prénom, Nom, Continuer).
- **`mockup-c-coach-detail-step2.html`** — Écran 2 : bio, offres, formulaire sans Prénom/Nom.

### Anciens mockups (hors contexte détail coach)

- `mockup-a-redirect-profile.html` (Solution A, écartée)
- `mockup-b-inline-fields.html` (B version formulaire simple)
- `mockup-c-step-identity.html` (C étape identité simple)

Utilisation des tokens et composants du design system (couleurs palette, Input, Button, structure modale).

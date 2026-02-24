# User stories — Tuile demande en attente (uniformisation + Discuter + modales confirmation)

**Référence mockup :** `docs/design-pending-request-tile/MOCKUP_PENDING_REQUEST_TILE.html`  
**Contexte :** Page « Mes athlètes » (coach), section « Demandes en attente ».  
**Design system :** `docs/DESIGN_SYSTEM.md`, composants `ActivityTile` / `TileCard`, `Badge`, `Button`, `Modal`, `AvatarImage`.

---

## US 1 — Tuile demande en attente uniformisée (style ActivityTile)

**En tant que** coach,  
**je veux** que chaque demande en attente soit affichée dans une tuile au même style que les tuiles d’activité (bordure gauche, avatar, badges sport),  
**afin que** l’interface soit cohérente et lisible.

### Critères d’acceptation

- [ ] Chaque demande est rendue dans une carte avec : `rounded-lg`, `border border-l-4 border-l-palette-amber`, `border-stone-200`, `bg-white`, `p-3`, `shadow-sm`, et la classe `.training-card` pour le hover (léger lift + ombre).
- [ ] À gauche : **avatar** de l’athlète (composant `AvatarImage`, initiales si pas de photo), taille 12×12 (w-12 h-12).
- [ ] À droite de l’avatar : **nom** (ou email si pas de nom) en `font-semibold text-stone-900`, puis une ligne de **métadonnées** avec les **tuiles sport** (composant `Badge` avec `sport="..."` selon les sports pratiqués) et l’**offre choisie** (titre + prix ou « Gratuit »), séparés par des points (·).
- [ ] Les sports sont affichés avec les badges du design system (icône + couleur par sport). Aucun texte en dur pour les libellés sport (i18n via namespace `sports` ou équivalent).
- [ ] **Référence mockup :** section « Demandes en attente (2) », tuiles 1, 2 et 3 (zone principale de chaque `<li>`).

---

## US 2 — Message de l’athlète (besoin de coaching) en entier et pleine largeur

**En tant que** coach,  
**je veux** voir le message (besoin de coaching) saisi par l’athlète en entier, sur toute la largeur de la tuile,  
**afin de** bien comprendre sa demande sans avoir à cliquer ailleurs.

### Critères d’acceptation

- [ ] Le champ `coaching_need` (ou équivalent) est affiché **sous** la ligne avatar + infos + boutons, dans un bloc dédié.
- [ ] Ce bloc s’étale sur **toute la largeur** de la tuile (pas seulement sous la colonne texte). Séparation visuelle : `border-t border-stone-100`, `mt-2 pt-2`.
- [ ] Le texte est affiché **en entier**, sans troncature. Retour à la ligne naturel : `whitespace-pre-wrap` si conservation des sauts de ligne, sinon `break-words`. Style : `text-sm text-stone-600 italic`.
- [ ] **Référence mockup :** paragraphe en italique sous chaque tuile (ex. « Je fais actuellement un programme d'entrainement… »).

---

## US 3 — Bouton « Discuter » et ouverture du module de conversation

**En tant que** coach,  
**je veux** un bouton « Discuter » sur chaque demande en attente qui ouvre le module de conversation (overlay chat) en ciblant cet athlète,  
**afin de** échanger avec lui avant ou après avoir accepté / refusé.

### Critères d’acceptation

- [ ] Un bouton **« Discuter »** (libellé court, pas « Discuter avec l’athlète » dans l’UI) est affiché sur chaque tuile. Style : **secondaire** (`Button variant="secondary"` : bordure stone, hover bg-stone-100).
- [ ] Au clic : le **module de conversation** (overlay chat existant, `ChatModule`) s’ouvre et la conversation avec cet athlète est **sélectionnée** ou **créée** puis affichée. Comportement identique à « Choisir un athlète » dans l’overlay quand le coach démarre une discussion.
- [ ] i18n : une clé dédiée est utilisée pour le libellé du bouton (ex. `pendingRequests.chat` ou `coachRequests.chat`), avec traduction FR et EN.
- [ ] **Référence mockup :** premier bouton dans la zone actions (desktop et mobile).

---

## US 4 — Boutons Refuser et Accepter (styles et ordre)

**En tant que** coach,  
**je veux** que les boutons Refuser et Accepter aient un style clair (danger / primary) et un ordre cohérent,  
**afin de** éviter les erreurs de clic et comprendre immédiatement l’action.

### Critères d’acceptation

- [ ] **Refuser** : style **danger** (`Button variant="danger"` : texte stone, hover texte + fond danger).
- [ ] **Accepter** : style **primary** (`Button variant="primary"` ou `primaryDark`).
- [ ] Ordre des boutons : **Discuter**, **Refuser**, **Accepter** (comme sur le mockup).
- [ ] Libellés issus de l’i18n existant (namespace `coachRequests` : `decline`, `accept`).
- [ ] **Référence mockup :** zone des trois boutons sur chaque tuile.

---

## US 5 — Disposition responsive : boutons en bas sur petit écran

**En tant que** coach sur mobile,  
**je veux** que les boutons d’action soient tout en bas de la tuile, avec « Discuter » en pleine largeur et « Refuser » / « Accepter » côte à côte en 50/50,  
**afin de** pouvoir agir facilement au doigt sans encombrer la ligne du haut.

### Critères d’acceptation

- [ ] **À partir de `sm` (640px)** : ligne 1 = avatar + nom + métadonnées (sports + offre) + les 3 boutons alignés à droite. Ligne 2 = bloc message pleine largeur.
- [ ] **En dessous de `sm`** : ligne 1 = avatar + nom + métadonnées (sans boutons). Ligne 2 = bloc message pleine largeur. Ligne 3 = **zone boutons** : « Discuter » en **pleine largeur**, puis une ligne avec « Refuser » et « Accepter » en **50/50** (flex, chaque bouton `flex-1`).
- [ ] Aucun doublon de boutons : un seul bloc boutons rendu, avec classes responsive (ex. boutons desktop `hidden sm:flex`, bloc boutons mobile `flex sm:hidden` ou équivalent) pour afficher soit les boutons à droite (desktop), soit le bloc en bas (mobile).
- [ ] **Référence mockup :** section « Exemple petit écran (~360px) » et structure décrite dans « Comportement ».

---

## US 6 — Modale de confirmation « Refuser la demande »

**En tant que** coach,  
**je veux** qu’un clic sur « Refuser » ouvre d’abord une modale de confirmation,  
**afin de** éviter les refus accidentels.

### Critères d’acceptation

- [ ] Au clic sur **Refuser**, une **modale** s’ouvre (composant `Modal`, taille `sm`), sans appeler tout de suite l’API.
- [ ] La modale respecte le design system : **header** (titre `text-lg font-bold`), **corps** (`px-6 py-4`, message `text-sm text-stone-600`), **footer** (`px-6 py-4 border-t border-stone-100 bg-stone-50/50`) avec deux boutons en `flex gap-3 w-full`, chacun `flex-1`.
- [ ] Titre : type « Refuser la demande ? ». Message explicatif : la demande sera refusée, l’athlète pourra en renvoyer une plus tard.
- [ ] Boutons : **Annuler** (variant `muted`) ferme la modale sans action. **Refuser** (variant `danger`) appelle `respondToCoachRequest(requestId, false, locale)`, ferme la modale et déclenche un refresh.
- [ ] Textes modale en i18n (ex. `coachRequests.confirmDeclineTitle`, `coachRequests.confirmDeclineBody`, `common.cancel` ou équivalent).
- [ ] **Référence mockup :** section « Modales de confirmation », première modale (Refuser).

---

## US 7 — Modale de confirmation « Accepter la demande »

**En tant que** coach,  
**je veux** qu’un clic sur « Accepter » ouvre d’abord une modale de confirmation,  
**afin de** confirmer la création de la souscription et l’ajout de l’athlète.

### Critères d’acceptation

- [ ] Au clic sur **Accepter**, une **modale** s’ouvre (composant `Modal`, taille `sm`), sans appeler tout de suite l’API.
- [ ] Même structure que US 6 (header / corps / footer design system).
- [ ] Titre : type « Accepter la demande ? ». Message explicatif : l’athlète sera ajouté, une souscription sera créée, le coach pourra lui assigner entraînements et objectifs.
- [ ] Boutons : **Annuler** (variant `muted`) ferme la modale. **Accepter** (variant `primary` ou `primaryDark`) appelle `respondToCoachRequest(requestId, true, locale)`, ferme la modale et refresh.
- [ ] Textes en i18n (ex. `coachRequests.confirmAcceptTitle`, `coachRequests.confirmAcceptBody`).
- [ ] **Référence mockup :** section « Modales de confirmation », deuxième modale (Accepter).

---

## Récapitulatif technique

| Élément | Composant / source |
|--------|---------------------|
| Tuile (carte) | Style `TileCard` / ActivityTile : `border-l-4 border-l-palette-amber`, `rounded-lg`, `shadow-sm`, `.training-card` |
| Avatar | `AvatarImage` |
| Sports | `Badge` avec `sport="course"` etc. (design system + i18n sports) |
| Bouton Discuter | `Button variant="secondary"`, i18n `pendingRequests.chat` ou `coachRequests.chat` |
| Bouton Refuser | `Button variant="danger"`, i18n `coachRequests.decline` |
| Bouton Accepter | `Button variant="primary"`, i18n `coachRequests.accept` |
| Modales | `Modal` size="sm", `title`, `footer` avec 2 boutons `flex-1` |
| Ouverture chat | Utiliser le mécanisme existant (context / callback / param) pour ouvrir `ChatModule` et cibler l’athlète |

**Fichiers concernés (à adapter en implémentation) :**  
`app/[locale]/dashboard/athletes/page.tsx` (rendu des tuiles), `RespondToRequestButtons.tsx` (ou nouveau composant tuile + modales), `components/ChatModule.tsx` ou layout dashboard (ouverture chat avec athleteId), `messages/fr.json` et `messages/en.json` (clés `pendingRequests`, `coachRequests`).

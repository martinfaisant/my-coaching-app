# Design : Voir la demande envoyée (athlète)

**Mode :** Designer  
**Date :** 22 février 2026

---

## 1. Synthèse du besoin

L'athlète doit pouvoir **consulter le détail de la demande** qu'il a envoyée à un coach (statut « en attente »). Aujourd'hui, dans la tuile du coach il voit uniquement « Demande envoyée » et « Annuler la demande », sans accès au contenu de la demande.

**Objectifs :**
- Dans la **tuile du coach** (état « demande en attente ») : afficher un bouton **« Annuler la demande »** et, à droite, un élément **« Demande envoyée > »** dans un style muted, cliquable.
- Au clic sur « Demande envoyée > », ouvrir une **modale** qui affiche le détail de la demande envoyée (offre choisie, message, sports, date, etc.).

---

## 2. Cas identifiés

| Cas | Description |
|-----|-------------|
| **Nominal** | L'athlète clique sur « Demande envoyée > » → la modale s'ouvre avec le détail de la demande (offre figée, besoin, sports, date). Il peut fermer la modale (X ou overlay). Depuis la modale, option possible : bouton « Annuler la demande » qui renvoie vers le flux d'annulation existant (confirmation puis suppression). |
| **Erreur chargement** | Si le détail de la demande ne peut pas être chargé (requête supprimée entre-temps, etc.), afficher un message d'erreur dans la modale ou une phrase du type « Demande introuvable » avec bouton Fermer. |
| **Limite** | Un seul état « pending » par coach : une seule demande à afficher par tuile. Pas de liste d'historique des demandes dans ce périmètre. |

**Clarifications PO :** Une demande ne peut pas exister sans offre ; pas de cas « demande sans offre » à gérer.

---

## 3. Proposition UI (une solution alignée avec votre demande)

- **Tuile coach (footer)**  
  - **La tuile coach ne change pas de design** : on réutilise telle quelle la structure du composant **CoachTile** du design system (header avatar + nom + note, badges sports, bio, bloc offres). Seul le **contenu du footer** change quand la demande est en attente.  
  - Ligne unique : à **gauche** un bouton **« Annuler la demande »** (variant **danger**).  
  - À **droite** un bouton **« Demande envoyée > »** en style muted (chevron `>`), qui ouvre la modale au clic.

- **Modale « Détail de la demande »**  
  - Titre : type « Votre demande envoyée ».  
  - Contenu (lecture seule) : offre choisie (titre + description + prix), sports pratiqués, votre message, date d'envoi.  
  - **Footer modale** : à **gauche** bouton **Annuler la demande** (danger), à **droite** bouton **Fermer** (muted). **Les deux boutons ont la même taille** (ex. `flex-1` ou même `min-h-10 px-4 py-2.5`).

Référence visuelle : mockup HTML `docs/athlete-view-sent-request-mockup.html`.

---

## 4. Composants design system

| Composant | Usage |
|-----------|--------|
| **CoachTile** | Tel quel. Le footer sera fourni par le parent (FindCoachSection / RequestCoachButton) avec la nouvelle disposition : flex, « Annuler la demande » à gauche, « Demande envoyée > » à droite. |
| **Button** (variant `danger`) | Pour « Annuler la demande » (tuile et modale). |
| **Button** (variant `muted`) | Pour « Demande envoyée > » dans la tuile ; pour « Fermer » dans la modale. |
| **Modal** | Composant `Modal` existant pour la modale de détail (taille `md` ou `lg`), avec titre, corps scrollable, footer (Fermer [+ Annuler la demande si retenu]). |
| **Badge** | Optionnel dans la modale pour les sports pratiqués (cohérent avec le reste de l'app). |
| **Typography** | Labels en `text-xs font-bold uppercase tracking-wider text-stone-400`, contenu en `text-sm text-stone-600` / `text-stone-900` (design system). |

**Évolutions à prévoir :**
- **RequestCoachButton** (ou bloc footer quand `requestStatus === 'pending'`) : faire évoluer le layout du footer pour afficher deux zones (gauche : Annuler la demande ; droite : Demande envoyée >) et gérer l'ouverture de la modale. Si les données détaillées de la demande ne sont pas encore disponibles côté client, l'Architecte prévoira un chargement (ex. action qui retourne une demande par `requestId`) pour alimenter la modale.
- **Nouvelle modale** : composant type `AthleteSentRequestDetailModal` (ou contenu dédié dans un composant existant) qui reçoit les données de la demande (frozen_title, frozen_description, coaching_need, sport_practiced, created_at, frozen_price / frozen_price_type, locale) et les affiche en lecture seule. Réutilisation du composant `Modal` du design system.

---

## 5. Détails UI retenus (mockup final)

- **Tuile** : badges sports avec **icônes** (Badge + SPORT_ICONS, design system). Bouton « Demande envoyée » avec **icône Send** (envoi) à gauche du libellé, puis chevron `>`.
- **Modale** : **date d'envoi** affichée juste après « Envoyée à [Coach] » (ex. « Envoyée à Marie Dupont · 22 février 2026 »). Statut **En attente** avec **icône sablier** (hourglass). Sports avec badges + icônes. Message en style citation (bordure gauche olive, italique).

Référence visuelle : **`docs/athlete-view-sent-request-mockup.html`**.

---

## 6. User stories

### US1 – Footer tuile coach (demande en attente)

**Titre :** Afficher « Annuler la demande » et « Demande envoyée > » dans la tuile du coach quand une demande est en attente.

**Description :** Lorsque l'athlète a envoyé une demande à un coach (statut pending), le footer de la tuile de ce coach affiche deux actions : annuler la demande (gauche) et consulter la demande (droite).

**Critères d'acceptation :**
- [ ] Quand `requestStatus === 'pending'` pour ce coach, le footer de la tuile affiche une ligne avec deux éléments (pas le bouton unique « Choisir ce coach »).
- [ ] À gauche : bouton **« Annuler la demande »**, variant **danger** (design system).
- [ ] À droite : bouton/lien **« Demande envoyée »** avec icône **Send** (envoi) à gauche du texte et **chevron >** à droite, style **muted**.
- [ ] La tuile coach conserve la structure actuelle (CoachTile) : header, badges sports avec icônes, bio, bloc offres ; seul le contenu du footer change.
- [ ] Clic sur « Annuler la demande » ouvre le flux existant de confirmation d'annulation (comportement actuel).

**Périmètre :** Page « Trouver un coach » (dashboard athlète), rôle athlète.

**Référence mockup :** Tuile coach, zone footer (bloc « Footer : Annuler la demande (danger) à gauche, Demande envoyée > (muted) à droite »).

**i18n :** Namespace `requestCoachButton` (ou `findCoach`) : libellés « Annuler la demande », « Demande envoyée » (déjà présents ou à compléter).

---

### US2 – Ouvrir la modale « Détail de la demande »

**Titre :** Ouvrir une modale au clic sur « Demande envoyée > ».

**Description :** Un clic sur le bouton « Demande envoyée > » ouvre une modale affichant le détail de la demande envoyée en lecture seule.

**Critères d'acceptation :**
- [ ] Au clic sur « Demande envoyée > », une modale s'ouvre (composant `Modal` du design system).
- [ ] La modale peut être fermée par le bouton X (header), le bouton « Fermer » (footer) ou le clic sur l'overlay (comportement standard `Modal`).
- [ ] Les données affichées proviennent de la demande (coach_requests) pour ce coach : pas de données en dur.

**Périmètre :** Page « Trouver un coach », rôle athlète.

**Référence mockup :** Modale « Détail de la demande envoyée » (section entière dans le mockup HTML).

**i18n :** Namespace dédié (ex. `athleteSentRequest` ou `requestCoachButton`) pour tous les textes de la modale.

---

### US3 – Contenu de la modale (lecture seule)

**Titre :** Afficher en lecture seule le détail de la demande dans la modale.

**Description :** La modale affiche les informations figées de la demande : offre choisie, sports pratiqués, message de l'athlète, date d'envoi, statut.

**Critères d'acceptation :**
- [ ] **Header** : titre « Votre demande », sous-titre « Envoyée à [Nom du coach] · [Date d'envoi formatée] », pill « En attente » avec **icône sablier** (hourglass). Bouton fermer (X).
- [ ] **Offre choisie** : bloc mis en avant (bordure gauche verte) avec titre figé, description figée, prix (ou « Gratuit »). Données issues de `frozen_title` / `frozen_description` / `frozen_price` / `frozen_price_type` selon la locale.
- [ ] **Sports pratiqués** : badges avec **icônes** (Badge + SPORT_ICONS, comme dans le design system), à partir de `sport_practiced` (découpage si plusieurs sports).
- [ ] **Votre message** : contenu de `coaching_need` en style citation (bordure gauche olive, fond discret, italique ou équivalent).
- [ ] **Footer modale** : à **gauche** bouton « Annuler la demande » (danger), à **droite** bouton « Fermer » (muted). Les deux boutons ont **la même taille** (ex. flex-1 ou classes identiques).
- [ ] Clic sur « Annuler la demande » dans la modale déclenche le même flux de confirmation d'annulation que depuis la tuile (puis fermeture après annulation).

**Périmètre :** Modale détail demande, rôle athlète.

**Référence mockup :** Modale – header (titre + envoyée à + date + En attente sablier), bloc offre, section sports avec badges, bloc message, footer (Annuler / Fermer).

**i18n :** Labels « Offre choisie », « Sports pratiqués », « Votre message », « En attente », « Annuler la demande », « Fermer », « Votre demande » (namespace cohérent avec US2).

---

### US4 – Erreur chargement détail demande

**Titre :** Gérer l'impossibilité de charger le détail de la demande.

**Description :** Si la demande n'est plus disponible (ex. supprimée entre-temps), la modale affiche un message explicite au lieu du détail.

**Critères d'acceptation :**
- [ ] Si le chargement du détail de la demande échoue ou retourne « non trouvée », la modale affiche un message du type « Demande introuvable » (ou équivalent i18n) avec un bouton « Fermer ».
- [ ] Pas de contenu détail (offre, message, etc.) dans ce cas.
- [ ] L'utilisateur peut fermer la modale et retrouver la liste des coachs (la tuile peut alors ne plus afficher l'état « demande en attente » après refresh).

**Périmètre :** Modale détail demande, rôle athlète.

**Référence mockup :** N/A (état d'erreur ; le mockup ne le représente pas).

**i18n :** Clé type `requestNotFound` ou `demandNotFound` dans le namespace de la modale.

---

## 7. Checklist avant livraison à l'Architecte

- [x] Design system et composants existants consultés ; composants à réutiliser / à faire évoluer listés.
- [x] Mockup ouvert dans un navigateur et validé visuellement.
- [x] Chaque user story comporte une **référence au mockup** (zone ou écran correspondant).
- [x] Cas nominal, erreur et limite identifiés ; clarifications PO intégrées.

---

## 8. Suite

- **Spec technique (Architecte)** : `docs/ATHLETE_VIEW_SENT_REQUEST_ARCHI.md` — architecture, flux, table des fichiers, action `getCoachRequestDetail`, RLS (aucun changement), tests manuels, points à trancher.
- **Transmission au Développeur** : implémentation à partir de la spec technique et des user stories ci-dessus.
- **Référence** : `docs/athlete-view-sent-request-mockup.html` pour le rendu cible.

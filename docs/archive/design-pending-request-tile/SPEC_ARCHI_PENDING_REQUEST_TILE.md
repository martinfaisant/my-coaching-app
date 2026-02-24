# Spec technique — Tuile demande en attente (uniformisation + Discuter + modales confirmation)

**Référence :** User stories `docs/design-pending-request-tile/USER_STORIES_PENDING_REQUEST_TILE.md`, mockup `docs/design-pending-request-tile/MOCKUP_PENDING_REQUEST_TILE.html`.

---

## 1. Vue d’ensemble

- **Périmètre :** Page « Mes athlètes » (coach), section « Demandes en attente ». Uniquement UI + flux (modales, ouverture chat). Pas de changement de modèle de données ni de RLS.
- **Flux :** Les demandes en attente sont déjà récupérées par `getPendingCoachRequests(locale)`. On modifie le rendu des tuiles (style ActivityTile, message pleine largeur, boutons Discuter / Refuser / Accepter avec modales de confirmation) et on ajoute l’ouverture du module de conversation ciblée sur un athlète.

---

## 2. Architecture et flux

### 2.1 Flux actuels réutilisés

- **Données :** `getPendingCoachRequests(locale)` dans `app/[locale]/dashboard/actions.ts` → retourne `PendingRequestWithAthlete[]` (id, athlete_id, athlete_name, athlete_email, athlete_avatar_url, sport_practiced, coaching_need, offer_title, offer_price, offer_price_type, …). Aucun changement de contrat ni de requête nécessaire pour les US 1–2–4–5–6–7. Pour l’affichage prix (Gratuit / X€/mois), s’assurer que `offer_price_type` est bien renseigné dans le mapping (actuellement mis à `null` dans le return) — **point à trancher en implémentation**.
- **Action refus / acceptation :** `respondToCoachRequest(requestId, accept, locale)` dans `app/[locale]/dashboard/actions.ts` — inchangée. Les modales ne font qu’intercepter le clic, afficher la confirmation, puis appeler cette action au clic sur Refuser / Accepter.

### 2.2 Nouveau flux « Discuter »

- Le **bouton Discuter** doit ouvrir l’overlay chat (ChatModule) et **sélectionner ou créer** la conversation avec l’athlète de la demande.
- Aujourd’hui, `ChatModule` est rendu dans le layout dashboard sans API « ouvrir avec athleteId ». Il gère en interne `open`, `coachConvs`, `selectedCoachConvId`, et la vue « Choisir un athlète » qui appelle `getOrCreateConversationForCoach(contactId, locale)`.
- **Option retenue :** Introduire un **context React** (ex. `OpenChatContext`) fourni par un **wrapper client** autour du contenu du layout (ou autour de la zone qui contient `ChatModule` + les pages). Ce context expose par exemple `openChatWithAthlete(athleteId: string)`.  
  - Le **bouton Discuter** (dans un composant client) appelle `openChatWithAthlete(req.athlete_id)`.  
  - **ChatModule** (ou un wrapper qui rend ChatModule) consomme le context : quand `openChatWithAthlete(athleteId)` est appelé, il met à jour un état du type `{ open: true, preselectedAthleteId: athleteId }`, ouvre l’overlay, et une fois l’overlay monté, soit sélectionne la conversation existante pour cet athlète, soit appelle `getOrCreateConversationForCoach(athleteId, locale)` et affiche la conversation.  
- **Alternative (à trancher en implémentation) :** passer une prop optionnelle au `ChatModule` du type `initialOpenWithAthleteId?: string` gérée au niveau du layout via un state remonté (ex. state dans un client layout wrapper, passé au layout qui rend `ChatModule` avec cette prop). Le composant tuile remonterait alors un callback au layout. Un context reste plus simple pour éviter le prop drilling.

---

## 3. Table des fichiers

| Fichier | Rôle | Créer / Modifier |
|--------|------|-------------------|
| `app/[locale]/dashboard/athletes/page.tsx` | Page Mes athlètes : section demandes en attente | **Modifier** — Remplacer le rendu actuel des `<li>` par un composant dédié qui reçoit `pendingRequests` et les labels i18n. Structure : liste de tuiles selon mockup (avatar, nom, métadonnées, bloc message pleine largeur, zone boutons desktop + zone boutons mobile). |
| `app/[locale]/dashboard/PendingRequestTile.tsx` (ou nom équivalent) | Une tuile « demande en attente » : carte, avatar, badges sport, offre, message, boutons Discuter / Refuser / Accepter + modales confirmation | **Créer** — Client component. Props : une entrée `PendingRequestWithAthlete` + locale / labels. Gère les deux modales (confirm decline / confirm accept), appelle `respondToCoachRequest`, utilise le context pour `openChatWithAthlete(athlete_id)`. Respect du mockup (responsive, ordre boutons, styles Button). |
| `app/[locale]/dashboard/RespondToRequestButtons.tsx` | Boutons Refuser / Accepter (sans modales) | **Modifier** ou **Remplacer** — Soit ce composant est étendu pour gérer les modales et le bouton Discuter (et reçoit `athleteId` + callback ou context pour Discuter), soit il est remplacé par l’usage de `PendingRequestTile` qui intègre tout. Recommandation : **ne plus utiliser RespondToRequestButtons** dans la section pending ; tout passer par `PendingRequestTile`. |
| `components/ChatModule.tsx` | Overlay chat + bouton flottant | **Modifier** — Consommer le context (ou la prop) pour « ouvrir avec athleteId » : au montage de l’overlay, si un `preselectedAthleteId` est fourni, charger/créer la conversation pour cet athlète et l’afficher (équivalent logique à un clic sur un athlète dans la liste « Choisir un athlète »). |
| `contexts/OpenChatContext.tsx` (ou `app/[locale]/dashboard/OpenChatContext.tsx`) | Context : `openChatWithAthlete(athleteId: string)` + état optionnel `preselectedAthleteId` | **Créer** — Client component. Provider enveloppe la zone layout qui contient les children + ChatModule. |
| `app/[locale]/dashboard/layout.tsx` | Layout dashboard : Sidebar, children, ChatModule | **Modifier** — Envelopper children + ChatModule dans le provider du context (ou dans un client wrapper qui fournit le context et rend ChatModule avec la prop dérivée du context). |
| `messages/fr.json` | Traductions FR | **Modifier** — Ajouter clés `coachRequests.confirmDeclineTitle`, `confirmDeclineBody`, `confirmAcceptTitle`, `confirmAcceptBody` ; `pendingRequests.chat` (ou `coachRequests.chat`) pour le bouton Discuter. |
| `messages/en.json` | Traductions EN | **Modifier** — Mêmes clés que ci-dessus. |

**Fichiers non modifiés (usage uniquement) :**  
`app/[locale]/dashboard/actions.ts` (getPendingCoachRequests, respondToCoachRequest), `components/Modal.tsx`, `components/Button.tsx`, `components/Badge.tsx`, `components/AvatarImage.tsx`, `lib/frozenOfferI18n.ts`, `getDisplayName`, `getInitials`.

---

## 4. Modèle de données

**Aucun changement BDD.**

- Lecture : `coach_requests` (déjà filtré par `coach_id` et `status = 'pending'`) + jointure implicite via `getPendingCoachRequests` avec `profiles` pour nom, email, avatar. Les champs utilisés sont déjà exposés dans `PendingRequestWithAthlete`.
- Écriture : refus / acceptation via `respondToCoachRequest` (update `coach_requests`, éventuellement update `profiles.coach_id` et insert `subscriptions` à l’acceptation) — inchangé.

**Point à trancher en implémentation :** Dans `getPendingCoachRequests`, le mapping renvoie actuellement `offer_price_type: null`. Pour afficher « Gratuit » vs « X€/mois » correctement, il faut soit ajouter `frozen_price_type` dans le select et le mapper vers `offer_price_type`, soit déduire du prix (0 = gratuit) ou d’un autre champ. À aligner avec le type `PendingRequestWithAthlete` et l’UI.

---

## 5. RLS et sécurité

**Aucun changement RLS.**

- Les politiques existantes sur `coach_requests` (select/update par le coach) et sur `profiles` / `subscriptions` restent suffisantes.
- Le bouton Discuter ne fait qu’ouvrir une conversation avec un `athlete_id` déjà exposé au coach (demande en attente dont il est le `coach_id`). La création/sélection de conversation utilise les actions chat existantes (`getOrCreateConversationForCoach`). Les RLS et la fonction `is_chat_request_writable` (migration 047) autorisent déjà l’écriture quand `request.status = 'pending'` ; un coach peut donc ouvrir ou créer une conversation avec un athlète qui a une demande en attente. Aucune évolution RLS ni action chat nécessaire.

---

## 6. Logique métier

- **Tuile :** Affichage en lecture seule des champs de `PendingRequestWithAthlete`. Sports : `sport_practiced` est une chaîne (ex. « course,velo ») à splitter et afficher avec `<Badge sport={...} />` pour chaque valeur (en s’assurant que les valeurs sont des `SportType` valides ou en les filtrant).
- **Prix offre :** Si `offer_price_type === 'free'` → libellé « Gratuit » (i18n) ; si `monthly` → `offer_price` + « /mois » ; sinon forfait → `offer_price` + « € ». Utiliser les clés existantes `pendingRequests.free`, `pendingRequests.perMonth` et le namespace `athletes` ou `coachRequests` selon le placement des clés.
- **Modales :** Clic sur Refuser → ouvrir modale « Refuser la demande ? » ; Annuler ferme sans appel ; Refuser (bouton danger) appelle `respondToCoachRequest(requestId, false, locale)`, ferme la modale, puis `router.refresh()`. Idem pour Accepter avec `respondToCoachRequest(requestId, true, locale)`. Gérer `isPending` (désactiver les boutons pendant l’appel) et afficher une erreur (toast ou message dans la modale) si `result.error`.
- **Discuter :** Clic sur Discuter → appeler `openChatWithAthlete(req.athlete_id)` (du context), ce qui ouvre l’overlay et cible la conversation avec cet athlète (sélection existante ou création via `getOrCreateConversationForCoach`).

---

## 7. Tests manuels recommandés

- En tant que coach, sur la page Mes athlètes avec au moins une demande en attente :
  - Vérifier le rendu des tuiles (style carte, bordure gauche amber, avatar, badges sport, offre, message en entier pleine largeur).
  - Vérifier le responsive : sur une largeur &lt; 640px, les 3 boutons passent en bas, Discuter pleine largeur, Refuser et Accepter en 50/50.
  - Cliquer sur **Discuter** : l’overlay chat s’ouvre et la conversation avec l’athlète est affichée (ou créée puis affichée).
  - Cliquer sur **Refuser** : la modale « Refuser la demande ? » s’ouvre ; Annuler ferme sans changement ; Refuser confirme, la demande disparaît de la liste après refresh.
  - Cliquer sur **Accepter** : la modale « Accepter la demande ? » s’ouvre ; Annuler ferme ; Accepter crée la souscription, la demande disparaît et l’athlète apparaît dans la liste « Mes athlètes ».
- Vérifier les libellés en FR et EN (bouton Discuter, titres/corps des modales, messages d’erreur si erreur API).

---

## 8. Points à trancher en implémentation

1. **`offer_price_type`** dans `getPendingCoachRequests` : ajouter `frozen_price_type` au select et au mapping pour un affichage correct Gratuit / X€/mois.
2. **Context vs prop pour « ouvrir chat avec athlete »** : context recommandé ; si prop, définir le lieu du state (client wrapper du layout) et la signature de ChatModule.
3. **Droits chat pour demande en attente :** déjà couverts (RLS + `is_chat_request_writable` pour `pending`, `getOrCreateConversationForCoach` / `getLatestWritableRequestIdForPair`). Aucune évolution nécessaire.
4. **Gestion d’erreur après respondToCoachRequest** : garder ou remplacer `alert(result.error)` par un message dans la modale ou un toast, selon les conventions du projet.

---

## 9. Checklist avant livraison (Architecte)

- [x] Aucun changement BDD (migrations cohérentes : aucune).
- [x] RLS : aucune modification ; accès déjà couvert.
- [x] Table des fichiers présente (créer / modifier).
- [x] Cas limites / edge cases : erreur API, `offer_price_type`, droits chat pour demande en attente.
- [x] Tests manuels recommandés indiqués.

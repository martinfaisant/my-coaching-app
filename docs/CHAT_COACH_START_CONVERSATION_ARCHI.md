# Architecture – Chat : permettre au coach de démarrer une conversation

**Mode :** Architecte  
**Date :** 22 février 2026  
**Référence :** `docs/CHAT_COACH_START_CONVERSATION_DESIGN.md` (user stories US1–US8, mockup, composants).

---

## 1. Contexte et objectif

Aujourd’hui une conversation n’est créée que lorsque l’athlète ouvre le chat (`getOrCreateConversationForAthlete()`). Le coach ne peut pas initier une conversation. L’objectif est de permettre au coach de :

- Voir à l’ouverture de l’overlay soit la **liste de ses athlètes** (souscription active) pour en choisir un (état 1), soit la **sidebar des conversations** existantes + panneau de conversation (états 2a/2b).
- **Créer** une conversation avec un athlète (si elle n’existe pas) au clic sur cet athlète.
- **Rechercher** un athlète (live en état 1, optionnellement en 2a/2b).
- **Fermer** la conversation courante sans fermer l’overlay (bouton dans le header du panneau).
- Réutiliser la **même vue** pour l’athlète (pas de liste, pas de sidebar, pas de bouton Fermer conversation).

---

## 2. Modèle de données

**Aucune migration requise.** Le modèle existant suffit.

### 2.1 Tables utilisées

| Table | Rôle |
|-------|------|
| `conversations` | Une ligne par couple (coach_id, athlete_id). `updated_at` mis à jour par trigger à chaque insertion dans `chat_messages`. |
| `chat_messages` | Messages d’une conversation. |
| `subscriptions` | Pour le coach : déterminer la liste des athlètes « avec souscription active » (état 1 et recherche). Filtre : `coach_id = auth.uid()` et `status = 'active'` (éventuellement `'cancellation_scheduled'` si on souhaite garder l’accès jusqu’à la fin de période — **point à trancher**). |
| `profiles` | Pour les noms affichés (first_name, last_name, email) et avatar_url. |

### 2.2 Règles métier données

- **Liste « athlètes pour démarrer » (état 1)** : athlètes ayant une **souscription active** avec le coach (`subscriptions.coach_id = coach`, `subscriptions.status = 'active'`). Tri : par date du dernier message (conversation existante) décroissant, puis athlètes sans conversation (ordre secondaire ex. alphabétique).
- **Liste des conversations (sidebar 2a/2b)** : conversations du coach, triées par `conversations.updated_at` DESC (déjà assuré par le trigger sur `chat_messages`).
- **Création de conversation** : un coach ne peut créer une conversation qu’avec un athlète qui a une **souscription active** avec lui. Vérification côté application dans l’action serveur (les RLS actuelles permettent tout athlète dont `profiles.coach_id = coach` ; pour coller au produit, restreindre aux athlètes présents dans `subscriptions` actives).

---

## 3. RLS (Row Level Security)

**Aucune modification des RLS.** Les politiques existantes suffisent.

- **conversations** : le coach peut `SELECT` et `INSERT` où `coach_id = auth.uid()` et `athlete_id IN (SELECT user_id FROM profiles WHERE coach_id = auth.uid())`. La restriction « souscription active » est assurée **dans l’application** en ne proposant que les athlètes issus de `subscriptions` (et en vérifiant avant un éventuel `INSERT`).
- **chat_messages** : lecture/écriture pour les participants à la conversation (inchangé).

Si on souhaite durcir au niveau BDD (empêcher un coach de créer une conversation avec un athlète sans souscription active), on pourrait ajouter une politique `INSERT` plus stricte sur `conversations` (ex. `athlete_id IN (SELECT athlete_id FROM subscriptions WHERE coach_id = auth.uid() AND status = 'active')`). **Recommandation :** garder les RLS actuelles et contrôler en appli pour éviter une dépendance forte RLS ↔ règles métier souscription (annulation, résiliation, etc.).

---

## 4. Architecture des fichiers et flux

### 4.1 Flux principaux

1. **Ouverture overlay (coach)**  
   - `ChatModule` affiche le bouton ; au clic, rendu de `ChatOverlay` avec `role="coach"`.  
   - `ChatOverlay` appelle soit `getAthletesForCoachForChat()` (état 1), soit `getConversationsForCoach()` (états 2a/2b). Selon le cas : affichage liste d’athlètes (état 1) ou sidebar + panneau (2a/2b).  
   - Si `initialAthleteId` est fourni (US8), charger/créer la conversation pour cet athlète et afficher directement le panneau.

2. **Sélection d’un athlète (état 1)**  
   - Clic sur une ligne → appel `getOrCreateConversationForCoach(athleteId)`.  
   - Si conversation créée ou existante → mise à jour de l’état (conversation sélectionnée), chargement des messages `getMessages(conversationId)`, affichage panneau droit.  
   - Mise à jour de la liste côté client : soit refetch des conversations (pour passer en vue 2a), soit simple mise à jour locale (ajout de la conversation courante dans la liste).

3. **Recherche (état 1 et 2a/2b)**  
   - Côté client : filtre sur la liste déjà chargée (prénom, nom, email, substring, insensible à la casse). Debounce 200–300 ms pour l’état 1. Pas d’appel serveur supplémentaire si la liste complète est chargée une fois.

4. **Fermer la conversation**  
   - Côté client uniquement : désélection de la conversation courante → affichage de la liste (état 1) ou de la sidebar sans panneau sélectionné (2a/2b selon le choix d’UX — **point à trancher** : afficher « Choisir une conversation » ou revenir à la liste athlètes).

5. **Athlète**  
   - Comportement actuel conservé : `getOrCreateConversationForAthlete()`, pas de liste, pas de sidebar, pas de bouton Fermer conversation.

### 4.2 Table des fichiers

| Fichier | Rôle | Créer / Modifier |
|---------|------|------------------|
| `app/[locale]/actions/chat.ts` | Actions serveur chat | **Modifier** : ajouter `getAthletesForCoachForChat(search?)`, `getOrCreateConversationForCoach(athleteId)`. Adapter si besoin les types retour (ex. dernier message pour tri). |
| `components/ChatModule.tsx` | Bouton + rendu conditionnel de `ChatOverlay` | **Modifier** : passer une prop `initialAthleteId?: string` à `ChatOverlay` (pour US8). |
| `components/ChatModule.tsx` (ChatOverlay) | Overlay chat (coach + athlète) | **Modifier** : refonte UI selon mockup (états 1, 2a, 2b) ; recherche ; sidebar réductible ; panneau conversation avec header nom + bouton Fermer ; tri listes ; même vue pour athlète. |
| `components/ChatAthleteListItem.tsx` | Ligne athlète (état 1) : avatar + nom + hover « Démarrer » | **Créer** (ou structure inline dans ChatOverlay). Réutiliser Avatar/AvatarImage, getInitials. |
| `components/ChatConversationSidebar.tsx` | Sidebar liste conversations (2a/2b) : lignes avatar+nom, chevron réduire/étendre | **Créer**. Réutiliser Avatar/AvatarImage, getInitials. |
| `app/[locale]/dashboard/athletes/[athleteId]/page.tsx` | Page détail athlète (coach) | **Modifier** (US8) : ajouter bouton « Discuter avec [Nom] » et moyen d’ouvrir l’overlay chat avec `initialAthleteId` (ex. state + ChatModule rendu conditionnel, ou contexte). |
| `messages/fr.json`, `messages/en.json` | Libellés chat | **Modifier** : ajouter clés `chat.searchPlaceholder`, `chat.chooseAthleteToStart`, `chat.start`, `chat.noMatch`, `chat.closeConversation`, `chat.reduceList`, `chat.expandList`, `chat.discussWith` (et existantes si manquantes). |
| `docs/DESIGN_SYSTEM.md` | Documentation composants | **Modifier** : documenter `ChatAthleteListItem` et `ChatConversationSidebar` si réutilisables (section Composants, TOC, Fichiers clés). |
| `tailwind.config.ts` ou `app/globals.css` | Ombres chat (mockup) | **Modifier** (optionnel) : ajouter `shadow-chat`, `shadow-chat-inner` si pas déjà présents. |

---

## 5. Détail des actions serveur (chat.ts)

### 5.1 Nouvelles ou à adapter

- **getAthletesForCoachForChat(query?: string)**  
  - Rôle : fournir la liste des athlètes avec **souscription active** pour le coach, pour l’état 1 (et éventuellement la recherche côté serveur si on ne filtre pas uniquement en client).  
  - Requête : depuis `subscriptions` où `coach_id = auth.uid()` et `status = 'active'`, récupérer les `athlete_id` ; joindre `profiles` (user_id, first_name, last_name, email, avatar_url) et éventuellement `conversations` (id, updated_at) pour le tri.  
  - Tri : par `conversations.updated_at` DESC NULLS LAST (conversations existantes en premier, plus récent en haut), puis par nom/email pour les athlètes sans conversation.  
  - Filtre optionnel `query` : si fourni, filtrer côté serveur sur prénom/nom/email (substring, insensible à la casse). Si non fourni ou vide, retourner toute la liste.  
  - Retour : tableau `{ athlete_id, displayName, avatar_url, conversation_id?, updated_at? }[]` (ou type dédié `AthleteForChat[]`).  
  - **Point à trancher :** recherche état 1 entièrement en client (liste complète chargée une fois) ou appel serveur avec `query` à chaque changement (avec debounce côté client). Recommandation : charger la liste complète une fois, filtre en client (évite requêtes répétées).

- **getOrCreateConversationForCoach(athleteId: string)**  
  - Rôle : pour le coach, récupérer la conversation avec l’athlète ou la créer si elle n’existe pas (et si l’athlète a une souscription active).  
  - Vérification : s’assurer que l’athlète a une souscription active avec le coach (ex. `subscriptions` où `coach_id = auth.uid()` et `athlete_id = athleteId` et `status = 'active'`). Sinon retourner erreur (ex. « Souscription requise »).  
  - Logique : `SELECT` conversation existante ; si aucune, `INSERT` puis `SELECT`. Retourner `{ conversationId, athleteName }` (ou type existant enrichi).  
  - i18n : message d’erreur si pas de souscription (namespace `chat` ou `chat.validation`).

### 5.2 Existantes à réutiliser

- **getConversationsForCoach()**  
  - Déjà tri par `updated_at` DESC. À conserver. Enrichir si besoin le retour avec `avatar_url` pour la sidebar (join profiles sur athlete_id).  
- **getMessages(conversationId)**  
  - Inchangé.  
- **sendMessage(conversationId, content, locale)**  
  - Inchangé (le trigger met à jour `conversations.updated_at`).  
- **getOrCreateConversationForAthlete()**  
  - Inchangé (côté athlète).

---

## 6. Logique métier (résumé)

- **Qui peut créer une conversation ?** Le coach, uniquement pour un athlète ayant une souscription active avec lui. L’athlète continue de créer sa conversation au premier accès au chat (comportement actuel).
- **Ordre des listes :**  
  - État 1 (liste athlètes) : par date du dernier message (conversation) décroissant, puis sans conversation (ordre secondaire ex. alphabétique).  
  - Sidebar 2a/2b : par `conversations.updated_at` DESC.
- **Recherche :** filtrage sur prénom, nom, email (substring, insensible à la casse). État 1 : en live (debounce 200–300 ms). État 2 : au choix live ou sur Entrée.
- **Fermer la conversation :** purement client (désélection) ; pas de suppression en BDD.

---

## 7. Tests manuels recommandés

- **Coach, 0 conversation** : ouvrir l’overlay → état 1 (liste d’athlètes avec souscription active). Recherche en live, aucun résultat → message explicite. Clic sur un athlète → création conversation + affichage panneau.
- **Coach, ≥1 conversation** : ouvrir l’overlay → état 2a (sidebar + panneau). Réduire/étendre la sidebar (2b ↔ 2a). Sélectionner une autre conversation → messages mis à jour. Bouton Fermer conversation → retour liste/sidebar sans fermer l’overlay. Bouton X header → fermeture totale.
- **Coach, page détail athlète** : bouton « Discuter avec [Nom] » → overlay s’ouvre avec cette conversation (créée si besoin).
- **Athlète** : ouvrir le chat → une seule conversation, pas de liste ni sidebar ni bouton Fermer conversation. Envoi/réception de messages.
- **Sécurité** : coach ne peut pas créer de conversation avec un athlète sans souscription active (vérifier retour erreur ou absence de l’athlète dans la liste). Vérifier RLS (un coach ne voit que ses conversations et ses athlètes).

---

## 8. Points à trancher en implémentation

1. **Souscription « active »** : inclure ou non les souscriptions `cancellation_scheduled` dans la liste des athlètes du chat (accès jusqu’à la fin de période) ? Recommandation : uniquement `active` pour simplifier.
2. **Recherche état 2** : déclencher le filtre en live (comme état 1) ou sur Entrée ? Design laisse le choix.
3. **Après « Fermer la conversation »** (coach) : en état 2a, afficher un panneau vide « Choisir une conversation » ou revenir à la vue liste d’athlètes (état 1) ? Recommandation : garder la sidebar visible et afficher un message dans le panneau droit type « Sélectionnez une conversation ».
4. **Ouverture depuis page athlète (US8)** : comment passer `initialAthleteId` au `ChatOverlay` ? Options : state dans un layout/parent partagé, contexte React, ou URL query (ex. `?chat=athleteId`). À choisir selon l’arborescence actuelle du dashboard.
5. **Ombres mockup** : ajouter `shadow-chat` et `shadow-chat-inner` dans le projet (Tailwind ou globals.css) pour coller au mockup.

---

## 9. Checklist avant livraison (Architecte)

- [x] Aucun changement BDD (migrations) — modèle existant suffisant.
- [x] RLS : aucune modification ; contrôle « souscription active » en application.
- [x] Table des fichiers (Créer/Modifier) présente.
- [x] Cas limites listés (souscription active, fermer conversation, recherche vide).
- [x] Tests manuels recommandés indiqués.
- [x] Points à trancher en implémentation listés.

---

**Document de référence pour la phase Développeur (implémentation du chat coach – démarrer une conversation).**

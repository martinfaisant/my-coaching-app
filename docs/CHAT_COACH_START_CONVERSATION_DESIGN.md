# Design – Chat : permettre au coach de démarrer une conversation avec un athlète

**Mode :** Designer  
**Date :** 22 février 2026  
**Contexte :** Actuellement, une conversation n’est créée que lorsque l’athlète ouvre le chat (côté athlète, `getOrCreateConversationForAthlete()`). Le coach ne voit que les conversations déjà existantes ; il ne peut pas initier une session de discussion avec un athlète.

---

## 1. Reformulation du besoin

**Besoin :** En tant que coach, je veux pouvoir **démarrer** une conversation avec n’importe lequel de mes athlètes, même si cet athlète n’a jamais ouvert le chat. Aujourd’hui, si aucun athlète n’a encore envoyé de message, le coach voit « Aucune discussion avec vos athlètes pour le moment » et ne peut pas envoyer le premier message.

**Objectif produit :** Donner au coach au moins un moyen clair d’« ouvrir » ou « démarrer » une conversation avec un athlète donné (création de la conversation côté backend si elle n’existe pas, puis affichage du fil de discussion dans l’UI existante).

---

## 2. Cas identifiés

| Cas | Description |
|-----|-------------|
| **Nominal** | Le coach choisit un athlète (depuis la liste des athlètes ou la page détail athlète), une conversation est créée si besoin, et le coach peut envoyer le premier message. |
| **Conversation déjà existante** | L’athlète a déjà ouvert le chat ; le coach ouvre la même conversation depuis un nouveau point d’entrée → la conversation existante s’affiche, pas de doublon. |
| **Coach sans athlètes** | Pas de souscription active / pas d’athlètes → pas d’affichage des points d’entrée « Démarrer une conversation » (comportement actuel inchangé pour la vue vide). |
| **Fermer la conversation** | Le coach peut quitter la vue conversation pour revenir à la liste sans fermer l'overlay. |
| **Erreur technique** | Échec de création de conversation ou de chargement (RLS, réseau) → message d’erreur compréhensible, pas de blocage silencieux. |
| **Limite** | On ne change pas le modèle de données (une conversation par couple coach–athlète) ; on ajoute uniquement la possibilité pour le coach de créer cette conversation côté backend et d’y accéder depuis l’UI. |

---

## 3. Décisions PO (22 février 2026)

1. **Point(s) d’entrée souhaités**  
   Souhaitez-vous que le coach puisse démarrer une conversation :  
   - depuis la **tuile athlète** sur le dashboard (ex. bouton/lien « Discuter ») ?  
   - depuis la **page détail d’un athlète** (ex. bouton « Ouvrir le chat » / « Discuter avec [Nom] ») ?  
   - et/ou depuis l’**overlay chat** actuel lorsqu’il n’a encore aucune conversation (liste « Choisir un athlète pour démarrer ») ?  
   Toutes ces options sont envisageables ; une combinaison de 2 ou 3 est possible.

2. **Ouverture depuis la page athlète**  
   Quand le coach ouvre le chat en ciblant déjà un athlète (depuis tuile ou page détail), préférez-vous :  
   - ouvrir directement l’overlay avec **cette conversation** (créée si besoin) et le fil de messages ;  
   - ou ouvrir l’overlay puis laisser le coach **sélectionner** l’athlète dans la liste (comportement actuel), en présélectionnant si possible l’athlète d’origine ?

3. **Liste « Tous mes athlètes » dans l’overlay**  
   En cas de « zéro conversation », voulez-vous afficher une **liste de tous les athlètes** (avec souscription active) pour en choisir un et démarrer la conversation, ou préférez-vous garder uniquement des entrées depuis le dashboard / page athlète (sans liste d’athlètes dans l’overlay) ?

4. **Libellés**  
   Préférence pour le libellé d’action : « Discuter », « Ouvrir le chat », « Démarrer une conversation », ou autre (à préciser pour FR/EN) ?

Dès que ces points sont tranchés, les solutions ci‑dessous peuvent être ajustées et détaillées en user stories.

---

## 4. Solution retenue (alignée sur les décisions PO)

### Overlay chat (point d’entrée principal)

- **Bouton « Nouvelle conversation »** dans l’overlay : affichage de la **liste des athlètes** (filtrée par la saisie) (souscription active). Le coach en choisit un → création de la conversation si besoin, puis affichage du fil de messages et zone d’envoi.
- **État « aucune conversation »** : à l’ouverture de l’overlay, afficher directement cette même liste « Choisir un athlète pour démarrer » (pas de message vide type « Aucune discussion »).
- **État « le coach a déjà des conversations »** : header avec titre (ex. « Messages ») et **champ de recherche** (placeholder « Rechercher un athlète ») ; **liste des conversations en sidebar** (à gauche), triée par **date du dernier message** (reçu ou envoyé), **le plus récent en haut** ; à droite le fil de messages et la zone d’envoi.

**Ordre d’affichage de la liste des athlètes / conversations** : la liste (sidebar ou vue liste) est triée par **date du dernier message** (dernier message reçu ou envoyé dans la conversation). **En haut : le plus récent.** En bas : le plus ancien.

### Ouverture depuis la page athlète

- **Page détail athlète** (`/dashboard/athletes/[athleteId]`) : bouton **« Discuter avec [Nom] »** (éviter « Ouvrir le chat »). Au clic, ouverture de l’overlay avec **cette** conversation déjà affichée (créée si besoin).

### Design de l’overlay

- **Moderne** : bordure légère, ombre douce, coins arrondis (design system), espacements généreux, liste d’athlètes en cartes cliquables avec avatar et hover discret. Voir le mockup HTML pour les différents états.

**Composants à faire évoluer :**
- `ChatModule` / `ChatOverlay` : champ de recherche (filtrer par nom) dans le header ; affichage liste athlètes (0 conversation ou liste filtrée) ; sidebar réductible pour les conversations.
- _(non implémenté)_ Page `app/[locale]/dashboard/athletes/[athleteId]` : bouton « Discuter avec [Nom] » ouvrant l’overlay avec `initialAthleteId`.

**Mockup HTML :** `docs/chat-coach-start-conversation-mockup.html`  
Plusieurs **états de l’overlay** sont illustrés (design moderne) : aucune conversation, liste athlètes, recherche + liste, sidebar réductible, conversation avec messages dans le panneau droit (états 2a/2b), bouton Fermer à droite du nom, mobile. Recherche déclenchée sur Entrée uniquement.

---

### Comportement de la recherche (saisie du nom par le coach)

- **État 1 (aucune conversation, liste d’athlètes pour démarrer)** : la recherche est **en live**. La liste se filtre **en temps réel** au fur et à mesure de la saisie (éventuellement debounce 200–300 ms). Pas besoin d’appuyer sur Entrée.
- **États 2a/2b (sidebar avec conversations)** : la recherche peut rester sur Entrée ou être aussi en live (au choix).
- **Champ de filtrage** : le filtre s’applique sur le **nom affiché** de l’athlète (prénom, nom, ou email). Correspondance **partielle** (substring) et **insensible à la casse**.
- **Champ vide** : si le champ est vide, la liste complète est affichée.
- **Aucun résultat** : si la saisie ne correspond à aucun athlète, afficher un message explicite, ex. « Aucun athlète ne correspond à "[saisie]" » (i18n), sans liste.

### Fermer la conversation avec un athlète (sans fermer l’overlay)

- Le coach doit pouvoir **fermer la discussion** avec un athlète donné **sans fermer toute la modale** : la conversation est fermée (désélection ou retrait de la liste), l’overlay reste ouvert (vue liste ou autre conversation).
- **Implémentation** : un bouton **Fermer** (icône X ou « Fermer ») à **droite du nom de l’athlète** dans le **header du panneau de conversation** (à droite) uniquement : à côté de « Jean Dupont », un bouton Fermer ferme cette conversation. Pas de bouton Fermer dans la sidebar.
- À distinguer du bouton **X** du header global qui ferme **toute** l’overlay.
- Il n’y a pas d’état « plein écran conversation » séparé : la conversation s’affiche dans le panneau droit des états 2a/2b ; le bouton Fermer ramène à « aucune conversation sélectionnée » ou retire l’athlète de la liste selon le comportement retenu.

### Même composant et même vue pour l'athlète

- Le **même** composant (ex. `ChatOverlay`) et la **même** vue (même structure : header, zone messages, zone d'envoi) sont utilisés pour **l'athlète** et pour le **coach**. Seules les données et les éléments affichés changent :
  - **Coach** : recherche + liste d'athlètes (ou sidebar conversations) + fil de messages + zone d'envoi ; bouton pour fermer la conversation et revenir à la liste.
  - **Athlète** : une seule conversation (avec le coach) → pas de liste ni de recherche ; affichage direct du fil dans la même structure (header avec nom du coach, zone messages, zone d'envoi). Pas de bouton « Retour » vers une liste.
- Réutilisation du même layout et des mêmes sous-composants (bulles, champ de saisie, bouton envoyer) pour les deux rôles.

---

## 5. User stories

Référence visuelle : **mockup** `docs/chat-coach-start-conversation-mockup.html` (états 1, 2a, 2b, 3, mobile).  
Composants : voir **design system** `docs/DESIGN_SYSTEM.md` ; **à réutiliser** ou **à créer** indiqués pour chaque US.

---

### US1 – Ouvrir l’overlay chat (coach, zéro conversation) et voir la liste d’athlètes

**En tant que** coach sans aucune conversation existante,  
**je veux** qu’à l’ouverture de l’overlay chat s’affiche directement la liste de mes athlètes (souscription active),  
**afin de** choisir un athlète et démarrer une conversation sans voir un écran vide.

**Critères d’acceptation :**
- À l’ouverture de l’overlay (clic sur le bouton « Discuter avec mes athlètes » ou équivalent), si le coach n’a aucune conversation, la vue affichée est celle de l’**état 1** du mockup : header « Messages » + champ de recherche + liste d’athlètes (pas de message « Aucune discussion »).
- La liste affiche les athlètes avec souscription active, chaque ligne : avatar (ou initiales), nom affiché, hover avec indication « Démarrer ».
- Liste triée par date du dernier message (conversation existante ou null), le plus récent en haut ; pour athlètes sans conversation, ordre secondaire au choix (ex. alphabétique).

**Référence mockup :** État 1 – zone liste (lignes Jean Dupont, Marie Martin).

**Composants design :**
- **Modal** (existant `components/Modal.tsx`) : conteneur de l’overlay, `size` et `alignment` selon mockup (ex. `alignment="right"`, largeur type ~560px). Réutiliser tel quel.
- **Button** (existant `components/Button.tsx`) : bouton fermer (X) dans le header. Variante `ghost` ou icône seule. Réutiliser.
- **Champ de recherche** : `Input` (existant) ou `<input type="search">` avec classes `lib/formStyles.ts` (`FORM_BASE_CLASSES`) + icône loupe en préfixe (inline SVG ou icône existante). Placeholder i18n « Rechercher un athlète ».
- **Ligne athlète (état 1)** : **à créer** — composant type `ChatAthleteListItem` ou structure dans `ChatModule` : bloc cliquable (bouton ou div + role/onClick), contenu = avatar + nom + label optionnel « Démarrer » au hover. Réutiliser **Avatar** ou **AvatarImage** (`components/Avatar.tsx`, `components/AvatarImage.tsx`) avec **getInitials** (`lib/stringUtils.ts`) pour les initiales ; tokens `palette-olive`, `palette-sage`, `palette-forest-light`, `rounded-xl`, `border-stone-200` comme dans le mockup. Si une ligne « athlète » minimaliste existe ailleurs (ex. liste déroulante, select), s’en inspirer ; sinon nouveau bloc réutilisable documenté dans le design system.

**i18n :** namespace `chat` : `searchPlaceholder`, `chooseAthleteToStart`, `start` (Démarrer), `messages` (titre).

---

### US2 – Recherche en live (état 1)

**En tant que** coach sur la vue « liste d’athlètes » (état 1),  
**je veux** que la liste se filtre en temps réel quand je saisis du texte dans le champ de recherche,  
**afin de** retrouver rapidement un athlète sans avoir à valider avec Entrée.

**Critères d’acceptation :**
- Filtrage **en live** : la liste se met à jour au fur et à mesure de la saisie (debounce 200–300 ms recommandé).
- Filtre sur le **nom affiché** (prénom, nom, email) : correspondance partielle, insensible à la casse.
- Champ vide → liste complète.
- Aucun résultat → message explicite type « Aucun athlète ne correspond à "[saisie]" » (i18n), pas de liste.

**Référence mockup :** État 1 – champ « Rechercher un athlète » + zone liste.

**Composants design :**
- Même champ de recherche que US1. Comportement (onChange, debounce, filtrage) dans la logique du composant parent (ex. `ChatOverlay`).

**i18n :** `chat.noMatch` avec paramètre `{ query }`.

---

### US3 – Choisir un athlète et ouvrir la conversation (état 1 → panneau conversation)

**En tant que** coach sur la liste d’athlètes (état 1),  
**je veux** pouvoir cliquer sur un athlète pour ouvrir (ou créer) la conversation et afficher le fil de messages,  
**afin de** démarrer ou poursuivre une discussion.

**Critères d’acceptation :**
- Au clic sur une ligne athlète, création de la conversation côté backend si elle n’existe pas, puis affichage du **panneau de conversation** (fil de messages + zone d’envoi). Même structure que les états 2a/2b du mockup (panneau droit).
- Si la conversation existait déjà, affichage des messages existants.
- Le coach peut envoyer le premier message si la conversation est vide.

**Référence mockup :** État 1 (liste) → panneau droit des états 2a/2b (header avec nom de l’athlète + bouton Fermer, bulles, zone d’envoi).

**Composants design :**
- **Header de conversation** : titre = nom de l’athlète ; à droite bouton **Fermer la conversation** (icône X). Réutiliser **IconClose** (`components/icons/IconClose`) ou **Button** `variant="ghost"` avec aria-label i18n.
- **Bulles de messages** : aligner le style actuel de `ChatModule` sur le mockup (bulles `rounded-2xl`, `rounded-tl-md` / `rounded-tr-md`, `shadow-chat-inner`, `bg-white` / `bg-palette-forest-dark`, `text-stone-800` / `text-white`). Pas de nouveau composant si le rendu actuel est ajusté en classes.
- **Zone d’envoi** : champ texte + bouton Envoyer. Réutiliser **Input** ou input contrôlé avec `FORM_BASE_CLASSES` ; **Button** `variant="primary"` ou `primaryDark` pour Envoyer. Icône avion optionnelle (Heroicons ou existante).

**i18n :** `chat.placeholder` (Votre message…), `chat.send`, `chat.closeConversation` (Fermer la conversation), `chat.you`.

---

### US4 – Sidebar conversations (états 2a / 2b) et tri par dernier message

**En tant que** coach ayant au moins une conversation existante,  
**je veux** voir une sidebar avec la liste des conversations (avatar + nom), triée par date du dernier message (le plus récent en haut), et pouvoir réduire la sidebar en n’affichant que les avatars,  
**afin de** naviguer rapidement entre les conversations et gagner de la place à l’écran.

**Critères d’acceptation :**
- À l’ouverture de l’overlay, si le coach a au moins une conversation, affichage **état 2a** : header avec « Messages » + recherche + bouton fermer overlay ; sous le header, sidebar (liste des conversations) + panneau de conversation à droite.
- **Sidebar étendue (2a)** : chaque ligne = avatar/initiales + nom de l’athlète. Pas de bouton Fermer (croix) dans la sidebar. Clic sur une ligne = sélection de cette conversation (affichage dans le panneau droit).
- **Sidebar réduite (2b)** : un bouton (chevron) permet de réduire la sidebar pour n’afficher que les avatars/initiales ; un autre bouton (chevron inverse) permet de rouvrir la sidebar.
- **Ordre de la liste** : tri par **date du dernier message** (reçu ou envoyé), **le plus récent en haut**.

**Référence mockup :** États 2a (sidebar étendue) et 2b (sidebar réduite) – zone gauche.

**Composants design :**
- **Sidebar liste** : **à créer** — bloc réutilisable type `ChatConversationSidebar` : liste verticale de lignes (avatar + nom en 2a, avatars seuls en 2b), bouton chevron pour réduire/étendre. Réutiliser **Avatar** / **AvatarImage** + **getInitials** pour chaque ligne. Tokens : `palette-olive`, `palette-forest-light`, `border-palette-olive/20` pour l’item sélectionné ; `stone-300`, `stone-600` pour les autres. Largeur sidebar étendue ~160px, réduite ~56px (mockup).
- **Boutons chevron** : SVG inline (flèche gauche / droite) ou icônes Heroicons, style `Button variant="ghost"` ou simple bouton rond. Réutiliser pattern existant si présent (ex. Sidebar).

**i18n :** `chat.reduceList`, `chat.expandList`.

---

### US5 – Fermer la conversation sans fermer l’overlay

**En tant que** coach en train de consulter une conversation (panneau droit),  
**je veux** pouvoir fermer cette conversation (revenir à la liste ou à « aucune conversation sélectionnée ») sans fermer toute l’overlay,  
**afin de** changer d’athlète ou revenir à la liste sans rouvrir le chat.

**Critères d’acceptation :**
- Dans le **header du panneau de conversation** (à droite du nom de l’athlète), un bouton **Fermer** (icône X) sur la même ligne que le nom. Au clic : la conversation est fermée (désélection), l’overlay reste ouverte (affichage de la liste – état 1 ou 2a selon le cas). Pas de bouton Fermer dans les lignes de la sidebar.
- Le bouton X du header **global** (en haut à droite) ferme **toute** l’overlay, comme aujourd’hui.

**Référence mockup :** États 2a et 2b – header du panneau droit (« Jean Dupont » + bouton X).

**Composants design :**
- **Button** `variant="ghost"` ou icône seule avec **IconClose** ; `aria-label` = libellé i18n « Fermer la conversation ». Réutiliser composants existants.

**i18n :** `chat.closeConversation` (déjà cité en US3).

---

### US6 – Recherche (états 2a/2b)

**En tant que** coach avec des conversations ouvertes (sidebar visible),  
**je veux** pouvoir rechercher un athlète par nom (soit en live, soit sur Entrée selon choix d’implémentation),  
**afin de** filtrer la liste des conversations ou afficher les résultats de recherche.

**Critères d’acceptation :**
- Le header des états 2a/2b contient un champ « Rechercher un athlète » (même comportement que pour état 1 possible, ou déclenchement sur Entrée). Comportement exact : **au choix** (live ou sur Entrée) tant que le design doc est respecté.
- Filtre sur nom affiché (prénom, nom, email), partiel, insensible à la casse. Champ vide = liste complète. Aucun résultat = message explicite i18n.

**Référence mockup :** États 2a et 2b – zone header (champ recherche à droite du titre « Messages »).

**Composants design :**
- Même type de champ que US1/US2 ; intégration dans le header (layout flex) comme sur le mockup.

---

### US7 – Même vue et composants pour l’athlète

**En tant que** athlète,  
**je veux** ouvrir le chat et voir la même structure d’interface (header avec nom du coach, zone messages, zone d’envoi) que le coach pour une conversation,  
**afin de** avoir une expérience cohérente et de réutiliser le même code.

**Critères d’acceptation :**
- Le **même** composant (ex. `ChatOverlay`) et la **même** structure (header, zone messages, zone d’envoi) sont utilisés pour le rôle athlète et le rôle coach. Côté athlète : pas de liste d’athlètes, pas de sidebar, pas de recherche ; une seule conversation (avec le coach). Pas de bouton « Fermer la conversation » (pas de liste à laquelle revenir).
- Mêmes sous-composants : bulles de messages, champ de saisie, bouton Envoyer. Données et libellés adaptés (nom du coach dans le header, etc.).

**Référence mockup :** Pas d’état dédié athlète dans le mockup ; le panneau droit (conversation) illustre la structure commune.

**Composants design :**
- Aucun composant supplémentaire ; **Modal**, **Button**, champs et bulles déjà cités. Branchement `role === 'athlete'` pour masquer sidebar, recherche et bouton Fermer conversation.

---

### US8 – (Optionnel) Ouvrir le chat depuis la page détail athlète

**En tant que** coach sur la page détail d’un athlète,  
**je veux** un bouton « Discuter avec [Nom] » qui ouvre l’overlay chat avec cette conversation déjà affichée (créée si besoin),  
**afin de** lancer rapidement une discussion avec cet athlète.

**Critères d’acceptation :**
- Sur la page `app/[locale]/dashboard/athletes/[athleteId]`, présence d’un bouton (ou lien) « Discuter avec [Nom] » (i18n). Au clic : ouverture de l’overlay chat avec `initialAthleteId` ; la conversation est créée si elle n’existe pas et affichée dans le panneau droit.
- Comportement identique à « choisir un athlète dans la liste » côté backend (une conversation par couple coach–athlète).

**Référence mockup :** Non illustré dans le mockup actuel ; comportement décrit dans le design §4 (Ouverture depuis la page athlète).

**Composants design :**
- **Button** `variant="outline"` ou `primary` sur la page détail athlète. Réutiliser **Modal** + **ChatModule** / **ChatOverlay** avec prop `initialAthleteId` (à ajouter si pas présente).

**i18n :** `chat.discussWith` avec paramètre `{ name }` (ou libellé page athlete).

---

### Récapitulatif composants

| Composant | Fichier / origine | Action |
|-----------|-------------------|--------|
| Modal | `components/Modal.tsx` | Réutiliser |
| Button | `components/Button.tsx` | Réutiliser |
| Input | `components/Input.tsx` | Réutiliser (ou input search + formStyles) |
| IconClose | `components/icons/IconClose` | Réutiliser |
| Avatar / AvatarImage | `components/Avatar.tsx`, `AvatarImage.tsx` | Réutiliser |
| getInitials | `lib/stringUtils.ts` | Réutiliser |
| formStyles | `lib/formStyles.ts` | Réutiliser pour champs |
| ChatAthleteListItem (ligne état 1) | — | **À créer** (ou structure inline dans ChatModule) ; documenter dans DESIGN_SYSTEM si réutilisable |
| ChatConversationSidebar (sidebar 2a/2b) | — | **À créer** ; documenter dans DESIGN_SYSTEM |
| Bulles messages | Dans `ChatModule` | Faire évoluer les classes pour coller au mockup (tokens, ombres) |

---

## 6. Références

- Design : `docs/CHAT_COACH_START_CONVERSATION_DESIGN.md` (ce document)
- **Architecture :** `docs/CHAT_COACH_START_CONVERSATION_ARCHI.md` (fichiers, flux, données, RLS, tests manuels)
- Design system : `docs/DESIGN_SYSTEM.md`
- Composants : `AthleteTile`, `CoachAthleteTileWithModal`, `ChatModule`, `Modal`, `Button`
- i18n : namespace `chat` dans `messages/fr.json` et `messages/en.json` (clés à étendre si nouveaux libellés)
- Contexte produit : `Project_context.md` (§ Chat 1-to-1 coach–athlète)

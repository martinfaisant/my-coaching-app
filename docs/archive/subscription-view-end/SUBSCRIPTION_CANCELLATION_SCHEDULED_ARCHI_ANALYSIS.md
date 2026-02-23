# Statut « En résiliation » – Analyse du livrable Designer (phase Architecte)

**Mode :** Architecte  
**Date :** 18 février 2026  
**Entrée :** `docs/SUBSCRIPTION_CANCELLATION_SCHEDULED_DESIGN.md` (brief design validé PO)

---

## 1. Ce que le Designer a livré

### 1.1 Décisions PO actées

| Décision | Contenu |
|----------|---------|
| **Périmètre** | Uniquement les souscriptions **mensuelles** (récurrentes). Free et one_time : comportement actuel inchangé (résiliation immédiate, pas de statut « En résiliation »). |
| **Annulation de la résiliation** | Oui : coach et athlète peuvent annuler la résiliation programmée (remettre la souscription « active » sans date de fin) tant que la date de fin n’est pas passée. |
| **Zones d’affichage** | Partout où on affiche aujourd’hui « Active » : bloc Ma souscription (athlète), tuile athlète + modale détail (coach), page Souscriptions (coach). Page Souscriptions coach : **section dédiée** « En résiliation » en plus des sections Actives et Historique. |
| **Charte graphique** | Couleur **amber** (`palette-amber`) pour le badge « En résiliation » et pour la section/tuiles « En résiliation » (bordure gauche des tuiles). |

### 1.2 Règles métier formalisées

- **Statut « En résiliation »** = souscription **active** avec une **end_date** renseignée et **dans le futur**. Pas de nouveau statut métier stocké en base dans le brief : le Designer laisse le choix (dérivé vs stocké) à l’Architecte (US-R6).
- **Déclenchement** : quand l’utilisateur (coach ou athlète) clique « Mettre fin » sur une souscription mensuelle → on programme la fin au prochain cycle (comportement actuel : `end_date` = prochain anniversaire). À partir de ce moment, l’affichage passe en « En résiliation ».
- **Fin effective** : à la date `end_date` (ou après), la souscription doit être traitée comme aujourd’hui (status cancelled, coach_id = null, etc.). Le Designer ne précise pas si un job/cron est requis ou si le traitement est fait à la volée (lecture) ; à trancher en phase Architecte.
- **Annulation de la résiliation** : action qui remet `end_date = null` ; la souscription redevient « Active » (affichage) et le bouton « Mettre fin » réapparaît.

### 1.3 Solution UI décrite (Option A)

- **Badge « En résiliation »** : composant Badge, couleur ambre (ex. `bg-palette-amber/10 text-palette-amber border-palette-amber/20`).
- **Tuiles** : bordure gauche ambre pour les souscriptions « en résiliation » sur la page Souscriptions coach (`border-l-palette-amber`).
- **Comportement conditionnel partout** :
  - Si **active sans end_date** (ou end_date passée) → badge « Active », bouton « Mettre fin ».
  - Si **active avec end_date future** → badge « En résiliation », « Fin prévue le {date} », pas de « Mettre fin », bouton « Annuler la résiliation ».
- **Page Souscriptions (coach)** : trois sections dans l’ordre — (1) Souscriptions actives (vert), (2) **En résiliation** (ambre), (3) Historique (gris).
- **Modal « Annuler la résiliation »** : titre type « Annuler la résiliation ? », corps explicatif, boutons « Annuler » et « Oui, annuler la résiliation ».

### 1.4 User stories livrées (US-R1 à US-R6)

- **US-R1** : Athlète voit « En résiliation » + date de fin sur Mon Coach ; pas de « Mettre fin », bouton « Annuler la résiliation ».
- **US-R2** : Athlète peut annuler la résiliation (modal de confirmation → end_date = null → retour à « Active »).
- **US-R3** : Coach voit « En résiliation » sur tuile athlète et dans la modale détail (badge ambre, date de fin, pas de « Mettre fin », bouton « Annuler la résiliation »).
- **US-R4** : Coach peut annuler la résiliation (depuis modale ou page Souscriptions).
- **US-R5** : Page Souscriptions coach a une section « En résiliation » avec tuiles à bordure ambre ; accès détail et annulation.
- **US-R6** : Prérequis pour l’Architecte (choix dérivé vs stocké, action annulation, RLS).

---

## 2. Implications pour l’Architecte

### 2.1 Modèle de données

- **Aucune nouvelle table** : on reste sur `subscriptions` (status, start_date, end_date, frozen_*, etc.).
- **Statut « En résiliation »** : soit **dérivé** en lecture (`status = 'active' AND end_date IS NOT NULL AND end_date > NOW()`), soit **stocké** (nouvelle valeur ex. `status = 'cancellation_scheduled'`). Le Designer laisse le choix ; l’Architecte doit trancher et documenter (requêtes, cohérence avec le flux actuel de `endSubscription`).
- **Annulation** : une seule opération métier — **UPDATE subscriptions SET end_date = NULL** (pour la ligne concernée), avec les mêmes règles d’accès que pour la programmation de la fin (athlète ou coach autorisé). Aucun changement de `status` si on reste en dérivé ; si on introduit un statut stocké, il faudrait repasser à `active` (et éventuellement ne pas avoir de statut intermédiaire stocké, donc rester en dérivé pour simplifier).
- **Implémenté (migration 045)** : colonne `cancellation_requested_by_user_id` (UUID NULL) sur `subscriptions`. Elle enregistre qui a demandé la résiliation ; seule cette personne peut annuler la résiliation (audit + restriction côté action et UI).

### 2.2 RLS

- **Lecture** : pas de changement ; coach et athlète voient déjà leurs souscriptions (actives et cancelled). La condition « en résiliation » est une dérivation côté applicatif sur les lignes déjà accessibles.
- **Écriture** : il faut autoriser **UPDATE** de `subscriptions` pour **remettre end_date à NULL** (annulation de la résiliation). Les policies actuelles (041, 039) autorisent déjà l’athlète et le coach à mettre à jour la souscription (status, end_date). Il faut vérifier que **WITH CHECK** ou les contraintes permettent bien de repasser `end_date` à null (pas de contrainte CHECK qui l’interdirait). Si une policy impose par exemple que end_date ne peut que être renseignée et pas effacée, il faudrait l’adapter.

### 2.3 Flux et actions serveur

- **Action existante** : `endSubscription` — pour monthly, elle fait déjà `UPDATE subscriptions SET end_date = <prochain cycle>` sans changer le status. Cohérent avec un statut « En résiliation » **dérivé** (active + end_date future).
- **Nouvelle action** : `cancelSubscriptionCancellation` (ou nom équivalent) : reçoit `subscriptionId` (et locale pour i18n) ; vérifie que la souscription est bien active avec end_date future et que l’appelant est l’athlète ou le coach ; fait `UPDATE subscriptions SET end_date = NULL WHERE id = ...` ; revalide les chemins concernés (dashboard, coach, subscriptions).
- **Traitement à la date de fin** : le Designer n’impose pas de changement. Aujourd’hui, une souscription avec status active et end_date passée reste en base jusqu’à ce qu’un job ou une logique applicative la passe en cancelled et mette coach_id à null. L’Architecte doit préciser : soit un **cron/job** qui exécute ce traitement (ex. quotidien), soit une **lecture « as-of »** qui considère comme terminées les souscriptions active + end_date < NOW() pour l’affichage et applique le passage en cancelled + null coach_id à la première interaction ou dans un batch. Recommandation : documenter la décision (cron vs à la volée) dans la spec technique.

### 2.4 Écrans et requêtes impactés

- **Athlète – Mon Coach** (`/dashboard/coach`) : déjà chargement d’une souscription active ; ajouter la dérivation « en résiliation » (active + end_date future) pour afficher le bon badge, la date de fin, le bouton « Annuler la résiliation » et masquer « Mettre fin ».
- **Coach – Dashboard (tuiles athlètes)** : les souscriptions actives chargées incluent déjà celles avec end_date ; dériver « en résiliation » pour la modale détail (badge, boutons).
- **Coach – Modale détail souscription** : affichage conditionnel badge (Active vs En résiliation), bouton « Mettre fin » vs « Annuler la résiliation ».
- **Coach – Page Souscriptions** (`/dashboard/subscriptions`) : **scinder** les souscriptions actives en deux listes — (1) actives sans end_date (ou end_date passée, cas limite) → section « Souscriptions actives » ; (2) actives avec end_date future → section « En résiliation ». Requêtes : soit une requête avec filtre `status = 'active'` puis partition en mémoire, soit deux requêtes (ex. actives sans end_date / actives avec end_date future). Historique inchangé (status = 'cancelled').

### 2.5 i18n

- Nouveaux libellés (namespace à définir, ex. `myCoach.subscription` ou dédié) : « En résiliation », « Annuler la résiliation », « Annuler la résiliation ? », corps de la modal d’annulation, « Oui, annuler la résiliation ». FR et EN.

### 2.6 Décisions actées (post-migration 044)

1. **Statut « En résiliation »** : **explicite en base** — valeur `cancellation_scheduled` ajoutée au CHECK sur `subscriptions.status` (migration 044). Affichage « En résiliation » lorsque `status = 'cancellation_scheduled'` (ou, pour robustesse si end_date passée mais cron pas encore passé : afficher comme « En résiliation » tant que status n’est pas `cancelled` et end_date est renseignée).
2. **Passage à cancelled** : **cron** — fonction `process_expired_subscription_cancellations()` exécutée quotidiennement (pg_cron, 2h00 UTC) ; met à jour les souscriptions dont `status = 'cancellation_scheduled'` et `end_date <= NOW()` en `cancelled` et met `profiles.coach_id = NULL` pour ces athlètes. Aucun cron existant pour ce cas avant la migration 044.
3. **Contraintes RLS** : les policies actuelles (039, 041) permettent déjà l’UPDATE par l’athlète et le coach ; l’annulation de la résiliation (remise de `status` à `active` et `end_date` à `NULL`) est couverte.
4. **Edge case (end_date dépassée, status pas encore cancelled)** : conserver l’affichage **comme « En résiliation »** (badge ambre, date de fin) jusqu’à ce que le cron ait passé le statut en `cancelled`. Pas d’affichage « Terminée » tant que status ≠ cancelled.

---

## 3. Synthèse

Le Designer a livré un **brief validé PO** qui introduit un **affichage « En résiliation »** pour les souscriptions mensuelles dont la fin a été programmée (`end_date` future), avec **annulation de la résiliation** (remise de `end_date` à null). Aucun nouveau statut stocké n’est imposé ; l’UI repose sur la dérivation « active + end_date future ». La page Souscriptions coach passe à **trois sections** (Actives, En résiliation, Historique), avec une charte **amber** pour « En résiliation ». L’Architecte doit produire la **spécification technique** (décisions modèle/RLS/cron, action d’annulation, découpage des requêtes et des écrans) pour le Développeur.

---

## 4. État d'implémentation

- **Statut stocké** : `cancellation_scheduled` (migration 044). `endSubscription` (monthly) met à jour `status` et `cancellation_requested_by_user_id` (migration 045).
- **Qui peut annuler** : seule la personne ayant demandé la résiliation (`cancellation_requested_by_user_id`). Côté app : vérification dans `cancelSubscriptionCancellation` ; côté UI : bouton « Annuler la résiliation » affiché uniquement si `currentUserId === subscription.cancellation_requested_by_user_id` (pas de message d'explication pour l'autre sur la vue athlète).
- **Vue athlète (Mon Coach)** : « A débuté le » et « Fin prévue le » sur la même ligne.

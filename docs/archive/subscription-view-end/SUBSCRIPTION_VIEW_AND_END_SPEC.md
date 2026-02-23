# Vue et résiliation de la souscription – Spécification technique (Mode Architecte)

**Entrée :** `docs/SUBSCRIPTION_VIEW_AND_END_DESIGN.md` (brief design + user stories).  
**Objectif :** Définir l’architecture, le modèle de données, les RLS et la logique métier pour que le Développeur puisse implémenter sans ambiguïté.

---

## État d'implémentation

- **Status :** `subscriptions.status` inclut `'cancellation_scheduled'` (migration 044). Résiliation mensuelle → `status = 'cancellation_scheduled'`, `end_date` = prochain cycle, `cancellation_requested_by_user_id` = auteur (migration 045).
- **Annulation de la résiliation :** action `cancelSubscriptionCancellation` ; vérification `cancellation_requested_by_user_id === auth.uid()` ; mise à jour `status = 'active'`, `end_date = null`, `cancellation_requested_by_user_id = null`.
- **Page Souscriptions (coach) :** trois sections (Actives, En résiliation, Historique) ; requête unique `status IN ('active','cancellation_scheduled')` puis partition en mémoire ; tuiles « En résiliation » avec `border-l-palette-amber`.
- **Cron :** `process_expired_subscription_cancellations()` (migration 044, pg_cron 2h UTC).

---

## 1. Analyse de la solution Designer

### 1.1 Synthèse des écrans et flux

| Côté | Écran / flux | Description |
|------|----------------|-------------|
| **Athlète** | Mon Coach | Bloc « Ma souscription » (offre figée, prix/type, dates, bouton « Mettre fin »). Pas de lien historique. |
| **Athlète** | Sidebar | Nouvel item « Historique des souscriptions » → `/dashboard/subscriptions/history`. |
| **Athlète** | Historique | Liste des souscriptions passées (tuile grise, même structure que coach), lecture seule. |
| **Athlète** | Modal confirmation | « Mettre fin » → conséquences + si monthly « actif jusqu’au [date] » ; Annuler / Mettre fin (danger). |
| **Coach** | Mes athlètes | Sur chaque tuile : titre de la souscription + flèche ; clic → détail en **modale**. Athlètes sans souscription active (archivés) exclus de cette liste. |
| **Coach** | Sidebar | Nouvel item « Souscriptions » → `/dashboard/subscriptions`. |
| **Coach** | Page Souscriptions | Bloc « Actives » (tuiles vertes) + bloc « Historique » (tuiles grises, même structure que l’athlète). Clic ligne → détail en modale ; bouton « Mettre fin ». |
| **Coach** | Modale détail | Contenu type « Ma souscription » + nom athlète + bouton « Mettre fin » (ouvre modal confirmation). |
| **Partagé** | Modal « Mettre fin » | Texte adapté athlète/coach ; bouton danger (design system). |

### 1.2 Règles métier à implémenter

- **Fin immédiate (free / one_time) :** `subscriptions.status = 'cancelled'`, `subscriptions.end_date = NOW()`, `profiles.coach_id = null` pour l’athlète.
- **Fin au cycle (monthly) :** `subscriptions.end_date` = prochain anniversaire (ex. start_date 4 mars, résiliation 7 juin → end_date 4 juillet). La souscription reste `status = 'active'` jusqu’à cette date. À **end_date**, il faut appliquer : `status = 'cancelled'` et `profiles.coach_id = null`.
- **Liste « Mes athlètes » (coach) :** uniquement les athlètes avec `profiles.coach_id = current.id` (comportement actuel). Donc dès que `coach_id` est mis à null, l’athlète disparaît de la liste (et perd l’accès calendrier/workouts via RLS existant).
- **Historique / archivés (coach) :** liste dérivée des souscriptions avec `coach_id = me` et `status = 'cancelled'` (avec jointure `profiles` pour noms), pas d’accès aux données live (déjà garanti par RLS dès que `coach_id` est null).

### 1.3 Points laissés ouverts par le Designer (à trancher ici)

1. **Type de tarification sur la souscription**  
   La table `subscriptions` n’a pas aujourd’hui de `frozen_price_type`. Pour appliquer « fin immédiate vs fin au cycle », il faut connaître le type (free / one_time / monthly). **Décision :** ajouter `frozen_price_type` sur `coach_requests` (au snapshot) et sur `subscriptions` (copié à l’acceptation).

2. **Qui peut mettre à jour une souscription (résilier)**  
   Aujourd’hui seul le coach a une policy UPDATE sur `subscriptions`. L’athlète doit aussi pouvoir lancer la résiliation. **Décision :** ajouter une policy UPDATE pour l’athlète sur ses propres lignes (`athlete_id = auth.uid()`), avec contraintes métier côté application (seul status/end_date modifiables, selon frozen_price_type).

3. **Exécution de la fin au cycle (monthly)**  
   Quand `end_date` est atteint, il faut mettre `status = 'cancelled'` et `profiles.coach_id = null`. **Décision (PO) :** utiliser un **cron** (job planifié) qui exécute quotidiennement la clôture des souscriptions monthly à échéance. Voir section 4.3 et 4.6.

4. **« Souscription active » pour l’athlète (Mon Coach)**  
   Un athlète avec `profiles.coach_id` non null peut avoir au plus une souscription active (celle liée à ce coach). **Décision :** récupérer la souscription avec `athlete_id = current.id` et `status = 'active'` et `(end_date IS NULL OR end_date > NOW())` ; si monthly et résiliation déjà demandée, afficher « Fin prévue le [end_date] ».

---

## 2. Modèle de données

### 2.1 Évolutions nécessaires

#### 2.1.1 Table `coach_requests`

- **Ajout :** `frozen_price_type TEXT` (nullable), contrainte `CHECK (frozen_price_type IS NULL OR frozen_price_type IN ('free', 'one_time', 'monthly'))`.
- **Rôle :** snapshot du `price_type` de l’offre au moment de la demande (pour copie dans `subscriptions` à l’acceptation).
- **Remplissage :** dans `createCoachRequest`, lorsque une offre est choisie (`offerId`), copier `offer.price_type` dans `frozen_price_type`.

#### 2.1.2 Table `subscriptions`

- **Ajout :** `frozen_price_type TEXT` (nullable), même contrainte que ci‑dessus.
- **Rôle :** déterminer si la résiliation est immédiate (free / one_time) ou au prochain cycle (monthly).
- **Remplissage :** à l’acceptation de la demande, copier depuis `coach_requests.frozen_price_type` (et non depuis `coach_offers`).

### 2.2 Schéma cible (extrait)

```text
coach_requests
  + offer_id, frozen_price, frozen_title, frozen_description  (existant)
  + frozen_price_type  (nouveau)

subscriptions
  + id, athlete_id, coach_id, request_id
  + frozen_price, frozen_title, frozen_description  (existant)
  + frozen_price_type  (nouveau)
  + status ('active' | 'cancellation_scheduled' | 'cancelled'), start_date, end_date, created_at
  + cancellation_requested_by_user_id  (UUID NULL, migration 045)
```

### 2.3 Pas de nouvelle table

- Liste « athlètes archivés » = lecture des `subscriptions` avec `coach_id = auth.uid()` et `status = 'cancelled'`, avec jointure sur `profiles` pour afficher les noms. Pas de table dédiée.

---

## 3. RLS (Row Level Security)

### 3.1 Table `subscriptions` (état actuel + évolution)

- **SELECT athlète :** `athlete_id = auth.uid()` — inchangé.
- **SELECT coach :** `coach_id = auth.uid()` — inchangé.
- **INSERT coach :** `coach_id = auth.uid()` — inchangé.
- **UPDATE coach :** `coach_id = auth.uid()` — inchangé.
- **UPDATE athlète (nouveau) :** autoriser l’athlète à mettre à jour **uniquement** ses propres lignes (`athlete_id = auth.uid()`), pour pouvoir modifier `status` et `end_date` lors de la résiliation. Les colonnes modifiables en pratique seront contrôlées côté application (seule la résiliation est exposée).

**Policy à créer :**  
`subscriptions_update_athlete` : `FOR UPDATE TO authenticated` avec `USING (athlete_id = auth.uid())` et `WITH CHECK (athlete_id = auth.uid())`.

### 3.2 Tables existantes (workouts, goals, profiles)

- **Workouts / goals :** les policies existantes s’appuient sur `profiles.coach_id`. Dès que `profiles.coach_id` est mis à null pour un athlète, le coach perd l’accès à ses workouts/goals. **Aucune modification RLS** nécessaire pour « archivage ».
- **Profiles :** la mise à jour de `coach_id` (pour le remettre à null à la fin de souscription) doit être restreinte. Aujourd’hui la policy `profiles_update_coach_accept_request` permet au coach de mettre `coach_id = auth.uid()` pour un athlète dont la demande est pending. **Il faut une policy ou une logique supplémentaire** pour permettre de mettre `coach_id = null` lorsque la souscription est résiliée (par le coach ou par l’athlète). Options :
  - **Option A (recommandée) :** server action « mettre fin à la souscription » (côté app) fait en une transaction (ou deux appels contrôlés) : (1) UPDATE `subscriptions` (status, end_date), (2) UPDATE `profiles` SET coach_id = null pour cet athlète. Pour (2), ajouter une policy sur `profiles` : autoriser UPDATE si `user_id` correspond à un `athlete_id` d’une souscription où `coach_id = auth.uid()` OU `athlete_id = auth.uid()`, et qu’on ne met que `coach_id` à null (à documenter ; en pratique on peut une policy plus simple : « coach peut update coach_id vers null pour un athlete_id qui a une subscription cancelled avec ce coach », ou « athlete peut update son propre profil pour mettre coach_id à null »). Pour simplifier : **policy** « authenticated peut mettre à jour `profiles.coach_id` à null pour `user_id = auth.uid()` » (athlète se « délie » lui‑même) et « coach peut mettre à jour `profiles.coach_id` à null pour un user_id qui est athlete_id d’une subscription où coach_id = auth.uid() ». À implémenter en une migration avec des policies claires.
  - **Option B :** trigger en base qui, sur UPDATE de `subscriptions` (status → cancelled, end_date renseigné), met à jour `profiles.coach_id = null` pour cet `athlete_id`. Cela évite une deuxième policy sur profiles mais couple la logique à la base.

**Décision retenue :** Option A. Une **server action** unique « endSubscription(subscriptionId) » (ou équivalent) effectue : (1) UPDATE subscriptions SET status = 'cancelled', end_date = … WHERE id = … ; (2) UPDATE profiles SET coach_id = null WHERE user_id = subscription.athlete_id. Pour (2), ajouter une policy sur `profiles` : permettre à un utilisateur authentifié de mettre `coach_id` à null pour un `user_id` qui est soit lui‑même (`user_id = auth.uid()`), soit un `athlete_id` d’une souscription où `coach_id = auth.uid()` (coach qui « libère » l’athlète). Détail à mettre dans la migration (voir section 5).

---

## 4. Architecture applicative (fichiers, modules, flux)

### 4.1 Routes (App Router)

- **Athlète**
  - `app/[locale]/dashboard/coach/page.tsx` — Existant ; ajout du bloc « Ma souscription » (données : souscription active de l’athlète).
  - `app/[locale]/dashboard/subscriptions/history/page.tsx` — **Nouvelle page** : historique des souscriptions (liste en tuiles grises).
- **Coach**
  - `app/[locale]/dashboard/page.tsx` — Existant ; adapter la liste « Mes athlètes » : n’afficher que les athlètes avec `profiles.coach_id = current.id` (inchangé) et pour chaque athlète afficher le titre de la souscription active + flèche, clic ouvrant une modale de détail (client component).
  - `app/[locale]/dashboard/subscriptions/page.tsx` — **Nouvelle page** : Souscriptions actives (tuiles vertes) + Historique (tuiles grises). Données : souscriptions du coach (actives puis cancelled), avec jointure profiles pour les noms.
- **Pas de route** `/dashboard/subscriptions/[id]` en page dédiée : le détail est uniquement en **modale** (client).

### 4.2 Données à charger (résumé)

- **Mon Coach (athlète) :**  
  Souscription active : `subscriptions` où `athlete_id = current.id` et `status = 'active'` et (`end_date` IS NULL ou `end_date > NOW()`). Une seule ligne attendue. Si pas de ligne, afficher « Aucune souscription active » ou ne pas afficher le bloc.
- **Historique athlète :**  
  `subscriptions` où `athlete_id = current.id` et `status = 'cancelled'`, ordre `end_date DESC` (ou `created_at DESC`), avec jointure `profiles` sur `coach_id` pour le nom du coach.
- **Mes athlètes (coach) :**  
  Inchangé : `profiles` où `coach_id = current.id`. Pour chaque profil, charger la souscription active (une par athlète) : `subscriptions` où `coach_id = current.id` et `athlete_id = profile.user_id` et `status = 'active'` et (`end_date` IS NULL ou `end_date > NOW()`). Permet d’afficher le titre (frozen_title) et le lien vers la modale de détail.
- **Page Souscriptions (coach) :**  
  - Actives : `subscriptions` où `coach_id = current.id` et `status = 'active'` et (`end_date` IS NULL ou `end_date > NOW()`), jointure `profiles` (athlete) pour noms.
  - Historique : `subscriptions` où `coach_id = current.id` et `status = 'cancelled'`, jointure `profiles` pour noms, ordre `end_date DESC` (ou `created_at DESC`).
- **Clôture des monthly à échéance :** assurée par un **cron** (voir section 4.6), pas au chargement des pages.

### 4.3 Server actions

- **Résiliation (athlète et coach)**  
  Une action unique (ex. `endSubscription(subscriptionId, locale)`) :
  1. Vérifier que l’utilisateur est soit l’athlète soit le coach de cette souscription (RLS + check côté app).
  2. Lire la souscription (id, athlete_id, coach_id, frozen_price_type, start_date, end_date).
  3. Selon `frozen_price_type` :
     - **free ou one_time :**  
       - `end_date = NOW()` (ou date du jour en début de journée UTC selon convention).  
       - `status = 'cancelled'`.  
       - UPDATE `profiles` SET `coach_id = null` WHERE `user_id = athlete_id`.
     - **monthly :**  
       - Calculer `end_date` = prochain anniversaire après aujourd’hui (à partir de `start_date`, mois par mois).  
       - Mettre à jour uniquement `subscriptions.end_date`. Ne pas mettre `status = 'cancelled'` ni `coach_id = null` avant cette date.
  4. Réponse structurée (succès / erreur) pour affichage dans la modale (message succès, fermeture, revalidation).
- **Clôture des monthly à échéance**  
  Une fonction (ex. `closeExpiredSubscriptions()`) **invoquée par un cron quotidien** : pour chaque souscription avec `status = 'active'` et `end_date IS NOT NULL` et `end_date < NOW()`, mettre `status = 'cancelled'` et `profiles.coach_id = null` pour l’`athlete_id` concerné. Idempotent. L’endpoint appelé par le cron doit être sécurisé (secret, pas exposé aux utilisateurs).

### 4.4 Composants (résumé)

- **Bloc « Ma souscription »** (Mon Coach) : Server component ou client avec données passées en props ; bouton « Mettre fin » ouvre une modale (client).
- **Modale confirmation « Mettre fin »** : Client component réutilisable (athlète + coach), texte et date de fin dynamiques selon `frozen_price_type` et `end_date`.
- **Modale détail souscription (coach)** : Client component, contenu = détail d’une souscription + bouton « Mettre fin » (ouvre la modale confirmation).
- **Tuiles liste** : Réutiliser TileCard (bordure gauche verte actives, grise historiques) ; structure identique athlète/coach pour l’historique (nom, titre, descriptif tronqué, prix/type, période, badge Terminée).
- **Sidebar :** Ajouter item « Historique des souscriptions » (athlète) et « Souscriptions » (coach) ; i18n.

### 4.5 i18n

- Nouveaux namespaces ou clés pour : Ma souscription, Mettre fin à la souscription, Historique des souscriptions, Souscriptions, Annuler, Mettre fin, messages de la modale (conséquences, fin au cycle), libellés des tuiles (Terminée, prix/type), erreurs. Référence : `docs/I18N.md`.

### 4.6 Cron : clôture des souscriptions monthly à échéance

- **Objectif :** exécuter quotidiennement la logique « closeExpiredSubscriptions » (mettre `status = 'cancelled'` et `profiles.coach_id = null` pour les souscriptions où `status = 'active'` et `end_date < NOW()`).
- **Implémentation possible :**
  - **Vercel :** route API (ex. `app/api/cron/close-expired-subscriptions/route.ts`) protégée par un secret (header ou query) + configuration Cron dans le dashboard Vercel (schedule quotidien).
  - **Supabase :** Edge Function + pg_cron (si disponible) ou appel HTTP externe depuis un cron (Vercel, GitHub Actions, etc.).
- **Sécurité :** l’endpoint ne doit pas être appelable sans le secret partagé (variable d’environnement). Documenter le secret et le schedule dans les notes de déploiement.

---

## 5. Migrations SQL à rédiger

### 5.1 Migration 1 : `frozen_price_type` sur coach_requests et subscriptions

- `coach_requests` : ajout colonne `frozen_price_type TEXT` avec contrainte `CHECK (frozen_price_type IS NULL OR frozen_price_type IN ('free', 'one_time', 'monthly'))`.
- `subscriptions` : même colonne et même contrainte.
- Commentaires sur les colonnes.

### 5.2 Migration 2 : RLS subscription (UPDATE athlète)

- Policy `subscriptions_update_athlete` : `FOR UPDATE TO authenticated` sur `subscriptions`, `USING (athlete_id = auth.uid())`, `WITH CHECK (athlete_id = auth.uid())`.

### 5.3 Migration 3 : Mise à jour de `profiles.coach_id` à null (résiliation)

- Permettre à l’athlète de se « délier » : policy sur `profiles` autorisant UPDATE de `coach_id` à null lorsque `user_id = auth.uid()` (et éventuellement restreindre aux champs `coach_id` uniquement si le moteur le permet).
- Permettre au coach de « libérer » l’athlète : policy autorisant UPDATE de `profiles` pour mettre `coach_id = null` lorsque le `user_id` est l’`athlete_id` d’une souscription où `coach_id = auth.uid()`. (À formuler précisément selon la syntaxe Supabase/Postgres.)

Note : Si une seule policy « UPDATE profiles SET coach_id = null » est plus simple (ex. « user_id = auth.uid() OR user_id IN (SELECT athlete_id FROM subscriptions WHERE coach_id = auth.uid()) »), l’utiliser en documentant que l’usage prévu est uniquement pour la résiliation.

---

## 6. Cas limites et contraintes

- **Souscription monthly déjà avec end_date renseigné :** si l’utilisateur clique une seconde fois « Mettre fin », ne pas recalculer une date plus lointaine ; considérer la souscription comme déjà en fin programmée (afficher la modale en lecture ou désactiver le bouton).
- **Concurrence :** deux onglets (athlète + coach) qui résilient en même temps : dernier UPDATE gagne ; acceptable en MVP.
- **Absence de frozen_price_type (données existantes) :** pour les anciennes lignes sans `frozen_price_type`, traiter comme `one_time` (fin immédiate) pour éviter de bloquer la résiliation.
- **Liste « Mes athlètes » :** ne pas afficher les athlètes dont la seule souscription est cancelled et end_date dans le passé (ils n’ont plus coach_id ; déjà exclu car profiles.coach_id = null).

---

## 7. Livrables pour le Développeur

1. **Migrations** (3 fichiers numérotés après la dernière existante) : frozen_price_type (coach_requests + subscriptions), RLS UPDATE athlète sur subscriptions, policies profiles pour coach_id = null.
2. **Code applicatif :**
   - Remplir `frozen_price_type` dans `createCoachRequest` (depuis l’offre) et dans `respondToCoachRequest` (copie depuis coach_requests vers subscriptions).
   - Nouvelles routes : `dashboard/subscriptions/history` (athlète), `dashboard/subscriptions` (coach).
   - Server actions : `endSubscription`, `closeExpiredSubscriptions` (logique réutilisable).
   - **Cron :** endpoint sécurisé (ex. API route) appelant `closeExpiredSubscriptions`, planifié quotidiennement (Vercel Cron ou équivalent). Documenter le secret et le schedule.
   - Bloc « Ma souscription » sur Mon Coach ; modale confirmation ; modale détail (coach) ; tuiles actives/historique ; sidebar (items + i18n).
3. **Types TypeScript :** ajouter `frozen_price_type` aux types `Subscription` et au type/interface des coach_requests (snapshot).
4. **i18n :** clés pour toutes les chaînes côté athlète, coach et modales (FR/EN).

---

## 8. Décisions PO (réponses aux questions)

- **Cron / fin de cycle monthly :** **Oui.** Un cron quotidien exécute la clôture des souscriptions monthly à échéance (section 4.6).
- **US8 (cohérence des en-têtes) :** **Oui, à traiter** via une **user story technique** dédiée (section 9).

---

## 9. User story technique – Cohérence des en-têtes (US8)

**En tant que** développeur,  
**je veux** que toutes les pages dashboard utilisent le même composant d’en-tête (structure et styles),  
**afin de** garantir une cohérence visuelle et éviter les écarts (hauteur, bordure, fond).

**Critères d’acceptation (techniques) :**
1. Le design system (`docs/DESIGN_SYSTEM.md`) documente l’**en-tête canonique** des pages dashboard : composant `PageHeader` (ou équivalent) avec les classes de référence (ex. `flex items-center justify-between gap-4 px-6 lg:px-8 py-4 border-b border-stone-200/50 bg-white/80`, titre `text-xl font-bold text-stone-900 truncate`). Si le composant existe déjà, ajouter une section « En-tête des pages dashboard » qui le référence explicitement.
2. **Toutes les nouvelles pages** (Historique des souscriptions, Souscriptions coach, et toute future page dashboard) utilisent `DashboardPageShell` (qui inclut `PageHeader`) ou, si layout différent, le même composant `PageHeader` avec les mêmes props/classes.
3. **Revue des pages existantes :** identifier les pages dashboard qui n’utilisent pas `DashboardPageShell` / `PageHeader` (ex. page d’accueil dashboard `/dashboard` qui a un header custom) et soit les migrer vers le composant canonique, soit documenter l’exception et la raison (ex. « Page d’accueil coach : header h-20 pour cohérence avec maquette »).
4. Checklist ou note dans la doc (ou dans `DOCS_INDEX.md`) : « Nouvelles pages dashboard : utiliser DashboardPageShell + PageHeader ».

**Priorité :** peut être réalisée dans le même sprint que la feature souscriptions ou dans un sprint dédié refactoring. Les nouvelles pages de la feature souscriptions doivent d’emblée respecter le critère 2.

---

**Document de référence pour la phase Développeur.** En cas de doute sur un point métier ou de sécurité, le Développeur pourra s’y référer ou demander clarification au PO/Architecte.

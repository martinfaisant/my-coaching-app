# Notes de déploiement

**Production :** https://mysportally.com (voir `docs/DOMAIN_MYSPORTALLY_SETUP.md` pour la configuration domaine, Vercel, Resend, Supabase).  
**Dernière mise à jour doc :** 12 juin 2026 (politique mot de passe Supabase ; précédent : connexion Google OAuth).

---

## Politique mot de passe (Supabase Auth)

**Aucune migration BDD** — réglage dashboard Supabase + validation app (`lib/passwordValidation.ts`).

### Supabase (prod et dev)

**Authentication → Settings** (ou **Auth → Policies / Password**) — exiger :

- Longueur minimale : **8**
- **Lowercase**, **Uppercase**, **Digits**, **Symbols**

L’app affiche une checklist des 5 critères à l’**inscription email** et à la **réinitialisation** ; le bouton de validation reste désactivé tant que tous les critères ne sont pas remplis. Référence produit : **`Project_context.md`** §4.1 ; composants : **`PasswordRequirements`**, **`NewPasswordField`** (`docs/DESIGN_SYSTEM.md`).

**Vérification post-déploiement :** sur `/login` (bloc inscription), saisir un mot de passe incomplet → critères gris/rouge, bouton « S'inscrire » désactivé ; mot de passe valide (ex. `MonMot2!`) + rôle + CGU → submit possible.

---

## Connexion Google (OAuth login / signup)

**Aucune migration BDD** — Auth Supabase + config Google Cloud + variables Vercel.

### Flux des URLs (2 redirect distincts)

| Étape | Où configurer | URL exemple (prod) |
|-------|----------------|---------------------|
| Google → Supabase | **Google Cloud** → Identifiants OAuth → **URI de redirection autorisés** | `https://<REF_PROJET_SUPABASE>.supabase.co/auth/v1/callback` |
| Supabase → app | **Supabase** → Authentication → URL Configuration → **Redirect URLs** | `https://mysportally.com/auth/callback` |

L’app construit le callback via `NEXT_PUBLIC_SITE_URL` + `/auth/callback` (`lib/authOAuth.ts` → `oauthCallbackPath()`).

### Google Cloud Console

1. **APIs & Services → Identifiants** → client OAuth Web.
2. **URI de redirection autorisés** (URL **complètes**, avec `/auth/v1/callback`) — une entrée **par projet Supabase** si dev et prod sont distincts :
   - Prod : `https://vkkykxbtywoxsqlpznng.supabase.co/auth/v1/callback`
   - Dev/preview : `https://<ref_dev>.supabase.co/auth/v1/callback` (si même client Google)
3. **Branding → Domaines autorisés** : `mysportally.com` + les sous-domaines `*.supabase.co` utilisés (cohérent avec les redirect ci-dessus).
4. Écran de consentement : nom d’app **My Sport Ally** ; liens CGU / confidentialité vers `https://mysportally.com/terms` et `/privacy`.

### Supabase (projet **production**)

1. **Authentication → Providers → Google** : activer, renseigner Client ID + Secret (même client Google ou client dédié prod).
2. **Authentication → URL Configuration** :
   - **Site URL** : `https://mysportally.com`
   - **Redirect URLs** : `https://mysportally.com/auth/callback` (ajouter preview/local si besoin : `http://localhost:3000/auth/callback`, `https://*.vercel.app/auth/callback` selon politique Supabase).

Répéter la config Google provider sur le **projet Supabase de dev/preview** avec les URLs de cet environnement.

### Vercel — variables par environnement

| Variable | Production | Preview / local |
|----------|------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://vkkykxbtywoxsqlpznng.supabase.co` | projet dev |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon **prod** | clé anon dev |
| `SUPABASE_SECRET_KEY` | service role **prod** | service role dev |
| `NEXT_PUBLIC_SITE_URL` | `https://mysportally.com` | preview URL ou `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | `https://mysportally.com` | idem |

**Ne pas mélanger** clés Supabase prod et redirect Google d’un autre projet.

### Vérification post-déploiement

1. `https://mysportally.com/login` → **Continuer avec Google**.
2. Nouveau compte → `/auth/complete-signup` (rôle + CGU) → dashboard ; prénom/nom préremplis si Google les fournit.
3. Compte existant lié → dashboard direct.
4. Erreurs typiques : `redirect_uri_mismatch` (Google) = URI Supabase manquante ; échec après Google = Redirect URL app absente dans Supabase ; mauvaises données = variables Vercel pointant vers le mauvais projet Supabase.

**Code clé :** `lib/authOAuth.ts`, `app/[locale]/login/oauthActions.ts`, `app/auth/callback/route.ts`, `lib/googleUserMetadata.ts`, `proxy.ts` (i18n : exclure uniquement `/auth/callback`).

---

## Connexion Strava — appareils athlète (feature flag)

- **Comportement par défaut (lancement) :** pas d’entrée menu **« Mes appareils connectés »**, page `/dashboard/devices` → redirect calendrier pour les athlètes, OAuth `/api/auth/strava` bloqué. Les activités **déjà importées** restent visibles au calendrier et aux statistiques.
- **Variable d’environnement :** `NEXT_PUBLIC_ENABLE_ATHLETE_STRAVA_DEVICES=true` pour exposer la feature (menu compte, page devices, OAuth, sync/déconnexion). Absent ou ≠ `true` → feature off. Source : `lib/featureFlags.ts`.
- **Strava API (inchangé) :** `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, callback domain `mysportally.com` (prod) / `localhost` (local), `NEXT_PUBLIC_APP_URL` ou `NEXT_PUBLIC_SITE_URL`. Voir `README.md` § Intégration Strava.
- **Réactivation :** définir la variable sur Vercel (ou `.env.local` en local) + redeploy ; aucune migration BDD.

---

## Abonnement plateforme coach (Stripe)

- **Migrations Supabase :** `073_coach_platform_subscription.sql` (table `coach_platform_subscriptions`, RPC `coach_platform_access_granted`, RLS) ; **`074_coach_platform_access_no_grace.sql`** — `past_due` / `unpaid` n’accordent plus l’accès plateforme (suppression tolérance 3 jours) ; **`075_coach_platform_trial_consumptions.sql`** — essais consommés par campagne (une fois par `coach_id` × `trial_campaign_id`) ; **`076_coach_platform_subscription_cancel_mirror.sql`** — colonnes `cancel_at_period_end`, `cancel_at` (miroir Stripe pour fin programmée).
- **Variables d’environnement :** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_COACH_PLATFORM_PRICE_ID` (un prix) ou **`STRIPE_COACH_PLATFORM_PRICE_IDS`** (liste séparée par virgules ou espaces, vitrine « Mon Abonnement ») ; optionnel **`COACH_PLATFORM_SUBSCRIPTION_TRIAL_DAYS`** (entier > 0, ex. 90 — essai sur **nouvelles** souscriptions Checkout via `trial_period_days` si le coach n’a pas déjà consommé la campagne ; 0 ou absent = pas d’essai ; retirer la campagne : mettre 0 puis redéployer) ; optionnel **`COACH_PLATFORM_SUBSCRIPTION_TRIAL_CAMPAIGN_ID`** (identifiant stable de la campagne essai, ex. `launch-2026-v1` — si absent alors que `TRIAL_DAYS > 0`, fallback `platform-default`) ; libellés cartes offre : `messages/fr.json` & `en.json` → **`coachMsaOffers.byPriceId`** (`title`, `description`, optionnel **`tagline`**, **`features`[]`) ; `NEXT_PUBLIC_SITE_URL` ou `NEXT_PUBLIC_APP_URL` (repli ; les URL de retour Checkout utilisent aussi l’hôte de la requête lorsqu’il est autorisé — voir `lib/checkoutReturnOrigin.ts`, previews `*.vercel.app`).
- **Stripe Dashboard :** webhook **`https://<votre-domaine>/api/webhooks/stripe`** — événements typiques : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`. En **local**, les webhooks n’atteignent pas `localhost` sans **`stripe listen --forward-to localhost:3000/api/webhooks/stripe`** ; la consommation d’essai est aussi enregistrée au retour Checkout (**`verifyCoachPlatformCheckoutSession`** → **`syncCoachPlatformTrialConsumptionFromStripeSubscription`**). Après une 1ʳᵉ souscription avec essai, vérifier en base : `SELECT * FROM coach_platform_trial_consumptions WHERE coach_id = '<uuid>';`.
- **Comportement applicatif (Checkout coach) :** `ensureCoachPlatformStripeCustomerForCheckout` — résolution du Customer `cus_…` (ligne `coach_platform_subscriptions` si valide, sinon recherche Stripe par e-mail + `metadata.coach_id`, sinon création) ; **mise à jour** à chaque session des **`preferred_locales`** selon la locale **`[locale]`** et du **`Customer.name`** (prénom + nom profil, `formatCoachPlatformStripeCustomerName`) ; session Checkout avec **`customer`** + **`locale`** (`lib/stripeCoachPlatformCustomer.ts`, `coachPlatformActions.ts`). Sauvegarde profil coach : `syncCoachPlatformStripeCustomerNameIfPresent` (`app/[locale]/dashboard/profile/actions.ts`). Résolution customer facturation : `resolveOrCreateCoachPlatformStripeCustomerId` (`lib/stripeCoachPlatformBillingAddress.ts`).
- **Supabase Auth :** maintenir les **Redirect URLs** pour chaque origine réelle (prod, preview Vercel, local) ; wildcards `https://*.vercel.app/...` si besoin (`docs/AUTH_EMAIL_TEMPLATES.md`).

---

## Formulaire contact (production)

- **Migrations Supabase :** appliquer **`066_contact_submissions.sql`** puis **`067_contact_submissions_rpc_fix.sql`** (ordre des fichiers dans `supabase/migrations/`).
- **Variables d’environnement (Vercel / hôte) :** `SUPABASE_SECRET_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY`), **`RESEND_API_KEY`** (envoi e-mail support depuis l’app — distinct de la config SMTP Supabase Auth) ; optionnellement `CONTACT_EMAIL_FROM`, `CONTACT_SUPPORT_TO`. Domaine d’expéditeur **From** doit être **vérifié dans Resend** (voir `README.md` section Resend).

---

## Nouveaux sports (nordic ski, backcountry ski, patin à glace)

## Commit créé
Le commit suivant a été créé avec toutes les modifications :
```
feat: Ajout des sports nordic ski, backcountry ski et patin à glace
```

## Scripts SQL à exécuter en production

### ⚠️ IMPORTANT : Ordre d'exécution
Les migrations doivent être exécutées **dans l'ordre** car chaque migration dépend de la précédente.

### 1. Migration pour les totaux hebdomadaires des activités importées
**Fichier :** `supabase/migrations/024_imported_activity_weekly_totals_table.sql`

**Description :** Remplace la vue `v_imported_activity_weekly_totals` par une table `imported_activity_weekly_totals` alimentée par un trigger. Permet au calendrier d'afficher les totaux « réalisé » (activités importées) sans recalcul à chaque requête.

**Tables créées / modifiées :**
- Suppression de la vue `v_imported_activity_weekly_totals`
- Création de la table `imported_activity_weekly_totals`
- Fonction `sync_imported_activity_weekly_totals()` et trigger associé

### 2. Migration pour le champ target_pace (vitesse/allure)
**Fichier :** `supabase/migrations/025_workout_target_pace.sql`

**Description :** Ajoute le champ `target_pace` à la table `workouts` pour permettre le calcul automatique de durée ou distance.

**Tables modifiées :**
- `workouts` (ajout de la colonne `target_pace`)

### 3. Migration pour les totaux hebdomadaires précalculés (entraînements)
**Fichier :** `supabase/migrations/026_workout_weekly_totals.sql`

**Description :** Crée la table `workout_weekly_totals` et le trigger associé pour précalculer les totaux hebdomadaires par sport. Cette table accélère l'affichage du calendrier.

**Tables créées :**
- `workout_weekly_totals`
- Fonction `get_week_monday()`
- Fonction `sync_workout_weekly_totals()`
- Trigger `trigger_sync_workout_weekly_totals`

### 4. Migration pour nordic_ski
**Fichier :** `supabase/migrations/027_add_nordic_ski_sport_type.sql`

**Description :** Ajoute le type `nordic_ski` aux contraintes CHECK de toutes les tables concernées.

**Tables modifiées :**
- `workouts`
- `imported_activities`
- `imported_activity_weekly_totals`
- `workout_weekly_totals`

### 5. Migration pour backcountry_ski
**Fichier :** `supabase/migrations/028_add_backcountry_ski_sport_type.sql`

**Description :** Ajoute le type `backcountry_ski` aux contraintes CHECK de toutes les tables concernées.

**Tables modifiées :**
- `workouts`
- `imported_activities`
- `imported_activity_weekly_totals`
- `workout_weekly_totals`

### 6. Migration pour ice_skating
**Fichier :** `supabase/migrations/029_add_ice_skating_sport_type.sql`

**Description :** Ajoute le type `ice_skating` aux contraintes CHECK de toutes les tables concernées.

**Tables modifiées :**
- `workouts`
- `imported_activities`
- `imported_activity_weekly_totals`
- `workout_weekly_totals`

## Scripts optionnels (maintenance/diagnostic)

Ces scripts ne sont **pas nécessaires** pour le déploiement en production, mais peuvent être utiles pour :
- Diagnostiquer des problèmes
- Mettre à jour des activités existantes

### Scripts disponibles dans `supabase/scripts/` :

1. **`diagnose_nordic_ski.sql`** - Diagnostic pour vérifier les activités nordic ski
2. **`update_nordic_ski_activities.sql`** - Met à jour les activités Strava existantes qui devraient être du type nordic_ski
3. **`force_recalculate_totals.sql`** - Force le recalcul de tous les totaux hebdomadaires

## Après le déploiement

1. **Réimporter les activités Strava** : Les activités de type "NordicSki", "BackcountrySki" ou "IceSkate" seront automatiquement mappées aux nouveaux types de sport.

2. **Vérifier les totaux** : Les totaux hebdomadaires seront automatiquement recalculés par les triggers existants.

## Résumé des modifications

### Nouveaux types de sport ajoutés :
- `nordic_ski` - Ski de fond (icône bleue)
- `backcountry_ski` - Ski de randonnée (icône indigo inclinée à 30°)
- `ice_skating` - Patin à glace (icône cyan)

### Fonctionnalités :
- Support complet dans les résumés hebdomadaires
- Affichage dans les semaines condensées et détaillées
- Mapping automatique depuis Strava
- Calcul automatique des totaux par les triggers

---

## Migration 063 — Liste publique des avis coach (Trouver mon coach)

**Fichier :** `supabase/migrations/063_get_coach_public_reviews.sql`

**Description :** crée la fonction **`get_coach_public_reviews(p_coach_id uuid)`** (SECURITY DEFINER, `RETURNS` id, rating, comment, created_at) pour alimenter la modale liste d’avis côté athlète. **À exécuter en production** lorsque cette fonctionnalité est déployée. Dépend de la table **`coach_ratings`** (migration **021**).

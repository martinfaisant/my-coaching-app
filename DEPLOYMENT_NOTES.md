# Notes de déploiement

**Production :** https://mysportally.com (voir `docs/DOMAIN_MYSPORTALLY_SETUP.md` pour la configuration domaine, Vercel, Resend, Supabase).

---

## Abonnement plateforme coach (Stripe)

- **Migration Supabase :** `073_coach_platform_subscription.sql` (table `coach_platform_subscriptions`, RPC `coach_platform_access_granted`, RLS et périmètres associés — détail dans le fichier).
- **Variables d’environnement :** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_COACH_PLATFORM_PRICE_ID` (un prix) ou **`STRIPE_COACH_PLATFORM_PRICE_IDS`** (liste séparée par virgules ou espaces, vitrine « Mon Abonnement ») ; `NEXT_PUBLIC_SITE_URL` ou `NEXT_PUBLIC_APP_URL` (repli ; les URL de retour Checkout utilisent aussi l’hôte de la requête lorsqu’il est autorisé — voir `lib/checkoutReturnOrigin.ts`, previews `*.vercel.app`).
- **Stripe Dashboard :** webhook **`https://<votre-domaine>/api/webhooks/stripe`** — événements typiques : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`.
- **Comportement applicatif (Checkout coach) :** `ensureCoachPlatformStripeCustomerForCheckout` — résolution du Customer `cus_…` (ligne `coach_platform_subscriptions` si valide, sinon recherche Stripe par e-mail + `metadata.coach_id`, sinon création) ; **mise à jour** à chaque session des **`preferred_locales`** selon la locale **`[locale]`** ; session Checkout avec **`customer`** + **`locale`** (`lib/stripeCoachPlatformCustomer.ts`, `coachPlatformActions.ts`).
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

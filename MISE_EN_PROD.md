# Mise en production — Checklist

**URL de production :** https://mysportally.com (domaine custom, Vercel). Voir `docs/DOMAIN_MYSPORTALLY_SETUP.md` pour la configuration.

Tout fonctionne sur **preview**. Voici quoi faire pour tout mettre en **prod**.

---

## 0. Vérifications avant merge (recommandé)

Avant de merger vers la branche de prod :

```bash
npm run check:full   # lint + typecheck + tests Vitest (inclut parité i18n)
npm run build
```

La CI GitHub (`.github/workflows/ci.yml`) exécute les mêmes étapes (sans `check:full` regroupé) sur chaque PR et push `main`.

---

## 1. Mettre le code en production (Git)

Selon votre workflow :

### Option A — Branche `main` = prod (classique)
```bash
git checkout main
git pull origin main
git merge preview
git push origin main
```
→ Si vous déployez sur Vercel depuis `main`, le déploiement se lancera automatiquement.

### Option B — Vous déployez manuellement ou depuis une autre branche
- Déclencher le déploiement depuis votre outil (Vercel, etc.) en ciblant la branche `preview` ou en important le commit voulu.
- Ou merger `preview` dans la branche que votre prod utilise, puis pousser.

---

## 2. Migrations SQL sur la base **production** (Supabase)

À faire **sur le projet Supabase de production** (pas celui de preview).

Dans le **SQL Editor** de Supabase (prod), exécuter les fichiers **dans cet ordre** :

| # | Fichier | Rôle |
|---|---------|------|
| 1 | `supabase/migrations/024_imported_activity_weekly_totals_table.sql` | Table totaux « réalisé » (activités importées) + trigger |
| 2 | `supabase/migrations/025_workout_target_pace.sql` | Champ vitesse/allure |
| 3 | `supabase/migrations/026_workout_weekly_totals.sql` | Table totaux « prévu » (entraînements) précalculés |
| 4 | `supabase/migrations/027_add_nordic_ski_sport_type.sql` | Sport nordic_ski |
| 5 | `supabase/migrations/028_add_backcountry_ski_sport_type.sql` | Sport backcountry_ski |
| 6 | `supabase/migrations/029_add_ice_skating_sport_type.sql` | Sport ice_skating |

**Important :**  
- Ouvrir chaque fichier, copier tout le contenu, coller dans une nouvelle requête SQL, exécuter.  
- Ne pas inverser l’ordre. Les 027–029 modifient les contraintes des tables créées en 024 et 026.

Si une migration a déjà été exécutée en prod (ex. 025 ou 026), sauter celle-là et exécuter seulement les suivantes.

**Migrations postérieures (030 et suivantes, ex. 063)** : en général appliquées via **`supabase db push`** ou le SQL Editor en respectant l’ordre des fichiers dans `supabase/migrations/`. Pour la **liste d’avis** sur « Trouver mon coach » : fichier **`063_get_coach_public_reviews.sql`**. Pour l’**annuaire coach public** (`/coaches`) : **`077_public_coaches_rpc.sql`** (RPC lecture publique + sitemap fiches). Pour le **formulaire contact public** : **`066_contact_submissions.sql`** puis **`067_contact_submissions_rpc_fix.sql`** ; côté hébergeur, renseigner **`RESEND_API_KEY`** et **`SUPABASE_SECRET_KEY`** (voir **`DEPLOYMENT_NOTES.md`** et **`README.md`**). Pour l’**abonnement plateforme coach (Stripe)** : **`073`** … **`076`** (dont **`074`** accès sans grâce, **`075`** essais consommés, **`076`** miroir résiliation) + variables (dont optionnel **`COACH_PLATFORM_SUBSCRIPTION_TRIAL_DAYS`**) et webhook décrits dans **`DEPLOYMENT_NOTES.md`**.

---

## 3. Connexion Google (si feature livrée)

Sur le projet Supabase **production** (`vkkykxbtywoxsqlpznng`) et **Google Cloud** :

1. Activer le provider Google dans Supabase (Client ID / Secret).
2. **Redirect URLs** Supabase : `https://mysportally.com/auth/callback`.
3. **Google Cloud** : URI de redirection `https://vkkykxbtywoxsqlpznng.supabase.co/auth/v1/callback`.
4. Vercel **Production** : `NEXT_PUBLIC_SUPABASE_URL`, clés anon/service **prod**, `NEXT_PUBLIC_SITE_URL=https://mysportally.com`.

Détail complet : **`DEPLOYMENT_NOTES.md`** § Connexion Google. **Pas de migration SQL.**

---

## 4. Après la mise en prod

1. **Vérifier l’app** : ouvrir l’URL de prod et tester le calendrier, les résumés, la création d’entraînements.
2. **Connexion Google** : tester inscription et connexion depuis `/login`.
3. **Strava** : les prochaines importations (NordicSki, BackcountrySki, IceSkate) seront mappées automatiquement.
4. **Optionnel** : si vous aviez déjà des activités “ski” ou “patin” importées avant ces changements, vous pouvez exécuter en prod (avec précaution) le script `supabase/scripts/update_nordic_ski_activities.sql` pour les recatégoriser, puis éventuellement `force_recalculate_totals.sql` pour recalculer les totaux. Sinon, une réimport depuis Strava suffit.

---

## Résumé rapide

| Étape | Action |
|-------|--------|
| 0 | *(Recommandé)* `npm run check:full` + `npm run build` avant merge. |
| 1 | Merger `preview` dans la branche de prod et pousser (ou déclencher le déploiement). |
| 2 | Exécuter les 6 migrations SQL (024 → 025 → 026 → 027 → 028 → 029) sur la base Supabase **production** dans l’ordre. |
| 3 | Configurer Google OAuth (Supabase prod + Google Cloud + Vercel) si la feature est livrée. |
| 4 | Tester l’app en prod (dont `/login` Google) et les imports Strava si besoin. |
| 5 | Vérifier le SEO : `https://mysportally.com/sitemap.xml` et `/robots.txt` répondent **200** (pas 404 — voir exclusion `proxy.ts`) ; redirection `www` → apex ; resoumettre `sitemap.xml` dans Google Search Console si besoin (`DEPLOYMENT_NOTES.md` § Référencement). |

Une fois ces étapes faites, tout est en prod.

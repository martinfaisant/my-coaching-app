# Mise en production — Checklist

**URL de production :** https://mysportally.com (domaine custom, Vercel). Voir `docs/DOMAIN_MYSPORTALLY_SETUP.md` pour la configuration.

Tout fonctionne sur **preview**. Voici quoi faire pour tout mettre en **prod**.

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

**Migrations postérieures (030 et suivantes, ex. 063)** : en général appliquées via **`supabase db push`** ou le SQL Editor en respectant l’ordre des fichiers dans `supabase/migrations/`. Pour la **liste d’avis** sur « Trouver mon coach » : fichier **`063_get_coach_public_reviews.sql`**.

---

## 3. Après la mise en prod

1. **Vérifier l’app** : ouvrir l’URL de prod et tester le calendrier, les résumés, la création d’entraînements.
2. **Strava** : les prochaines importations (NordicSki, BackcountrySki, IceSkate) seront mappées automatiquement.
3. **Optionnel** : si vous aviez déjà des activités “ski” ou “patin” importées avant ces changements, vous pouvez exécuter en prod (avec précaution) le script `supabase/scripts/update_nordic_ski_activities.sql` pour les recatégoriser, puis éventuellement `force_recalculate_totals.sql` pour recalculer les totaux. Sinon, une réimport depuis Strava suffit.

---

## Résumé rapide

| Étape | Action |
|-------|--------|
| 1 | Merger `preview` dans la branche de prod et pousser (ou déclencher le déploiement). |
| 2 | Exécuter les 6 migrations SQL (024 → 025 → 026 → 027 → 028 → 029) sur la base Supabase **production** dans l’ordre. |
| 3 | Tester l’app en prod et les imports Strava si besoin. |

Une fois ces étapes faites, tout est en prod.

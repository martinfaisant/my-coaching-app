# Archive — Maquette « bandeau grâce 3 jours » (abonnement plateforme coach)

**Archivé le :** 13 mai 2026  

**Fichier :** `MOCKUP_US_COACH_MYSA_SUB_PAGE_GRACE_ALERT.html`  

**Raison :** le produit ne prévoit plus de **tolérance 3 jours** pour `past_due` / `unpaid` ; l’accès plateforme est **coupé** dès ces statuts (migration **`074_coach_platform_access_no_grace.sql`**, RPC `coach_platform_access_granted`).  

**Doc cible :** comportement actuel **`past_due` / `unpaid`** décrit dans **`docs/design-coach-platform-subscription/MOCKUP_US_MYSA_SUB_PAYMENT_DEFAULT_NO_GRACE.html`** et **`Project_context.md`** (§ coach ↔ platform Stripe).

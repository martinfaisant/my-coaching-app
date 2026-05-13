# Design — Abonnement plateforme coach (Stripe)

**Statut :** Phase Designer **2** — évolution **mai 2026** : proposition **A** (modale catalogue offres avant Stripe) validée par le PO ; titres / descriptions offres **FR + EN** via **next-intl** (recommandation maintenabilité).  
**Historique :** page dédiée **« Mon Abonnement MySportAlly »** + vitrine multi-produits + historique factures / échecs / remboursements ; **anciennement** bandeau si tolérance 3 jours (`US-COACH-MYSA-03`) — **révoqué** mai 2026 PO (voir évolution ci-dessous) ; **pas** de portail client Stripe en v1.

## User stories → mockups (évolution mai 2026 — tarif + prochain paiement + fin tolérance)

| US | Fichier | Rôle |
|----|---------|------|
| **US-MYSA-SUB-UI-01** | `MOCKUP_US_MYSA_SUB_ACTIVE_PRICING_PROP_B.html` | Abo plateforme **actif / essai** : carte **proposition B** — badge statut **en haut à droite** ; montant + intervalle ; **« Prochain paiement »** + date (i18n) ; **pas** de mention portail / gestion de carte sous la carte |
| **US-MYSA-SUB-ACCESS-01** | `MOCKUP_US_MYSA_SUB_PAYMENT_DEFAULT_NO_GRACE.html` | **`past_due` / `unpaid`** : **aucune** tolérance 3 j ; **pas** de bandeau grâce ; accès coach aux zones protégées = **coupé** ; page abo : carte défaut + réaffichage offres si applicable |

## User stories → mockups (évolution modale + i18n offres)

| US | Fichier | Rôle |
|----|---------|------|
| **US-MYSA-OFFERS-01** | `MOCKUP_US_MYSA_OFFERS_MODAL_STATES.html` | Modale catalogue : chargement, **1 offre** (affichée), **N offres**, erreur catalogue, CTA pending ; transitions fermer / payer |
| **US-MYSA-OFFERS-02** | `MOCKUP_US_MYSA_OFFERS_MODAL_ENTRY_POINTS.html` | Ouverture de la **même** modale depuis **demande en attente** (Accepter), **overlay Mes athlètes**, **calendrier bloqué** ; page dédiée inchangée (hors modale) |

## User stories → mockups (livraison initiale page / menu)

| US | Fichier | Rôle |
|----|---------|------|
| US-COACH-MYSA-01 | `MOCKUP_US_COACH_MYSA_SUB_PAGE_NO_ACTIVE.html` | Sans abo actif : statut, **liste** d’offres (CTA Souscrire), 3 blocs historique (vides) |
| US-COACH-MYSA-02 | `MOCKUP_US_COACH_MYSA_SUB_PAGE_ACTIVE.html` | Abo en cours (hors alerte) : carte détail, historique rempli (factures, échecs, remboursements) |
| US-COACH-MYSA-03 | *archivé* → `docs/archive/design-coach-platform-subscription-grace/MOCKUP_US_COACH_MYSA_SUB_PAGE_GRACE_ALERT.html` | ~~**Bandeau** tolérance 3 j~~ — **obsolète** ; remplacé par **US-MYSA-SUB-ACCESS-01** |
| US-COACH-MYSA-04 | `MOCKUP_US_COACH_MYSA_ACCOUNT_MENU_ENTRY.html` | Entrée menu **Mon Abonnement MySportAlly** (desktop + consignes drawer mobile) |

### Anciennes US (Mes athlètes / modal / calendrier / bandeaux retour)

| US | Fichier |
|----|---------|
| US-COACH-PLAT-01 | `MOCKUP_US1_MES_ATHLETES_ABONNEMENT_INACTIF.html` |
| US-COACH-PLAT-02 | `MOCKUP_US2_MODAL_ABONNEMENT_STRIPE.html` |
| US-COACH-PLAT-03 | `MOCKUP_US3_CALENDRIER_COACH_BLOQUE.html` |
| US-COACH-PLAT-04 | `MOCKUP_US4_RETOUR_STRIPE_BANDEAUX.html` |

## Implémentation (référence code)

- Page app : **`app/[locale]/dashboard/coach-platform-subscription/`** (`page.tsx`, `loading.tsx`), shell **`DashboardPageShell`**, section offres **`components/CoachPlatformSubscriptionOffers.tsx`** (grille partagée **`components/CoachPlatformOfferGrid.tsx`**). Carte abo **`active` / `trialing`** : **`fetchCoachPlatformSubscriptionCardDetails`** + **`coachPlatformPriceIntervalTranslationKey`** (montant, intervalle, libellé plan, **`currentPeriodEndIso`** pour repli date si la colonne `current_period_end` est vide en base) ; i18n **`coachMsaSubscription`** (`nextPaymentWithDate`, `trialFree`, `paymentDefaultDescription`, etc.). Accès plateforme : RPC **`coach_platform_access_granted`** (migration **`074_coach_platform_access_no_grace.sql`** — plus de grâce 3 j pour `past_due` / `unpaid`).
- Modale choix d’offre avant Checkout : **`components/CoachPlatformSubscribeOffersModal.tsx`** (chargement **`loadCoachPlatformCatalogForCoach`** dans **`app/[locale]/dashboard/athletes/coachPlatformActions.ts`**), intégrations **`PendingRequestTile`**, **`CoachAthletesBillingOverlay`**, **`CoachAthleteBillingBlocked`**.
- Catalogue / facturation Stripe : **`lib/stripeCoachPlatformCatalog.ts`**, **`lib/stripeCoachPlatformBillingHistory.ts`**, **`lib/stripeCoachPlatformCustomer.ts`** (**`ensureCoachPlatformStripeCustomerForCheckout`** : Customer Checkout, **`preferred_locales`** + locale de session alignés sur **`[locale]`**) ; libellés marketing par `price_id` : **`lib/coachMsaOfferDisplay.ts`** + messages **`coachMsaOffers.byPriceId`** ; whitelist retour Checkout **`lib/coachPlatformCheckoutReturnPath.ts`**.

## Suite du pipeline

→ Livraisons **Développeur** (mai 2026) : modale offres + **évolution** carte abonnement (montant, **prochain paiement** avec repli date Stripe, essai gratuit, fin tolérance **074**) documentées dans **README** ci-dessus et **Project_context.md**. Maquette grâce 3 j **archivée** sous `docs/archive/design-coach-platform-subscription-grace/`. Évolutions ultérieures (nouveaux `price_id`, offre « encaissements ») : ajouter les clés sous **`byPriceId`** et les IDs dans l’env, puis mise à jour **`Project_context.md`** / **`docs/I18N.md`** si besoin.

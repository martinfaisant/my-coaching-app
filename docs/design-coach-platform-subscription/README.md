# Design — Abonnement plateforme coach (Stripe)

**Statut :** Phase Designer **2** — évolution **mai 2026** : proposition **A** (modale catalogue offres avant Stripe) validée par le PO ; titres / descriptions offres **FR + EN** via **next-intl** (recommandation maintenabilité).  
**Historique :** page dédiée **« Mon Abonnement MySportAlly »** + vitrine multi-produits + historique factures / échecs / remboursements ; bandeau alerte si **tolérance 3 jours** ; **pas** de portail client Stripe en v1.

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
| US-COACH-MYSA-03 | `MOCKUP_US_COACH_MYSA_SUB_PAGE_GRACE_ALERT.html` | **Bandeau d’alerte** tolérance 3 jours + carte statut alignée |
| US-COACH-MYSA-04 | `MOCKUP_US_COACH_MYSA_ACCOUNT_MENU_ENTRY.html` | Entrée menu **Mon Abonnement MySportAlly** (desktop + consignes drawer mobile) |

### Anciennes US (Mes athlètes / modal / calendrier / bandeaux retour)

| US | Fichier |
|----|---------|
| US-COACH-PLAT-01 | `MOCKUP_US1_MES_ATHLETES_ABONNEMENT_INACTIF.html` |
| US-COACH-PLAT-02 | `MOCKUP_US2_MODAL_ABONNEMENT_STRIPE.html` |
| US-COACH-PLAT-03 | `MOCKUP_US3_CALENDRIER_COACH_BLOQUE.html` |
| US-COACH-PLAT-04 | `MOCKUP_US4_RETOUR_STRIPE_BANDEAUX.html` |

## Implémentation (référence code)

- Page app : **`app/[locale]/dashboard/coach-platform-subscription/`** (`page.tsx`, `loading.tsx`), shell **`DashboardPageShell`**, section offres **`components/CoachPlatformSubscriptionOffers.tsx`** (grille partagée **`components/CoachPlatformOfferGrid.tsx`**).
- Modale choix d’offre avant Checkout : **`components/CoachPlatformSubscribeOffersModal.tsx`** (chargement **`loadCoachPlatformCatalogForCoach`** dans **`app/[locale]/dashboard/athletes/coachPlatformActions.ts`**), intégrations **`PendingRequestTile`**, **`CoachAthletesBillingOverlay`**, **`CoachAthleteBillingBlocked`**.
- Catalogue / facturation Stripe : **`lib/stripeCoachPlatformCatalog.ts`**, **`lib/stripeCoachPlatformBillingHistory.ts`**, **`lib/stripeCoachPlatformCustomer.ts`** (**`ensureCoachPlatformStripeCustomerForCheckout`** : Customer Checkout, **`preferred_locales`** + locale de session alignés sur **`[locale]`**) ; libellés marketing par `price_id` : **`lib/coachMsaOfferDisplay.ts`** + messages **`coachMsaOffers.byPriceId`** ; whitelist retour Checkout **`lib/coachPlatformCheckoutReturnPath.ts`**.

## Suite du pipeline

→ Livraison **Développeur** réalisée (mai 2026) ; évolutions ultérieures (nouveaux `price_id`, offre « encaissements ») : ajouter les clés sous **`byPriceId`** et les IDs dans l’env, puis mise à jour **`Project_context.md`** / **`docs/I18N.md`** si besoin.

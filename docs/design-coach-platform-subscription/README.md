# Design — Abonnement plateforme coach (Stripe)

**Statut :** Phase Designer **2** — solution page **A** validée par le PO (mai 2026).  
**Évolution vs doc initiale :** page dédiée **« Mon Abonnement MySportAlly »** + vitrine **multi-produits** + historique factures / échecs / remboursements ; bandeau alerte si **tolérance 3 jours** ; **pas** de portail client Stripe en v1.

## User stories → mockups

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

- Page app : **`app/[locale]/dashboard/coach-platform-subscription/`** (`page.tsx`, `loading.tsx`), shell **`DashboardPageShell`**, offres client **`components/CoachPlatformSubscriptionOffers.tsx`**, catalogue / facturation **`lib/stripeCoachPlatformCatalog.ts`**, **`lib/stripeCoachPlatformBillingHistory.ts`**, whitelist retour Checkout **`lib/coachPlatformCheckoutReturnPath.ts`**.

## Suite du pipeline

→ **Mode Architecte** (sources Stripe pour catalogue + factures / échecs / remboursements, route, retours Checkout, cohabitation avec flux Mes athlètes).

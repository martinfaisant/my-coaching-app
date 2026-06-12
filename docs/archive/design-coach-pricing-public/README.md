# Design — Page publique tarifs coach (`/pricing`)

**Statut :** **Livré** (juin 2026) — Phase Designer 2 + Développeur + Reviewer Tech **Validation OK**.

**Arbitrages PO :**
- CTA visiteur : **Créer un compte** uniquement (pas de double CTA connexion sur la page tarifs).
- Entrée : **`PublicHeader`** — nav **Accueil** (→ `/`) puis **Tarifs** (→ `/pricing`), à gauche de la zone auth.
- Route : **`/pricing`** (`/en/pricing` en EN).
- Offre future « plateforme + encaissements » : **masquée**.
- Coach connecté avec abonnement géré : bannière + CTA **Gérer mon abonnement** → `/dashboard/coach-platform-subscription`.

## User stories → mockups

| US | Fichier | Rôle |
|----|---------|------|
| **US-PRICING-PUB-01** | `MOCKUP_US_PRICING_PUB_01_VISITOR_PAGE.html` | Page complète visiteur : hero, bandeau, timeline, offres, inclus, FAQ, CTA créer un compte |
| **US-PRICING-PUB-02** | `MOCKUP_US_PRICING_PUB_02_HEADER_NAV.html` | `PublicHeader` : Accueil + Tarifs, états actifs, responsive |
| **US-PRICING-PUB-03** | `MOCKUP_US_PRICING_PUB_03_OFFER_GRID_STATES.html` | Grille offres mode vitrine : 2 offres, 1 offre, essai actif, catalogue vide |
| **US-PRICING-PUB-04** | `MOCKUP_US_PRICING_PUB_04_COACH_SUBSCRIBED.html` | Coach connecté abonnement actif/essai : bannière + CTA Gérer |
| **US-PRICING-PUB-05** | `MOCKUP_US_PRICING_PUB_05_COACH_NO_SUB.html` | Coach connecté sans abo géré : grille + CTA → page abonnement |

## Implémentation (référence code)

- Page : **`app/[locale]/pricing/page.tsx`**, **`loading.tsx`**
- Header : **`components/PublicHeader.tsx`** (nav Accueil | Tarifs)
- Logique affichage : **`lib/coachPricingPublicView.ts`**
- Grille vitrine : **`components/CoachPlatformOfferGrid.tsx`** (`mode="marketing"`), wrapper **`CoachPricingPublicOffers.tsx`**
- Signup : **`CoachPricingPublicSignupProvider.tsx`**, **`CoachPricingPublicFinalCta.tsx`**
- Coach abonné : **`CoachPricingPublicManageBanner.tsx`**
- i18n : **`coachPricingPublic`**, metadata **`pricingTitle`** / **`pricingDescription`**
- Doc produit à jour : **`Project_context.md`** §4.12, **`docs/DESIGN_SYSTEM.md`** § CoachPlatformOfferGrid / PublicHeader

**Archive :** ce dossier est déplacé vers **`docs/archive/design-coach-pricing-public/`** après fusion doc (voir **`DOCS_INDEX.md`**).

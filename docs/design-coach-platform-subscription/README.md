# Design — Abonnement plateforme coach (Stripe)

**Statut :** Phase Designer **2** + livraisons **Développeur** mai 2026 (catalogue, essai, facturation, **résiliation + tuile moderne**). Proposition **A** (modale catalogue avant Stripe), essai lancement et **US-MYSA-CANCEL-01…05** / **US-MYSA-SUB-UI-02** **implémentées**. **`coachMsaOffers.byPriceId`** (FR + EN). **Page abo :** tuile gérée **`active`/`trialing`** (+ fin programmée) ; bannière impayé **`past_due`/`unpaid`** ; grille offres si **`shouldShowCoachPlatformOfferGrid`** (**`offersTitle`** `sr-only`).  
**Résiliation + tuile moderne (mai 2026) :** **livré** — proposition **A** ; **`CoachPlatformCurrentOfferCard`**, **`CoachPlatformManageSubscriptionFlow`**, **`CoachPlatformUnpaidSubscriptionBanner`** ; migration **076** ; actions **`coachPlatformCancellationActions.ts`**. Maquettes **US-MYSA-CANCEL-01…05**, **US-MYSA-SUB-UI-02-01…04** (`MOCKUP_US_MYSA_SUB_UI_02_TILE.html`, `MOCKUP_US_MYSA_SUB_UI_02_MODALS.html`).
**Historique :** page **« Mon Abonnement MySportAlly »** + vitrine multi-produits + historique factures ; bandeau tolérance 3 j (`US-COACH-MYSA-03`) **archivé** ; **pas** de portail client Stripe en v1.

## User stories → mockups (résiliation abonnement plateforme — mai 2026)

| US | Fichier | Rôle |
|----|---------|------|
| **US-MYSA-CANCEL-01** | `MOCKUP_US_MYSA_CANCEL_01_MONTHLY_FLOW.html` | **Mensuel actif** : lien **Gérer mon abonnement** → modale choix (fin de mois / immédiat) → confirmations ; montant remboursement **si Stripe** |
| **US-MYSA-CANCEL-02** | `MOCKUP_US_MYSA_CANCEL_02_SCHEDULED_STATE.html` | **Fin programmée** (mensuel ou annuel) : badge ambre, accès jusqu’à la date, **Annuler la demande** → réactivation renouvellement ; offres masquées |
| **US-MYSA-CANCEL-03** | `MOCKUP_US_MYSA_CANCEL_03_ANNUAL_FLOW.html` | **Annuel actif** : modale unique **non-renouvellement** à l’échéance (pas d’immédiat / prorata) |
| **US-MYSA-CANCEL-04** | `MOCKUP_US_MYSA_CANCEL_04_TRIAL_END_ONLY.html` | **Essai** : fin à la date d’essai uniquement + rappel **une seule période d’essai** ; pas d’immédiat |
| **US-MYSA-CANCEL-05** | `MOCKUP_US_MYSA_CANCEL_05_UNPAID_BLOCK.html` | **`past_due` / `unpaid`** : pas de résiliation ; régulariser l’impayé d’abord |

## User stories → mockups (UI modernisation tuile + modales — mai 2026, Phase 2 validée)

| US | Fichier | Rôle |
|----|---------|------|
| **US-MYSA-SUB-UI-02-01** | `MOCKUP_US_MYSA_SUB_UI_02_TILE.html` (§ Actif) | Tuile **active** pleine largeur, badge outline sans animation, bandeau date/prix, **Gérer** (`Button` muted) |
| **US-MYSA-SUB-UI-02-02** | `MOCKUP_US_MYSA_SUB_UI_02_TILE.html` (§ Essai) | Tuile **trialing** : jours restants, puis prix, fin essai, micro-copy essai unique |
| **US-MYSA-SUB-UI-02-03** | `MOCKUP_US_MYSA_SUB_UI_02_TILE.html` (§ Fin programmée) | Bandeau amber haut, encart résiliation, **Annuler l'arrêt** (`Button` primary) |
| **US-MYSA-SUB-UI-02-04** | `MOCKUP_US_MYSA_SUB_UI_02_MODALS.html` | Modales **US-MYSA-CANCEL-*** via **`Modal`** app : titre header seul, **pas d’icône à droite**, sous-titre dans le corps, footer `Button` existant |
| *(obsolète)* | `MOCKUP_US_MYSA_SUB_UI_MODERN_V2.html` | Brouillon PO — remplacé par **02_TILE** + **02_MODALS** |

**Arbitrages PO :** proposition **A** · catalogue **Souscrire inchangé** · tuile **pleine largeur** · **pas d’animation** · **`Modal`** sans logo/icône header droite.

## User stories → mockups (lancement — essai 3 mois, mai 2026)

| US | Fichier | Rôle |
|----|---------|------|
| **US-MYSA-TRIAL-01** | `MOCKUP_US_MYSA_TRIAL_LAUNCH_OFFER_CARDS.html` | **Catalogue** (page + modale, même grille) : **badge** « **3 mois gratuits** » + ligne d’accroche + **prix récurrent** visible ; 1 offre / N offres / CTA pending ; pas d’essai rétroactif |
| **US-MYSA-TRIAL-02** | `MOCKUP_US_MYSA_TRIAL_SUBSCRIPTION_CARD_TRIALING.html` | Carte abo **`trialing`** : **durée d’essai restante** puis **« puis {prix} par {intervalle} »** ; **Prochain prélèvement** + date ; **seul** rappel statut essai = badge **En essai** (aucune autre mention période d’essai) ; contraste **`active`** |
| **US-MYSA-TRIAL-03** | `MOCKUP_US_MYSA_TRIAL_NO_REPEAT_SILENT.html` | **Essai campagne courante non renouvelable** : coach ayant déjà eu un statut **`trialing`** → **masquage silencieux** (pas de badge, pas de ligne verte, pas de bandeau) ; même grille page + modale ; Checkout sans essai |
| **US-MYSA-TRIAL-04** | *(section dans `MOCKUP_US_MYSA_TRIAL_NO_REPEAT_SILENT.html`)* | **Extensibilité** : éligibilité essai **par campagne / offre** (pas blocage global) — futur essai 2 possible sur nouvelle offre ; **hors UI MVP** |

## User stories → mockups (évolution mai 2026 — tarif + prochain paiement + fin tolérance)

| US | Fichier | Rôle |
|----|---------|------|
| **US-MYSA-SUB-UI-01** | `MOCKUP_US_MYSA_SUB_ACTIVE_PRICING_PROP_B.html` | Abo plateforme **actif / essai** : carte **proposition B** — badge statut **en haut à droite** ; montant + intervalle ; **« Prochain paiement »** + date (i18n) ; **pas** de mention portail / gestion de carte sous la carte |
| **US-MYSA-SUB-ACCESS-01** | `MOCKUP_US_MYSA_SUB_PAYMENT_DEFAULT_NO_GRACE.html` | **`past_due` / `unpaid`** : **aucune** tolérance 3 j ; **pas** de bandeau grâce ; accès coach aux zones protégées = **coupé** ; page abo : carte défaut + réaffichage offres si applicable |
| **US-COACH-MYSA-BILL-01** | `MOCKUP_US_COACH_PLATFORM_BILLING_ADDRESS.html` | **Informations de facturation** : adresse Canada (Stripe **`Customer.address`**), états vide / lecture / édition / erreur ; titres de sous-sections alignés sur les libellés de champs (**`FORM_LABEL_CLASSES`** sur la page) |

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

- Page app : **`app/[locale]/dashboard/coach-platform-subscription/`** (`page.tsx`, `loading.tsx`), shell **`DashboardPageShell`**, section offres **`components/CoachPlatformSubscriptionOffers.tsx`** (grille **`CoachPlatformOfferGrid`** — inchangée visuellement). **Tuile abo gérée** : **`CoachPlatformSubscriptionStatusSection`**, **`CoachPlatformCurrentOfferCard`**, **`CoachPlatformManageSubscriptionFlow`** ; **impayé** : **`CoachPlatformUnpaidSubscriptionBanner`**. **Résiliation** : **`coachPlatformCancellationActions.ts`**, **`lib/stripeCoachPlatformCancellation.ts`**, **`lib/coachPlatformSubscriptionSync.ts`**, **`lib/coachPlatformSubscriptionDisplay.ts`** ; migration **076**. Carte données : **`fetchCoachPlatformSubscriptionCardDetails`** ; i18n **`coachMsaSubscription`** + **`coachMsaSubscription.cancellation`** + **`coachMsaSubscription.currentOfferCard`**. Bloc **Informations de facturation** : sous-titres **`h3`** + **`FORM_LABEL_CLASSES`** (`lib/formStyles.ts`) pour **adresse**, **factures**, **paiements échoués**, **remboursements** ; **`CoachPlatformBillingAddressSection`**, actions **`coachPlatformBillingAddressActions.ts`**, **`lib/stripeCoachPlatformBillingAddress`**, **`lib/canadianProvinces.ts`**. Accès plateforme : RPC **`coach_platform_access_granted`** (migration **`074_coach_platform_access_no_grace.sql`** — plus de grâce 3 j pour `past_due` / `unpaid`).
- Modale choix d’offre avant Checkout : **`components/CoachPlatformSubscribeOffersModal.tsx`** (chargement **`loadCoachPlatformCatalogForCoach`** dans **`app/[locale]/dashboard/athletes/coachPlatformActions.ts`**), intégrations **`PendingRequestTile`**, **`CoachAthletesBillingOverlay`**, **`CoachAthleteBillingBlocked`**.
- Catalogue / facturation Stripe : **`lib/stripeCoachPlatformCatalog.ts`**, **`lib/stripeCoachPlatformBillingHistory.ts`**, **`lib/stripeCoachPlatformCustomer.ts`** (**`ensureCoachPlatformStripeCustomerForCheckout`** : Customer Checkout, **`preferred_locales`** + **`Customer.name`** (profil prénom/nom) + locale de session alignés sur **`[locale]`** ; **`syncCoachPlatformStripeCustomerNameIfPresent`** après Mon profil coach), **`lib/stripeCoachPlatformBillingAddress.ts`** (**`resolveOrCreateCoachPlatformStripeCustomerId`**) ; libellés marketing par `price_id` : **`lib/coachMsaOfferDisplay.ts`** + messages **`coachMsaOffers.byPriceId`** ; whitelist retour Checkout **`lib/coachPlatformCheckoutReturnPath.ts`**.
- **Essai lancement (US-MYSA-TRIAL-01 / 02)** — **livré** : **`COACH_PLATFORM_SUBSCRIPTION_TRIAL_DAYS`** → **`lib/coachPlatformSubscriptionTrial.ts`**, **`subscriptionTrialDays`** dans le catalogue, badge + **`trialCatalogTrialLine`** sur **`CoachPlatformOfferGrid`**, **`trial_period_days`** dans **`createCoachPlatformCheckoutSession`**, carte **`trialing`** sur **`coach-platform-subscription/page.tsx`** (jours restants, **puis** prix, prochain prélèvement).
- **Essai non renouvelable (US-MYSA-TRIAL-03 / 04)** — **livré** : table **`coach_platform_trial_consumptions`** (075), **`lib/coachPlatformTrialEligibility.ts`** (`resolveCoachPlatformTrialPresentationForCoach`, **`syncCoachPlatformTrialConsumptionFromStripeSubscription`**), **`trialEligible`** sur catalogue + **`CoachPlatformOfferGrid`** (masquage silencieux), garde Checkout + consommation webhook **et** repli **`verifyCoachPlatformCheckoutSession`** (local sans `stripe listen`) ; détection essai : **`trialing`** ou **`trial_end`** ; extensibilité campagne via **`COACH_PLATFORM_SUBSCRIPTION_TRIAL_CAMPAIGN_ID`** + **`resolveTrialCampaignForPriceId`** (stub MVP).

## Suite du pipeline

→ Livraisons **Développeur** (mai 2026) — **résiliation + UI tuile** : voir **Implémentation** ci-dessous.  
→ Livraisons **Développeur** (mai 2026) — précédentes : modale offres, carte abonnement, adresse facturation (**074**, **US-COACH-MYSA-BILL-01**), **essai catalogue** (**US-MYSA-TRIAL-01/02/03**), **tuiles offre** (`tagline`/`features`), **simplification page** (carte `active`/`trialing` seule, grille sans en-tête visible) — voir **README** ci-dessus, **`Project_context.md`**, **`docs/DESIGN_SYSTEM.md`**, **`docs/I18N.md`**. Maquette grâce 3 j **archivée** sous `docs/archive/design-coach-platform-subscription-grace/`. Évolutions ultérieures (nouveaux `price_id`, offre « encaissements ») : **`byPriceId`** + env, puis doc.

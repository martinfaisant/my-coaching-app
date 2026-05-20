# Design — Abonnement plateforme coach (Stripe)

**Statut :** Phase Designer **2** + livraisons **Développeur** mai 2026 (essai catalogue, tuiles offre, carte abo essai, simplification page). Proposition **A** (modale catalogue avant Stripe) et essai lancement (**`COACH_PLATFORM_SUBSCRIPTION_TRIAL_DAYS`**, badge **« {n} jours gratuits »**, ligne verte, Checkout **`trial_period_days`**) **implémentées**. Titres / descriptions / **`tagline`** / **`features`** par `price_id` via **`coachMsaOffers.byPriceId`** (FR + EN). **Page abo (mai 2026) :** carte statut **uniquement** `active` / `trialing` ; **pas** de bandeau « sans abo » / défaut de paiement sur la page ; grille offres si le coach n’est pas en `active`/`trialing`, **sans** titre ni intro visibles (**`offersTitle`** en `sr-only`).  
**Historique :** page **« Mon Abonnement MySportAlly »** + vitrine multi-produits + historique factures ; bandeau tolérance 3 j (`US-COACH-MYSA-03`) **archivé** ; **pas** de portail client Stripe en v1.

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

- Page app : **`app/[locale]/dashboard/coach-platform-subscription/`** (`page.tsx`, `loading.tsx`), shell **`DashboardPageShell`**, section offres **`components/CoachPlatformSubscriptionOffers.tsx`** (grille partagée **`components/CoachPlatformOfferGrid.tsx`** — **sans** titre ni paragraphe d’intro visibles depuis **20 mai 2026** ; titre **`offersTitle`** en **`sr-only`** uniquement ; les maquettes **US-COACH-MYSA-01**, **US-MYSA-TRIAL-01** et **US-MYSA-SUB-ACCESS-01** peuvent encore montrer un en-tête « Offres disponibles » à titre de référence historique). Carte abo **`active` / `trialing`** : **`fetchCoachPlatformSubscriptionCardDetails`** + **`coachPlatformPriceIntervalTranslationKey`** (montant, intervalle, libellé plan, **`currentPeriodEndIso`** pour repli date si la colonne `current_period_end` est vide en base) ; i18n **`coachMsaSubscription`** (`nextPaymentWithDate`, **`trialThenPrefix`**, **`trialRemainingDays`**, campagne catalogue, **`billingInfoTitle`**, etc.). Bloc **Informations de facturation** : sous-titres **`h3`** + **`FORM_LABEL_CLASSES`** (`lib/formStyles.ts`) pour **adresse**, **factures**, **paiements échoués**, **remboursements** ; **`CoachPlatformBillingAddressSection`**, actions **`coachPlatformBillingAddressActions.ts`**, **`lib/stripeCoachPlatformBillingAddress`**, **`lib/canadianProvinces.ts`**. Accès plateforme : RPC **`coach_platform_access_granted`** (migration **`074_coach_platform_access_no_grace.sql`** — plus de grâce 3 j pour `past_due` / `unpaid`).
- Modale choix d’offre avant Checkout : **`components/CoachPlatformSubscribeOffersModal.tsx`** (chargement **`loadCoachPlatformCatalogForCoach`** dans **`app/[locale]/dashboard/athletes/coachPlatformActions.ts`**), intégrations **`PendingRequestTile`**, **`CoachAthletesBillingOverlay`**, **`CoachAthleteBillingBlocked`**.
- Catalogue / facturation Stripe : **`lib/stripeCoachPlatformCatalog.ts`**, **`lib/stripeCoachPlatformBillingHistory.ts`**, **`lib/stripeCoachPlatformCustomer.ts`** (**`ensureCoachPlatformStripeCustomerForCheckout`** : Customer Checkout, **`preferred_locales`** + **`Customer.name`** (profil prénom/nom) + locale de session alignés sur **`[locale]`** ; **`syncCoachPlatformStripeCustomerNameIfPresent`** après Mon profil coach), **`lib/stripeCoachPlatformBillingAddress.ts`** (**`resolveOrCreateCoachPlatformStripeCustomerId`**) ; libellés marketing par `price_id` : **`lib/coachMsaOfferDisplay.ts`** + messages **`coachMsaOffers.byPriceId`** ; whitelist retour Checkout **`lib/coachPlatformCheckoutReturnPath.ts`**.
- **Essai lancement (US-MYSA-TRIAL-01 / 02)** — **livré** : **`COACH_PLATFORM_SUBSCRIPTION_TRIAL_DAYS`** → **`lib/coachPlatformSubscriptionTrial.ts`**, **`subscriptionTrialDays`** dans le catalogue, badge + **`trialCatalogTrialLine`** sur **`CoachPlatformOfferGrid`**, **`trial_period_days`** dans **`createCoachPlatformCheckoutSession`**, carte **`trialing`** sur **`coach-platform-subscription/page.tsx`** (jours restants, **puis** prix, prochain prélèvement).
- **Essai non renouvelable (US-MYSA-TRIAL-03 / 04)** — **livré** : table **`coach_platform_trial_consumptions`** (075), **`lib/coachPlatformTrialEligibility.ts`** (`resolveCoachPlatformTrialPresentationForCoach`, **`syncCoachPlatformTrialConsumptionFromStripeSubscription`**), **`trialEligible`** sur catalogue + **`CoachPlatformOfferGrid`** (masquage silencieux), garde Checkout + consommation webhook **et** repli **`verifyCoachPlatformCheckoutSession`** (local sans `stripe listen`) ; détection essai : **`trialing`** ou **`trial_end`** ; extensibilité campagne via **`COACH_PLATFORM_SUBSCRIPTION_TRIAL_CAMPAIGN_ID`** + **`resolveTrialCampaignForPriceId`** (stub MVP).

## Suite du pipeline

→ Livraisons **Développeur** (mai 2026) : modale offres, carte abonnement, adresse facturation (**074**, **US-COACH-MYSA-BILL-01**), **essai catalogue** (**US-MYSA-TRIAL-01/02**), **tuiles offre** (`tagline`/`features`), **simplification page** (carte `active`/`trialing` seule, grille sans en-tête visible) — voir **README** ci-dessus, **`Project_context.md`**, **`docs/DESIGN_SYSTEM.md`**, **`docs/I18N.md`**. Maquette grâce 3 j **archivée** sous `docs/archive/design-coach-platform-subscription-grace/`. Évolutions ultérieures (nouveaux `price_id`, offre « encaissements ») : **`byPriceId`** + env, puis doc.

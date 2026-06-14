# Design — Refonte page d'accueil marketing (Option B)

**Statut :** **Livré** (juin 2026) — Phase Designer 2 + Architecte + Développeur + Reviewer Tech **Validation conditionnelle** (assets EN à remplacer).

**Arbitrages PO :**
- **Option B** : hero split, showcase 6 onglets (3 athlète / 3 coach), cartes audience 50/50, How it works + CTA final.
- Titre hero inchangé (*« Atteignez vos objectifs avec un coach dédié »*).
- Pas de mention **Strava** sur la landing.
- Lien **Tarifs** secondaire (texte) → `/pricing`.
- Captures produit FR + EN (`public/landing/{locale}/*.webp`) — **EN : remplacer les placeholders** (copies FR en v1).

## User stories → mockups

| US | Fichier | Rôle |
|----|---------|------|
| **US-LANDING-01** | `MOCKUP_US_LANDING_01_HERO.html` | Hero split desktop/mobile, CTAs, lien tarifs |
| **US-LANDING-02** | `MOCKUP_US_LANDING_02_SHOWCASE_TABS.html` | 6 onglets interactifs, panneaux capture + copy |
| **US-LANDING-03** | `MOCKUP_US_LANDING_03_AUDIENCE_CARDS.html` | Cartes « Je suis athlète / coach » |
| **US-LANDING-04** | `MOCKUP_US_LANDING_04_HOW_IT_WORKS_CTA.html` | 3 étapes, bandeau CTA, footer |
| *(vue d'ensemble)* | `MOCKUP_US_LANDING_FULL_PAGE.html` | Page complète desktop assemblée |

Captures source (PNG) : `screenshots/fr/`.

## Implémentation (référence code)

- Page : **`app/[locale]/page.tsx`**
- Composants : **`components/landing/*`** (Hero, ShowcaseTabs, AudienceCards, HowItWorks, FinalCta, ScreenshotFrame, PricingLink, SignupButton)
- Config : **`lib/landingConfig.ts`**, **`lib/landingScreenshots.ts`**, **`lib/landingTabStyles.ts`**
- Assets : **`public/landing/fr/`**, **`public/landing/en/`** (7 WebP par locale)
- Auth : **`AuthButtons`** variants `hero`, **`ctaBand`** ; flows `?emailConfirmed=1`, redirect si connecté inchangés
- i18n : namespace **`landing`** (`hero`, `pricingLink`, `showcase`, `audience`, `howItWorks`, `cta`, `footer`)
- Doc à jour : **`Project_context.md`** §4.13, **`docs/DESIGN_SYSTEM.md`** § Landing, **`docs/I18N.md`**

**Archive :** ce dossier est dans **`docs/archive/design-landing-revamp/`** (voir **`DOCS_INDEX.md`**).

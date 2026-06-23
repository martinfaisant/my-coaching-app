# Design — Pied de page unifié pages publiques (issue #115)

**Statut :** **Livré** (juin 2026) — issue [#115](https://github.com/martin-faisant/my-coaching-app/issues/115) ; Phase Designer 2 + Développeur + Reviewer Tech **Validation OK**.

**Arbitrages PO :**
- Lien actif dans le footer : **pas de soulignement** — `font-medium text-palette-forest-dark` (liens inactifs : `text-stone-600 hover:text-stone-900`, sans underline).
- Suppression des liens sociaux inline sous le formulaire Contact.
- Périmètre strict : `/privacy`, `/terms`, `/contact` uniquement.

## User stories → mockups

| US | Fichier | Rôle |
|----|---------|------|
| **US-PUB-FOOTER-01** | `MOCKUP_US_PUB_FOOTER_01_ACTIVE_LINK_STATES.html` | États du footer : lien actif privacy / terms / contact / FAQ |
| **US-PUB-FOOTER-02** | `MOCKUP_US_PUB_FOOTER_02_PUBLIC_PAGE_SHELL.html` | Structure `PublicPageShell` : header + main flex-1 + footer |
| **US-PUB-FOOTER-03** | `MOCKUP_US_PUB_FOOTER_03_PRIVACY_PAGE.html` | Page `/privacy` complète avec footer et lien actif |
| **US-PUB-FOOTER-04** | `MOCKUP_US_PUB_FOOTER_04_TERMS_PAGE.html` | Page `/terms` complète avec footer et lien actif |
| **US-PUB-FOOTER-05** | `MOCKUP_US_PUB_FOOTER_05_CONTACT_PAGE.html` | Page `/contact` : formulaire, sans liens sociaux inline, footer |

## Composants cibles

- **`PublicMarketingFooter`** — prop `activeLink` (remplace `activeFaq`)
- **`PublicPageShell`** — layout `/privacy`, `/terms`, `/contact`

**Implémentation (réf. code) :** `components/public/PublicPageShell.tsx`, `components/public/PublicMarketingFooter.tsx` ; pages `app/[locale]/privacy|terms|contact/page.tsx`. **Doc à jour :** `Project_context.md` §4.11, §4.13 ; `docs/DESIGN_SYSTEM.md` § Pages FAQ publiques.

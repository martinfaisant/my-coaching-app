# Design — Pages FAQ publiques (athlète + coach)

**Statut :** ✅ Livré juin 2026

**Solution validée :** A — deux pages dédiées `/faq/athlete` et `/faq/coach`.

**Référence produit / technique à jour :**
- **`Project_context.md`** §4.15
- **`docs/DESIGN_SYSTEM.md`** § Pages FAQ publiques
- **`docs/I18N.md`** — namespaces `publicFooter`, `faqAthlete`, `faqCoach`

## User stories

| ID | Fichier HTML | Périmètre |
|----|--------------|-----------|
| US-FAQ-01 | `MOCKUP_US_FAQ_01_PUBLIC_FOOTER.html` | Footer marketing partagé |
| US-FAQ-02 | `MOCKUP_US_FAQ_02_ATHLETE_PAGE.html` | Page FAQ athlète complète |
| US-FAQ-03 | `MOCKUP_US_FAQ_03_COACH_PAGE.html` | Page FAQ coach complète |
| US-FAQ-04 | (intégré dans 02 et 03) | Bandeau CTA croisé entre FAQ |

## Routes livrées

- `/faq/athlete`, `/en/faq/athlete`
- `/faq/coach`, `/en/faq/coach`

## Implémentation

- `app/[locale]/faq/athlete/page.tsx`, `app/[locale]/faq/coach/page.tsx`
- `components/public/*`, `lib/faqPublicConfig.ts`
- Footer : `PublicMarketingFooter` sur `/`, `/pricing`, FAQ

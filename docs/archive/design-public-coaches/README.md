# Design — Annuaire coach public (Solution A)

**Validé PO :** juin 2026  
**Routes :** `/coaches` (FR), `/en/coaches` (EN) · `/coaches/[id]`, `/en/coaches/[id]`

## Décisions PO

| # | Décision |
|---|----------|
| 1 | URLs `/coaches` + `/coaches/[id]` |
| 2 | Masquer les coachs sans offre `published` |
| 3 | Athlète connecté sans coach → redirect `/dashboard/find-coach` |
| 4 | Athlète avec coach → message « Vous avez déjà un coach » |
| 5 | Une fiche URL par coach (SEO) |

## Mockups par user story

| US | Fichier | Contenu |
|----|---------|---------|
| US-PUB-COACH-01 | `MOCKUP_US_PUB_COACH_01_DIRECTORY.html` | Page annuaire complète (header, hero, filtres, grille) |
| US-PUB-COACH-02 | `MOCKUP_US_PUB_COACH_02_PROFILE.html` | Fiche coach publique `/coaches/[id]` |
| US-PUB-COACH-03 | `MOCKUP_US_PUB_COACH_03_AUTH_GATE.html` | Gate compte + LoginModal signup |
| US-PUB-COACH-04 | `MOCKUP_US_PUB_COACH_04_SESSION_STATES.html` | Redirect athlète, message « déjà un coach », lecture seule coach |
| US-PUB-COACH-05 | `MOCKUP_US_PUB_COACH_05_HEADER_NAV.html` | PublicHeader avec lien Trouver un coach (desktop + mobile) |

## Références code existant

- `FindCoachSection.tsx`, `CoachTile.tsx`, `CoachReviewsModal.tsx`
- `PublicHeader.tsx`, `LoginModal.tsx`, `AuthButtons.tsx`
- `docs/DESIGN_SYSTEM.md` § Trouver mon coach, § PublicHeader

# Design — PublicHeader mobile (hamburger + drawer)

**Mode :** Designer → Développeur → Reviewer Tech OK  
**Date :** 13 juin 2026

## Feature livrée

Sur viewport **&lt; md** (768 px), **`PublicHeader`** affiche une barre compacte (logo + titre page + hamburger) et un **drawer** latéral droit regroupant navigation, auth et langue — même pattern que **`DashboardTopBar`**.

## Maquettes (référence visuelle)

| Fichier | User story |
|---------|------------|
| `MOCKUP_US_PUB_HDR_01_MOBILE_BAR.html` | US-PUB-HDR-01 — barre mobile |
| `MOCKUP_US_PUB_HDR_02_DRAWER.html` | US-PUB-HDR-02 — drawer menu public |
| `MOCKUP_US_PUB_HDR_03_DESKTOP.html` | US-PUB-HDR-03 — desktop inchangé |

## Doc à jour

- **`docs/DESIGN_SYSTEM.md`** § PublicHeader
- **`Project_context.md`** §4.0 (en-tête public)
- **`lib/publicHeaderPageTitle.ts`** — titres mobile par route

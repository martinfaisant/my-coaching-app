# Onboarding coach — Mes athlètes (empty state)

**Issue :** [#116](https://github.com/martinfaisant/my-coaching-app/issues/116)  
**Livré :** juin 2026

## Implémentation

| Fichier | Rôle |
|---------|------|
| `components/CoachAthletesOnboardingPanel.tsx` | Panneau checklist (profil, offre, demandes) |
| `components/CoachOnboardingStepVisual.tsx` | Mini-visuels par étape |
| `components/CoachOnboardingGhostAthleteTiles.tsx` | Tuiles fantômes athlètes |
| `lib/coachProfileCompletion.ts` | `isCoachProfileComplete` |
| `app/[locale]/dashboard/athletes/page.tsx` | Affichage conditionnel |
| `app/[locale]/dashboard/CoachAthletesListWithFilter.tsx` | Recherche vide + effacer |

## Règles d'affichage

- Panneau visible si : 0 athlète actif, 0 demande en attente, liste chargée sans erreur.
- Masqué dès qu'il existe une **demande en attente** ou au moins un athlète actif.

## Maquettes

| Fichier | Contenu |
|---------|---------|
| `MOCKUP_US_COACH_ONB_01_CHECKLIST.html` | Checklist + visuels par étape (référence principale) |
| `MOCKUP_US_COACH_ONB_02_GHOST_TILES.html` | Spec tuiles fantômes athlètes |
| `MOCKUP_US_COACH_ONB_03_READY_WAITING.html` | Mode « espace prêt » |
| `MOCKUP_US_COACH_ONB_04_FULL_PAGE.html` | Page complète (contexte) |
| `MOCKUP_US_COACH_ONB_05_SEARCH_EMPTY.html` | Recherche sans résultat |

## Doc à jour

- **`Project_context.md`** §4.4
- **`docs/DESIGN_SYSTEM.md`** (composants + §7 Mes athlètes)
- **`docs/I18N.md`** (`athletes.onboarding.*`)

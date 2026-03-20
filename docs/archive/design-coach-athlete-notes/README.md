# Design — Notes privées coach (calendrier athlète)

> **État :** implémenté dans l’app (voir `Project_context.md` §4.2.2, `docs/DESIGN_SYSTEM.md` — `CoachAthleteNotesSection` / `CoachAthleteNoteModal`, migration **062**). Dossier **archivé** : mockups HTML de référence conservés ; source de vérité produit/UI : `Project_context.md`, `docs/DESIGN_SYSTEM.md`, `docs/I18N.md` (`coachAthleteNotes`).

**Solution validée :** option **A** (segment 3 onglets + liste + modale création/édition/suppression).

| User story | Fichier HTML de référence |
|------------|---------------------------|
| US1 | `MOCKUP_US1_SEGMENT_NOTES_EMPTY.html` |
| US2 + US4 | `MOCKUP_US2_US4_NOTE_MODAL.html` |
| US3 | `MOCKUP_US3_NOTES_LIST.html` |

## Décisions PO (révisions)

- **Toggle** : seul sur sa ligne ; le bouton **Nouvelle note** n’est **pas** à côté du toggle.
- **Nouvelle note** : **premier élément** de la zone liste, **pleine largeur** (même largeur qu’une tuile de note).
- **Tri** : **date de modification** (`updated_at`) décroissante ; **aucune date affichée** sur les tuiles (ni créée ni modifiée).
- **Aperçu** dans la liste : **au moins 3 lignes** de corps (`line-clamp-3` ou équivalent).
- **Titre** : **obligatoire** ; corps de note **obligatoire**.
- **Visibilité** : **seul le coach auteur** voit ses notes (pas les autres coachs).
- **Suppression** : autorisée pour l’auteur (avec confirmation).
- **Longueur texte** : **pas de limite** produit (éventuel plafond technique en Architecte).

**Namespace i18n :** `coachAthleteNotes` (+ `coachAthleteNotes.validation`) — voir `docs/I18N.md` et `messages/fr.json` / `en.json`.

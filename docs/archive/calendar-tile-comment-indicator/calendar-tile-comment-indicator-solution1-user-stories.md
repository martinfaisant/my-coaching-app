# Indicateur commentaire athlète sur la tuile calendrier — Solution 1 (validée)

**Solution retenue :** Icône commentaire (bulle de dialogue) en fin de ligne métadonnées (durée, distance, etc.), même style que les autres infos.  
**Mockup de référence :** `docs/archive/calendar-tile-comment-indicator/calendar-tile-comment-indicator-mockups.html` (Solution 1 ; implémentation livrée avec icône en fin de ligne).

---

## User stories (livrées)

### US1 — Afficher l'icône commentaire sur la carte compacte (grille)
- Icône bulle en **fin de ligne** métadonnées (durée, distance, allure), même style (text-stone-400, h-3 w-3). Condition : `athlete_comment` non vide ou `athlete_comment_at` renseigné.

### US2 — Accessibilité et tooltip
- `title` et `aria-label` sur l'icône via `calendar.tile.athleteCommentLabel` (FR/EN).

### US3 — Carte détaillée (modale jour)
- Même icône en fin de ligne métadonnées dans `renderDetailedCard`.

---

## Fichiers modifiés (livraison Développeur)
- `components/CalendarView.tsx` (hasAthleteComment, renderCompactCard, renderDetailedCard)
- `messages/fr.json`, `messages/en.json` (calendar.tile.athleteCommentLabel)

**Comportement courant :** Project_context.md §4.5, docs/DESIGN_SYSTEM.md §7, docs/I18N.md (namespace calendar).

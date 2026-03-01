# Design – Sélecteur de semaine sur deux lignes

**Contexte :** Sur mobile, le bouton/sélecteur de semaine de la page calendrier est trop large. L’affichage de la plage de dates sur **deux lignes** permet de réduire la largeur tout en gardant la lisibilité.

**Contrainte :** La hauteur totale du sélecteur ne doit **pas** dépasser celle du sélecteur actuel (boutons `min-h-10`, barre compacte).

**Composant concerné :** `WeekSelector` (utilisé dans `AthleteCalendarPage` / `CalendarViewWithNavigation`). Design system : tokens stone, palette-forest-dark (hover), `rounded-xl`, `border-stone-200`, `shadow-sm`.

---

## Mockups

| Fichier | Description |
|--------|-------------|
| `solution-1-two-lines-compact.html` | Deux lignes centrées (début → fin), même style, zone centrale flexible |
| `solution-2-two-lines-hierarchy.html` | Deux lignes avec hiérarchie (« Semaine du » / « au 9 févr. ») |

Les deux solutions respectent la même hauteur que l’actuel (contenu sur 2 lignes en `text-xs` ou `text-sm leading-tight` pour tenir dans la zone des boutons).

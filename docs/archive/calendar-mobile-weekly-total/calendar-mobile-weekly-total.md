# Design — Total de la semaine sur mobile (calendrier)

**Mode :** Designer  
**Date :** 23 février 2026  
**Contexte :** Calendrier athlète/coach, vue mobile.

---

## 1. Reformulation du besoin

- **Contexte :** Sur **desktop**, la semaine centrale du calendrier affiche un bloc « total de la semaine » (volume horaire total + barres de progression par sport : fait / prévu). Sur **mobile**, la vue affiche uniquement le titre de la semaine (« Semaine en cours » + plage de dates) puis la liste des jours ; **ce bloc totaux n'existe pas**.
- **Besoin :** Afficher le **total de la semaine** sur mobile en s'appuyant sur l'existant (mêmes données, mêmes libellés i18n, même logique métier).
- **Cas à couvrir :**
  - **Cas nominal :** Données présentes (prévu et/ou fait) → afficher volume horaire total et/ou totaux par sport.
  - **Semaine sans totaux :** Aucun prévu ni fait → ne pas afficher de bloc totaux (comportement actuel desktop).
  - **Plusieurs sports :** Grille ou liste adaptée à la largeur mobile (éviter surcharge visuelle).

---

## 2. Existant à réutiliser

- **Données :** `weekPrevuBySport[1]`, `weekFaitBySport[1]` (semaine centrale = `weeks[1]`), déjà calculés dans `CalendarView.tsx`.
- **i18n :** Namespace `calendar.weekly` — `totalTimeVolume`, `planned`, `sportLabels.*`, titres tooltip (ex. `timeCompletedPlanned`, `runningDistanceCompletedPlanned`, etc.).
- **Styles :** Tokens `palette-amber` (volume total), `palette-forest-dark`, `palette-olive`, etc. pour les sports ; `border-stone-200`, `bg-stone-100`, `rounded-xl` ; icônes sport existantes (`SportIcons.tsx` / `CalendarView`).
- **Composants :** Pas de composant dédié « bloc totaux » aujourd'hui (JSX inline dans `CalendarView`). Réutilisation de `formatDuration`, barres de progression (divs avec `bg-stone-100`, barre colorée en %).

---

## 3. Solutions UI proposées

Trois options, du plus fidèle au desktop au plus compact. Les mockups sont dans `calendar-mobile-weekly-total-mockups.html` (même dossier).

### Solution A — Bloc totaux identique au desktop (grille 2 colonnes)

- **Idée :** Insérer le **même** bloc que la semaine détaillée desktop (volume horaire total + barres par sport) juste **sous le titre de la semaine** et **au-dessus de la liste des jours**, uniquement en vue mobile.
- **Layout :** Une carte `rounded-xl border border-stone-200 shadow-sm` avec une grille en **2 colonnes** (`grid-cols-2`) pour rester lisible sur mobile. Déjà utilisé sur desktop en petit écran (`grid-cols-2 sm:grid-cols-5`), donc cohérent.
- **Composants :** Aucun nouveau. **À faire évoluer :** `CalendarView.tsx` — soit extraire le rendu « totaux semaine » en sous-composant interne et l'appeler à la fois pour la semaine détaillée desktop et pour la section mobile, soit dupliquer ce bloc dans la branche `isMobileView` avec les données `weekPrevuBySport[1]` / `weekFaitBySport[1]`.
- **Avantage :** Parité fonctionnelle et visuelle avec le desktop.
- **Inconvénient :** Peut prendre de la hauteur si beaucoup de sports.

### Solution B — Résumé compact (une ligne)

- **Idée :** Une **ligne unique** sous le titre de la semaine : « X h / Y h prévu » (volume total) + éventuellement icônes sport avec petits chiffres (ex. course 12 km, vélo 45 km), sur une ou deux lignes si besoin, style proche de la ligne inline des semaines **condensées** desktop (à droite du titre).
- **Layout :** Ligne de texte + icônes, `flex flex-wrap`, `text-xs`, couleurs par sport. Pas de barres de progression.
- **Composants :** Réutilisation des icônes sport et de `formatDuration`, libellés i18n existants. **À faire évoluer :** `CalendarView.tsx` — ajouter une ligne dédiée en mobile (après le titre, avant la liste des jours) avec le même calcul que la ligne condensée desktop mais pour l'index de semaine 1.
- **Avantage :** Très compact, peu de scroll.
- **Inconvénient :** Moins lisible que les barres si beaucoup de sports ; pas de détail « fait / prévu » par sport en un coup d'œil.

### Solution C — Total temps uniquement + détail en modal

- **Idée :** Sur mobile, afficher **uniquement** le **volume horaire total** (une carte avec barre fait/prévu, comme la première cellule du bloc desktop). Un lien/bouton « Voir le détail » ouvre une **modal** avec le bloc complet (volume total + barres par sport), réutilisant le même contenu que le bloc détaillé desktop.
- **Layout :** Petite carte (une seule barre) + bouton `Button variant="muted"` ou lien texte. Modal : composant `Modal` existant, contenu = bloc totaux actuel.
- **Composants :** `Modal` existant. **À faire évoluer :** `CalendarView.tsx` — bloc réduit (total temps seul) en mobile + état pour ouvrir la modal + contenu modal = rendu totaux détaillés.
- **Avantage :** Vue mobile légère, détail à la demande.
- **Inconvénient :** Un clic de plus pour voir le détail par sport.

---

## 4. Composants à utiliser / faire évoluer (synthèse)

| Élément | Utiliser tel quel | Faire évoluer |
|--------|--------------------|----------------|
| Données totaux | `weekPrevuBySport`, `weekFaitBySport` (index 1 pour la semaine centrale) | — |
| i18n | `calendar.weekly.*` | — |
| Tokens & couleurs | `palette-amber`, `palette-forest-dark`, `palette-olive`, etc. | — |
| Icônes | SportIcons (course, vélo, natation, etc.) + SVG horloge | — |
| Barres de progression | Même pattern que desktop (fond `bg-stone-100`, barre en %) | — |
| `CalendarView.tsx` | — | Branche mobile : ajout du bloc ou de la ligne totaux ; optionnel : extraction sous-composant « WeeklyTotalsBlock » pour éviter duplication |
| `Modal` | Solution C uniquement | — |

---

## 5. Recommandation

- **Recommandation :** **Solution A** — même bloc que le desktop en 2 colonnes sous le titre de la semaine. Meilleure parité avec le desktop, pas de nouveau parcours (modal), réutilisation maximale du code existant. Idéalement extraire le rendu « totaux semaine » en sous-composant pour l'appeler en desktop (semaine détaillée) et en mobile.
- Si le PO privilégie un affichage plus court sur mobile : **Solution B**. Si le PO préfère garder l'écran minimal avec détail à la demande : **Solution C**.

---

## 6. Suite (après validation PO)

- Découpage en **user stories** avec critères d'acceptation et référence au mockup choisi.
- Chaque US précisera la zone concernée (sous le titre de la semaine, au-dessus de la liste des jours) et les composants / i18n à utiliser.

---

**Livraison :** Solution A implémentée. Comportement décrit dans **Project_context.md** §4.5 (Calendar responsive) et **docs/DESIGN_SYSTEM.md** §7 (Calendrier).

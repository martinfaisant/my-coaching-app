# Design — Popup calendrier (sélecteur de date)

**Contexte :** Dans la modale d’entraînement modifiable, le choix de la date ouvre un **popup calendrier**. Cet élément doit respecter le design system (tokens, typo, couleurs) au lieu des styles par défaut (ex. bleu du navigateur).

**Références :** `docs/DESIGN_SYSTEM.md`, `lib/formStyles.ts`, `tailwind.config.ts`.

---

## 1. Périmètre

On designe **l’élément popup** lui-même :
- Conteneur (fond, bordure, ombre, rayons)
- En-tête : mois/année + navigation (mois précédent / suivant)
- Ligne des jours de la semaine (lu, ma, me…)
- Grille des dates du mois (dates du mois en cours, dates adjacentes en atténué)
- Date sélectionnée (état visuel)
- Pied : actions « Effacer » et « Aujourd’hui »

**Hors périmètre :** Le déclencheur (champ ou bouton qui ouvre le popup) est traité dans le design « placement » du calendrier dans la modale.

---

## 2. Tokens design system à appliquer

| Zone | Rôle | Tokens / classes |
|------|------|------------------|
| **Conteneur** | Popup flottant | `bg-white`, `rounded-xl`, `border border-stone-200`, `shadow-xl` (ou shadow-lg) |
| **En-tête (mois/année)** | Titre du mois affiché | `text-sm font-semibold text-stone-900` |
| **Flèches navigation** | Mois précédent / suivant | Icônes `text-stone-500`, hover `text-palette-forest-dark bg-stone-100`, boutons `rounded-lg` |
| **Jours de la semaine** | lu, ma, me… | `text-xs font-medium text-stone-500` (ou `text-stone-600`) |
| **Jour du mois (normal)** | Case cliquable | `text-sm text-stone-900`, hover `bg-stone-100` |
| **Jour autre mois** | Février / avril visibles | `text-stone-400` (atténué) |
| **Jour sélectionné** | Date choisie | `bg-palette-forest-dark text-white` (plus bordure optionnelle `border-palette-forest-darker` ou ring) |
| **Jour aujourd’hui** | Repère visuel optionnel | Bordure `border-palette-forest-dark` ou `ring-2 ring-palette-forest-dark` + fond blanc |
| **Lien pied** | « Aujourd'hui » uniquement’hui » | `text-palette-forest-dark` (pas de bleu), hover `text-palette-forest-darker` ou `underline` |

Couleurs à **ne pas** utiliser : bleu par défaut du navigateur ; tout remplacer par la palette (forest-dark, stone).

---

## 3. Structure visuelle proposée

```
┌─────────────────────────────────────┐
│  mars 2025  ▾        ⟨  ⟩           │  ← Mois/année (optionnel dropdown) + flèches
├─────────────────────────────────────┤
│  lu  ma  me  je  ve  sa  di         │  ← Jours (labels)
│   24  25  26  27  28   1   2        │
│   3   4   5   6   7   8   9         │  ← 3 = sélectionné (fond vert forêt)
│  ...                                │
├─────────────────────────────────────┤
│                    Aujourd'hui       │  ← Lien unique (vert forêt, pas d’Effacer)
└─────────────────────────────────────┘
```

- Padding : `p-4` (conteneur), `py-2` (ligne jours), `gap` cohérent dans la grille (ex. `gap-1`).
- Cases de jour : taille minimale touch-friendly (ex. `min-w-[2.25rem] h-9`), `rounded-lg` au clic/hover.

---

## 4. Composants à utiliser / à créer

| Élément | Utilisation |
|--------|--------------|
| **Tokens** | Partout : `palette-forest-dark`, `palette-forest-darker`, `stone-*` |
| **Dropdown** | Sélecteur mois/année dans l’en-tête : `components/Dropdown.tsx` avec `hideLabel` (trigger = mois affiché), options = liste des mois (value YYYY-MM, label formaté). |
| **Button (ghost)** | Flèches mois : boutons icône `rounded-lg`, `text-stone-500` hover `text-palette-forest-dark` |
| **DatePickerPopup** | Composant créé : `components/DatePickerPopup.tsx` — utilise Dropdown pour le mois, grille de jours, lien « Aujourd'hui ». |

Si le popup est fourni par une **librairie** (ex. react-day-picker, Radix, etc.) : le thème/customisation doit appliquer ces tokens (couleur de la sélection, liens, bordures).  
Si le popup est **natif** (`<input type="date">`), le navigateur contrôle l’apparence ; pour avoir ce design, il faut un **composant calendrier custom** ou une librairie themable.

---

## 5. Recommandation technique

- **Option A — Composant custom** : Implémenter un petit composant `DatePickerPopup` (ou utiliser une librairie themable) pour avoir le rendu 100 % aligné avec ce design.
- **Option B — Input natif** : Garder `<input type="date">` + `showPicker()` ; l’apparence du popup restera celle du navigateur (souvent bleu). On peut seulement styler le **trigger** (champ ou bouton).

Pour respecter strictement le design system sur **l’élément popup**, il faut une **Option A** (custom ou librairie themable).

---

## 6. Mockup et implémentation

- **Mockup :** `mockup-calendar-popup.html` — popup avec tokens (mars 2025, 3 sélectionné, lien « Aujourd'hui » uniquement ; mois = trigger style Dropdown).
- **Composant :** `components/DatePickerPopup.tsx` — utilise **Dropdown** (`hideLabel`) pour le mois, grille des jours, lien « Aujourd'hui ». Intégré dans **WorkoutModal** en **popover** sous le champ date (pas une 2e modale ; overlay transparent, fermeture clic extérieur / Escape).
- **Liste des mois (Dropdown)** : **début = mois actuel**, **fin = mois actuel + 2 ans** (25 mois). Hors plage (navigation par flèches), le mois est ajouté aux options et la liste triée. Panneau Dropdown : `max-h-64 overflow-y-auto` pour le scroll.

 / Aujourd’hui en vert forêt).

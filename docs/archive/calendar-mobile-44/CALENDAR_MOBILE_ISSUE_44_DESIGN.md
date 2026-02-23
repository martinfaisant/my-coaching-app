# Issue #44 – Calendrier mobile compatible (analyse Designer)

**Source :** GitHub issue #44  
**Titre :** Rendre le calendrier mobile compatible  
**État :** OPEN

---

## 1. Synthèse du besoin

L’athlète consulte son calendrier d’entraînement sur mobile. Aujourd’hui :
- L’en-tête met le **titre** et le **sélecteur de semaines** sur une seule ligne : sur petit écran le sélecteur sort de l’écran.
- Le calendrier affiche **3 semaines** en grille (7 colonnes × 3 semaines), avec `min-w-[800px]` et scroll horizontal, ce qui est peu lisible sur mobile.

**Objectifs :**
1. **En-tête** : faire apparaître le sélecteur de semaines **en entier**. Le mettre sur une **deuxième ligne** pour qu’il ne soit plus coupé.
2. **Vue mobile** : n’afficher qu’**une seule semaine**, avec les **jours empilés verticalement** (un jour sous l’autre) pour une lecture naturelle au doigt.

---

## 2. Cas identifiés

| Cas | Description |
|-----|-------------|
| **Nominal** | Sur mobile : en-tête sur 2 lignes (titre puis sélecteur), une semaine affichée, 7 lignes « jour » empilées. Navigation précédent/suivant inchangée. |
| **Desktop** | Comportement actuel conservé : 3 semaines, grille 7 colonnes, en-tête sur une ligne (ou 2 si on unifie le layout). |
| **Seuil mobile** | Définir un breakpoint (ex. `md` ou `lg`) à partir duquel on bascule en « 1 semaine + jours empilés » et en-tête 2 lignes. |
| **Limite** | Un seul « mode » par breakpoint : pas de choix utilisateur entre vue 3 semaines et vue 1 semaine sur mobile. |
| **Accessibilité** | Conserver les labels aria et la possibilité d’utiliser le sélecteur au clavier / au doigt. |

---

## 3. Questions au PO (optionnel)

- **Breakpoint :** on part sur `md` (768px) pour « mobile » vs « desktop », ou tu préfères `lg` (1024px) ? md
- **Coach :** le calendrier coach (vue athlète) doit-il avoir le même comportement mobile (1 semaine, jours empilés + en-tête 2 lignes) ? oui

---

## 4. Mockup HTML

Un mockup **non fonctionnel** (HTML + classes du design system) est fourni dans le même dossier :  
**`docs/calendar-mobile-mockup.html`**

Il illustre :
- **En-tête 2 lignes** : ligne 1 = titre « Calendrier », ligne 2 = sélecteur de semaine (précédent | 16 févr. – 22 févr. | suivant) centré et lisible.
- **Vue une semaine** : 7 blocs « jour » empilés verticalement (lun. 17 → dim. 23), chaque bloc avec un bandeau jour + date et une zone contenu (ex. entraînement ou vide).

Tu peux ouvrir ce fichier dans un navigateur pour valider la proposition avant passage en spec / implémentation.

---

## 5. Suite (après validation PO)

- Découpage en **user stories** avec critères d’acceptation pour l’Architecte.
- **Spec technique (Mode Architecte) :** `docs/CALENDAR_MOBILE_ISSUE_44_SPEC.md` — implémentation par le Développeur à partir de cette spec.

---

## Implémentation

**Livrée le 21 février 2026** — AthleteCalendarPage, CoachAthleteCalendarPage, CalendarView (breakpoint md, en-tête 2 lignes, vue mobile 1 semaine en stack), i18n `calendar.today`.

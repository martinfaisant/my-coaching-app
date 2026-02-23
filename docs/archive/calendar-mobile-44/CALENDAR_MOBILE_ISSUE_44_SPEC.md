# Issue #44 – Calendrier mobile compatible – Spécification technique (Mode Architecte)

**Entrée :** `docs/CALENDAR_MOBILE_ISSUE_44_DESIGN.md` (besoin + réponses PO)  
**Réponses PO :** breakpoint **md** (768px) ; **oui** pour le même comportement sur le calendrier coach (vue athlète).

**État d'implémentation :** Livré le 21 février 2026 (conformément à la spec : breakpoint md, en-tête responsive, vue mobile 1 semaine stack).

---

## 1. Périmètre et objectifs

- **En-tête :** sur viewport &lt; md, le sélecteur de semaines doit être entièrement visible, sur une **deuxième ligne** sous le titre (ou le bloc gauche).
- **Vue calendrier :** sur viewport &lt; md, n’afficher qu’**une seule semaine**, avec les **7 jours empilés verticalement** (un bloc par jour).
- **Breakpoint :** `md` (768px) — en dessous = mobile, à partir de md = desktop (comportement actuel).
- **Vues concernées :** calendrier athlète (`/dashboard/calendar`) et calendrier coach (page athlète `/dashboard/athletes/[athleteId]`).

---

## 2. Modèle de données et backend

- **Aucune modification** du schéma de base de données, des migrations ou des RLS.
- **Chargement des données inchangé :** on continue à charger 5 semaines (S-2 à S+2) côté page et dans `CalendarViewWithNavigation` (pour que la navigation prev/next ait déjà les données). Seul le **rendu** change selon le breakpoint (1 semaine affichée vs 3).

---

## 3. Architecture et fichiers concernés

### 3.1 Fichiers à modifier (aucun nouveau fichier obligatoire)

| Fichier | Rôle |
|--------|------|
| `components/AthleteCalendarPage.tsx` | En-tête du calendrier athlète : layout responsive (2 lignes sous md). |
| `components/CoachAthleteCalendarPage.tsx` | En-tête du calendrier coach : layout responsive (2 lignes sous md). |
| `components/CalendarView.tsx` | Rendu conditionnel : sous md = 1 semaine en jours empilés ; à partir de md = 3 semaines en grille comme aujourd’hui. |
| Optionnel | `components/WeekSelector.tsx` : si besoin d’ajuster largeur/min-width pour la ligne 2 (ex. `w-full max-w-…` dans le parent). |

- **CalendarViewWithNavigation** : pas de changement structurel. Il fournit déjà `referenceMonday`, les données (workouts, totaux, etc.) et le `WeekSelector` via `renderWeekSelector`. Les parents (AthleteCalendarPage, CoachAthleteCalendarPage) gèrent le layout de l’en-tête ; CalendarView gère le layout du contenu (1 vs 3 semaines, grille vs stack).

### 3.2 Flux de données (inchangé)

- Page → `AthleteCalendarPage` ou `CoachAthleteCalendarPage` → `CalendarViewWithNavigation` (données 5 semaines, `referenceMonday`, `handleNavigate`) → `CalendarView` (workouts, importedActivities, goals, weeklyTotals, workoutTotals, referenceMonday).
- Sous md, `CalendarView` n’affiche que la semaine correspondant à `referenceMonday` (équivalent actuel de la « semaine du milieu »), en liste verticale.

---

## 4. Détail des changements par composant

### 4.1 En-tête (2 lignes sur mobile)

**Règle :**  
- **&lt; md :**  
  - Ligne 1 : titre (ou bloc gauche : lien retour + avatar + nom pour le coach).  
  - Ligne 2 : sélecteur de semaine (`WeekSelector`) en pleine largeur ou centré, sans être coupé.  
- **≥ md :** conserver le layout actuel (une ligne, titre à gauche, sélecteur à droite).

**AthleteCalendarPage.tsx**

- Le `header` actuel est en `flex items-center justify-between` (titre | WeekSelector).
- Sous md : passer à `flex-col` (ou `flex flex-col md:flex-row`), avec titre sur la première ligne et `WeekSelector` sur la deuxième. Sur la deuxième ligne, le sélecteur peut être `w-full` avec `max-w-…` et `mx-auto` ou `justify-center` pour rester lisible.
- Conserver les mêmes props passées à `WeekSelector` (dateRangeLabel, onNavigate, isAnimating, prev/next labels, aria).

**CoachAthleteCalendarPage.tsx**

- Même principe : sous md, première ligne = lien retour + avatar + nom de l’athlète ; deuxième ligne = `WeekSelector` en entier (pleine largeur ou centré).
- À partir de md : une seule ligne comme aujourd’hui (retour + avatar + nom | WeekSelector).

**WeekSelector.tsx**

- Pas de changement obligatoire. Si le parent lui donne toute la largeur sur la ligne 2, le composant peut rester tel quel (avec son `w-[200px]` pour la plage au centre). Si on souhaite qu’il s’étire sur mobile, le parent peut le wrapper dans un `div` avec `flex justify-center` et une largeur max ; ou on peut rendre le bloc du sélecteur un peu plus flexible (ex. `min-w-0` + `flex-1` pour la zone centrale) — à trancher en implémentation.

### 4.2 CalendarView : 1 semaine empilée vs 3 semaines en grille

**Règle :**  
- **&lt; md (mobile) :**  
  - Afficher **une seule semaine** : celle dont le lundi est `referenceMonday` (actuellement c’est la semaine à l’index 1 dans le tableau `weeks`).  
  - Rendu : **7 blocs « jour » empilés verticalement** (lun → dim). Chaque bloc = bandeau (jour court + numéro + mois court + optionnel « Aujourd’hui ») + zone contenu (même logique qu’aujourd’hui : entraînements, objectifs, activités importées, ou vide / « Ajouter » si édition).  
  - Titre de section : une seule ligne du type « Cette semaine » + « 16 févr. au 22 févr. » (réutiliser les libellés existants / i18n).  
  - Pas de carte « totaux hebdo » (prévu/fait par sport) sur mobile pour rester aligné avec le mockup et limiter la hauteur.  
- **≥ md (desktop) :**  
  - Comportement actuel : 3 semaines, chaque semaine avec son titre, totaux si besoin, et grille 7 colonnes.

**Implémentation suggérée dans CalendarView.tsx**

1. **Détection du viewport**  
   - Utiliser un hook type `useMediaQuery('(min-width: 768px)')` ou des classes Tailwind `md:…` avec un rendu conditionnel basé sur un state/hook (pour éviter hydration mismatch, prévoir une valeur par défaut côté serveur, ex. desktop, puis mise à jour au montage client).  
   - Breakpoint cohérent avec Tailwind `md` : 768px.

2. **Données « weeks »**  
   - Ne pas changer la construction de `weeks` (3 éléments). Pour mobile, ne rendre que `weeks[1]` (la semaine de `referenceMonday`). Les données (workoutsByDate, importedByDate, goalsByDate, weekPrevuBySport, weekFaitBySport) restent inchangées ; on limite l’affichage à la semaine du milieu.

3. **Rendu mobile (1 semaine en stack)**  
   - Un seul `<section>` avec :  
     - Titre : libellé semaine + plage de dates (comme dans le mockup).  
     - Liste verticale des 7 jours : pour chaque `day` de `weeks[1].days`, un bloc avec :  
       - Bandeau : jour court (lun., mar., …), numéro, mois court ; si `day.isToday`, badge « Aujourd’hui » (i18n).  
       - Contenu : réutiliser la même logique que pour une cellule de jour actuelle (affichage objectif, entraînement, activité importée, ou cellule vide / « Ajouter »). Les composants/cartes existants (ex. objectif, entraînement compact, activité Strava) doivent être réutilisables dans ce bloc.  
   - Pas de `grid grid-cols-7` sur mobile ; pas de `min-w-[800px]` pour cette vue.

4. **Rendu desktop**  
   - Inchangé : boucle sur les 3 `weeks`, grille 7 colonnes, totaux détaillés pour la semaine du milieu, etc.

5. **Animation (slide)**  
   - `CalendarViewWithNavigation` garde la même logique de slide (transform sur le contenu). Sur mobile, le contenu qui bouge est la seule section « 1 semaine » ; pas de changement de contrat ni de props à ajouter pour l’animation.

### 4.3 Accessibilité et i18n

- Conserver les `aria-label` sur les boutons du sélecteur (Semaine précédente / Semaine suivante), déjà fournis par le parent.
- Tous les textes visibles (titres de section, « Aujourd’hui », libellés de jours, etc.) doivent passer par les clés i18n existantes ou à ajouter dans `calendar` / `common` (FR + EN). Aucun texte en dur.

### 4.4 Design system

- Tokens existants : `palette-forest-dark`, `palette-olive`, `stone-*`, `rounded-xl`, `rounded-lg`, bordures, etc.
- Pas de couleurs en hex en dur. Réutiliser les styles des cartes jour (bordures, états today/past) déjà présents dans `CalendarView`.
- Référence visuelle : `docs/calendar-mobile-mockup.html`.

---

## 5. Cas limites et points d’attention

- **Hydration :** le rendu mobile/desktop dépend du viewport. Pour éviter un flash ou une incohérence, soit on rend par défaut la vue desktop (puis on bascule en mobile au client si besoin), soit on utilise une approche CSS-only (ex. deux blocs, l’un visible sous md l’autre à partir de md) pour éviter un state « isMobile » qui diffère serveur/client. L’Architecte recommande de privilégier une approche CSS (ex. `block md:hidden` pour le stack des jours, `hidden md:block` pour la grille 3 semaines) si la structure du DOM le permet sans dupliquer trop de logique ; sinon, hook client + valeur par défaut desktop.
- **Coach + renderAfterCalendar :** la section « Objectifs de l’athlète » sous le calendrier reste inchangée ; sur mobile elle reste en dessous de la liste des 7 jours (scroll).
- **Pas de changement** des actions serveur, des routes, ni des politiques RLS.

---

## 6. Récapitulatif pour le Développeur

1. **En-tête 2 lignes sous md**  
   - Dans `AthleteCalendarPage.tsx` et `CoachAthleteCalendarPage.tsx`, rendre l’en-tête responsive : sous md, titre (ou bloc gauche) ligne 1, `WeekSelector` ligne 2 entièrement visible.

2. **CalendarView : vue mobile**  
   - Sous md : n’afficher que la semaine `referenceMonday` (index 1), en 7 blocs verticaux (bandeau jour + contenu).  
   - Utiliser soit CSS (deux structures, visibilité selon `md:`), soit hook viewport + rendu conditionnel avec défaut desktop pour l’hydration.  
   - Pas de carte totaux hebdo sur mobile.  
   - À partir de md : garder le comportement actuel (3 semaines, grille 7 colonnes).

3. **i18n**  
   - Vérifier/ajouter les clés nécessaires (ex. « Aujourd’hui », libellés de jours déjà dans `calendar`) pour la vue mobile.

4. **Tests manuels**  
   - Calendrier athlète : redimensionner sous 768px → en-tête sur 2 lignes, 1 semaine en stack.  
   - Calendrier coach (page athlète) : idem.  
   - Navigation prev/next : vérifier que la semaine affichée et les données correspondent.

Aucune migration SQL, aucun changement RLS, aucun nouveau fichier obligatoire ; uniquement des modifications de layout et de rendu conditionnel dans les composants listés.

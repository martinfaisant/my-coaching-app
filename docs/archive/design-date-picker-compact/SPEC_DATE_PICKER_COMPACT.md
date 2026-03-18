# Spec technique — Date picker compact (mois/année séparés)

**Mode :** Architecte  
**Date :** 17 mars 2026  
**Référence :** `DESIGN_DATE_PICKER_COMPACT.md` (User stories §8), mockup `MOCKUP_DATE_PICKER_SOLUTION_B.html`

---

## 1. Vue d’ensemble

Évolution **frontend uniquement** du composant `DatePickerPopup` : remplacer le Dropdown mois+année combiné par deux Dropdown (Mois, Année), plage d’années -4 / +4, flèches réduites, compacité (padding, police, cellules). Aucun changement base de données, aucun RLS.

---

## 2. Modèle de données

**Aucun changement BDD.**  
Le composant ne persiste rien ; il reçoit `value` (YYYY-MM-DD) et appelle `onChange(dateStr)`.

---

## 3. Architecture et flux

### 3.1 Fichiers impactés

| Fichier | Rôle | Action |
|---------|------|--------|
| `components/DatePickerPopup.tsx` | Popup calendrier (état vue, dropdowns, grille, pied) | **Modifier** |
| `messages/fr.json` | Traductions FR (namespace `calendar`) | **Modifier** |
| `messages/en.json` | Traductions EN (namespace `calendar`) | **Modifier** |
| `docs/DESIGN_SYSTEM.md` | § DatePickerPopup (props, usage, plage années) | **Modifier** (par le Développeur après implémentation) |

Aucun autre fichier à créer. Les appels existants à `DatePickerPopup` (WorkoutModal, AvailabilityModal, ObjectifsTable, RequestGoalAddModal) restent valides ; seule la prop optionnelle `yearDropdownId` est ajoutée (les ids dérivés restent possibles en implémentation).

### 3.2 Flux de données (DatePickerPopup)

- **Entrées :** `value` (YYYY-MM-DD), `onChange`, `locale`, `minDate?`, `maxDate?`, `monthDropdownId?`, `yearDropdownId?`, `className?`.
- **État local :** une seule source de vérité pour la « vue » calendrier suffit. Actuellement `viewMonthKey` (YYYY-MM) ; on peut conserver cette clé et en dériver `viewYear` / `viewMonth` pour les deux dropdowns.
  - Dropdown Mois : `value` = mois courant (0–11 ou format string), `onChange` met à jour la vue (année inchangée, mois changé).
  - Dropdown Année : `value` = année courante (number ou string), `onChange` met à jour la vue (mois inchangé, année changée).
  - Synchro : depuis `viewMonthKey` on calcule `viewYear` et `viewMonth` ; depuis les deux dropdowns on reconstruit `viewMonthKey` (ou équivalent) pour garder une seule variable d’état si souhaité.
- **Sorties :** `onChange(dateStr)` inchangé (sélection jour, « Aujourd’hui », pas de changement de contrat).

---

## 4. Table des fichiers (détail)

| Fichier | Créer / Modifier | Détail |
|---------|------------------|--------|
| `components/DatePickerPopup.tsx` | Modifier | Remplacer le Dropdown unique par deux Dropdown (mois, année). Options mois : 12 mois (locale, long). Options année : année -4 à +4, filtrées par min/max si présents. State : conserver ou adapter `viewMonthKey` pour piloter les deux dropdowns + grille. Flèches : même logique `goPrevMonth` / `goNextMonth`, style réduit (p-1.5, icône w-4 h-4). Styles compacts : conteneur p-3, w-[min(280px,90vw)], semaine text-[11px] ou text-xs + py-0.5 mb-0.5, grille h-8 min-w-[2rem] text-xs gap-0.5, pied mt-3 pt-2 + lien text-xs. Props : ajouter `yearDropdownId?` (optionnel). Ids : dériver l’id année de `monthDropdownId` si `yearDropdownId` non fourni (ex. `${monthDropdownId}-year`). Aria-labels via `t('chooseMonth')`, `t('chooseYear')`, `t('prevMonth')`, `t('nextMonth')`. Filtrer options mois/année selon minDate/maxDate (mois ou année sans aucun jour dans [minDate,maxDate] exclus). |
| `messages/fr.json` | Modifier | Sous `calendar` : ajouter `chooseMonth`, `chooseYear`, `prevMonth`, `nextMonth` (aria-labels). |
| `messages/en.json` | Modifier | Idem (traductions EN). |
| `docs/DESIGN_SYSTEM.md` | Modifier | Mettre à jour la section DatePickerPopup : deux Dropdown (Mois, Année), plage années -4 / +4, prop `yearDropdownId`, styles compacts (padding, largeur 280px, cellules, pied). Référence mockup Solution B. |

---

## 5. Logique métier

### 5.1 Options du dropdown Mois

- **Sans min/max :** les 12 mois (janvier–décembre), label = `toLocaleDateString(locale, { month: 'long' })` capitalisé, value = numéro de mois (1–12 en string ou 0–11 selon implémentation). Pour la vue, on travaille avec (year, month) ; la valeur du dropdown mois peut être `String(month + 1).padStart(2,'0')` et l’année vient de `viewYear`.
- **Avec minDate / maxDate :** pour chaque mois (dans la plage d’années affichée), inclure le mois seulement s’il existe au moins un jour dans [minDate, maxDate]. Ex. si maxDate = 2026-03-15, exclure avril 2026 et au-delà pour l’année 2026. Pour une année donnée, les 12 mois peuvent rester tous proposés si la plage couvre l’année ; sinon filtrer les mois qui n’ont aucun jour dans l’intervalle.

Détail implémentation : construire la liste des mois pour l’année courante de la vue (`viewYear`). Pour chaque mois 0..11, premier jour = `${viewYear}-${(month+1).padStart(2,0)}-01`, dernier jour = dernier jour du mois. Le mois est inclus si l’intervalle [premier, dernier] intersecte [minDate, maxDate] (ou si pas de min/max, tous inclus).

### 5.2 Options du dropdown Année

- **Sans min/max :** années de `currentYear - 4` à `currentYear + 4` (9 valeurs). Label = année (ex. "2026"), value = année (string ou number).
- **Avec minDate / maxDate :** garder uniquement les années pour lesquelles au moins un jour existe dans [minDate, maxDate]. Ex. minDate = 2024-06-01, maxDate = 2027-12-31 → années 2024, 2025, 2026, 2027 (sous-réponse de -4/+4 si besoin).

### 5.3 Vue affichée (viewMonthKey ou équivalent)

- Initialisation : comme aujourd’hui depuis `value` ou date du jour.
- Changement Mois : garder `viewYear`, mettre à jour le mois ; recalculer `viewMonthKey` (YYYY-MM).
- Changement Année : garder le mois, mettre à jour l’année ; recalculer `viewMonthKey`.
- Flèches : inchangé (goPrevMonth / goNextMonth). La vue peut sortir de la plage -4/+4 (ex. naviguer en 2022 avec les flèches) ; les options des dropdowns restent -4/+4, et si la vue est hors plage, l’année (ou le mois) affiché peut être ajouté temporairement aux options pour que les dropdowns restent synchronisés, ou on clamp la vue à la plage au prochain open (à trancher en implémentation).

### 5.4 Jours désactivés

- Comportement actuel conservé : tout jour dont `dateStr < minDate` ou `dateStr > maxDate` est disabled (style gris, non cliquable). Aucun changement de logique.

### 5.5 Sélection d’un jour / Aujourd’hui

- Inchangé : `handleSelectDate(dateStr)`, `handleToday()` ; respect de min/max déjà en place.

---

## 6. Contraintes et cas limites

- **Vue hors plage -4/+4 :** si l’utilisateur navigue aux flèches vers 2022 alors que la plage d’années est 2022–2030, le dropdown Année doit afficher 2022. Donc soit les options année sont dynamiques et incluent `viewYear` s’il sort de -4/+4 (comme actuellement pour viewMonthKey dans monthOptions), soit on clamp la vue à [currentYear-4, currentYear+4]. Recommandation : inclure `viewYear` dans les options année si hors plage, pour cohérence affichage (comportement actuel du mois combiné).
- **Mois sans aucun jour dans [min, max] :** ne pas proposer ce mois dans le dropdown (éviter une vue vide).
- **Année sans aucun jour dans [min, max] :** ne pas proposer cette année.
- **Accessibilité :** les deux dropdowns doivent avoir un id unique (prop `monthDropdownId`, `yearDropdownId` ou dérivé). Aria-labels i18n pour « Choisir le mois », « Choisir l’année », « Mois précédent », « Mois suivant ».

---

## 7. i18n

- **Namespace :** `calendar` (déjà utilisé pour `today`).
- **Nouvelles clés (FR / EN) :**
  - `calendar.chooseMonth` — aria-label dropdown mois (ex. FR « Choisir le mois », EN « Choose month »).
  - `calendar.chooseYear` — aria-label dropdown année (ex. FR « Choisir l’année », EN « Choose year »).
  - `calendar.prevMonth` — aria-label bouton mois précédent (ex. FR « Mois précédent », EN « Previous month »).
  - `calendar.nextMonth` — aria-label bouton mois suivant (ex. FR « Mois suivant », EN « Next month »).

Référence : `docs/I18N.md`.

---

## 8. Tests manuels recommandés

1. **WorkoutModal (coach) :** ouvrir le date picker, changer mois puis année via les deux dropdowns, sélectionner un jour, vérifier que la date s’affiche et que le popup se ferme. Vérifier flèches (mois précédent/suivant). Vérifier lien « Aujourd’hui ».
2. **AvailabilityModal :** même scénario (date du créneau).
3. **ObjectifsTable (ajout objectif) :** ouvrir le date picker depuis le formulaire, vérifier mois/année séparés et compacité.
4. **RequestGoalAddModal :** idem.
5. **Avec minDate / maxDate :** si un usage impose min/max (ex. pas de date passée), vérifier que les options mois/année ne proposent que les mois/années avec au moins un jour dans la plage, et que les jours hors plage sont grisés.
6. **Locale EN :** basculer en anglais, ouvrir le date picker, vérifier libellés des mois et aria-labels.
7. **Accessibilité :** vérifier que les deux dropdowns ont un id et un aria-label (inspect ou lecteur d’écran).

---

## 9. Points à trancher en implémentation

- **Valeur du dropdown Mois :** stocker mois seul (1–12 ou 0–11) et garder `viewYear` à part, ou garder une clé unique `viewMonthKey` (YYYY-MM) et dériver mois/année pour l’affichage des deux dropdowns. Recommandation : garder `viewMonthKey` comme state unique, dériver `viewYear` / `viewMonth` pour les dropdowns ; au changement du dropdown Mois, reconstruire `viewMonthKey` avec la nouvelle valeur mois et `viewYear` ; au changement du dropdown Année, reconstruire avec `viewMonth` et la nouvelle année.
- **Id année :** si `yearDropdownId` non fourni, utiliser `${monthDropdownId}-year` pour ne pas casser les appels existants (ils ne passent que `monthDropdownId`).
- **Largeur dropdown Année :** passer `minWidth="72px"` (ou équivalent) au Dropdown année pour coller au mockup ; le composant Dropdown accepte déjà `minWidth`.

---

## 10. Checklist avant livraison (Architecte)

- [x] Aucun changement BDD (confirmé).
- [x] Aucune RLS (N/A).
- [x] Table des fichiers présente (Fichier | Créer/Modifier | Détail).
- [x] Logique métier (options mois/année, min/max, état vue) décrite.
- [x] Cas limites (vue hors plage, mois/année sans jour dans plage) listés.
- [x] Tests manuels recommandés indiqués.
- [x] Points à trancher en implémentation signalés.

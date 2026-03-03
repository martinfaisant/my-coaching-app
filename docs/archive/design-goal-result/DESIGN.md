# Design : Saisie du résultat pour un objectif passé

**Mode :** Designer  
**Date :** 3 mars 2026

---

## 1. Reformulation du besoin

**En tant qu’athlète**, je veux pouvoir **saisir un résultat** pour un **objectif passé** (course, épreuve dont la date est dépassée), afin de garder une trace de ma performance et de la partager avec mon coach.

**Données à saisir :**
- **Temps** (requis) : **3 champs** — heures, minutes, secondes (valeurs numériques).
- **Place** (facultatif) : position à l’arrivée uniquement (ex. 42).
- **Note** (facultatif) : champ texte libre pour commentaires (conditions, ressenti, etc.).

**Contraintes :**
- Résultat **uniquement pour un objectif dont la date est dans le passé** (pas de saisie pour un objectif futur).
- L’athlète peut **modifier le résultat à tout moment** (pas de gel après première saisie).
- Le coach voit les objectifs de l’athlète en **lecture seule** ; il doit donc voir aussi le résultat (temps, place, note) s’il est renseigné.

**Modale :** Le **titre de la modale** est le **nom de la course** (ex. « Semi-marathon de Lyon »), pas « Saisir le résultat ».

---

## 2. Écran existant analysé

**Page :** `app/[locale]/dashboard/objectifs/page.tsx`  
**Composant principal :** `ObjectifsTable` (`app/[locale]/dashboard/objectifs/ObjectifsTable.tsx`).

**Structure actuelle :**
- **Layout** : grille 2/3 (liste) + 1/3 (formulaire d’ajout d’objectif en sticky).
- **Liste** : objectifs groupés par **saison (année)** ; pour chaque objectif :
  - **TileCard** avec bordure gauche (ambre = priorité principale, sage = secondaire).
  - Bloc date (mois / jour), titre (race_name), badge priorité (Principal / Secondaire), distance (km), « X jours » pour les futurs, bouton **Supprimer**.
- **Objectifs passés** : affichés avec `opacity-75` ; pas d’action « Saisir le résultat » aujourd’hui.
- **Formulaire droit** : ajout d’un nouvel objectif (nom, date, distance, priorité) ; date **min = aujourd’hui** (pas de création dans le passé).

**Table `goals` actuelle :** `id`, `athlete_id`, `date`, `race_name`, `distance`, `is_primary`, `created_at`. Aucun champ résultat (temps, classement, note).

---

## 3. Cas d’usage identifiés

| Cas | Description |
|-----|-------------|
| **Nominal** | Pour un objectif passé, l’athlète clique sur « Saisir le résultat ». Une modale s’ouvre (titre = nom de la course) avec : Temps (3 champs H/min/s, requis), Place (optionnel), Note (optionnel). Il enregistre ; le résultat est affiché sur la tuile. |
| **Déjà un résultat** | Si un résultat existe déjà, l’action devient « Modifier le résultat » ; le formulaire est pré-rempli. Modification autorisée à tout moment. |
| **Objectif futur** | Aucune action « Saisir le résultat » pour un objectif dont la date ≥ aujourd’hui. |
| **Erreurs** | Temps vide ou invalide (ex. minutes &gt; 59) → message d’erreur. Limite de longueur sur note (ex. 500 caractères). |
| **Coach** | En vue « Objectifs de l’athlète », le coach voit les objectifs avec résultat en lecture seule (temps, place, note) sans bouton de saisie. |
| **Limite** | Un seul « résultat » par objectif (pas d’historique de modifications, seule la dernière valeur est stockée). |

---

## 4. Réponses PO (validé)

| Question | Décision |
|----------|----------|
| **Titre modale** | Le titre de la modale = **nom de la course** (ex. « Semi-marathon de Lyon »). |
| **Format du temps** | **3 champs** : heures, minutes, secondes (numériques). |
| **Classement** | Un seul champ **Place** : la position à l’arrivée uniquement (ex. 42). |
| **Modification** | L’athlète peut **modifier le résultat à tout moment**. |
| **Affichage sur la tuile** | Résumé du résultat (ex. « 3h42 · 24e ») directement sur la tuile — validé. |

---

## 5. Propositions UI (2 solutions)

### Solution A – Modale « Saisir / Modifier le résultat »

- **Déclencheur :** Sur chaque **tuile objectif passé**, un bouton **« Saisir le résultat »** (ou **« Modifier le résultat »** si déjà renseigné), à côté du bouton Supprimer.
- **Modale** (composant `Modal`, taille `md` ou `lg`) :
  - **Titre :** **Nom de la course** (ex. « Semi-marathon de Lyon »), pas « Saisir le résultat ».
  - **Corps :**
    - **Temps** (requis) : **3 champs** `Input` number — Heures, Minutes, Secondes (min/max selon unité).
    - **Place** (optionnel) : un champ `Input` number, position à l’arrivée (ex. 42).
    - **Note** (optionnel) : un `Textarea`, placeholder « Conditions, ressenti… ».
  - **Footer :** Annuler (muted) + Enregistrer (primaryDark), avec pattern bouton de sauvegarde (loading, succès, erreur).
- **Après enregistrement :** La tuile objectif affiche un **résumé du résultat** (ex. temps formaté + place si présent) sous la ligne distance, et le bouton devient « Modifier le résultat ».

**Référence mockup :** `MOCKUP_GOAL_RESULT_MODAL.html`, `MOCKUP_GOAL_RESULT_TILE.html`.

---

### Créer un objectif dans le passé pour ensuite saisir un résultat

**Besoin :** « J’ai couru une course le mois dernier mais je ne l’avais pas ajoutée comme objectif ; je veux l’ajouter maintenant avec la date passée et saisir mon résultat. »

**Comportement à prévoir :**
- **Autoriser la création d’un objectif avec une date dans le passé** dans le formulaire « Ajouter un objectif » (colonne droite) : retirer la contrainte `min={today}` sur le champ date (ou accepter toute date).
- Après création, l’objectif apparaît dans la liste (section objectifs passés). L’athlète peut immédiatement cliquer sur **« Saisir le résultat »** pour ouvrir la modale et renseigner temps, place, note.
- **Côté backend** : l’action `addGoal` doit accepter une date passée (supprimer la vérification qui renvoie « Un objectif ne peut pas être défini dans le passé » pour ce flux, ou la réserver uniquement à un autre cas si besoin).

**Résumé :** Pour « créer un résultat dans le passé », l’athlète **ajoute d’abord l’objectif** (nom de la course, date passée, distance, priorité) puis **saisit le résultat** via le bouton sur la tuile. Les deux étapes sont donc : 1) Ajouter un objectif (date passée autorisée), 2) Saisir le résultat sur cet objectif.

---

### Solution B – Formulaire inline sous la tuile

- **Déclencheur :** Clic sur « Saisir le résultat » → la tuile **s’étend** (ou un bloc sous la tuile s’affiche) avec les champs Temps, Classement, Note et le bouton Enregistrer.
- **Avantage :** Pas de modale, tout reste dans le flux de la page.
- **Inconvénient :** Sur mobile, liste longue = beaucoup de dépliage ; moins de focus que la modale.

**Recommandation Designer :** **Solution A (modale)** pour garder un flux clair, réutilisation du composant `Modal` et pattern de sauvegarde déjà en place sur l’app.

---

## 6. Règles design system (rappel)

- **Tokens de couleur** : pas de hex en dur ; utiliser `palette-forest-dark`, `palette-amber`, `palette-sage`, `palette-danger`, etc.
- **Formulaires** : `Input`, `Textarea`, styles `lib/formStyles.ts` (`FORM_BASE_CLASSES`, etc.).
- **Modale** : composant `Modal` (`components/Modal.tsx`), tailles `md` / `lg`.
- **Boutons** : `Button` (primaryDark pour Enregistrer, muted pour Annuler), avec pattern `docs/PATTERN_SAVE_BUTTON.md` (loading, success, error).
- **Tuiles** : `TileCard` pour la liste d’objectifs ; bordure gauche ambre/sage selon priorité.

---

## 7. Composants à utiliser / faire évoluer

| Composant | Usage |
|-----------|--------|
| **Modal** | Modale « Saisir / Modifier le résultat » : **titre = nom de la course**, corps (Temps en 3 champs H/min/s, Place, Note), footer Annuler + Enregistrer. |
| **Input** | Temps : 3 champs number (heures, minutes, secondes). Place : 1 champ number. |
| **Textarea** | Champ Note (optionnel). |
| **Button** | Annuler (muted), Enregistrer (primaryDark avec pattern save button). |
| **ObjectifsTable / TileCard** | Pour les objectifs passés : ajouter le bouton « Saisir le résultat » / « Modifier le résultat » et l’affichage du résumé résultat (temps, classement) sous la distance. |

Aucun nouveau composant réutilisable à créer dans `components/` ; uniquement évolution de la page objectifs et d’une modale dédiée (ou bloc dans la page).

---

## 8. Fichiers mockups

- **`MOCKUP_GOAL_RESULT_MODAL.html`** : modale avec **titre = nom de la course** (Semi-marathon de Lyon), Temps en 3 champs (h, min, s), Place (optionnel), Note (optionnel), boutons Annuler / Enregistrer.
- **`MOCKUP_GOAL_RESULT_TILE.html`** : extrait de la liste « Mes objectifs » avec une tuile **objectif passé sans résultat** (bouton « Saisir le résultat ») et une tuile **objectif passé avec résultat** (affichage 3h42 · 24e, bouton « Modifier le résultat »).

Ouvrir dans un navigateur pour validation visuelle (Tailwind CDN + palette projet).

---

## 9. User stories (à valider après réponses PO)

### US1 – Saisie du résultat (objectif passé)

**En tant qu’** athlète, **je veux** saisir un résultat (temps, classement optionnel, note optionnelle) pour un objectif dont la date est passée **afin que** je garde une trace de ma performance et que mon coach puisse la consulter.

**Référence mockup :** `MOCKUP_GOAL_RESULT_MODAL.html`, zone formulaire.

**Critères d’acceptation :**
- Sur la page « Mes objectifs », pour tout objectif dont la date &lt; aujourd’hui, un bouton « Saisir le résultat » est affiché (ou « Modifier le résultat » si un résultat existe).
- Au clic, une modale s’ouvre : **titre = nom de la course** ; corps : Temps (requis, 3 champs heures / minutes / secondes), Place (optionnel), Note (optionnel).
- L’athlète peut modifier le résultat à tout moment (réouvrir la modale, pré-remplie).
- L’enregistrement persiste les données (voir spec technique pour modèle de données).
- Après succès, la modale se ferme et la tuile affiche un résumé du résultat (temps formaté, éventuellement place).
- Texte et libellés en i18n (namespace `goals`, ex. `goals.result.*`).

### US2 – Affichage du résultat sur la tuile

**En tant qu’** athlète, **je veux** voir le résultat que j’ai saisi directement sur la tuile de l’objectif **afin que** je n’aie pas à rouvrir la modale pour le consulter.

**Référence mockup :** `MOCKUP_GOAL_RESULT_TILE.html`, tuile avec résultat.

**Critères d’acceptation :**
- Si un résultat existe (temps au minimum), la tuile affiche sous la ligne distance un résumé lisible (ex. « 3h42 » ou « 3h42 · 24e » si place renseignée).
- Le bouton d’action reste « Modifier le résultat ».

### US3 – Lecture seule côté coach

**En tant que** coach, **je veux** voir le résultat (temps, place, note) des objectifs passés de mes athlètes **afin que** je puisse suivre leurs performances.

**Critères d’acceptation :**
- Dans la vue « Objectifs de l’athlète » (ou équivalent), les objectifs passés avec résultat affichent temps, place (si présent), note (si présent). Aucun bouton « Saisir / Modifier le résultat ».

### US4 – Ajouter un objectif avec une date passée (pour saisir un résultat a posteriori)

**En tant qu’** athlète, **je veux** pouvoir ajouter un objectif dont la date est dans le passé **afin que** je puisse ensuite saisir le résultat d’une course que j’ai déjà courue sans l’avoir créée à l’avance.

**Critères d’acceptation :**
- Dans le formulaire « Ajouter un objectif » (page Mes objectifs), le champ date **accepte une date passée** (pas de contrainte `min = aujourd’hui`).
- Après création, l’objectif apparaît dans la liste (section objectifs passés) et l’athlète peut cliquer sur « Saisir le résultat » pour renseigner temps, place, note.
- Côté backend : l’action d’ajout d’objectif accepte une date passée (pas de message « Un objectif ne peut pas être défini dans le passé »).

---

## 10. Checklist avant livraison Designer

- [x] Design system consulté (`docs/DESIGN_SYSTEM.md`)
- [x] Écran existant (page objectifs, ObjectifsTable) analysé
- [x] Cas nominal, erreurs, limites et vue coach identifiés
- [x] Questions au PO listées (format temps, classement, modification, affichage tuile)
- [x] 2 solutions UI proposées (modale recommandée)
- [x] Composants design system cités (Modal, Input, Textarea, Button, TileCard)
- [x] Mockups créés (modale + tuiles avec/sans résultat)
- [x] Réponses PO reçues (titre = nom course, temps 3 champs, place uniquement, modification à tout moment, affichage tuile validé). Cas « objectif créé dans le passé » documenté (autoriser date passée à l’ajout d’objectif).

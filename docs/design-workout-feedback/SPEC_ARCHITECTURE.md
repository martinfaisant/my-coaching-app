# Spec technique : Retour athlète (ressenti, intensité, plaisir)

**Mode :** Architecte  
**Date :** 3 mars 2026  
**Référence design :** `docs/design-workout-feedback/DESIGN.md`, mockup `MOCKUP_WORKOUT_FEEDBACK_MODAL_A.html`

---

## 1. Contexte et périmètre

L’athlète peut déjà, dans la modale d’entraînement (vue athlète), modifier le **statut** (Planifié / Réalisé / Non réalisé) et le **commentaire** via `saveWorkoutStatusAndComment`. On ajoute trois champs de retour optionnels :

- **Ressenti** (comment vous êtes-vous senti) : échelle 1–5 (stockée en entier).
- **Intensité de l’effort ressenti** : échelle 1–10 (stockée en entier).
- **Plaisir pris pendant la séance** : échelle 1–5 (stockée en entier).

Tous optionnels ; pas de règle métier imposant de les remplir selon le statut. Le coach voit ces valeurs en **lecture seule** (même politique d’accès que le reste de la modale).

---

## 2. Modèle de données

### 2.1 Table concernée : `workouts`

Ajout de **trois colonnes** sur `public.workouts` :

| Colonne                 | Type      | Nullable | Contrainte | Description |
|-------------------------|-----------|----------|------------|-------------|
| `perceived_feeling`     | SMALLINT  | Oui      | 1 à 5      | Ressenti (1 = très mal → 5 = très bien). |
| `perceived_intensity`   | SMALLINT  | Oui      | 1 à 10     | Intensité effort perçu (RPE). |
| `perceived_pleasure`    | SMALLINT  | Oui      | 1 à 5      | Plaisir (1 = aucun → 5 = très agréable). |

- Pas de valeur par défaut (NULL = non renseigné).
- Contraintes `CHECK` pour borner les valeurs.
- Aucune nouvelle table ; pas d’historique des modifications (dernière valeur uniquement).

### 2.2 Migration

**Fichier :** `supabase/migrations/054_workout_feedback.sql`

- `ALTER TABLE public.workouts` : ajout des 3 colonnes + contraintes CHECK.
- Pas de modification des politiques RLS : l’athlète met déjà à jour ses lignes `workouts` (policy `workouts_update_athlete_comment`), le coach via `workouts_update_coach`. Les nouvelles colonnes sont simplement incluses dans ces mises à jour.

---

## 3. Architecture et flux

### 3.1 Flux actuel (inchangé en entrée/sortie)

- Ouverture de la modale : chargement du `workout` (déjà récupéré avec les colonnes existantes).
- Soumission formulaire athlète : `saveWorkoutStatusAndComment(workoutId, athleteId, pathToRevalidate, prevState, formData)`.
- FormData actuel : `status`, `comment`.

### 3.2 Extension du flux

- **FormData** : en plus de `status` et `comment`, envoyer `perceived_feeling` (1–5 ou vide), `perceived_intensity` (1–10 ou vide), `perceived_pleasure` (1–5 ou vide).
- **Action** : dans `saveWorkoutStatusAndComment`, lire ces trois champs, les valider (entiers dans les bornes ou null), et les passer dans l’`update` Supabase avec `status` et `athlete_comment` / `athlete_comment_at`.
- **Lecture** : les requêtes qui chargent un workout (page calendrier, modale) doivent sélectionner les nouvelles colonnes pour affichage (athlète : formulaire ; coach : lecture seule).

### 3.3 Règles métier

- **Validation côté serveur** :  
  - `perceived_feeling` : entier entre 1 et 5, ou absent/null → stocker NULL si vide ou invalide.  
  - `perceived_intensity` : entier entre 1 et 10, ou absent/null → idem.  
  - `perceived_pleasure` : entier entre 1 et 5, ou absent/null → idem.
- **Qui met à jour** : seul l’athlète propriétaire du workout peut modifier ces champs (déjà garanti par RLS : `workouts_update_athlete_comment` avec `athlete_id = auth.uid()`). Le coach ne modifie pas le retour athlète.
- **Visibilité** :  
  - Athlète : peut voir et éditer ses propres valeurs dans la section retour de la modale.  
  - Coach : peut voir les valeurs en lecture seule dans la modale (même sélection que les autres champs workout).

---

## 4. Table des fichiers

| Fichier | Rôle | Créer / Modifier |
|---------|------|-------------------|
| `supabase/migrations/054_workout_feedback.sql` | Ajout colonnes + CHECK sur `workouts` | **Créer** |
| `types/database.ts` | Type `Workout` : ajout `perceived_feeling`, `perceived_intensity`, `perceived_pleasure` (optionnels, number \| null) | **Modifier** |
| `app/[locale]/dashboard/workouts/actions.ts` | `saveWorkoutStatusAndComment` : lecture FormData, validation 1–5 / 1–10, update avec les 3 champs | **Modifier** |
| `components/WorkoutModal.tsx` | Vue athlète : champs UI ressenti (1–5 Lucide), intensité (1–10), plaisir (1–5), envoi dans le form ; vue coach : affichage lecture seule des 3 valeurs | **Modifier** |
| `messages/fr.json` | Clés i18n pour labels et descriptions (ressenti, intensité, plaisir, libellés des 5 niveaux) | **Modifier** |
| `messages/en.json` | Idem (EN) | **Modifier** |
| `docs/DESIGN_SYSTEM.md` | Documenter composant(s) échelle 1–5 (smileys Lucide) et/ou échelle 1–10 si réutilisables | **Modifier** (optionnel, au moment de l’implémentation) |

Aucun nouveau fichier de page ; pas de nouvelle route.

---

## 5. RLS (sécurité)

- **Aucune nouvelle politique** : les politiques existantes sur `workouts` suffisent.  
  - **Athlète** : `workouts_update_athlete_comment` autorise l’UPDATE sur les lignes où `athlete_id = auth.uid()`. Les nouvelles colonnes sont mises à jour dans le même `update`.  
  - **Coach** : `workouts_update_coach` et `workouts_select_coach` : lecture et mise à jour des champs coach (pas de mise à jour des champs « retour athlète » côté app, mais la RLS ne restreint pas colonne par colonne).  
- En **implémentation** : s’assurer que l’action côté coach ne met jamais à jour `perceived_feeling`, `perceived_intensity`, `perceived_pleasure` (seule l’action athlète `saveWorkoutStatusAndComment` les modifie). Ainsi, pas de contournement fonctionnel.

---

## 6. Cas limites et contraintes

| Cas | Comportement |
|-----|--------------|
| Valeur hors bornes (ex. 0, 11, -1) | Validation serveur : rejeter ou ignorer le champ → stocker NULL. Message d’erreur générique ou champ invalide selon choix implémentation. |
| Chaîne vide ou non numérique | Interpréter comme « non renseigné » → NULL. |
| Athlète modifie le retour après coup | Autorisé (comme le commentaire). Dernière valeur conservée. |
| Coach consulte un workout sans retour | Afficher les 3 champs en lecture seule ; si NULL, afficher un tiret ou « Non renseigné » (i18n). |
| Mobile / petits écrans | Conserver la même largeur totale des trois lignes de choix (flex w-full, flex-1 min-w-0) ; textes descriptifs avec line-clamp si besoin (déjà prévu dans le mockup). |

---

## 7. Points à trancher en implémentation

1. **Visibilité des champs selon le statut** : le design laisse ouverte la question « afficher les 3 questions uniquement si statut = Réalisé, ou aussi pour Non réalisé ? ». Par défaut, proposer d’afficher les 3 blocs pour tout statut (Planifié / Réalisé / Non réalisé) pour éviter de cacher des champs déjà remplis si l’athlète repasse en « Planifié ». Si le PO impose « uniquement si Réalisé », masquer les blocs en lecture/écriture quand `status !== 'completed'`.
2. **Message d’erreur** : en cas de valeur invalide (hors 1–5 ou 1–10), soit retourner un message générique (ex. « Erreur de saisie »), soit un message par champ (ex. « L’intensité doit être entre 1 et 10 »). À aligner avec les autres validations du projet (namespace `workouts.validation` ou équivalent).
3. **i18n** : namespace dédié (ex. `workouts.feedback`) pour les libellés ressenti / intensité / plaisir et les 5 descriptions (Très mal, Mal, Neutre, Bien, Très bien ; Aucun plaisir, Un peu, Moyen, Agréable, Très agréable).

---

## 8. Tests manuels recommandés

1. **Athlète – enregistrement** : Ouvrir un entraînement en vue athlète, choisir « Réalisé », renseigner ressenti (1–5), intensité (1–10), plaisir (1–5), commentaire. Enregistrer. Recharger la page / rouvrir la modale : les valeurs sont bien persistées.
2. **Athlète – modification** : Modifier une ou plusieurs des 3 échelles et ré-enregistrer. Vérifier que les nouvelles valeurs remplacent les anciennes.
3. **Athlète – tout optionnel** : Enregistrer sans remplir ressenti / intensité / plaisir (uniquement statut + commentaire). Vérifier qu’aucune erreur et que les champs restent NULL en BDD ou vides à l’affichage.
4. **Coach – lecture seule** : En tant que coach, ouvrir un entraînement d’un athlète ayant renseigné le retour. Vérifier l’affichage des 3 valeurs (et des libellés 1–5 / 1–10) sans possibilité d’édition.
5. **Validation** : Tenter d’envoyer une intensité 0 ou 11 (ex. via outil dev) : le serveur doit rejeter ou normaliser en NULL et ne pas planter.
6. **Responsive** : Vérifier sur une largeur réduite que les trois lignes de choix restent alignées et lisibles (même largeur totale, textes éventuellement sur 2 lignes).

---

## 9. Checklist livraison spec

- [x] Migrations cohérentes (ajout colonnes + CHECK, pas de changement RLS).
- [x] RLS justifiées (réutilisation policies existantes).
- [x] Table des fichiers (créer / modifier) présente.
- [x] Cas limites listés.
- [x] Tests manuels indiqués.
- [x] Points à trancher en implémentation signalés.

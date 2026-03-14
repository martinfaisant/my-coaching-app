# Spec technique — Profil athlète : objectifs et volume par sport/semaine

**Mode :** Architecte  
**Date :** 12 mars 2026  
**Référence :** `docs/design-athlete-weekly-targets/DESIGN_ATHLETE_WEEKLY_TARGETS.md`, mockup Solution E (`MOCKUP_ATHLETE_WEEKLY_TARGETS.html`).

---

## 1. Contexte et périmètre

- **Besoin :** Dans le profil athlète (Mon profil), ajouter une section « Objectifs et volume par sport » avec :
  - **Temps à allouer par semaine** : une valeur globale en **heures** (saisie manuelle, suffixe h/sem. / h/week).
  - **Volume actuel par sport et par semaine** : une valeur par sport pratiqué, saisie manuelle ; unités : km (course, vélo), m (natation), h (musculation). Autres sports (trail, triathlon, etc.) : à définir en implémentation (ex. km ou h).
- **Solution UI retenue :** Solution E — temps global sur une ligne ; grille de cartes (une par sport pratiqué), titre (icône + nom) + champ de saisie sur une ligne ; **champs de saisie alignés à droite**, même largeur (`w-28`). Pattern input + suffixe comme dans `OffersForm.tsx`.
- **Enregistrement :** même formulaire profil, même bouton « Enregistrer ».
- **Coach :** verra ces infos plus tard (hors scope ; pas d’écran coach dans cette spec).

---

## 2. User stories (synthèse design)

| US | Description | Critères d’acceptation |
|----|-------------|------------------------|
| US1 | Section visible (athlète uniquement) | La section « Objectifs et volume par sport » apparaît après « Sports pratiqués », uniquement si `role === 'athlete'`. |
| US2 | Temps à allouer (global) | Un champ unique « Temps à allouer / semaine » avec suffixe h/sem. / h/week ; valeur en heures ; enregistrée avec le profil. |
| US3 | Volume par sport | Pour chaque sport de `practiced_sports`, une carte avec icône + nom + champ volume ; suffixe selon sport (km/sem., m/sem., h/sem.) ; champs même largeur, alignés à droite. |
| US4 | Aucun sport | Si `practiced_sports` est vide : soit section masquée, soit message « Sélectionnez des sports pratiqués ci-dessus pour définir vos objectifs. » (à trancher en implémentation). |
| US5 | Validation et enregistrement | Validation (positif, plafond raisonnable) ; sauvegarde avec le bouton Enregistrer existant ; feedback succès/erreur comme le reste du formulaire. |

---

## 3. Architecture et table des fichiers

| Fichier | Rôle | Action |
|---------|------|--------|
| `supabase/migrations/055_profiles_weekly_target_and_volume.sql` | Ajout colonnes `weekly_target_hours`, `weekly_volume_by_sport` sur `profiles` | **Créer** |
| `app/[locale]/dashboard/profile/page.tsx` | Page profil ; passe les nouvelles props au `ProfileForm` | **Modifier** (lecture des champs depuis le profil) |
| `app/[locale]/dashboard/profile/ProfileForm.tsx` | Formulaire profil ; section Objectifs et volume (Solution E) pour athlète ; détection des changements pour « Enregistrer » | **Modifier** |
| `app/[locale]/dashboard/profile/actions.ts` | `updateProfile` : lire et valider `weekly_target_hours`, `weekly_volume_by_sport` ; mise à jour `profiles` | **Modifier** |
| `lib/sportStyles.ts` (ou nouveau `lib/weeklyVolumeUtils.ts`) | Mapping sport → unité (km / m / h) pour affichage suffixe et validation | **Créer** ou **Modifier** (voir §5) |
| `messages/fr.json`, `messages/en.json` | Clés i18n section objectifs/volume (labels, suffixes, erreurs) | **Modifier** |
| `docs/I18N.md` | Documenter le namespace utilisé (ex. `profile` ou `profile.weeklyTargets`) | **Modifier** |
| Types (ex. `types/database.ts` ou types profil) | Types pour `weekly_target_hours`, `weekly_volume_by_sport` | **Modifier** si nécessaire |

**Aucun nouveau composant partagé obligatoire** : réutilisation de `Input`, `Button`, `SportIcons` + `SPORT_CARD_STYLES`, pattern champ avec suffixe (comme OffersForm). Si un sous-composant « champ avec suffixe » est extrait, le documenter dans `docs/DESIGN_SYSTEM.md`.

---

## 4. Modèle de données

**Table concernée :** `profiles` (uniquement).

- **`weekly_target_hours`** (nouveau)  
  - Type : `NUMERIC(5,2)` ou `REAL`, nullable.  
  - Signification : temps à allouer par semaine (global), en heures.  
  - Contrainte : positif si renseigné ; plafond raisonnable (ex. ≤ 168 ou 100 h) en application.

- **`weekly_volume_by_sport`** (nouveau)  
  - Type : `JSONB`, défaut `'{}'`.  
  - Signification : volume actuel par sport et par semaine. Clés = identifiants sport (`course`, `velo`, `natation`, `musculation`, `trail`, `triathlon`, etc. selon `PRACTICED_SPORTS_VALUES`). Valeurs = nombres (km, m ou h selon le sport).  
  - Exemple : `{ "course": 42, "velo": 120, "natation": 2500, "musculation": 2.5 }`.  
  - Pas de contrainte CHECK métier en base ; validation côté application (positif, plafond, clés limitées aux sports pratiqués).

**Migration 055 (résumé) :**

```sql
-- 055_profiles_weekly_target_and_volume.sql
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS weekly_target_hours NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS weekly_volume_by_sport JSONB DEFAULT '{}';

COMMENT ON COLUMN public.profiles.weekly_target_hours IS 'Temps à allouer par semaine (global), en heures, pour l''athlète.';
COMMENT ON COLUMN public.profiles.weekly_volume_by_sport IS 'Volume actuel par sport et par semaine (km, m ou h selon sport). Clés = sport (course, velo, natation, musculation, ...).';
```

**RLS :** Aucune modification. Les policies existantes sur `profiles` (`profiles_select_own`, `profiles_update_own`, `profiles_select_coach_athletes`) suffisent : l’athlète met à jour son propre profil ; le coach pourra lire ces champs plus tard via `profiles_select_coach_athletes`.

---

## 5. Logique métier

- **Unité par sport (affichage suffixe + validation) :**
  - Course (course, course_route, trail, randonnée) → **km**
  - Vélo → **km**
  - Natation → **m**
  - Musculation → **h**
  - Triathlon, ski, etc. : à définir en implémentation (ex. triathlon = h ou km). Une fonction ou map `getWeeklyVolumeUnit(sport): 'km' | 'm' | 'h'` dans `lib/sportStyles.ts` ou `lib/weeklyVolumeUtils.ts` est recommandée.

- **Validation côté serveur (actions.ts) :**
  - `weekly_target_hours` : si fourni, nombre ≥ 0, avec plafond (ex. ≤ 168).
  - `weekly_volume_by_sport` : pour chaque clé, valeur numérique ≥ 0 ; clés restreintes aux valeurs de `PRACTICED_SPORTS_VALUES` (ou au sous-ensemble « pratiqués » envoyé par le formulaire). Plafonds optionnels par unité (ex. km ≤ 2000, m ≤ 500000, h ≤ 168).

- **Formulaire :**
  - Champs contrôlés ou non selon préférence ; au minimum, `name` cohérents : ex. `weekly_target_hours`, `weekly_volume_[sport]` (un input par sport pratiqué).
  - À l’envoi : construire l’objet `weekly_volume_by_sport` à partir des champs `weekly_volume_*` pour les sports présents dans `practiced_sports`.

- **Section si aucun sport :** soit ne pas afficher la section, soit l’afficher avec un message invitant à sélectionner des sports pratiqués (choix PO/implémentation).

---

## 6. Tests manuels recommandés

1. **Athlète, 0 sport pratiqué :** section masquée ou message affiché ; enregistrement sans erreur.
2. **Athlète, 1 à N sports :** affichage des N cartes avec bons labels et suffixes ; saisie et enregistrement ; rechargement de la page : valeurs reprises.
3. **Changement de sports pratiqués :** ajout/retrait de sport ; les champs volume affichés correspondent à la nouvelle liste ; anciennes valeurs pour sports retirés non re-soumises (ou conservées en JSONB pour réaffichage si le sport est réajouté — à trancher).
4. **Validation :** valeur négative ou invalide → message d’erreur côté serveur ; succès après correction.
5. **i18n :** bascule FR/EN ; labels et suffixes (h/sem., km/week, etc.) corrects.
6. **Coach / Admin :** pas d’affichage de cette section sur leur profil (formulaire coach inchangé).

---

## 7. Points à trancher en implémentation

- **Aucun sport pratiqué :** masquer la section ou afficher un message (design doc : « soit masquée, soit message »).
- **Unités pour triathlon, trail, randonnée, ski :** design indique km pour course/trail/rando, h pour musculation ; triathlon/ski à définir (km ou h).
- **Plafonds exacts** pour `weekly_target_hours` et par unité dans `weekly_volume_by_sport` (ex. 168 h, 2000 km, etc.).
- **Comportement quand on retire un sport pratiqué :** garder la valeur dans `weekly_volume_by_sport` (pour réaffichage si le sport est réajouté) ou la supprimer du JSON à l’envoi.
- **Namespace i18n :** `profile` existant vs sous-clé dédiée (ex. `profile.weeklyTargets`) pour labels et erreurs de la section.

---

## 8. Checklist livraison spec

- [x] Migrations décrites (055), pas de changement RLS supplémentaire.
- [x] Table des fichiers (créer/modifier) présente.
- [x] Modèle de données (colonnes profiles) documenté.
- [x] Logique métier (unités, validation, formulaire) décrite.
- [x] Tests manuels recommandés listés.
- [x] Points à trancher en implémentation indiqués.

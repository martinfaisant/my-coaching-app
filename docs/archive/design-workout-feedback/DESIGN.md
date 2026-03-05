# Design : Retour athlète après une séance (ressenti, intensité, plaisir)

**Mode :** Designer  
**Date :** 3 mars 2026

---

## 1. Reformulation du besoin

**En tant qu’athlète**, je veux pouvoir **ajouter un retour** sur une séance que j’ai faite (entraînement marqué « Réalisé »), afin de partager avec mon coach :

- **Comment je me suis senti (ressenti)** : échelle **1 à 5** avec **une image smiley par valeur** (1 = très mal, 5 = très bien).
- **L’intensité de l’effort ressenti** : échelle **1 à 10** en **segments** (option A, comme le statut).
- **Le plaisir pris pendant la séance** : échelle **1 à 5** avec **une image smiley par valeur** (1 = aucun plaisir, 5 = très agréable).

Ces informations complètent le **statut** (Planifié / Réalisé / Non réalisé) et le **commentaire** déjà existants dans la modale d’entraînement.

---

## 2. Écran existant analysé

**Composant :** `WorkoutModal` (`components/WorkoutModal.tsx`).

**Vue athlète actuelle :**
- **Zone lecture** : date, objectifs de la séance (durée, distance, allure, D+, description).
- **Section « retour »** (sous une bordure `border-t`) :
  - **Statut** : 3 segments (Planifié | Réalisé | Non réalisé), style `bg-stone-200 p-0.5 rounded-lg`, segment actif `bg-palette-forest-dark text-white`.
  - **Commentaire** : un `Textarea` (placeholder « Commentaires sur la séance pour votre coach »), sauvegardé avec le statut via `saveWorkoutStatusAndComment`.
  - **Bouton** : Enregistrer (pleine largeur, pattern save button).

**Données côté serveur :**  
Table `workouts` : `status`, `athlete_comment`, `athlete_comment_at`. Pas de champs dédiés aujourd’hui pour « ressenti », « intensité perçue » ni « plaisir ».

**Design system :**  
- `Modal`, `Button`, `Textarea`, `FORM_BASE_CLASSES`, `FORM_LABEL_CLASSES` (`lib/formStyles.ts`).  
- Pas de composant « échelle 1–10 » ou slider dans le design system ; les segments (comme statut / moment de la journée) sont des boutons dans un bloc `bg-stone-200 p-0.5 rounded-lg`.

---

## 3. Cas d’usage identifiés

| Cas | Description |
|-----|-------------|
| **Nominal** | L’athlète ouvre un entraînement, choisit « Réalisé », remplit (optionnellement) ressenti, intensité 1–10, plaisir, et commentaire. Il enregistre ; les données sont visibles pour le coach en lecture seule. |
| **Statut « Planifié » ou « Non réalisé »** | À clarifier : les 3 nouveaux champs sont-ils affichés et éditables uniquement quand le statut est « Réalisé », ou aussi pour « Non réalisé » ? |
| **Modification** | L’athlète peut modifier son retour à tout moment (comme le commentaire actuel). |
| **Coach** | En vue coach, la modale affiche le statut et le commentaire en lecture seule ; le coach doit-il voir aussi ressenti, intensité et plaisir ? (souhaitable pour le suivi). |
| **Erreurs / limites** | Intensité et plaisir : valeurs 1–10 uniquement. Texte « comment vous êtes-vous senti » : limite de caractères à définir (ex. 500). Tous les champs optionnels sauf décision contraire. |

---

## 4. Questions au PO (à trancher avant implémentation)

1. **Visibilité des champs**  
   Les 3 nouveaux champs (ressenti, intensité, plaisir) doivent-ils s’afficher **uniquement lorsque le statut est « Réalisé »**, ou aussi lorsque l’athlète choisit « Non réalisé » ? On les masque quand c'Est non réalisé 

2. **Obligation de saisie**  
   Pour une séance marquée « Réalisé », ces champs sont-ils **tous optionnels** ou certains **obligatoires** ? C'est optionnel

3. **Affichage côté coach**  
   Le coach doit-il voir **ressenti, intensité et plaisir** en lecture seule dans la modale ? (recommandé : oui.) Oui en lecture seule en reprenant les logo 

---

## 5. Solution retenue (décision PO)

- **Intensité de l’effort ressenti** : **option A** — échelle **1 à 10** en **segments** (boutons 1…10), style identique au statut.
- **Comment vous êtes-vous senti (ressenti)** : échelle **1 à 5** avec **une image smiley par valeur** (1 = très mal → 5 = très bien).
- **Plaisir pris pendant la séance** : échelle **1 à 5** avec **une image smiley par valeur** (1 = aucun plaisir → 5 = très agréable).

**Échelles 1–5 avec smileys (Lucide) :**  
- **Icônes** : utiliser les icônes **Lucide** ([lucide.dev/icons](https://lucide.dev/icons/), catégorie Emoji) : **Angry**, **Frown**, **Meh**, **Smile**, **Laugh** (ordre 1 → 5).  
- **Affichage** : sous chaque icône, afficher une **description** (texte), pas le chiffre.  
  - **Ressenti** : 1 = « Très mal », 2 = « Mal », 3 = « Neutre », 4 = « Bien », 5 = « Très bien ».  
  - **Plaisir** : 1 = « Aucun plaisir », 2 = « Un peu », 3 = « Moyen », 4 = « Agréable », 5 = « Très agréable ».  
- Pas de mention « (1 = …, 5 = …) » dans le label du champ ; le sens est porté par les descriptions sous chaque bouton.  
- Accessibilité : `aria-label` ou titre par bouton avec la description.

---

## 6. Ordre et composants dans la section retour

**Ordre dans la section retour (formulaire athlète) :**  
1. Segments **Statut** (Planifié | Réalisé | Non réalisé).  
2. **Comment vous êtes-vous senti** : **échelle 1–5 avec smiley** par valeur (5 boutons).  
3. **Intensité de l’effort ressenti** : **segments 1–10** (10 boutons).  
4. **Plaisir pris pendant la séance** : **échelle 1–5 avec smiley** par valeur (5 boutons).  
5. **Commentaire** (existant) : « Commentaires sur la séance pour votre coach » (Textarea).  
6. Bouton Enregistrer.

**Composants à utiliser / à créer :**

| Élément | Composant / style |
|--------|-------------------|
| Conteneur section retour | Existant : `form` avec `px-6 py-4 border-t border-stone-100 space-y-4` |
| Statut | Existant : segments `bg-stone-200 p-0.5 rounded-lg` |
| « Comment vous êtes-vous senti » | **Nouveau** : 5 boutons (échelle 1–5), chaque bouton = **icône Lucide** (Angry, Frown, Meh, Smile, Laugh) + **description** (Très mal, Mal, Neutre, Bien, Très bien) ; style type segments |
| « Intensité de l'effort ressenti » | **Segments** : 10 boutons (1 à 10), style identique au statut ; pas de mention « (1 = …, 10 = …) » dans le label |
| « Plaisir pris pendant la séance » | **Nouveau** : 5 boutons (échelle 1–5), chaque bouton = **icône Lucide** (Angry, Frown, Meh, Smile, Laugh) + **description** (Aucun plaisir, Un peu, Moyen, Agréable, Très agréable) |
| Commentaire coach | Existant : **Textarea** |
| Bouton Enregistrer | Existant : **Button** variant primaryDark, pattern save |

**Harmonisation visuelle :**  
Les trois blocs de choix (ressenti, intensité, plaisir) ont la **même largeur totale** : conteneur en `flex w-full` avec un `gap` identique (ex. `gap-2`), chaque bouton en `flex-1 min-w-0` pour se répartir équitablement sur la ligne. Ainsi les trois lignes sont alignées et harmonieuses à l’œil.

**Composant réutilisable à documenter (design system) :**  
- **Échelle 1–10** (segments) pour l’intensité.  
- **Échelle 1–5 avec smileys Lucide** (ressenti, plaisir) : 5 boutons avec icône Lucide (Angry, Frown, Meh, Smile, Laugh) + **description texte** sous l’icône (pas le chiffre). Projet utilise déjà `lucide-react`.

**Référence mockup :** `MOCKUP_WORKOUT_FEEDBACK_MODAL_A.html` (intensité en segments 1–10 ; ressenti et plaisir en échelle 1–5 avec smiley par valeur).

---

## 7. Spec technique et suite

- **Spec architecte** : `docs/design-workout-feedback/SPEC_ARCHITECTURE.md` — modèle de données (colonnes `perceived_feeling`, `perceived_intensity`, `perceived_pleasure` sur `workouts`), flux, table des fichiers, RLS, cas limites, tests manuels recommandés, points à trancher en implémentation.
- **Migration** : `supabase/migrations/054_workout_feedback.sql`.
- Découpage en **user stories** (optionnel) avec critères d’acceptation et référence au mockup.
- Le mockup montre la **modale entière** (vue athlète) avec la section retour : statut, ressenti (1–5 smileys), intensité (1–10), plaisir (1–5 smileys), commentaire, Enregistrer.

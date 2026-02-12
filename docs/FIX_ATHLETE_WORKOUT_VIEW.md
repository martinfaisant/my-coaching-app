# Fix - Vue athlète des entraînements

**Date :** 12 février 2026  
**Problème :** L'athlète ne pouvait pas cliquer sur les entraînements et le champ commentaire n'apparaissait pas

---

## Problème identifié

Dans `components/CalendarView.tsx`, les cartes d'entraînement n'étaient pas visuellement cliquables pour les athlètes :

### Avant (ligne 517)
```tsx
className={`bg-white ... ${canEdit ? 'cursor-pointer training-card' : ''}`}
role={canEdit ? 'button' : undefined}
```

**Impact :**
- Si `canEdit = false` (athlète), la carte n'avait pas `cursor-pointer`
- Pas de `role="button"` pour l'accessibilité
- L'athlète ne voyait pas que la carte était cliquable
- Donc il ne pouvait pas ouvrir l'entraînement pour voir le détail et ajouter son commentaire

---

## Solution appliquée

### Modifications dans `CalendarView.tsx`

**Ligne 517 (vue compacte) :**
```tsx
// AVANT
className={`bg-white ... ${canEdit ? 'cursor-pointer training-card' : ''}`}
role={canEdit ? 'button' : undefined}

// APRÈS
className={`bg-white ... cursor-pointer ${canEdit ? 'training-card' : 'hover:shadow-md transition-shadow'}`}
role="button"
```

**Ligne 587 (vue détaillée) :**
```tsx
// AVANT
className={`training-card bg-white ... ${canEdit ? 'cursor-pointer' : ''}`}
role={canEdit ? 'button' : undefined}

// APRÈS
className={`bg-white ... cursor-pointer ${canEdit ? 'training-card' : 'hover:shadow-md transition-shadow'}`}
role="button"
```

### Changements appliqués :

1. ✅ **Toujours `cursor-pointer`** : Les cartes sont maintenant toujours cliquables visuellement
2. ✅ **Toujours `role="button"`** : Accessibilité préservée pour tous
3. ✅ **Styles différents** :
   - Coach (`canEdit=true`) : Garde l'animation `training-card` (transform + shadow)
   - Athlète (`canEdit=false`) : Effet hover plus subtil (`hover:shadow-md`)

---

## Comportement après correction

### Pour l'athlète (`canEdit=false`)

Quand il clique sur un entraînement :

1. ✅ **Modal s'ouvre** avec tous les détails
2. ✅ **Champs en lecture seule** :
   - Sport (affiché, non modifiable)
   - Objectifs (distance/temps/dénivelé - lecture seule)
   - Titre (disabled)
   - Description (disabled)
3. ✅ **Section commentaire visible** :
   - Titre : "Votre commentaire"
   - Champ Textarea éditable
   - Auto-save après 800ms
   - Messages de statut (Enregistrement…, Enregistré, Erreur)
4. ✅ **Pas de boutons d'action** (Enregistrer, Supprimer masqués)

### Pour le coach (`canEdit=true`)

Comportement inchangé :

1. ✅ **Modal s'ouvre** en mode édition
2. ✅ **Tous les champs modifiables**
3. ✅ **Section commentaire** :
   - Titre : "Commentaire de l'athlète"
   - Commentaire affiché en lecture seule
4. ✅ **Boutons Supprimer et Enregistrer**

---

## Vérification du champ commentaire

Le code du champ commentaire dans `WorkoutModal.tsx` (lignes 651-695) était déjà correct :

```tsx
{workout && (
  <div className="border-t border-stone-100 mt-6">
    <h3>
      {canEdit ? 'Commentaire de l\'athlète' : 'Votre commentaire'}
    </h3>
    <div>
      {!canEdit ? (
        <>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={3}
            placeholder="Saisissez votre commentaire… Il est enregistré automatiquement."
          />
          {commentSaveStatus === 'saving' && <p>Enregistrement…</p>}
          {commentSaveStatus === 'saved' && <p>Commentaire enregistré.</p>}
          {commentSaveStatus === 'error' && <p>Erreur</p>}
        </>
      ) : (
        <p>{workout.athlete_comment ?? 'Aucun commentaire.'}</p>
      )}
    </div>
  </div>
)}
```

**Logique :**
- La section apparaît seulement si `workout` existe (mode édition d'un workout existant)
- Si `!canEdit` (athlète) : champ éditable avec auto-save
- Si `canEdit` (coach) : lecture seule

Le problème était uniquement que l'athlète ne pouvait pas cliquer sur la carte pour ouvrir la modal.

---

## Tests à effectuer

1. ✅ **Athlète - Clic sur entraînement** : Vérifier que la carte est visuellement cliquable (cursor change)
2. ✅ **Athlète - Modal** : Vérifier que tous les champs sont en lecture seule
3. ✅ **Athlète - Commentaire** : Vérifier que le champ commentaire est visible et éditable
4. ✅ **Athlète - Auto-save** : Taper un commentaire et vérifier qu'il est enregistré automatiquement
5. ✅ **Coach - Clic sur entraînement** : Vérifier que la modal s'ouvre en mode édition
6. ✅ **Coach - Commentaire** : Vérifier que le commentaire de l'athlète est affiché en lecture seule

---

## Fichiers modifiés

- `components/CalendarView.tsx` : 2 corrections (lignes 517 et 587)

**Aucune autre modification nécessaire** - Le reste du code était déjà correct.

---

**Statut :** ✅ Corrigé et prêt pour test

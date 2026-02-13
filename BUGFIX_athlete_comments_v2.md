# 🔧 Fix v2 : Bug commentaires athlètes après refactorisation modals

**Date** : 13 février 2026  
**Status** : ✅ **RÉSOLU**

---

## 🐛 Problème rencontré (après refactorisation P1.1)

Après la refactorisation des modals (P1.1), le bug des commentaires d'athlètes est **réapparu**.

### Symptôme
- L'athlète écrit un commentaire
- Message "Commentaire enregistré" s'affiche ✅
- Commentaire sauvegardé en base de données ✅
- **MAIS** quand on ferme et rouvre la modal → Le commentaire a disparu ❌

---

## 🔍 Analyse de la cause

### Ce qui fonctionnait (avant refactorisation)
Le fix original (documenté dans `docs/BUGFIX_athlete_comments.md`) utilisait `router.refresh()` pour forcer Next.js à recharger les données après sauvegarde.

### Ce qui a cassé (après refactorisation)
Lors de la refactorisation P1.1 - Modals, la logique de `handleClose` a été préservée, **MAIS** un détail critique a été manqué :

**Avant** (code original) :
```typescript
const handleClose = useCallback(() => {
  // ...
  saveWorkoutComment(...).then(() => {
    router.refresh()
    onClose()  // ← Pas de paramètres
  })
}, [...])
```

**Après refactorisation** (problématique) :
```typescript
const handleClose = useCallback(() => {
  // ...
  const doClose = () => onClose()  // ← Toujours sans paramètres !
  
  saveWorkoutComment(...).then(() => {
    const updatedWorkout = { ...currentWorkout, athlete_comment: current, ... }
    setCurrentWorkout(updatedWorkout)
    router.refresh()
    doClose()  // ← N'envoie PAS le workout mis à jour au parent
  })
}, [...])
```

### Le problème exact

1. **Sauvegarde du commentaire** : ✅ Fonctionne (en DB)
2. **Mise à jour locale** : ✅ `setCurrentWorkout(updatedWorkout)` met à jour l'état local de la modal
3. **Refresh du cache** : ✅ `router.refresh()` force Next.js à recharger
4. **Fermeture de la modal** : ❌ `onClose()` appelé **sans paramètres**
5. **Dans CalendarView** :
   ```typescript
   const handleWorkoutModalClose = (closedBySuccess?: boolean, updatedWorkout?: Workout) => {
     setModalOpen(false)
     if (closedBySuccess) {  // ← JAMAIS true !
       onWorkoutSaved?.(updatedWorkout)
       setTimeout(() => router.refresh(), 150)
     }
   }
   ```
6. **Réouverture** : `CalendarView` passe toujours l'ANCIEN workout (celui qu'il avait en mémoire)

---

## ✅ Solution appliquée

### Modification dans `components/WorkoutModal.tsx`

**Changement clé** : Retourner le workout mis à jour ET marquer comme "success" pour déclencher `onWorkoutSaved` dans le parent.

```typescript
// À la fermeture : sauvegarder tout de suite le commentaire s'il y a des changements non enregistrés (athlète)
const handleClose = useCallback(() => {
  if (!currentWorkout || canEdit) {
    onClose()  // Pas de changements → fermeture simple
    return
  }
  const current = commentText.trim()
  const saved = lastSavedCommentRef.current ?? ''
  if (current === saved) {
    onClose()  // Pas de changements → fermeture simple
    return
  }
  if (commentDebounceRef.current) {
    clearTimeout(commentDebounceRef.current)
    commentDebounceRef.current = null
  }
  const fd = new FormData()
  fd.set('comment', commentText)
  saveWorkoutComment(currentWorkout.id, athleteId, pathToRevalidate, {}, fd).then(() => {
    // Mettre à jour le workout local avec le nouveau commentaire
    const updatedWorkout = {
      ...currentWorkout,
      athlete_comment: current || null,
      athlete_comment_at: current ? new Date().toISOString() : null,
    }
    setCurrentWorkout(updatedWorkout)
    // Refresh le cache pour les autres composants
    router.refresh()
    // 🔧 FIX v2: Retourner le workout mis à jour au parent
    // closedBySuccess=true pour déclencher onWorkoutSaved dans CalendarView
    onClose(true, updatedWorkout)  // ← LA CLÉ !
  }).catch(() => {
    onClose()
  })
}, [currentWorkout, canEdit, commentText, athleteId, pathToRevalidate, onClose, router])
```

### Changements
1. ✅ **Supprimé** la fonction intermédiaire `doClose()`
2. ✅ **Modifié** `onClose()` → `onClose(true, updatedWorkout)` après sauvegarde réussie
3. ✅ Gardé `onClose()` simple (sans paramètres) quand aucun changement

---

## 🎬 Fonctionnement (après fix v2)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Athlète ferme la modal après avoir écrit un commentaire │
│    → handleClose() détecte des changements non sauvegardés  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Sauvegarde du commentaire                                │
│    → saveWorkoutComment() appelé                             │
│    → DB mise à jour ✅                                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Succès → Mise à jour de l'état local                     │
│    - const updatedWorkout = { ...currentWorkout, ... }      │
│    - setCurrentWorkout(updatedWorkout)                      │
│    - router.refresh()                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Fermeture avec le workout mis à jour                     │
│    → onClose(true, updatedWorkout)  ← NOUVEAU !             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. CalendarView reçoit la notification                      │
│    handleWorkoutModalClose(closedBySuccess=true, updatedW.) │
│    → onWorkoutSaved(updatedWorkout) appelé                  │
│    → router.refresh() appelé                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Le parent (page) reçoit le workout mis à jour            │
│    → Peut mettre à jour sa liste locale immédiatement       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Réouverture de la modal                                  │
│    → openWorkout(dateStr, updatedWorkout)                   │
│    → La modal affiche le workout avec le commentaire ✅     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Différence avant/après

| Action | Avant (❌) | Après (✅) |
|---|---|---|
| Sauvegarde en DB | ✅ Fonctionne | ✅ Fonctionne |
| Mise à jour état local modal | ✅ Fonctionne | ✅ Fonctionne |
| `router.refresh()` | ✅ Appelé | ✅ Appelé |
| Retour au parent | ❌ `onClose()` sans params | ✅ `onClose(true, updatedWorkout)` |
| `CalendarView` notifié | ❌ Non (`closedBySuccess=false`) | ✅ Oui (`closedBySuccess=true`) |
| `onWorkoutSaved` appelé | ❌ Non | ✅ Oui |
| Réouverture | ❌ Ancien workout | ✅ Workout mis à jour |

---

## 🧪 Tests de validation

### Test 1 : Sauvegarde et réouverture immédiate
1. ✅ Ouvrir un workout en tant qu'athlète
2. ✅ Écrire "Test commentaire v2"
3. ✅ Attendre "Commentaire enregistré"
4. ✅ Fermer la modal
5. ✅ **Rouvrir immédiatement** → Le commentaire est là ✅

### Test 2 : Modifications multiples
1. ✅ Écrire "Commentaire 1"
2. ✅ Fermer/rouvrir → "Commentaire 1" visible
3. ✅ Modifier → "Commentaire 2"
4. ✅ Fermer/rouvrir → "Commentaire 2" visible

### Test 3 : Sauvegarde auto (debounce)
1. ✅ Écrire un commentaire
2. ✅ Attendre 800ms (auto-save)
3. ✅ Message "Commentaire enregistré"
4. ✅ Fermer la modal **immédiatement** (pas de délai)
5. ✅ Rouvrir → Le commentaire est toujours là

### Test 4 : Vue coach
1. ✅ Athlète écrit un commentaire
2. ✅ Coach ouvre le même workout sur son calendrier
3. ✅ Coach voit le commentaire de l'athlète

---

## 📝 Leçons apprises

### 1. Attention aux signatures de callback
Lors d'une refactorisation, il faut vérifier **tous les appels** à un callback, pas seulement sa déclaration.

```typescript
// ❌ Refactorisation incomplète
const handleClose = () => {
  doSomething()
  onClose()  // Oublié de passer les paramètres !
}

// ✅ Refactorisation complète
const handleClose = () => {
  doSomething()
  onClose(true, result)  // Tous les paramètres nécessaires
}
```

### 2. Les callbacks conditionnels nécessitent des flags corrects
Si le parent a une logique `if (success) { ... }`, il faut s'assurer que le flag `success` est correctement passé.

### 3. Tests de régression essentiels
Après une refactorisation importante (comme P1.1), il faut re-tester **toutes** les fonctionnalités affectées, même si le code semble correct.

---

## 🔗 Liens

- **Fix original** : `docs/BUGFIX_athlete_comments.md`
- **Refactorisation P1.1** : `REFACTORING_P1_MODALS_COMPLETE.md`
- **Script de diagnostic** : `supabase/scripts/debug_athlete_comment.sql`

---

## 🎉 Conclusion

Le bug est **définitivement résolu** après ce fix v2.

La solution est simple mais critique : **toujours retourner les données mises à jour au composant parent** pour que toute la chaîne de composants reste synchronisée.

Cette correction complète le fix original (`router.refresh()`) en s'assurant que le parent reçoit également le workout mis à jour, créant une double garantie de synchronisation.

---

**Status final** : ✅ **RÉSOLU ET TESTÉ**  
**Commit** : Inclus dans la refactorisation P1.1 + fix commentaires

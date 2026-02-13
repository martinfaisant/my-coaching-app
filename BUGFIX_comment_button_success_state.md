# Bug Fix - État du bouton "Enregistrer" (commentaire athlète)

**Date**: 13 février 2026
**Fichier concerné**: `components/WorkoutModal.tsx`
**Status**: ✅ Résolu

---

## 📋 Problème

Le bouton "Enregistrer" du formulaire de commentaire athlète (dans la modale d'entraînement) présentait deux bugs :

### Bug 1 - Bouton activé par défaut
Le bouton était activé même sans modification, contrairement au bouton de la page profil.

**Cause** : Absence de tracking des modifications. Le bouton utilisait uniquement `disabled={!hasCommentChanged || pending}` mais `hasCommentChanged` n'était pas correctement initialisé et mis à jour.

### Bug 2 - Check "✓ Enregistré" ne s'affichait pas au 2ème cycle
Après une première sauvegarde réussie, les sauvegardes suivantes n'affichaient plus le feedback visuel "✓ Enregistré".

**Cause** : Le `useEffect` écoutait `commentState?.success` qui restait à `true` après le premier cycle. React ne détectait donc aucun changement et le useEffect ne se redéclenchait pas (transition `true → true` = pas de changement).

---

## 🔍 Analyse technique

### Investigation avec runtime evidence

Grâce au debug mode et à l'instrumentation, les logs ont révélé :

```
Premier cycle :
- prevStateSuccess: false → resultSuccess: true ✅
- useEffect se déclenche, affiche le check ✅

Deuxième cycle :
- prevStateSuccess: true → resultSuccess: true ⚠️
- useEffect ne se déclenche PAS ❌ (pas de changement détecté)
```

**Hypothèse confirmée (H12)** : `commentState?.success` reste à `true`, donc `useEffect` avec `[commentState?.success]` ne se redéclenche pas.

---

## ✅ Solution

### Bug 1 - Tracking des modifications
Ajout de la logique de tracking des modifications :

```typescript
// État pour tracker les modifications
const initialCommentRef = useRef<string>('')
const [hasCommentChanged, setHasCommentChanged] = useState(false)

// Initialiser la référence quand le workout est chargé
useEffect(() => {
  if (currentWorkout && isOpen) {
    const initial = currentWorkout.athlete_comment || ''
    setCommentText(initial)
    initialCommentRef.current = initial
    setHasCommentChanged(false)
  }
}, [currentWorkout, isOpen])

// Détecter les modifications dans le Textarea
onChange={(e) => {
  const newValue = e.target.value
  setCommentText(newValue)
  const changed = newValue.trim() !== initialCommentRef.current.trim()
  setHasCommentChanged(changed)
  
  // Réinitialiser le success si on modifie pendant l'affichage du check
  if (showCommentSuccess) {
    setShowCommentSuccess(false)
  }
}}

// Après sauvegarde réussie, réinitialiser la référence
if (!result.error) {
  const savedComment = formData.get('comment')?.toString().trim() || ''
  initialCommentRef.current = savedComment
  setHasCommentChanged(false)
  // ...
}
```

### Bug 2 - Détection de transition (approche ProfileForm)
Remplacé l'écoute de `commentState?.success` par une détection de **transition** de `pending: true → false` + `success: true` :

```typescript
// Ref pour tracker l'état précédent de pending
const previousCommentPendingRef = useRef(false)

// Clé composite pour déclencher le useEffect à chaque changement pertinent
const commentSaveFeedbackKey = `${commentState?.success ?? ''}|${commentState?.error ?? ''}|${commentPending}`

useEffect(() => {
  // Détecter la transition: était en pending, ne l'est plus
  const justFinishedSubmitting = previousCommentPendingRef.current && !commentPending
  previousCommentPendingRef.current = commentPending
  
  // N'afficher le check QUE si on vient de finir ET que c'est un succès
  if (commentState?.success && justFinishedSubmitting) {
    setShowCommentSuccess(true)
    
    const timer = setTimeout(() => {
      setShowCommentSuccess(false)
    }, 2000)
    return () => clearTimeout(timer)
  }
  
  if (commentState?.error) {
    setShowCommentSuccess(false)
  }
}, [commentSaveFeedbackKey])
```

**Pourquoi ça fonctionne** :
- À chaque sauvegarde, `commentPending` passe de `false → true → false`
- Le useEffect détecte la transition `pending: true → false` avec la ref
- Cette transition se produit à **chaque** nouveau cycle de soumission
- Donc le feedback s'affiche à chaque fois, même si `success` reste à `true`

---

## 🎯 Approche inspirée de ProfileForm

Cette solution reprend exactement la même logique que `app/dashboard/profile/ProfileForm.tsx` (lignes 187-229), qui gère correctement ce cas depuis le début :

```typescript
// ProfileForm.tsx
const previousIsSubmittingRef = useRef(false)

useEffect(() => {
  const justFinishedSubmitting = previousIsSubmittingRef.current && !isSubmitting
  previousIsSubmittingRef.current = isSubmitting

  if (state?.success && justFinishedSubmitting) {
    setShowSavedFeedback(true)
    // ... timer pour cacher après 2.5s
  }
}, [saveFeedbackKey])
```

**Bénéfices** :
- ✅ Robuste : fonctionne même si le state `success` reste à `true`
- ✅ Fiable : ne se déclenche qu'après un cycle complet de soumission
- ✅ Éprouvé : déjà utilisé avec succès dans ProfileForm
- ✅ Cohérent : même pattern partout dans l'application

---

## 📝 Changements appliqués

### États et refs ajoutés
```typescript
const [hasCommentChanged, setHasCommentChanged] = useState(false)
const [showCommentSuccess, setShowCommentSuccess] = useState(false)
const initialCommentRef = useRef<string>('')
const previousCommentPendingRef = useRef(false)
```

### useEffect pour le feedback success
```typescript
const commentSaveFeedbackKey = `${commentState?.success ?? ''}|${commentState?.error ?? ''}|${commentPending}`
useEffect(() => {
  const justFinishedSubmitting = previousCommentPendingRef.current && !commentPending
  previousCommentPendingRef.current = commentPending
  
  if (commentState?.success && justFinishedSubmitting) {
    setShowCommentSuccess(true)
    const timer = setTimeout(() => setShowCommentSuccess(false), 2000)
    return () => clearTimeout(timer)
  }
  
  if (commentState?.error) {
    setShowCommentSuccess(false)
  }
}, [commentSaveFeedbackKey])
```

### Composant CommentSubmitButton
```typescript
<Button
  type="submit"
  variant="primaryDark"
  disabled={!hasChanges || pending}
  loading={pending}
  loadingText="Enregistrement…"
  success={showSuccess}
  className="shrink-0"
>
  Enregistrer
</Button>
```

---

## ✅ Résultat

- ✅ Le bouton "Enregistrer" est désactivé par défaut (cohérent avec ProfileForm)
- ✅ Le bouton s'active uniquement quand le commentaire est modifié
- ✅ Le feedback "✓ Enregistré" s'affiche à **chaque** sauvegarde réussie
- ✅ Le check disparaît automatiquement après 2 secondes
- ✅ Si l'utilisateur modifie le texte pendant l'affichage du check, il disparaît immédiatement

---

## 🔗 Documents associés

- `docs/BUGFIX_athlete_comments.md` - Fix initial du bug de sauvegarde des commentaires
- `BUGFIX_athlete_comments_v2.md` - Fix de la ré-émergence du bug (callback onClose)
- `SIMPLIFICATION_athlete_comments.md` - Remplacement de l'auto-save par un bouton manuel
- `app/dashboard/profile/ProfileForm.tsx` - Référence pour l'approche de détection de transition

**📘 Documentation standardisée (créée suite à ce bug) :**
- **`docs/PATTERN_SAVE_BUTTON.md`** - Pattern standard obligatoire pour tous les formulaires
- **`.cursor/rules/save-button-pattern.mdc`** - Règle Cursor pour uniformiser le comportement
- **`docs/DESIGN_SYSTEM.md`** - Section "Pattern Enregistrer" ajoutée

---

## 📊 Méthode de debug

Ce bug a été résolu grâce au **debug mode avec runtime evidence** :
1. Génération d'hypothèses précises (H1-H14)
2. Instrumentation du code avec des logs runtime
3. Reproduction du bug par l'utilisateur
4. Analyse des logs pour confirmer/rejeter les hypothèses
5. Application du fix avec instrumentation conservée
6. Vérification post-fix avec nouveaux logs
7. Nettoyage de l'instrumentation après confirmation

**Hypothèse confirmée** : H12 - Le `useEffect` ne détectait pas le changement car `commentState?.success` restait à `true` entre les cycles.

# Pattern Standard - Bouton "Enregistrer" avec Feedback

**Version**: 1.0  
**Date**: 13 février 2026  
**Statut**: ✅ Standard obligatoire

---

## 📋 Vue d'ensemble

Ce document définit le **pattern standard** pour tous les formulaires avec bouton "Enregistrer" dans l'application. Ce pattern garantit une expérience utilisateur cohérente et évite les bugs de feedback visuel.

### Pourquoi ce pattern ?

Le feedback "✓ Enregistré" doit s'afficher à **chaque** sauvegarde réussie, pas seulement la première fois. Sans ce pattern, React ne détecte pas les changements entre deux sauvegardes successives (transition `success: true → true`).

---

## ✅ Pattern Standard (Obligatoire)

### 1. États et Refs nécessaires

```typescript
// État pour tracking des modifications
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

// État pour afficher le feedback success
const [showSavedFeedback, setShowSavedFeedback] = useState(false)

// État pour l'envoi en cours
const [isSubmitting, setIsSubmitting] = useState(false)

// Ref pour détecter la TRANSITION de pending
const previousIsSubmittingRef = useRef(false)

// Ref pour éviter les avertissements "beforeunload" pendant l'envoi
const isSubmittingRef = useRef(false)
```

### 2. useActionState (ou useTransition)

```typescript
// Avec useActionState (recommandé)
const [state, action] = useActionState<FormState, FormData>(
  async (prevState, formData) => {
    const result = await saveAction(formData)
    return result
  },
  {}
)

// OU avec useTransition (si gestion manuelle)
const [isPending, startTransition] = useTransition()
```

### 3. useEffect pour le Feedback Success ⚠️ CRITIQUE

**🔑 Clé composite pour forcer le déclenchement :**

```typescript
// OBLIGATOIRE : Clé qui change à chaque cycle de soumission
const saveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isSubmitting}`

useEffect(() => {
  // Détecter la TRANSITION : était en train de soumettre, ne l'est plus
  const justFinishedSubmitting = previousIsSubmittingRef.current && !isSubmitting
  previousIsSubmittingRef.current = isSubmitting
  
  // N'afficher le check QUE si transition + succès
  if (state?.success && justFinishedSubmitting) {
    setShowSavedFeedback(true)
    router.refresh() // Rafraîchir les données
    
    const timer = setTimeout(() => {
      setShowSavedFeedback(false)
    }, 2000) // 2-2.5 secondes
    
    // Réinitialiser les valeurs de référence pour hasUnsavedChanges
    // ... (mettre à jour initialValuesRef, etc.)
    setHasUnsavedChanges(false)
    
    return () => clearTimeout(timer)
  }
  
  if (state?.error) {
    setShowSavedFeedback(false)
  }
}, [saveFeedbackKey]) // DÉPENDANCE : la clé composite
```

**❌ ERREUR COURANTE À ÉVITER :**

```typescript
// ❌ NE PAS FAIRE : Écouter state?.success directement
useEffect(() => {
  if (state?.success) {
    setShowSavedFeedback(true)
    // ...
  }
}, [state?.success]) // BUG : ne se déclenche pas au 2ème cycle !
```

**Pourquoi ça ne marche pas ?**
- Premier cycle : `state.success` passe de `false` → `true` ✅ useEffect se déclenche
- Deuxième cycle : `state.success` reste à `true` → `true` ❌ useEffect ne se déclenche pas (pas de changement détecté)

### 4. useEffect pour Cacher le Check lors de Modifications

```typescript
// Cacher le feedback dès qu'une modification est détectée
useEffect(() => {
  if (hasUnsavedChanges && showSavedFeedback) {
    setShowSavedFeedback(false)
  }
}, [hasUnsavedChanges, showSavedFeedback])
```

### 5. Gestion de la Soumission

```typescript
const handleFormSubmit = () => {
  isSubmittingRef.current = true
  setIsSubmitting(true)
}

// Réinitialiser après la réponse
useEffect(() => {
  if (state?.success || state?.error) {
    isSubmittingRef.current = false
    setIsSubmitting(false)
  }
}, [state])
```

### 6. Bouton "Enregistrer"

```typescript
<Button
  type="submit"
  variant="primary"
  disabled={!hasUnsavedChanges || isSubmitting}
  loading={isSubmitting}
  loadingText="Enregistrement…"
  success={showSavedFeedback}
  error={!!state?.error}
>
  Enregistrer
</Button>
```

**Props du Button :**
- `disabled` : Désactivé si pas de modifications OU en cours d'envoi
- `loading` : Affiche le spinner pendant l'envoi
- `success` : Affiche "✓ Enregistré" (géré automatiquement par le Button)
- `error` : Affiche "✗ Non enregistré" en cas d'erreur

---

## 📚 Références (Implémentations Correctes)

### 1. ProfileForm.tsx (Référence)
Lignes 57, 89-90, 187-229

```typescript
const previousIsSubmittingRef = useRef(false)
const saveFeedbackKey = `${state?.success ?? ''}|${state?.error ?? ''}|${isSubmitting}`

useEffect(() => {
  const justFinishedSubmitting = previousIsSubmittingRef.current && !isSubmitting
  previousIsSubmittingRef.current = isSubmitting

  if (state?.success && justFinishedSubmitting) {
    setShowSavedFeedback(true)
    router.refresh()
    const t = setTimeout(() => setShowSavedFeedback(false), 2500)
    
    // Réinitialiser les valeurs initiales
    // ... (mise à jour de initialValuesRef)
    setHasUnsavedChanges(false)
    
    return () => clearTimeout(t)
  }
  
  if (state?.error) {
    setShowSavedFeedback(false)
  }
}, [saveFeedbackKey])
```

### 2. OffersForm.tsx
Lignes 29, 251-269  
Suit exactement le même pattern que ProfileForm.

### 3. CoachRatingForm.tsx
Lignes 20-21, 139-162  
Utilise `useTransition` au lieu de `useActionState`, mais le principe est identique.

### 4. WorkoutModal.tsx (Commentaires Athlète)
Lignes 115-116, 312-328  
Pattern appliqué au formulaire de commentaire dans une modale.

---

## 🚨 Cas Particuliers

### Formulaires dans des Modales

Pour les formulaires dans des modales (ex: `WorkoutModal.tsx`), le pattern est **identique**. Utilisez `useActionState` avec la même logique de transition.

```typescript
// État pour le formulaire dans la modale
const [commentState, commentAction, commentPending] = useActionState<FormState, FormData>(...)
const previousCommentPendingRef = useRef(false)
const [showCommentSuccess, setShowCommentSuccess] = useState(false)

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

### Formulaires avec useTransition

Si vous utilisez `useTransition` au lieu de `useActionState` :

```typescript
const [isPending, startTransition] = useTransition()
const previousIsPendingRef = useRef(false)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  isSubmittingRef.current = true
  
  startTransition(async () => {
    const result = await saveAction(formData)
    isSubmittingRef.current = false
    
    if (!result.error) {
      // Mettre à jour savedValues pour que hasUnsavedChanges passe à false
      setSavedValues({ ...currentValues })
      setShowSavedFeedback(true)
      setTimeout(() => {
        setShowSavedFeedback(false)
        router.refresh()
      }, 2500)
    }
  })
}
```

---

## ⚠️ Checklist de Vérification

Avant de valider un formulaire avec bouton "Enregistrer", vérifier :

- [ ] ✅ Utilise `useActionState` (ou `useTransition`)
- [ ] ✅ Clé composite `saveFeedbackKey` définie
- [ ] ✅ `previousIsSubmittingRef` pour détecter la transition
- [ ] ✅ useEffect avec `justFinishedSubmitting` pour afficher le check
- [ ] ✅ Timer de 2-2.5s pour cacher le check automatiquement
- [ ] ✅ `hasUnsavedChanges` réinitialisé après succès
- [ ] ✅ Bouton désactivé si `!hasUnsavedChanges || isSubmitting`
- [ ] ✅ Props `success={showSavedFeedback}` sur le Button
- [ ] ✅ Le check s'affiche à CHAQUE sauvegarde (tester 2-3 fois de suite)

---

## 🐛 Debugging

Si le check ne s'affiche pas au 2ème cycle :

1. **Vérifier la clé composite** : Est-ce que `saveFeedbackKey` change à chaque soumission ?
2. **Vérifier la transition** : Est-ce que `justFinishedSubmitting` est bien `true` ?
3. **Ajouter des logs** : 
   ```typescript
   useEffect(() => {
     console.log('[DEBUG] saveFeedbackKey:', saveFeedbackKey)
     console.log('[DEBUG] justFinishedSubmitting:', justFinishedSubmitting)
     console.log('[DEBUG] state?.success:', state?.success)
     // ...
   }, [saveFeedbackKey])
   ```

---

## 📝 Historique

- **v1.0 (13/02/2026)** : Création du pattern standard suite au bug dans `WorkoutModal.tsx`
  - Bug identifié : Le check ne s'affichait pas au 2ème cycle
  - Cause : useEffect écoutait `state?.success` qui restait à `true`
  - Solution : Détecter la **transition** de `pending: true → false` avec une ref
  - Documents associés : `BUGFIX_comment_button_success_state.md`

---

## 🔗 Voir aussi

- `docs/DESIGN_SYSTEM.md` - Design system complet avec le composant Button
- `components/Button.tsx` - Implémentation du composant Button
- `BUGFIX_comment_button_success_state.md` - Historique du bug qui a mené à ce pattern
- `app/dashboard/profile/ProfileForm.tsx` - Implémentation de référence

# Pattern Standard - Bouton "Enregistrer" avec Feedback

**Version**: 1.0  
**Date**: 13 février 2026  
**Statut**: ✅ Standard obligatoire

---

## 📋 Vue d'ensemble

Ce document définit le **pattern standard** pour tous les formulaires avec bouton "Enregistrer" dans l'application. Ce pattern garantit une expérience utilisateur cohérente et évite les bugs de feedback visuel.

### Pourquoi ce pattern ?

Le feedback "✓ Enregistré" doit s'afficher à **chaque** sauvegarde réussie, pas seulement la première fois. Sans ce pattern, React ne détecte pas les changements entre deux sauvegardes successives (transition `success: true → true`).

### Comportement attendu

1. **Au chargement** : Bouton désactivé (grisé) car aucune modification
2. **Après modification** : Bouton activé et cliquable
3. **Pendant l'envoi** : "Enregistrement..." avec spinner
4. **Après succès** : "✓ Enregistré" en vert pendant 2-2.5s
5. **Après le feedback** : Bouton redevient désactivé jusqu'à la prochaine modification

---

## ✅ Pattern Standard (Obligatoire)

### 1. États et Refs nécessaires (TOUS requis)

```typescript
// État pour tracking des modifications (CRITIQUE pour désactiver le bouton)
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

// État pour afficher le feedback success
const [showSavedFeedback, setShowSavedFeedback] = useState(false)

// État pour l'envoi en cours (CRITIQUE pour le loader)
const [isSubmitting, setIsSubmitting] = useState(false)

// Ref pour détecter la TRANSITION de pending
const previousIsSubmittingRef = useRef(false)

// Ref pour éviter les avertissements "beforeunload" pendant l'envoi
const isSubmittingRef = useRef(false)

// Valeurs initiales pour détecter les modifications (CRITIQUE)
const initialValuesRef = useRef<{
  field1: string
  field2: string
  // ... tous les champs du formulaire
}>({
  field1: initialValue1,
  field2: initialValue2,
})
```

**⚠️ IMPORTANT** : Sans `hasUnsavedChanges`, le bouton sera toujours activé. Sans `isSubmitting`, le loader ne s'affichera pas. Sans `initialValuesRef`, impossible de détecter les modifications.

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

### 5. Détecter les Modifications (CRITIQUE)

```typescript
// useEffect qui compare les valeurs actuelles avec initialValuesRef
useEffect(() => {
  if (!initialValuesRef.current) {
    setHasUnsavedChanges(false)
    return
  }
  
  const initial = initialValuesRef.current
  const hasChanges = 
    currentField1 !== initial.field1 ||
    currentField2 !== initial.field2
  
  setHasUnsavedChanges(hasChanges)
}, [currentField1, currentField2]) // Tous les champs du formulaire
```

**⚠️ CRITIQUE** : Sans cette détection, le bouton sera toujours activé même sans modifications.

### 6. Gestion de la Soumission

```typescript
// Marquer comme en cours lors de la soumission
const handleFormSubmit = (e: React.FormEvent) => {
  e.preventDefault() // Si pas avec action={}
  isSubmittingRef.current = true
  setIsSubmitting(true)
  // ... puis soumettre le formulaire
}

// OU avec form action={} :
<form
  action={action}
  onSubmit={() => {
    isSubmittingRef.current = true
    setIsSubmitting(true)
  }}
>

// Réinitialiser après la réponse
useEffect(() => {
  if (state?.success || state?.error) {
    isSubmittingRef.current = false
    setIsSubmitting(false)
  }
}, [state])
```

### 7. Bouton "Enregistrer"

```typescript
<Button
  type="submit"
  variant="primary"
  disabled={!hasUnsavedChanges || isSubmitting}  // ⚠️ Les DEUX conditions
  loading={isSubmitting}                          // ⚠️ isSubmitting, pas pending
  loadingText="Enregistrement…"
  success={showSavedFeedback}                     // ⚠️ showSavedFeedback, pas state?.success
  error={!!state?.error}
>
  Enregistrer
</Button>
```

**Props du Button :**
- `disabled` : Désactivé si **pas de modifications** OU **en cours d'envoi** (les deux conditions obligatoires)
- `loading` : Affiche le spinner pendant l'envoi (utiliser `isSubmitting`, pas `pending`)
- `success` : Affiche "✓ Enregistré" (utiliser `showSavedFeedback`, pas `state?.success`)
- `error` : Affiche "✗ Non enregistré" en cas d'erreur

### 8. 🚨 CRITIQUE : Bouton HORS du Formulaire (Modales avec Footer)

**Si le bouton Submit est dans le footer d'une modale, HORS de la balise `<form>` :**

```typescript
// 1. Ajouter un ID au formulaire
<form id="my-form" action={action}>
  {/* contenu du formulaire */}
</form>

// 2. Lier le bouton avec l'attribut form
<Button
  type="submit"
  form="my-form"  // ⚠️ OBLIGATOIRE si le bouton est hors du <form>
  ...
>
  Enregistrer
</Button>
```

**⚠️ SANS l'attribut `form="..."` sur le bouton, LE FORMULAIRE NE SE SOUMETTRA JAMAIS !**

**Exemple dans WorkoutModal.tsx :**
```typescript
<Modal
  footer={
    <SubmitButton form="workout-form" ... />  // Bouton dans le footer
  }
>
  <form id="workout-form" action={action}>   // Form avec ID
    {/* champs */}
  </form>
</Modal>
```

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
### Formulaires en mode création (vs édition)
En création, initialValuesRef doit contenir les valeurs par défaut vides du formulaire (ex. '', 'course', etc.) et non null, pour que la détection des modifications fonctionne.
---

## ⚠️ Checklist de Vérification (OBLIGATOIRE)

Avant de valider un formulaire avec bouton "Enregistrer", vérifier **TOUS** ces points :

### États et Refs
- [ ] ✅ `hasUnsavedChanges` state défini
- [ ] ✅ `showSavedFeedback` state défini
- [ ] ✅ `isSubmitting` state défini
- [ ] ✅ `previousIsSubmittingRef` ref définie
- [ ] ✅ `isSubmittingRef` ref définie
- [ ] ✅ `initialValuesRef` ref avec tous les champs initiaux

### Logique de Feedback
- [ ] ✅ Utilise `useActionState` (ou `useTransition`)
- [ ] ✅ Clé composite `saveFeedbackKey` définie
- [ ] ✅ useEffect avec `justFinishedSubmitting` pour afficher le check
- [ ] ✅ Timer de 2-2.5s pour cacher le check automatiquement
- [ ] ✅ `hasUnsavedChanges` réinitialisé après succès

### Détection des Modifications
- [ ] ✅ useEffect qui compare valeurs actuelles vs `initialValuesRef`
- [ ] ✅ Dépendances : TOUS les champs du formulaire
- [ ] ✅ `setHasUnsavedChanges(true/false)` selon les changements

### Soumission
- [ ] ✅ `onSubmit` marque `isSubmitting = true`
- [ ] ✅ useEffect réinitialise `isSubmitting` après réponse

### Bouton
- [ ] ✅ `disabled={!hasUnsavedChanges || isSubmitting}` (LES DEUX)
- [ ] ✅ `loading={isSubmitting}` (pas `pending`)
- [ ] ✅ `success={showSavedFeedback}` (pas `state?.success`)
- [ ] ✅ Si bouton hors du `<form>` : attribut `form="form-id"` présent

### Tests
- [ ] ✅ Au chargement : bouton désactivé (grisé)
- [ ] ✅ Après modification : bouton activé
- [ ] ✅ Au clic : loader "Enregistrement..." visible
- [ ] ✅ Après succès : check "✓ Enregistré" visible
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

- **v1.1 (13/02/2026)** : Ajout sections critiques suite au bug du bouton "Enregistrer" coach
  - Bug #1 : Le formulaire ne se soumettait pas (bouton hors du `<form>`)
  - Bug #2 : Le bouton était toujours activé (manquait `hasUnsavedChanges`)
  - Bug #3 : Pas de loader "Enregistrement..." (manquait `isSubmitting` géré manuellement)
  - Solutions : 
    - Attribut `form="form-id"` sur le bouton
    - Tracking complet des modifications avec `initialValuesRef`
    - État `isSubmitting` géré manuellement dans `onSubmit` + useEffect
  - Documents associés : `BUGFIX_workout_modal_save_button.md`

---

## 🔗 Voir aussi

- `docs/DESIGN_SYSTEM.md` - Design system complet avec le composant Button
- `components/Button.tsx` - Implémentation du composant Button
- `BUGFIX_comment_button_success_state.md` - Historique du bug qui a mené à ce pattern
- `app/dashboard/profile/ProfileForm.tsx` - Implémentation de référence

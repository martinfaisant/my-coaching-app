# État des lieux complet des modales - Analyse et uniformisation

## Date : 5 février 2026

## Problèmes identifiés

### 1. Structure DOM incohérente (CRITIQUE)
Certaines modales ont le backdrop APRÈS le container au lieu d'AVANT, ce qui cause l'affichage sous le flou.

**Problème** : Le backdrop avec `z-[90]` doit être AVANT le container avec `z-[100]` dans le DOM pour que le z-index fonctionne correctement.

**Modales affectées** :
- ❌ `ChatModule.tsx` : Backdrop après container (ligne 177-178 vs 172)
- ❌ `RequestCoachButton.tsx` : Backdrop après container (ligne 222-223 vs 217)

### 2. LoginModal n'utilise pas createPortal
- `LoginModal.tsx` : N'utilise pas `createPortal`, ce qui peut causer des problèmes de z-index selon le contexte

### 3. Incohérences de couleurs de backdrop
- Certaines utilisent `bg-palette-forest-dark/50`
- D'autres utilisent `bg-stone-900/40` ou `bg-stone-900/60`

## Liste complète des modales

### ✅ Modales correctes (structure OK)

1. **`components/Modal.tsx`** (Composant réutilisable)
   - ✅ Structure correcte : Backdrop avant container
   - ✅ Z-index corrects : `z-[90]` (backdrop), `z-[100]` (container)
   - ✅ Utilise `createPortal`
   - ✅ Gère Escape et overflow body

2. **`components/WorkoutModal.tsx`**
   - ✅ Structure correcte
   - ✅ Z-index corrects
   - ✅ Utilise `createPortal`

3. **`components/CalendarView.tsx`** (3 modales)
   - ✅ `extraActivitiesModalOpen` : Structure correcte
   - ✅ `goalModalOpen` : Structure correcte
   - ✅ `selectedImportedActivity` : Structure correcte

4. **`app/dashboard/FindCoachSection.tsx`** (2 modales)
   - ✅ `CoachDetailModal` : Structure correcte
   - ✅ `presentationModalCoach` : Structure correcte

5. **`app/dashboard/profile/ProfileForm.tsx`** (2 modales)
   - ✅ `deleteModalOpen` : Structure correcte
   - ✅ `unsavedChangesModalOpen` : Structure correcte

6. **`app/dashboard/profile/offers/OffersForm.tsx`** (2 modales)
   - ✅ `deleteModalOpen` : Structure correcte
   - ✅ `unsavedChangesModalOpen` : Structure correcte

7. **`app/dashboard/coach/CoachRatingForm.tsx`**
   - ✅ `unsavedChangesModalOpen` : Structure correcte

### ❌ Modales à corriger

1. **`components/ChatModule.tsx`**
   - ❌ **PROBLÈME** : Backdrop après container (ligne 177-178)
   - ❌ Backdrop utilise `absolute` au lieu de `fixed`
   - ✅ Z-index corrects mais structure DOM incorrecte

2. **`app/dashboard/RequestCoachButton.tsx`** (2 modales)
   - ❌ **PROBLÈME** : Backdrop après container (ligne 222-223)
   - ❌ Backdrop utilise `absolute` au lieu de `fixed`
   - ✅ Z-index corrects mais structure DOM incorrecte

3. **`components/LoginModal.tsx`**
   - ⚠️ N'utilise pas `createPortal` (peut causer des problèmes selon le contexte)
   - ✅ Structure correcte sinon

## Solution : Composant Modal uniformisé

Le composant `Modal.tsx` existe déjà et est bien conçu. Il faut :
1. Corriger les modales avec structure incorrecte
2. Migrer progressivement vers le composant `Modal.tsx` quand possible
3. Uniformiser les couleurs de backdrop

## Plan d'action

1. Corriger `ChatModule.tsx` : Déplacer backdrop avant container
2. Corriger `RequestCoachButton.tsx` : Déplacer backdrop avant container (2 modales)
3. Migrer `LoginModal.tsx` vers `createPortal`
4. Uniformiser les couleurs de backdrop (toutes en `bg-palette-forest-dark/50`)

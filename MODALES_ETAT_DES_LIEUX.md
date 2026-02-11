# État des lieux des modales - Uniformisation complète

## Date : 5 février 2026

## Problèmes identifiés et corrigés

### 1. Z-index incohérents
- **Problème** : Certaines modales utilisaient `z-50` au lieu de `z-[100]` pour le contenu
- **Corrigé** : Toutes les modales utilisent maintenant `z-[100]` pour le contenu et `z-[90]` pour le backdrop

### 2. Structure DOM incohérente
- **Problème** : Certaines modales avaient le backdrop à l'intérieur du conteneur principal, d'autres en premier dans un fragment
- **Corrigé** : Toutes les modales utilisent maintenant la structure uniforme :
  ```tsx
  <>
    <div className="fixed inset-0 ... z-[90]" /> {/* Backdrop */}
    <div className="fixed inset-0 z-[100] ..."> {/* Container */}
      {/* Contenu */}
    </div>
  </>
  ```

### 3. Erreur de syntaxe CSS
- **Problème** : `ChatModule.tsx` avait une classe CSS invalide : `bg-palette-forest-dark/50bg-black/50`
- **Corrigé** : Remplacé par `bg-palette-forest-dark/50 backdrop-blur-sm z-[90]`

### 4. Utilisation de createPortal
- **Problème** : Certaines modales n'utilisaient pas `createPortal`, ce qui pouvait causer des problèmes de z-index
- **Corrigé** : Toutes les modales utilisent maintenant `createPortal` avec `document.body`

## Liste complète des modales uniformisées

### ✅ Composants corrigés

1. **`components/LoginModal.tsx`**
   - Z-index : `z-50` → `z-[100]` (contenu) et `z-[90]` (backdrop)
   - Structure : Backdrop en premier dans un fragment
   - Utilise maintenant un fragment au lieu d'un seul div

2. **`components/ChatModule.tsx`**
   - Z-index : `z-50` → `z-[100]` (contenu) et `z-[90]` (backdrop)
   - Correction de l'erreur CSS : `bg-palette-forest-dark/50bg-black/50` → `bg-palette-forest-dark/50 backdrop-blur-sm z-[90]`

3. **`components/CalendarView.tsx`**
   - **Modale `extraActivitiesModalOpen`** : Structure corrigée avec backdrop en premier
   - **Modale `goalModalOpen`** : Z-index `z-50` → `z-[100]`, ajout de `createPortal`
   - **Modale `selectedImportedActivity`** : Structure corrigée avec backdrop en premier

4. **`components/WorkoutModal.tsx`**
   - Structure corrigée avec backdrop en premier dans un fragment
   - Suppression du style inline `position: fixed` redondant

5. **`app/dashboard/profile/offers/OffersForm.tsx`**
   - **Modale `deleteModalOpen`** : Ajout de `createPortal` et structure corrigée
   - **Modale `unsavedChangesModalOpen`** : Ajout de `createPortal` et structure corrigée

6. **`app/dashboard/profile/ProfileForm.tsx`**
   - **Modale `deleteModalOpen`** : Ajout de `createPortal` et structure corrigée
   - **Modale `unsavedChangesModalOpen`** : Ajout de `createPortal` et structure corrigée

7. **`app/dashboard/coach/CoachRatingForm.tsx`**
   - **Modale `unsavedChangesModalOpen`** : Ajout de `createPortal` et structure corrigée

### ✅ Composants déjà corrects (vérifiés)

1. **`app/dashboard/RequestCoachButton.tsx`**
   - Structure déjà correcte avec backdrop en premier dans un fragment
   - Z-index corrects : `z-[100]` (contenu) et `z-[90]` (backdrop)
   - Utilise `createPortal`

2. **`app/dashboard/FindCoachSection.tsx`**
   - Structure déjà correcte avec backdrop en premier dans un fragment
   - Z-index corrects : `z-[100]` (contenu) et `z-[90]` (backdrop)
   - Utilise `createPortal`

## Structure uniforme standardisée

Toutes les modales suivent maintenant cette structure :

```tsx
{isOpen && typeof document !== 'undefined' && createPortal(
  <>
    {/* Backdrop - TOUJOURS EN PREMIER */}
    <div
      className="fixed inset-0 bg-palette-forest-dark/50 backdrop-blur-sm z-[90]"
      onClick={onClose}
      aria-hidden="true"
    />
    
    {/* Container modal - ENSUITE */}
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Contenu de la modale */}
      <div className="relative w-full max-w-md ...">
        {/* ... */}
      </div>
    </div>
  </>
  , document.body
)}
```

## Z-index standardisés

- **Sidebar** : `z-30`
- **Backdrop des modales** : `z-[90]`
- **Contenu des modales** : `z-[100]`

## Composant Modal réutilisable créé

Un composant `Modal.tsx` a été créé dans `components/Modal.tsx` pour faciliter la création de nouvelles modales à l'avenir. Ce composant :
- Gère automatiquement le z-index
- Gère la structure DOM correcte
- Gère les événements clavier (Escape)
- Gère le `document.body.style.overflow`
- Utilise `createPortal` automatiquement

**Note** : Les modales existantes n'ont pas été migrées vers ce composant pour éviter de casser le code existant, mais toutes les nouvelles modales devraient utiliser ce composant.

## Tests recommandés

1. ✅ Vérifier que toutes les modales s'affichent au-dessus de la sidebar
2. ✅ Vérifier que le backdrop flou apparaît derrière le contenu de la modale
3. ✅ Vérifier que le clic sur le backdrop ferme la modale
4. ✅ Vérifier que la touche Escape ferme la modale
5. ✅ Vérifier que le scroll de la page est désactivé quand une modale est ouverte

## Résumé

- **Total de modales corrigées** : 9 modales dans 7 fichiers
- **Erreurs corrigées** : 4 types de problèmes (z-index, structure DOM, syntaxe CSS, createPortal)
- **Composant réutilisable créé** : `components/Modal.tsx`
- **Toutes les modales sont maintenant uniformisées** ✅

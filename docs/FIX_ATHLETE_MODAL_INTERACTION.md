# Fix - Interaction athlète dans WorkoutModal

**Date :** 12 février 2026  
**Problème :** Les composants de la modal semblent cliquables pour l'athlète alors qu'ils ne devraient pas l'être

---

## Modifications appliquées

### 1. Label "OBJECTIFS DE LA SÉANCE" (ligne 431)

**Avant :**
```tsx
<label className="text-xs font-bold text-stone-500 uppercase tracking-wide">
  OBJECTIFS DE LA SÉANCE
</label>
```

**Après :**
```tsx
<div className="text-xs font-bold text-stone-500 uppercase tracking-wide">
  OBJECTIFS DE LA SÉANCE
</div>
```

**Raison :** Un `<label>` sans attribut `for` ne devrait pas être utilisé. Remplacé par `<div>` pour éviter toute impression de cliquabilité.

### 2. Protection du formulaire (ligne 371)

**Avant :**
```tsx
<form action={action} className="flex flex-col flex-1 min-h-0">
```

**Après :**
```tsx
<form 
  action={action} 
  className={`flex flex-col flex-1 min-h-0 ${!canEdit ? 'select-none' : ''}`}
  onSubmit={(e) => { if (!canEdit) e.preventDefault() }}
>
```

**Raison :**
- `onSubmit` avec `preventDefault()` empêche toute soumission accidentelle du formulaire si l'athlète n'a pas la permission
- `select-none` quand `!canEdit` empêche la sélection de texte dans les champs disabled

---

## État actuel pour l'athlète (`canEdit=false`)

### ✅ Non interactif (comme attendu)

1. **Type de sport** : Affiché en lecture seule dans une div non cliquable
2. **Objectifs** : Affichés en texte simple (ex: "45 min · 10 km · 200m D+")
3. **Titre** : Input avec `disabled={!canEdit}` → fond gris, cursor-not-allowed
4. **Description** : Textarea avec `disabled={!canEdit}` → fond gris, cursor-not-allowed
5. **Formulaire** : Ne peut pas être soumis (pas de bouton submit + preventDefault)

### ✅ Interactif (comme attendu)

1. **Champ commentaire** : Textarea éditable avec auto-save
2. **Bouton fermer (X)** : Toujours actif

---

## Vérification des champs disabled

Les composants Input et Textarea ont les classes suivantes quand `disabled` :

```css
disabled:bg-stone-100        /* Fond gris clair */
disabled:text-stone-500      /* Texte gris */
disabled:border-stone-200    /* Bordure grise */
disabled:cursor-not-allowed  /* Curseur interdit */
disabled:opacity-100         /* Pas de transparence */
```

**Comportement :** 
- Les champs disabled ne peuvent **pas recevoir le focus**
- On ne peut **pas taper dedans**
- Le curseur change en "not-allowed" au survol
- La sélection de texte est empêchée par `select-none` sur le form

---

## Comportement par élément

### Type de sport (lignes 381-424)

| État | Rendu |
|------|-------|
| Coach | Grid de 4 boutons cliquables |
| Athlète | Div unique non cliquable affichant le sport |

### Objectifs de la séance (lignes 427-615)

| État | Rendu |
|------|-------|
| Coach | Inputs éditables avec toggle temps/distance |
| Athlète | Texte simple "45 min · 10 km · 200m D+" |

**Important :** Pour l'athlète, ce bloc affiche UNIQUEMENT un `<p>` avec le texte formaté, **aucun input n'est rendu**.

### Titre & Description (lignes 617-640)

| État | Rendu |
|------|-------|
| Coach | Inputs éditables |
| Athlète | Inputs **disabled** (fond gris, non éditable) |

### Commentaire athlète (lignes 651-695)

| État | Rendu |
|------|-------|
| Coach | Lecture seule du commentaire de l'athlète |
| Athlète | Textarea éditable avec auto-save |

**C'est le SEUL champ que l'athlète peut modifier.**

### Boutons d'action (lignes 699-726)

| État | Rendu |
|------|-------|
| Coach | Boutons "Supprimer" et "Enregistrer" |
| Athlète | **Rien** (bloc entier masqué avec `{canEdit && ...}`) |

---

## Tests à effectuer

1. ✅ **Athlète - Survol titre/description** : Vérifier que le curseur devient "not-allowed"
2. ✅ **Athlète - Clic sur titre/description** : Vérifier qu'on ne peut pas taper
3. ✅ **Athlète - Label "OBJECTIFS"** : Vérifier que le curseur ne change pas (c'est maintenant un div)
4. ✅ **Athlète - Sélection de texte** : Vérifier qu'on ne peut pas sélectionner le texte dans les champs disabled
5. ✅ **Athlète - Commentaire** : Vérifier que c'est le SEUL champ éditable
6. ✅ **Athlète - Submit form** : Appuyer sur Entrée → vérifier que rien ne se passe

---

## Si le problème persiste

Si l'athlète peut toujours "interagir" avec les champs, vérifier :

1. **La prop `canEdit` est-elle correctement passée ?**
   - Vérifier dans `CalendarView.tsx` ligne 1165 : `canEdit={canEdit}`
   - Vérifier que `canEdit` est bien `false` pour l'athlète

2. **Les champs sont-ils vraiment disabled ?**
   - Inspecter avec DevTools et vérifier l'attribut `disabled` sur les inputs

3. **Y a-t-il des event listeners résiduels ?**
   - Vérifier qu'aucun `onClick` n'est attaché aux champs disabled

---

**Statut :** ✅ Corrections appliquées
**Fichiers modifiés :** `components/WorkoutModal.tsx`

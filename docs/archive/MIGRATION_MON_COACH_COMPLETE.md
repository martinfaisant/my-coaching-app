# Migration "Mon Coach" - Bilingue FR/EN ✅

**Date** : 15 février 2026  
**Statut** : ✅ Complété  
**Pattern** : next-intl (v3.x)

---

## 📋 Résumé

Migration complète de la page "Mon coach" (vue athlète) en bilingue français/anglais. Cette page permet aux athlètes de consulter le profil de leur coach et de laisser une note avec commentaire.

---

## 📂 Fichiers migrés

| Fichier | Type | Lignes modifiées | Textes traduits |
|---------|------|------------------|-----------------|
| `messages/fr.json` | Traductions | +24 | 1 namespace |
| `messages/en.json` | Traductions | +24 | 1 namespace |
| `app/[locale]/dashboard/coach/page.tsx` | Server Component | ~6 | Titres, labels |
| `app/[locale]/dashboard/coach/CoachRatingForm.tsx` | Client Component | ~13 | Formulaire + modale |
| `app/[locale]/dashboard/coach/actions.ts` | Server Actions | 1 | Message d'erreur |

**Total** : 5 fichiers, ~24 clés de traduction

---

## 🗂️ Nouveau namespace créé

### `myCoach` (24 clés)

**Section principale :**
- `title` : "Mon Coach" / "My Coach"
- `notFound` : "Coach introuvable." / "Coach not found."
- `avatarAlt` : "Photo du coach" / "Coach photo"
- `coachedSports` : "Sports coachés" / "Coached sports"
- `spokenLanguages` : "Langues parlées" / "Spoken languages"
- `presentation` : "Présentation" / "Presentation"

**Section rating (18 clés) :**
- Titres et boutons : `title`, `save`, `saving`
- Labels de notation : `yourRating`, `ratingLabel`, `starLabel`, `ratingDisplay`, `clickToChoose`
- Commentaire : `commentLabel`, `commentPlaceholder`
- Validation : `validationError`, `unsavedChangesAlert`
- Modal modifications non enregistrées : `unsavedChangesModal.title`, `message`, `leaveWithoutSaving`, `saveAndLeave`

**Section validation (1 clé) :**
- `validation.onlyYourCoach` : "Vous ne pouvez noter que votre coach actuel."

---

## 🔄 Modifications techniques

### Server Component

#### `app/[locale]/dashboard/coach/page.tsx`

**Changements :**
1. Ajout du paramètre `params: Promise<{ locale: string }>`
2. Extraction de la locale : `const { locale } = await params`
3. Initialisation des traductions :
   ```typescript
   const t = await getTranslations({ locale, namespace: 'myCoach' })
   ```
4. Migration de 6 textes hardcodés :
   - Titre de page : `"Mon Coach"` → `{t('title')}`
   - Message d'erreur : `"Coach introuvable."` → `{t('notFound')}`
   - Alt avatar : `"Photo du coach"` → `{t('avatarAlt')}`
   - Section sports : `"Sports coachés"` → `{t('coachedSports')}`
   - Section langues : `"Langues parlées"` → `{t('spokenLanguages')}`
   - Section présentation : `"Présentation"` → `{t('presentation')}`

### Client Component

#### `app/[locale]/dashboard/coach/CoachRatingForm.tsx`

**Changements :**
1. Imports `next-intl` :
   ```typescript
   import { useTranslations, useLocale } from 'next-intl'
   ```
2. Initialisation dans le composant :
   ```typescript
   const t = useTranslations('myCoach.rating')
   const tCommon = useTranslations('common')
   const locale = useLocale()
   ```
3. Migration de ~13 textes :
   - Titre formulaire : `"Donner votre avis"` → `{t('title')}`
   - Boutons : `"Enregistrer"`, `"Enregistrement…"` → `{t('save')}`, `{t('saving')}`
   - Labels notation : `"Votre note"`, `"Note sur 5"`, `"X sur 5"` → `{t('yourRating')}`, `{t('ratingLabel')}`, `{t('starLabel', { value })}`
   - Affichage note : `"X / 5"`, `"Cliquez pour choisir"` → `{t('ratingDisplay', { rating })}`, `{t('clickToChoose')}`
   - Commentaire : `"Commentaire (facultatif)"`, placeholder → `{t('commentLabel')}`, `{t('commentPlaceholder')}`
   - Erreur validation : `"Veuillez sélectionner..."` → `{t('validationError')}`
   - Confirm dialog : `"Vous avez des modifications..."` → `{t('unsavedChangesAlert')}`
   - Modal titre/message : `"Modifications non enregistrées"`, `"Vous avez..."` → `{t('unsavedChangesModal.title')}`, `{t('unsavedChangesModal.message')}`
   - Boutons modal : `"Quitter sans enregistrer"`, `"Enregistrer et quitter"` → `{t('unsavedChangesModal.leaveWithoutSaving')}`, `{t('unsavedChangesModal.saveAndLeave')}`
   - Aria-label : `"Fermer"` → `{tCommon('close')}`

4. Passage de `locale` aux server actions :
   ```typescript
   await upsertCoachRating(coachId, rating, comment, locale)
   ```

### Server Actions

#### `app/[locale]/dashboard/coach/actions.ts`

**Changements :**
1. Import `getTranslations` :
   ```typescript
   import { getTranslations } from 'next-intl/server'
   ```
2. **`upsertCoachRating`** :
   - Ajout du paramètre `locale: string = 'fr'`
   - Initialisation : `const t = await getTranslations({ locale, namespace: 'myCoach.validation' })`
   - Remplacement du message d'erreur :
     - `'Vous ne pouvez noter que votre coach actuel.'` → `t('onlyYourCoach')`

---

## ✅ Vérifications techniques

- [x] Aucune erreur de linter
- [x] Tous les imports `next-intl` présents
- [x] Locale passée aux server actions
- [x] Namespace cohérent entre fr.json et en.json
- [x] Clés de traduction identiques dans les 2 langues
- [x] Utilisation de `useTranslations` (client) et `getTranslations` (server)
- [x] Paramètres dynamiques (`value`, `rating`) supportés
- [x] Aria-labels traduits (`tCommon('close')`)
- [x] Modal modifications non enregistrées traduite
- [x] Confirm dialog traduit

---

## 🧪 Tests à effectuer

### Fonctionnalité de base
- [ ] Page "Mon coach" s'affiche en français
- [ ] Profil du coach affiché (nom, avatar, sports, langues, présentation)
- [ ] Formulaire de notation affiché
- [ ] Sélection d'étoiles fonctionne (1 à 5)
- [ ] Commentaire peut être saisi
- [ ] Bouton "Enregistrer" désactivé si pas de changements
- [ ] Bouton "Enregistrer" activé si note modifiée
- [ ] Sauvegarde fonctionne et affiche "Enregistré" (feedback visuel)
- [ ] Rafraîchissement après sauvegarde

### Changement de langue
- [ ] Accès à `/en/dashboard/coach` affiche tout en anglais
- [ ] Titre "My Coach"
- [ ] Labels "Coached sports", "Spoken languages", "Presentation"
- [ ] Formulaire "Give your feedback"
- [ ] Boutons "Save" / "Saving…"
- [ ] Labels notation "Your rating", "Rating out of 5", "X out of 5"
- [ ] Affichage "X / 5" ou "Click to choose"
- [ ] Commentaire "Comment (optional)", placeholder
- [ ] Retour à `/dashboard/coach` → tout en français

### Modal modifications non enregistrées
- [ ] Modification de la note (sans sauvegarder)
- [ ] Clic sur un lien de navigation
- [ ] Modal s'ouvre avec titre traduit "Modifications non enregistrées"
- [ ] Message traduit "Vous avez des modifications..."
- [ ] Boutons "Quitter sans enregistrer" et "Enregistrer et quitter"
- [ ] Changement de langue → modal traduite en anglais
- [ ] Bouton "Leave without saving" / "Save and leave"
- [ ] Échap ferme la modale
- [ ] Clic en dehors ferme la modale

### Validation
- [ ] Tentative de sauvegarde sans note → erreur "Veuillez sélectionner une note entre 1 et 5."
- [ ] En anglais : "Please select a rating between 1 and 5."
- [ ] Erreur serveur si tentative de noter un autre coach → "Vous ne pouvez noter que votre coach actuel."
- [ ] En anglais : "You can only rate your current coach."

### Confirm dialog navigateur
- [ ] Modification de la note
- [ ] Clic sur "Précédent" du navigateur
- [ ] Confirm dialog : "Vous avez des modifications non enregistrées. Voulez-vous vraiment quitter cette page ?"
- [ ] En anglais : "You have unsaved changes. Do you really want to leave this page?"
- [ ] Annuler → reste sur la page
- [ ] Confirmer → quitte la page

### beforeunload
- [ ] Modification de la note
- [ ] Tentative de fermeture de l'onglet/navigateur
- [ ] Message natif du navigateur s'affiche
- [ ] Annuler → reste sur la page

---

## 📊 Complexité

**Niveau** : 5/10 (page moyenne avec formulaire interactif)

**Raisons :**
- Formulaire avec gestion d'état complexe
- Modal modifications non enregistrées
- Gestion beforeunload et popstate
- Feedback visuel (étoiles, bouton "Enregistré")
- Validation côté client et serveur
- Pattern similaire à ProfileForm

---

## 📚 Références

- Pattern de migration : `MIGRATION_OFFRES_COMPLETE.md`, `MIGRATION_MES_ATHLETES_COMPLETE.md`
- Documentation i18n : `I18N_IMPLEMENTATION.md`
- Namespace `common` réutilisé (close)
- Namespace `navigation` existant (myCoach dans la nav)

---

## 🎯 Prochaines étapes

Autres pages à migrer (ordre de priorité) :

1. **Calendrier** (`app/[locale]/dashboard/calendar/page.tsx`)
   - ~40 textes (jours, mois, boutons)
   - Composant `CalendarView` partagé

2. **Profil** (`app/[locale]/dashboard/profile/page.tsx`)
   - ~30 textes (formulaire, labels, validations)
   - Pattern similaire à Mon coach

3. **Objectifs** (`app/[locale]/dashboard/objectifs/page.tsx`)
   - ~25 textes (formulaire, liste, badges)

4. **Devices/Strava** (`app/[locale]/dashboard/devices/page.tsx`)
   - ~20 textes (connexion, statuts)

5. **Détail athlète** (`app/[locale]/dashboard/athletes/[athleteId]/page.tsx`)
   - Peu de textes (délègue à `CoachAthleteCalendarPage`)

---

**✅ Migration "Mon Coach" complétée avec succès !**

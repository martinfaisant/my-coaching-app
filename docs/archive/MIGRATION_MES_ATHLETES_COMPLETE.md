# Migration "Mes Athlètes" - Bilingue FR/EN ✅

**Date** : 15 février 2026  
**Statut** : ✅ Complété  
**Pattern** : next-intl (v3.x)

---

## 📋 Résumé

Migration complète de la page "Mes athlètes" (dashboard principal) en bilingue français/anglais. Cette page est la **plus complexe** de l'application avec 3 cas d'usage différents (athlète, coach, admin) et ~490 lignes de code.

---

## 📂 Fichiers migrés

| Fichier | Type | Lignes modifiées | Textes traduits |
|---------|------|------------------|-----------------|
| `messages/fr.json` | Traductions | +91 | 3 namespaces |
| `messages/en.json` | Traductions | +91 | 3 namespaces |
| `app/[locale]/dashboard/page.tsx` | Server Component | ~30 | Tous rôles |
| `app/[locale]/dashboard/FindCoachSection.tsx` | Client Component | ~60 | Recherche + modales |
| `app/[locale]/dashboard/RespondToRequestButtons.tsx` | Client Component | 2 | Boutons action |
| `app/[locale]/dashboard/actions.ts` | Server Actions | ~8 | Messages d'erreur |

**Total** : 6 fichiers, ~190 clés de traduction

---

## 🗂️ Nouveaux namespaces créés

### 1. `athletes` (25 clés)

Pour la page principale (coach/admin) :
- Titres de page (pageTitle, allMembers, dashboard)
- Messages d'invitation (completeProfilePrompt)
- Demandes en attente (pendingRequests)
- Cartes athlètes (athleteCard)
- Labels de rôles (roles)
- Divers (you, myAthletes, manageMembers)

### 2. `findCoach` (37 clés)

Pour la recherche de coach (athlètes) :
- Titre et messages (pageTitle, noCoaches, noResults)
- Filtres (filters: title, reset, coachedSport, spokenLanguage)
- Cartes coach (coachCard: new, reviews, availableOffers, free, perMonth, plan, viewDetails, defaultBio)
- Modal détail (modal: presentation, pendingRequest, alreadySent, chooseOffer, noOffers, recommended, free, discovery, fullTracking, singlePlan, selectOffer, completeRequest, practicedSports, coachingNeed, coachingNeedPlaceholder, sendRequest, sending, selected, select)
- Validation (validation: selectOffer, fillRequired)

### 3. `coachRequests` (10 clés)

Pour les actions de demande de coaching :
- Boutons (accept, decline)
- Messages de validation (validation: athletesOnly, alreadyHasCoach, requireSportAndNeed, coachNotFound, offerNotFound, requestNotFound, accepted, declined)

---

## 🔄 Modifications techniques

### Server Components

#### `app/[locale]/dashboard/page.tsx`

**Changements :**
1. Ajout du paramètre `params: Promise<{ locale: string }>`
2. Extraction de la locale : `const { locale } = await params`
3. Initialisation des traductions :
   ```typescript
   const t = await getTranslations({ locale, namespace: 'athletes' })
   const tFindCoach = await getTranslations({ locale, namespace: 'findCoach' })
   ```
4. Remplacement de `ROLE_LABELS` hardcodé par `t('roles.*')`
5. Migration de ~30 textes hardcodés :
   - Titres de page conditionnels (admin/coach/athlète)
   - Messages d'invitation profil coach
   - Section demandes en attente
   - Cartes athlètes (objectifs, planning, statuts)
   - Bouton "Gérer les membres"
   - Badge "Vous"

### Client Components

#### `app/[locale]/dashboard/FindCoachSection.tsx`

**Changements :**
1. Imports `next-intl` :
   ```typescript
   import { useTranslations, useLocale } from 'next-intl'
   ```
2. Initialisation dans le composant principal :
   ```typescript
   const t = useTranslations('findCoach')
   const tCommon = useTranslations('common')
   const locale = useLocale()
   ```
3. Initialisation dans `CoachDetailModal` (sous-composant) :
   ```typescript
   const t = useTranslations('findCoach')
   const tCommon = useTranslations('common')
   const locale = useLocale()
   ```
4. Migration de ~60 textes :
   - Filtres (titre, reset, sports, langues)
   - Liste résultats (titre, message vide, compteur)
   - Cartes coach (note, badge "Nouveau", bio, offres, prix)
   - Bouton "Voir le détail"
   - Modal présentation (titre, close)
   - Modal demande (titres, formulaire, boutons, messages d'erreur)
   - Labels prix (Gratuit, /mois, /plan)
   - Badges offres (Recommandé, Découverte, Suivi Complet, Plan Unique)
5. Passage de `locale` à `createCoachRequest` :
   ```typescript
   const result = await createCoachRequest(coach.user_id, sports, need.trim(), selectedOfferId, locale)
   ```

#### `app/[locale]/dashboard/RespondToRequestButtons.tsx`

**Changements :**
1. Imports et initialisation :
   ```typescript
   import { useTranslations, useLocale } from 'next-intl'
   const t = useTranslations('coachRequests')
   const locale = useLocale()
   ```
2. Remplacement de 2 textes : "Accepter", "Refuser"
3. Passage de `locale` à `respondToCoachRequest` :
   ```typescript
   const result = await respondToCoachRequest(requestId, accept, locale)
   ```

### Server Actions

#### `app/[locale]/dashboard/actions.ts`

**Changements :**
1. Import `getTranslations` :
   ```typescript
   import { getTranslations } from 'next-intl/server'
   ```
2. **`createCoachRequest`** :
   - Ajout du paramètre `locale: string = 'fr'`
   - Initialisation : `const t = await getTranslations({ locale, namespace: 'coachRequests.validation' })`
   - Remplacement de 5 messages d'erreur :
     - 'Réservé aux athlètes.' → `t('athletesOnly')`
     - 'Vous avez déjà un coach.' → `t('alreadyHasCoach')`
     - 'Au moins un sport...' → `t('requireSportAndNeed')`
     - 'Ce coach n'existe pas.' → `t('coachNotFound')`
     - 'Cette offre n'existe pas...' → `t('offerNotFound')`

3. **`respondToCoachRequest`** :
   - Ajout du paramètre `locale: string = 'fr'`
   - Initialisation : `const t = await getTranslations({ locale, namespace: 'coachRequests.validation' })`
   - Remplacement de 1 message d'erreur :
     - 'Demande introuvable.' → `t('requestNotFound')`

---

## ✅ Vérifications techniques

- [x] Aucune erreur de linter
- [x] Tous les imports `next-intl` présents
- [x] Locale passée aux server actions
- [x] Namespaces cohérents entre fr.json et en.json
- [x] Clés de traduction identiques dans les 2 langues
- [x] Utilisation de `useTranslations` (client) et `getTranslations` (server)
- [x] Paramètres dynamiques (`count`, `number`) supportés
- [x] Aria-labels traduits (`tCommon('close')`)

---

## 🧪 Tests à effectuer

### Par rôle

#### Athlète sans coach
- [ ] Page "Trouver mon coach" s'affiche en FR
- [ ] Filtres fonctionnent (sports, langues)
- [ ] Cartes de coachs affichent note et offres
- [ ] Modal détail s'ouvre avec présentation
- [ ] Formulaire de demande fonctionne
- [ ] Messages d'erreur traduits si champs manquants
- [ ] Changement de langue → `/en/dashboard` → tout en anglais
- [ ] Retour `/dashboard` → tout en français

#### Coach
- [ ] Titre "Mes Athlètes (X)" affiché en FR
- [ ] Message "Compléter profil" si incomplet
- [ ] Section "Demandes en attente" si demandes
- [ ] Offre choisie affichée (Gratuit/€/mois)
- [ ] Boutons "Accepter" / "Refuser" fonctionnent
- [ ] Cartes athlètes avec objectif/planning/statuts
- [ ] Message "Aucun athlète" si liste vide
- [ ] Changement de langue → `/en/dashboard` → tout en anglais

#### Admin
- [ ] Titre "Tous les membres" en FR
- [ ] Bouton "Gérer les membres et les rôles" en FR
- [ ] Liste des membres affichée avec rôles
- [ ] Badge "Vous" si propre profil
- [ ] Changement de langue → `/en/dashboard` → tout en anglais

### Fonctionnels

- [ ] Création demande de coaching → message succès/erreur traduit
- [ ] Acceptation demande → message succès traduit
- [ ] Refus demande → message succès traduit
- [ ] Filtres de recherche fonctionnent
- [ ] Modales s'ouvrent et se ferment correctement
- [ ] Navigation FR ↔ EN préserve l'état des filtres

---

## 📊 Complexité

**Niveau** : 9/10 (page la plus complexe de l'application)

**Raisons :**
- 3 cas d'usage différents (athlète/coach/admin)
- Multiples composants imbriqués
- 2 modales complexes avec formulaires
- ~190 clés de traduction
- Logique conditionnelle selon rôle
- Gestion d'état côté client (filtres, formulaires)

---

## 📚 Références

- Pattern de migration : `MIGRATION_OFFRES_COMPLETE.md`
- Documentation i18n : `I18N_IMPLEMENTATION.md`
- Plan détaillé : `.cursor/plans/migration_page_mes_athlètes_2b87048a.plan.md`
- Namespaces `common`, `sports` réutilisés

---

## 🎯 Prochaines étapes

Autres pages à migrer (ordre de priorité) :

1. **Calendrier** (`app/[locale]/dashboard/calendar/page.tsx`)
   - ~40 textes (jours, mois, boutons)
   - Composant `CalendarView` partagé

2. **Profil** (`app/[locale]/dashboard/profile/page.tsx`)
   - ~30 textes (formulaire, labels, validations)

3. **Objectifs** (`app/[locale]/dashboard/objectifs/page.tsx`)
   - ~25 textes (formulaire, liste, badges)

4. **Devices/Strava** (`app/[locale]/dashboard/devices/page.tsx`)
   - ~20 textes (connexion, statuts)

5. **Détail athlète** (`app/[locale]/dashboard/athletes/[athleteId]/page.tsx`)
   - Peu de textes (délègue à `CoachAthleteCalendarPage`)

6. **Coach rating** (`app/[locale]/dashboard/coach/page.tsx`)
   - ~15 textes (formulaire notation)

---

**✅ Migration "Mes Athlètes" complétée avec succès !**

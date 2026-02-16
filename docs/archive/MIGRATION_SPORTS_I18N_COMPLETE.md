# Migration des sports vers i18n - TERMINÉE ✅

**Date:** 15 février 2026  
**Statut:** Migration complète et nettoyage effectué

## Résumé

Migration réussie de tous les labels de sports du système hardcodé en français (`SPORT_LABELS`) vers le système de traduction i18n (`next-intl`). Tous les composants affichant des sports utilisent maintenant les traductions appropriées selon la locale de l'utilisateur.

## Problème résolu

Les tuiles de sports n'étaient pas traduites dans plusieurs endroits :
- Page de profil (sports coachés/pratiqués)
- Page de recherche d'un coach (filtres et formulaire)
- Page "Mes athlètes" (cartes de coach)
- Page "Mon coach" (sports du coach)
- Composant de demande de coaching

Seule la modale d'activité utilisait déjà le système de traduction.

## Fichiers créés

### 1. `lib/hooks/useSportLabel.ts`
Hook pour obtenir le label traduit d'un sport dans les Client Components.

```typescript
const getSportLabel = useSportLabel()
const label = getSportLabel('course') // "Course" en FR, "Running" en EN
```

### 2. `lib/getSportLabel.ts`
Helper pour obtenir le label traduit d'un sport dans les Server Components.

```typescript
const label = await getSportLabel('course') // "Course" en FR, "Running" en EN
```

### 3. `lib/hooks/useSportsOptions.ts`
Hooks pour obtenir les listes d'options de sports avec labels traduits.

```typescript
const coachedOptions = useCoachedSportsOptions()
const practicedOptions = usePracticedSportsOptions()
```

## Fichiers modifiés

### Composants génériques

1. **`components/SportTileSelectable.tsx`**
   - Utilise maintenant `useSportLabel()` pour traduire les labels
   - Suppression de l'import `SPORT_LABELS`

2. **`components/Badge.tsx`**
   - Utilise maintenant `useSportLabel()` pour traduire les labels des badges sport
   - Suppression de l'import `SPORT_LABELS`

3. **`components/CalendarView.tsx`**
   - Fonction `getImportedActivityTypeLabel()` mise à jour pour accepter `tSports` en paramètre
   - Tous les appels mis à jour pour passer `tSports`
   - Suppression de l'import `SPORT_LABELS`

### Pages et sections

4. **`app/[locale]/dashboard/profile/ProfileForm.tsx`**
   - Utilise `useCoachedSportsOptions()` et `usePracticedSportsOptions()`
   - Suppression de l'import `COACHED_SPORTS_OPTIONS` et `PRACTICED_SPORTS_OPTIONS`

5. **`app/[locale]/dashboard/FindCoachSection.tsx`**
   - Utilise `useCoachedSportsOptions()` et `usePracticedSportsOptions()`
   - Suppression de l'import `COACHED_SPORTS_OPTIONS` et `PRACTICED_SPORTS_OPTIONS`
   - Les badges sport dans les cartes de coach sont automatiquement traduits

6. **`app/[locale]/dashboard/coach/page.tsx`** (Server Component)
   - Utilise `getTranslations('sports')` pour traduire les sports
   - Utilise `SPORT_TRANSLATION_KEYS` au lieu de `SPORT_LABELS`

7. **`app/[locale]/dashboard/RequestCoachButton.tsx`**
   - Utilise `usePracticedSportsOptions()`
   - Suppression de l'import `PRACTICED_SPORTS_OPTIONS`

8. **`app/[locale]/dashboard/admin/design-system/BadgeShowcase.tsx`**
   - Utilise `useSportLabel()` pour tous les exemples de démonstration
   - Suppression de l'import `SPORT_LABELS`

### Fichiers de configuration

9. **`lib/sportsOptions.ts`**
   - Suppression des exports `COACHED_SPORTS_OPTIONS` et `PRACTICED_SPORTS_OPTIONS`
   - Conservation des `COACHED_SPORTS_VALUES` et `PRACTICED_SPORTS_VALUES` (toujours utilisés)
   - Ajout d'une note expliquant comment utiliser les nouveaux hooks

10. **`lib/sportStyles.ts`**
    - **Suppression complète de `SPORT_LABELS`** (marqué deprecated, maintenant supprimé)
    - Conservation de `SPORT_TRANSLATION_KEYS` (système actuel)
    - Conservation de `SPORT_ICONS` et `SPORT_CARD_STYLES`

## Vérifications effectuées

- ✅ Aucune référence restante à `SPORT_LABELS` dans le codebase
- ✅ Aucune référence restante à `COACHED_SPORTS_OPTIONS` ou `PRACTICED_SPORTS_OPTIONS`
- ✅ Tous les composants utilisent maintenant le système de traduction i18n
- ✅ Les Server Components utilisent `getTranslations()` avec `SPORT_TRANSLATION_KEYS`
- ✅ Les Client Components utilisent `useSportLabel()` ou les hooks d'options

## Architecture finale

```
┌─────────────────────────────────────────────────────────────┐
│                    Traductions (messages/)                   │
│  fr.json: { "sports": { "course": "Course", ... } }         │
│  en.json: { "sports": { "course": "Running", ... } }        │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                            │
┌───────┴──────────┐                    ┌───────────┴──────────┐
│ Client Components│                    │  Server Components   │
│                  │                    │                      │
│ useSportLabel()  │                    │ getTranslations()    │
│ hook             │                    │ + SPORT_KEYS         │
└──────────────────┘                    └──────────────────────┘
        │                                            │
        └─────────────────────┬─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ sportStyles.ts     │
                    │                    │
                    │ SPORT_TRANSLATION_ │
                    │ KEYS               │
                    │ SPORT_ICONS        │
                    │ SPORT_CARD_STYLES  │
                    └────────────────────┘
```

## Bénéfices

1. **Centralisation** : Un seul système pour gérer les traductions de sports
2. **Cohérence** : Tous les composants utilisent le même système
3. **Maintenance** : Plus facile d'ajouter de nouveaux sports ou langues
4. **Type-safety** : Utilisation de `SportType` partout avec TypeScript
5. **Performance** : Les hooks sont optimisés et ne recalculent que si la locale change
6. **Internationalisation** : Support complet des langues (FR/EN actuellement)

## Prochaines étapes possibles

- ✅ Migration complète - aucune action requise
- Les sports sont maintenant traduits partout dans l'application
- Pour ajouter un nouveau sport : 
  1. Ajouter le type dans `SportType` (`lib/sportStyles.ts`)
  2. Ajouter la clé de traduction dans `SPORT_TRANSLATION_KEYS`
  3. Ajouter les traductions dans `messages/fr.json` et `messages/en.json`
  4. Ajouter l'icône dans `SPORT_ICONS` si nécessaire

## Fichiers à garder en référence

- `lib/hooks/useSportLabel.ts` - Pour les Client Components
- `lib/getSportLabel.ts` - Pour les Server Components (si besoin)
- `lib/hooks/useSportsOptions.ts` - Pour les listes d'options
- `lib/sportStyles.ts` - Configuration centralisée des sports

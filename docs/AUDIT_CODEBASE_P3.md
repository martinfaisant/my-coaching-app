# Audit codebase – P3 (Architecture, Design System, Performance, i18n)

**Date :** 17 mars 2026  
**Périmètre :** `app/`, `components/`, `lib/`  
**Références :** `.cursor/rules/project-core.mdc`, `docs/DESIGN_SYSTEM.md`, objectifs P3 (Performance, Accessibilité, Maintenabilité)

---

## État d’avancement (mise à jour)

**Mise à jour :** 18 mars 2026

### ✅ Réalisé depuis l’audit

- **Refactor `WorkoutModal`** (découpage + état hybride + memo) : création de `components/workout-modal/*` (reducer + sous-composants).
- **Quick Wins 1 → 7 : complétés** (logger, metadata login i18n, styles erreur tokens, token shadow forest, i18n Admin Members, typage Locale, i18n fallbacks chat).
- **Build** : `npm run build` OK après changements.

### ⏳ Reste à faire (priorité suggérée)

- **Calendar** : découpage de `components/CalendarView.tsx` (gros monolithe).
- **Modales custom** : migrer `FindCoachSection` / `AthleteSentRequestDetailModal` (et autres) vers `components/Modal` (suppression des `createPortal` maison quand possible).
- **Palette** : remplacer les couleurs **orange/emerald** restantes (Strava, indicateurs) par tokens `palette-*`.
- **i18n typing** : supprimer les derniers `as any` côté navigation (`DashboardNavLinks`, `DashboardTopBar`) via typage de clés.
- **Dashboard loading** : uniformiser les `loading.tsx` (squelettes basés sur `DashboardPageShell`).

---

## 1. Architecture & Maintenabilité

| Fichier | Problème détecté | Priorité | Action recommandée |
|---------|-------------------|----------|---------------------|
| `components/CalendarView.tsx` | Composant très volumineux (~2085 lignes), mélange calendrier, modales (goal, activité Strava), logique de totaux. | **Haute** | Découper : extraire `CalendarWeekColumn`, `CalendarGoalModal`, `CalendarStravaActivityModal`, et un hook `useCalendarData`. |
| `components/WorkoutModal.tsx` | ~1685 lignes, 43 usages useState/useEffect/useCallback/useMemo ; logique formulaire + UI dans le même fichier. | **Haute** | ✅ **Réalisé** : refactor (découpage + état hybride) via `components/workout-modal/*`. |
| `app/[locale]/dashboard/FindCoachSection.tsx` | Très volumineux, modales en `createPortal` custom au lieu du composant `Modal`. | **Haute** | Migrer les modales vers `<Modal>`, extraire `FindCoachOfferList`, `FindCoachRequestModal`, `FindCoachCoachDetailModal`. |
| `components/LoginForm.tsx` | ~453 lignes, formulaire + états + validation dans un seul fichier. | **Moyenne** | Extraire étapes (email, mot de passe, 2FA) en sous-composants et centraliser la validation dans un hook ou `lib/`. |
| Multiples fichiers (PendingRequestTile, AthleteSentRequestDetailModal, ObjectifsTable, RequestGoalsListModal, CoachAthleteCalendarPage, FindCoachSection) | Duplication du rendu « bloc date objectif » (formatGoalDateBlock + monthYear + day + badges Principal/Secondaire). | **Moyenne** | Créer un composant réutilisable `GoalDateBlock` (ou `GoalTileDate`) dans `components/` et le documenter dans DESIGN_SYSTEM.md. |

**Synthèse :** La logique métier est globalement bien dans les Server Actions ; les principaux risques sont les composants monolithiques et la duplication du rendu des tuiles objectifs.

---

## 2. Conformité au Design System

| Fichier | Problème détecté | Priorité | Action recommandée |
|---------|-------------------|----------|---------------------|
| `app/[locale]/dashboard/FindCoachSection.tsx`, `components/SportTileSelectable.tsx`, `components/Segments.tsx`, `components/WorkoutModal.tsx`, `app/[locale]/dashboard/admin/design-system/BadgeShowcase.tsx` | Ombre en dur `shadow-[0_4px_6px_-1px_rgba(98,126,89,0.3)]` (équivalent forest-dark) au lieu d’un token. | **Moyenne** | ✅ **Réalisé** : ajout `shadow-palette-forest` (Tailwind) + remplacements. |
| `components/ActivityTile.tsx`, `components/CalendarView.tsx`, `components/AvailabilityDetailModal.tsx`, `app/.../ActivityTileShowcase.tsx` | Utilisation de `bg-orange-100`, `text-orange-600`, `text-orange-700` pour Strava / indisponible au lieu de tokens (palette-strava, palette-danger ou neutres). | **Moyenne** | Utiliser `palette-strava` et fonds associés (ex. `bg-palette-strava/10`) ; pour « indisponible » utiliser `palette-danger` ou stone selon DESIGN_SYSTEM. |
| `app/[locale]/dashboard/profile/offers/OffersForm.tsx`, `app/.../FindCoachSection.tsx`, `app/.../RequestCoachButton.tsx`, `components/WorkoutModal.tsx`, `components/LoginForm.tsx`, `app/.../ProfileForm.tsx`, `app/.../MembersList.tsx`, etc. | Erreurs affichées avec `text-red-600`, `bg-red-50`, `border-red-200` au lieu des tokens `palette-danger`, `palette-danger-light`, `palette-danger-dark`. | **Haute** | ✅ **Réalisé** : classes centralisées dans `lib/formStyles.ts` (`FORM_ERROR_*_CLASSES`) + remplacements principaux. |
| `components/DashboardTopBar.tsx` | `hover:bg-red-50` sur le bouton Déconnexion. | **Moyenne** | ✅ **Réalisé** : `hover:bg-palette-danger-light`. |
| `components/AthleteTile.tsx` | Indicateur « à jour » : `bg-emerald-500`, `bg-red-400`, `text-red-400`. | **Moyenne** | Utiliser `palette-forest-dark` / `palette-danger` pour cohérence avec la palette. |
| `app/[locale]/dashboard/AthleteSentRequestDetailModal.tsx`, `app/.../FindCoachSection.tsx` | Modales construites avec `createPortal` + divs custom au lieu du composant `<Modal>`. | **Haute** | Refactorer pour utiliser systématiquement `import { Modal } from '@/components/Modal'` (règle project-core). |

**Synthèse :** Les composants standards (Button, Input, Modal, DashboardPageShell) sont majoritairement utilisés ; les écarts concernent surtout les couleurs (red/orange/emerald en dur) et quelques modales custom.

---

## 3. Performance & Robustesse

| Fichier | Problème détecté | Priorité | Action recommandée |
|---------|-------------------|----------|---------------------|
| `components/WorkoutModal.tsx` | Nombreux `useState` et logique inline ; risque de re-renders en chaîne sur champs formulaire. | **Haute** | ✅ **Réalisé** : état formulaire regroupé (reducer hybride) + sous-composants mémoïsés. |
| `components/CalendarView.tsx` | Rendu de nombreuses tuiles par semaine sans virtualisation évidente. | **Moyenne** | Évaluer la virtualisation (react-window / liste virtuelle) si le nombre de semaines ou d’éléments augmente. |
| `lib/dateUtils.ts` | Utilisation de `console.warn` pour dates invalides au lieu du logger centralisé. | **Haute** | ✅ **Réalisé** : `logger.warn` + contexte. |
| `components/DashboardNavLinks.tsx`, `components/DashboardTopBar.tsx` | Cast `t(item.i18nKey as any)` / `t(getPageTitleI18nKey(...) as any)` pour next-intl. | **Moyenne** | Typer correctement les clés i18n (type générique ou namespace) pour supprimer les `as any`. |
| `i18n/request.ts`, `app/[locale]/layout.tsx` | `locale as any` pour `routing.locales.includes(locale)`. | **Moyenne** | ✅ **Réalisé** : type `Locale` (`i18n/types.ts`) + guards `isLocale`. |
| Pages `loading.tsx` (dashboard/devices, profile/offers, objectifs, admin/members), `reset-password/page.tsx` | Utilisation de `<main>` direct au lieu de `DashboardPageShell` (ou squelette cohérent). | **Moyenne** | Utiliser un squelette basé sur DashboardPageShell pour les loading dashboard ; pour reset-password, garder ou documenter l’exception. |
| `app/[locale]/error.tsx`, `app/[locale]/dashboard/error.tsx` | Error boundaries présents ; pas d’error boundary dédié par segment lourd (ex. calendar, find-coach). | **Moyenne** | En P3, envisager des error.tsx au niveau des routes les plus critiques (ex. `dashboard/calendar/error.tsx`). |

**Synthèse :** Pas de try/catch vides détectés. Les types `any` restants sont localisés (i18n, layout). Les principaux gains sont le remplacement de `console.warn` par le logger et la réduction des re-renders dans WorkoutModal.

---

## 4. Internationalisation (i18n)

| Fichier | Problème détecté | Priorité | Action recommandée |
|---------|-------------------|----------|---------------------|
| `app/[locale]/login/layout.tsx` | Metadata en dur : `title: "Connexion"`, `description: "Connectez-vous à votre compte..."`. | **Haute** | ✅ **Réalisé** : `generateMetadata` + clés `metadata.loginTitle/loginDescription` (FR/EN). |
| `app/[locale]/admin/members/MembersList.tsx` | Textes en dur : `ROLE_LABELS` (Athlète, Coach, Admin), « Aucun membre. », « Email », « Rôle », « Action », « Modifier ». | **Haute** | ✅ **Réalisé** : namespace `admin.members.list.*` + `useTranslations`. |
| `app/[locale]/actions/chat.ts` | Fallbacks `getDisplayName(..., 'Athlète')`, `getDisplayName(..., 'Coach')`, `displayName: ... ?? 'Athlète'` (côté serveur). | **Haute** | ✅ **Réalisé** : `getLocale()` + `getTranslations({ locale, namespace: 'common' })` pour fallbacks. |
| `app/[locale]/dashboard/admin/design-system/ButtonShowcase.tsx` | Labels de démo en dur : « Enregistrer », « Annuler », « Déconnexion ». | **Moyenne** | Utiliser des clés i18n de démo ou indiquer clairement que ce sont des labels de référence (et les lier aux clés réelles). |
| `app/[locale]/dashboard/admin/design-system/ActivityTileShowcase.tsx` | Textes en dur : « ✓ Cliqué sur l'activité Strava Run / Ride / Swim ». | **Moyenne** | Remplacer par des clés i18n (namespace design-system ou showcase). |

**Synthèse :** La majorité des écrans utilisent déjà `useTranslations` / `getTranslations`. Les principaux oublis sont le layout login (metadata), la page admin members (table et rôles) et les fallbacks du chat (serveur).

---

## Tableau récapitulatif (tous points)

| Fichier | Problème | Priorité |
|---------|----------|----------|
| `components/CalendarView.tsx` | Composant monolithique ~2085 lignes ; découper en sous-composants et hook. | Haute |
| `components/WorkoutModal.tsx` | ~1685 lignes, trop d’état local ; risque re-renders ; couleurs red/orange. | Haute |
| `app/[locale]/dashboard/FindCoachSection.tsx` | Volumineux ; modales en createPortal au lieu de `<Modal>` ; ombre/couleurs en dur. | Haute |
| `app/[locale]/login/layout.tsx` | Metadata FR en dur (title, description). | Haute |
| `app/[locale]/admin/members/MembersList.tsx` | Textes FR en dur (rôles, table, bouton Modifier). | Haute |
| `app/[locale]/actions/chat.ts` | Fallbacks « Athlète » / « Coach » en dur côté serveur. | Haute |
| `lib/dateUtils.ts` | `console.warn` au lieu de `logger.warn`. | Haute |
| Multiples (OffersForm, FindCoachSection, RequestCoachButton, ProfileForm, LoginForm, MembersList, WorkoutModal, etc.) | Erreurs en `text-red-*` / `bg-red-*` au lieu de tokens palette-danger. | Haute |
| `app/[locale]/dashboard/AthleteSentRequestDetailModal.tsx` | Modale en createPortal au lieu de `<Modal>`. | Haute |
| `components/ActivityTile.tsx`, `CalendarView.tsx`, `AvailabilityDetailModal.tsx` | orange-* / emerald / red pour Strava ou statuts ; utiliser tokens. | Moyenne |
| `components/DashboardNavLinks.tsx`, `DashboardTopBar.tsx` | Cast `as any` sur clés i18n. | Moyenne |
| `i18n/request.ts`, `app/[locale]/layout.tsx` | `locale as any` ; typage Locale. | Moyenne |
| Duplication bloc date objectif | Plusieurs fichiers ; composant `GoalDateBlock` réutilisable. | Moyenne |
| `components/LoginForm.tsx` | Gros formulaire ; découpage en sous-composants. | Moyenne |
| Pages loading.tsx (dashboard) | `<main>` au lieu de squelette DashboardPageShell. | Moyenne |

---

## Quick Wins (modifications simples à fort impact)

1. **Remplacer `console.warn` par `logger.warn` dans `lib/dateUtils.ts`** (4 occurrences) — conforme project-core, traçabilité.
2. **Metadata login :** passer `app/[locale]/login/layout.tsx` en `generateMetadata` + `getTranslations` avec des clés `loginTitle` / `loginDescription` dans les namespaces metadata.
3. **Tokens erreur :** créer des classes ou constantes dans `lib/formStyles.ts` (ex. `FORM_ERROR_TEXT_CLASS`, `FORM_ERROR_BOX_CLASS`) en `text-palette-danger-dark`, `bg-palette-danger-light`, `border-palette-danger` et remplacer progressivement les `text-red-600`, `bg-red-50`, `border-red-200` dans les formulaires et listes.
4. **Token ombre forest :** ajouter dans `tailwind.config.ts` une entrée `shadow-palette-forest` (réutiliser la valeur `rgba(98,126,89,0.3)`) et remplacer les `shadow-[0_4px_6px_...]` dans SportTileSelectable, FindCoachSection, BadgeShowcase, Segments, WorkoutModal.
5. **Admin Members i18n :** ajouter le namespace `admin.members` (ou `admin`) avec les clés pour « Athlète », « Coach », « Admin », « Aucun membre », « Email », « Rôle », « Action », « Modifier » et brancher `useTranslations` dans `MembersList.tsx`.
6. **Typage locale :** définir `type Locale = (typeof routing.locales)[number]` (ou équivalent) dans un fichier partagé et l’utiliser dans `i18n/request.ts` et `app/[locale]/layout.tsx` pour supprimer les `locale as any`.
7. **Fallbacks chat :** dans `app/[locale]/actions/chat.ts`, accepter une `locale` (ou la récupérer du contexte) et utiliser `getTranslations({ locale, namespace: 'common' })` pour les libellés « Athlète » et « Coach » au lieu de chaînes en dur.

### Statut Quick Wins

- ✅ QW1 : `logger.warn` dans `lib/dateUtils.ts`
- ✅ QW2 : metadata login i18n (`metadata.loginTitle/loginDescription`)
- ✅ QW3 : styles erreur tokens (`lib/formStyles.ts`) + remplacements principaux
- ✅ QW4 : token `shadow-palette-forest` + remplacements
- ✅ QW5 : i18n Admin Members (`admin.members.list.*`)
- ✅ QW6 : typage `Locale` (`i18n/types.ts`) + guards (suppression `locale as any`)
- ✅ QW7 : fallbacks chat i18n (`app/[locale]/actions/chat.ts`)

---

**Prochaines étapes suggérées :** Traiter les Quick Wins dans l’ordre ci-dessus, puis planifier le découpage de `CalendarView` et `WorkoutModal` (architecture) et la migration des modales custom vers `<Modal>` (design system + maintenabilité).

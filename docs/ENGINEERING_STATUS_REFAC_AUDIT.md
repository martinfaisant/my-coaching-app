# Engineering status – Refactoring (P1/P2) & Audit (P3)

**Dernière mise à jour :** 18 mars 2026  
**Source canonique :** ce document (les anciens `REFACTORING_P1_P2_COMPLETE.md` et `docs/AUDIT_CODEBASE_P3.md` pointent ici).

---

## 1) Historique – Refactoring P1/P2 (réalisé le 13 février 2026)

Ce chapitre résume les chantiers **P1/P2** terminés (error boundaries, loading states, documentation, `DashboardPageShell`, consolidation styles sport).

### Points importants (toujours vrais)

- **Error boundaries** : `app/[locale]/error.tsx` et `app/[locale]/dashboard/error.tsx` (gestion d’erreur structurée + logging via `logger`, redirection **locale-aware** vers `/${locale}/dashboard`).
- **Loading UX** : alignement des `loading.tsx` avec les layouts cibles (réduction du “flash visuel”).
- **Design system & refactoring** : centralisation des styles sport via `lib/sportStyles.ts` (évite duplications).

### Points à noter (écarts avec l’état actuel)

- Le document historique mentionnait un composant `PageHeader` utilisé par certaines pages/skeletons. **Ce composant a depuis été supprimé** (code mort) et **ne doit plus être considéré comme une référence**.
- `DashboardPageShell` reste le pattern recommandé pour les pages dashboard, mais **sans dépendance à `PageHeader`**.

---

## 2) Audit P3 – état actuel (mars 2026)

### ✅ Quick Wins P3 (faits)

- **Logger** : `lib/dateUtils.ts` – remplacement de `console.warn` par `logger.warn` (4 occurrences) + contexte.
- **Login metadata i18n** : `app/[locale]/login/layout.tsx` → `generateMetadata` + clés `metadata.loginTitle` / `metadata.loginDescription` (FR/EN).
- **Styles erreurs (tokens)** : `lib/formStyles.ts` – ajout `FORM_ERROR_TEXT_CLASSES` et `FORM_ERROR_BOX_CLASSES` + remplacements principaux des `text-red-*`, `bg-red-*`, `border-red-*`.
- **Shadow token** : `tailwind.config.ts` – ajout `shadow-palette-forest` + remplacements des ombres arbitraires.
- **Admin Members i18n** : `app/[locale]/admin/members/MembersList.tsx` – namespace `admin.members.list.*` + messages FR/EN.
- **Typage Locale** : `i18n/types.ts` + guards (suppression des `locale as any`) dans `i18n/request.ts` et `app/[locale]/layout.tsx`.
- **Chat fallbacks i18n** : `app/[locale]/actions/chat.ts` – suppression des fallbacks “Athlète/Coach” en dur, remplacés par `getLocale()` + `getTranslations({ locale, namespace: 'common' })`.

### ✅ Refactor majeur P3 (fait) : `WorkoutModal`

- **Objectif** : réduire la taille, clarifier les responsabilités, limiter les re-renders.
- **Implémentation** : création de `components/workout-modal/*` :
  - `useWorkoutFormReducer.ts` (état formulaire workout + dirty + auto-calc)
  - `CoachWorkoutForm.tsx`, `WorkoutFeedbackSection.tsx` (memo), `DatePickerPopover.tsx`, `icons.tsx`
- **Validation** : `npm run build` OK après refactor.

---

## 3) Reste à faire (P3 – priorités)

| Sujet | Problème | Priorité | Recommandation |
|---|---|---|---|
| `components/CalendarView.tsx` | Composant monolithique (performance/maintenabilité) | Haute | Découper (sous-composants + hook data) ; limiter `createPortal`/UI inline ; envisager virtualisation si volumétrie augmente |
| Modales custom | `createPortal` “maison” dans certaines pages (ex. `FindCoachSection`, `AthleteSentRequestDetailModal`) | Haute | Migrer vers `components/Modal` quand possible |
| Palette Strava / statuts | `orange-*`, `emerald-*` encore présents | Moyenne | Remplacer par tokens `palette-*` (Strava/danger/forest) + fonds `.../10` |
| Typage i18n nav | `as any` dans nav (DashboardTopBar/NavLinks) | Moyenne | Typer les clés i18n (union de clés / mapping) pour supprimer les casts |
| `loading.tsx` dashboard | Certains skeletons utilisent encore `<main>` direct | Moyenne | Uniformiser autour de `DashboardPageShell` (squelettes cohérents) |

---

## 4) Checklist cohérence (état réel vs docs)

- **Build** : `npm run build` doit rester vert après chaque lot P3.
- **Design tokens** : pas de couleurs hex/arbitraires dans les composants UI (hors tokens/tailwind config).
- **i18n** : aucun texte visible en dur (FR/EN) dans UI/actions ; tout via next-intl.


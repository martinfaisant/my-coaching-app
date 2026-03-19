# AGENTS.md - Guide rapide pour agents de code (My Sport Ally)

## 1) Stack technique (ce que tu dois supposer)
- Next.js 16 (App Router), TypeScript strict
- Supabase (Auth + DB) avec RLS partout
- next-intl pour l'i18n FR/EN (routes sous `app/[locale]/`)
- Tailwind CSS + Design System (`docs/DESIGN_SYSTEM.md`)

## 2) Commandes importantes (local)
- Dev: `npm run dev`
- Typecheck: `npm run typecheck`
- Lint: `npm run lint`
- Fix auto: `npm run lint:fix`
- Gate qualite: `npm run check` (lint + typecheck)
- Build verification: `npm run build`

## 3) Sources de verite (verifie avant de specifier/decider)
- Produit / regles metier: `Project_context.md`
- UI tokens + composants + patterns: `docs/DESIGN_SYSTEM.md`
- i18n / namespaces / checklist: `docs/I18N.md` + `messages/fr.json` / `messages/en.json`
- Regles de code Cursor: `.cursor/rules/project-core.mdc` + `.cursorrules`
- Pattern bouton "Enregistrer": `docs/PATTERN_SAVE_BUTTON.md` (+ regle `.cursor/rules/save-button-pattern.mdc`)
- Index docs (evite les doublons): `DOCS_INDEX.md`

## 4) Contraintes absolues (ne jamais les casser)
- Aucun texte visible utilisateur en dur (FR/EN): toujours utiliser next-intl (`useTranslations` / `getTranslations`).
- Aucune couleur hardcodee (hex): utiliser les tokens (ex `palette-forest-dark`, etc.) du Design System.
- Aucun `console.log` / `console.error` (production): utiliser `lib/logger.ts`.
- Aucun type `any` en TypeScript.
- Dashboard: ne pas creer de `<main>` layout custom; utiliser `DashboardPageShell`.
- Modales: ne pas creer de portals custom; utiliser le composant centralise `Modal`.
- Sports: couleurs + icones doivent venir des utilitaires design system:
  - couleurs/tuiles: `lib/sportStyles.ts` (ex `SPORT_CARD_STYLES`)
  - icones: `components/SportIcons.tsx` (via `SPORT_ICONS`)
- DB: toute operation doit respecter RLS + acces role-based:
  - utiliser les helpers `lib/authHelpers.ts` (ex `requireUser`, `requireRole`, `requireCoachOrAthleteAccess`)

## 5) Conventions de developpement (pour etre coherent avec le code existant)
- Reutiliser un composant existant si il couvre au moins ~80% du besoin. Sinon, modifier/etendre le composant existant plutot que re-creer.
- Si tu ajoutes un nouveau composant reusable dans `components/`, documente-le dans `docs/DESIGN_SYSTEM.md`.
- Form styles: utiliser `lib/formStyles.ts` (`FORM_BASE_CLASSES`, `FORM_ERROR_CLASSES`, etc.).
- Errors: utiliser `lib/errors.ts` (et les boundaries prevues dans `app/error.tsx` / `app/dashboard/error.tsx`).
- Server actions:
  - garder le fichier `actions.ts` separe
  - passer la locale depuis le formulaire (ex `formData.get('_locale')`)
  - traduire messages d'erreur/succes via `getTranslations({ locale, namespace })`
- i18n: pour les labels de sports, ne jamais hardcoder; utiliser les hooks/utilitaires de sport labels (ex `lib/sportStyles.ts` / helpers associes).
- Pattern "Enregistrer ✓":
  - pour chaque formulaire avec feedback "✓ Enregistre", suivre `docs/PATTERN_SAVE_BUTTON.md` (transition `pending:true -> false` via cle composite).
- Responsive: respecter le breakpoint de reference `md = 768px` (layout significatif a partir de `md`).
- Eviter les refactors sans benefice direct: preferer un diff minimal.

## 6) Definition of Done (DoD) - pour une tache/feature code
1. La feature respecte la spec/les criteres d'acceptation (UI + comportements).
2. UI:
   - Design system respecte (tokens, composants, sports styles/icone)
   - etats UI couverts (loading/empty/error/disabled selon cas)
3. i18n:
   - toutes les chaines visibles utilisateur sont traduites (FR + EN) dans les namespaces corrects
   - server actions: erreurs/succes traduits via `getTranslations`
4. Qualite:
   - pas de `any`, pas de `console.*` en production
   - erreurs structurees via `lib/errors.ts`
5. Verification:
   - `npm run check` passe
   - `npm run build` passe
6. S'il y a ajout de composant reusable: `docs/DESIGN_SYSTEM.md` mis a jour.
7. S'il y a mise a jour doc: verifier avec `DOCS_INDEX.md` (pas de doublons).

## 7) Regles de securite (eviter changements inutiles/risk)
- Ne touche pas schema DB / policies RLS / auth helpers sans spec explicite. Si besoin non couvert: demander avant d'imposer une modif.
- Ne change pas la separation Athlete / Coach / Admin (et verifie les acces via `lib/authHelpers.ts`).
- Ne cree pas de nouvelles abstractions globales (state, patterns techniques) sans raison claire liee a la spec.
- Ne commit pas de secrets:
  - jamais `.env.local` ni cle service role
  - pas d'infos privees dans des fichiers
- Aucun git operation destructrice (ex `reset --hard`, force push) sauf demande explicite.

## 8) Mini-checklist avant de livrer
- `npm run check` + `npm run build`
- 0 texte visible hardcode en FR/EN
- 0 hex hardcode pour couleurs
- Sports: `lib/sportStyles.ts` + `components/SportIcons.tsx`
- Console: rien en prod, logger uniquement


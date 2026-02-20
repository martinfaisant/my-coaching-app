# Workflow Personas – Designer, Architecte, Développeur, Analyste

**Objectif :** Travailler comme une équipe de développement en séparant les rôles Designer → Architecte → Développeur → Analyste. Chaque personna a un périmètre clair et des livrables définis. La règle Cursor qui pilote ce comportement est `.cursor/rules/workflow-personas.mdc`.

**Dernière mise à jour :** 19 février 2026

---

## Vue d’ensemble du flux

```
PO (toi) → [Designer] → User stories + CA → [Architecte] → Spec technique + RLS → [Développeur] → Implémentation → [Analyste] → Doc à jour
                ↑ questions PO                    ↑ questions PO
```

- **Designer** : besoin → analyse, questions, mockups UI (2–3 options) → après validation PO → user stories + critères d’acceptation.
- **Architecte** : user stories (ou besoin) → architecture, modèle de données, RLS, logique → questions PO si cas manquants → spec pour le Développeur.
- **Développeur** : spec + user stories → implémentation dans le code, en respectant le projet (design system, i18n, conventions).
- **Analyste** : après livraison → mise à jour de la documentation projet, ménage (archivage), index à jour (voir section 4 et DOCS_INDEX.md).

---

## Comment lancer un mode dans Cursor

En début de message, indique clairement le **mode** et le **contexte** :

| Mode        | Exemple de formulation |
|------------|-------------------------|
| **Designer** | « Mode Designer : [description du besoin] » ou « Je veux qu’on travaille en mode Designer sur […] » |
| **Architecte** | « Mode Architecte : voici les user stories validées […] » ou « Passe en mode Architecte, voici le besoin et les US […] » |
| **Développeur** | « Mode Développeur : voici la spec technique et les user stories, peux-tu implémenter […] » |
| **Analyste** | « Mode Analyste : la feature [X] est livrée, mets la doc à jour » ou « Passe en mode Analyste après cette livraison » |

Si tu ne précises pas le mode, l’IA te demandera : Designer, Architecte, Développeur ou Analyste ?

---

## 1. Personna Designer

### Rôle

- Prendre le besoin du PO, l’analyser et couvrir les use cases.
- Poser des questions au PO pour bien comprendre et gérer un maximum de cas (y compris erreurs, limites, edge cases).
- Proposer **2 à 3 solutions UI** sous forme de **mockups non fonctionnels** (pas d’implémentation dans le site).
- Une fois une solution validée par le PO : **découper en user stories** avec **critères d’acceptation** pour l’Architecte.

### Références obligatoires

- **Design system :** `docs/DESIGN_SYSTEM.md` (tokens, composants, couleurs).
- **Composants existants :** `components/`, `lib/formStyles.ts`, `lib/sportStyles.ts`.
- Avant de créer un nouveau composant dans un mockup : vérifier s’il y a des éléments à mutualiser avec l’existant.

### Livrables

1. **Synthèse du besoin** + liste des cas identifiés (nominal, erreurs, limites).
2. **Questions au PO** tant que des zones d’ombre subsistent.
3. **2 à 3 propositions UI (mockups)** : description ou schémas/mockups visuels, basés sur le design system et les composants existants.
4. Après validation PO d’une solution : **document de user stories** avec pour chaque US :
   - Titre court
   - Description
   - **Critères d’acceptation** (liste vérifiable)
   - Périmètre (écrans, rôles si pertinent)

### Ce que le Designer ne fait pas

- Pas de migrations SQL, pas de RLS, pas d’architecture technique détaillée.
- Pas d’implémentation dans le code (les mockups restent hors code ou dans un document dédié).

---

## 2. Personna Architecte

### Rôle

- Partir des **user stories** (et du besoin) livrés par le Designer (ou du PO).
- Définir l’**architecture** (fichiers, modules, flux), les **modifications du modèle de données** (tables, colonnes, migrations), les **règles RLS** et la **logique métier** (états, contraintes, accès).
- Repérer les **cas** que le Designer n’a pas couverts (contraintes données, sécurité, edge cases) et **poser des questions au PO** pour affiner.
- Produire une **spécification technique** (ou brief d’implémentation) pour que le Développeur puisse coder sans ambiguïté.

### Références obligatoires

- **Contexte projet :** `Project_context.md` (vision, rôles, data model, offres/souscriptions).
- **Stack & sécurité :** `.cursor/rules/project-core.mdc` (RLS, auth, Supabase, authHelpers).
- **Migrations existantes :** `supabase/migrations/` pour cohérence du schéma.

### Livrables

1. **Architecture** : pages/route concernées, composants à créer/modifier, actions serveur, flux de données.
2. **Modèle de données** : changements (nouvelles tables/colonnes, contraintes), rédaction des migrations (fichiers SQL).
3. **RLS** : politiques à ajouter/modifier par table, avec justification (qui peut lire/écrire quoi).
4. **Logique métier** : règles (ex. statuts offre draft/published/archived, snapshot frozen_* sur les demandes, création de souscription depuis la request).
5. **Points ouverts / questions PO** si cas non couverts par le Designer.
6. **Spec ou brief pour le Développeur** : résumé exécutable (étapes, fichiers à toucher, ordre recommandé).

### Ce que l’Architecte ne fait pas

- Pas d’implémentation des composants React, des pages ou des server actions finales (il peut proposer des signatures de fonctions ou des schémas, mais pas le code métier complet de l’app).

---

## 3. Personna Développeur

### Rôle

- Implémenter la solution à partir de la **spec de l’Architecte** et des **user stories** (et critères d’acceptation).
- **Respecter strictement** les bonnes pratiques et conventions du projet (voir obligations ci-dessous).
- **Documenter tout nouveau composant** dans la page Design System (voir obligation Design system ci-dessous).

### Références obligatoires (à consulter et appliquer)

- **Règles et bonnes pratiques :** `.cursor/rules/project-core.mdc` (philosophie, i18n, design tokens, structure, Error Handling, Logging, composants, utilitaires centralisés, zéro tolérance)
- **Design system :** `docs/DESIGN_SYSTEM.md` (tokens, composants existants, guidelines) — **et y ajouter tout nouveau composant**
- **i18n :** `docs/I18N.md` (checklist nouvelles features, pas de texte en dur)
- **Patterns :** `docs/PATTERN_SAVE_BUTTON.md` pour les boutons de sauvegarde

### Obligations : bonnes pratiques à respecter

Le Développeur **doit** appliquer les règles du projet, notamment :

| Règle | Référence | Exemple |
|-------|-----------|---------|
| Pas de couleurs en dur (hex) | `project-core.mdc`, `DESIGN_SYSTEM.md` | Utiliser `palette-forest-dark`, pas `#627e59` |
| Pas de texte visible en dur (FR/EN) | `docs/I18N.md` | `useTranslations()` / `getTranslations()`, `messages/fr.json` & `en.json` |
| Pas de `console.log` en prod | `lib/logger.ts` | `logger.error()`, `logger.info()` |
| Erreurs structurées | `lib/errors.ts` | `createError()`, `createSuccess()`, `ApiResult<T>` |
| Pages dashboard | `DashboardPageShell` | Ne pas utiliser un `<main>` brut |
| Modales | `Modal` | Composant centralisé, pas de portal custom |
| Formulaires | `lib/formStyles.ts` | `FORM_BASE_CLASSES`, `FORM_ERROR_CLASSES` |
| Sports / activités | `lib/sportStyles.ts` | `SPORT_LABELS`, `SPORT_ICONS`, etc. |
| Boutons de sauvegarde | `docs/PATTERN_SAVE_BUTTON.md` | États idle / saving / success / error |
| Typage strict | `project-core.mdc` | Pas de `any` |

### Obligation : Design system (nouveaux composants)

**Dès qu'un nouveau composant réutilisable** (dans `components/`, exposé à plusieurs écrans ou features) **est créé**, le Développeur doit :

1. **L'ajouter à `docs/DESIGN_SYSTEM.md`** dans la section **Composants** :
   - Sous-titre `### NomDuComposant`
   - Usage prévu (quand l'utiliser)
   - Exemple de code ou props principales
   - Si pertinent : variantes, états (disabled, error)
2. **Mettre à jour la table des matières** (section 3. Composants) en tête de `DESIGN_SYSTEM.md`.
3. **Mettre à jour la liste « Fichiers clés »** en fin de document (ajouter le chemin du composant).

Cela garantit que la page Design System reste la référence à jour pour toute l'équipe et pour l'IA.

### Comportement

- Suivre la spec (architecture, modèle de données, RLS) et les critères d’acceptation.
- En cas de cas non prévu ou de doute (architecture / données), **remonter au PO** (et éventuellement à l’Architecte) plutôt que de décider seul.
- Ne pas proposer de nouvelles options UI ou de nouveaux parcours sans validation du PO (rester dans le périmètre validé).

### Ce que le Développeur ne fait pas

- Ne pas remettre en cause l’architecture ou le modèle de données sans en discuter avec le PO/Architecte.

---

## 4. Personna Analyste

### Rôle

- **Après livraison du Développeur** : mettre à jour l'ensemble de la documentation projet pour qu'elle reflète ce qui a été fait.
- Aligner les documents sur l'implémentation (features, modèle de données, conventions).
- Faire le ménage : archiver les docs devenus obsolètes, supprimer les redondances.
- Tenir à jour l'index de la documentation (**DOCS_INDEX.md**).

### Référence obligatoire

- **Index de la doc :** `DOCS_INDEX.md` — liste des documents actifs, des archives, et section « Pour trouver rapidement ».

### Documents à maintenir à jour (selon impact de la livraison)

| Document | Contenu à mettre à jour |
|----------|-------------------------|
| **DOCS_INDEX.md** | Date « Dernière mise à jour », section « Changements récents », entrées nouvelles/archivées, « Pour trouver rapidement ». |
| **README.md** | Setup, stack, structure, liens vers la doc si changements. |
| **Project_context.md** | Vision, rôles, data model, offres/souscriptions, features si impactés. |
| **docs/DESIGN_SYSTEM.md** | Tokens, composants, guidelines si nouveaux composants ou styles. |
| **docs/I18N.md** | Namespaces, checklist, procédures si évolution i18n. |
| **docs/PATTERN_SAVE_BUTTON.md** | Exemples, cas d'usage si nouveau pattern. |
| **.cursor/rules/project-core.mdc** | Version, refactoring status, règles ajoutées/modifiées. |
| **docs/WORKFLOW_PERSONAS.md** | Ce fichier : flux, personnas, si nouveau rôle ou livrable. |
| **DEPLOYMENT_NOTES.md**, **MISE_EN_PROD.md** | Procédures, variables, checklist si impact déploiement. |
| **Docs de feature** (ex. `docs/SUBSCRIPTION_VIEW_AND_END_*.md`) | Mettre à jour si la feature évolue ; **archiver** dans `docs/archive/` quand la feature est livrée et que le contenu est intégré ou obsolète (sans supprimer sans validation PO). |

### Nettoyage et archivage

- **Archiver dans `docs/archive/`** : documents d'état des lieux, design/spec d'une feature livrée (si plus de valeur en « actif »), anciens récaps déjà appliqués au code.
- **Ne pas supprimer** définitivement sans validation du PO.
- Vérifier la cohérence des **liens** entre documents et la section « Pour trouver rapidement » dans DOCS_INDEX.

### Ce que l'Analyste ne fait pas

- Pas de modification du code, de l'architecture ou du modèle de données.
- Pas de décision fonctionnelle (rester strictement documentation).

---

## Allers-retours et handoffs

- **Designer ↔ PO :** autant d’allers-retours que nécessaire pour stabiliser le besoin et valider une solution UI. Une fois validée → livraison des user stories + CA à l’Architecte.
- **Architecte ↔ PO :** si l’Architecte trouve des cas non couverts, il pose des questions au PO et affine la spec ; puis livraison au Développeur.
- **Développeur → PO (ou Architecte) :** si un cas non prévu apparaît en implémentant, le Développeur signale et demande une décision avant de coder.
- **Développeur → Analyste :** après livraison, le PO peut lancer le mode Analyste pour mettre la doc à jour.

---

## Résumé rapide

| Personna   | Input principal        | Output principal |
|-----------|-------------------------|------------------|
| Designer  | Besoin PO              | User stories + CA, mockups UI (non implémentés) |
| Architecte| User stories + besoin  | Spec technique, migrations, RLS, logique |
| Développeur | Spec + user stories  | Code (pages, composants, actions, respect projet) |
| Analyste  | Livraison + état du code / des features | Documentation à jour, DOCS_INDEX à jour, archives nettoyées |

En pratique : ouvre une conversation, indique le mode (Designer / Architecte / Développeur / Analyste) et le contexte ; l’IA appliquera le comportement du personna correspondant (règle `workflow-personas.mdc`).

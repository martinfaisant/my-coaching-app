# Workflow Personas – Designer, Architecte, Développeur, Analyste

**Objectif :** Travailler comme une équipe de développement en séparant les rôles Designer → Architecte → Développeur → Analyste. Chaque personna a un périmètre clair et des livrables définis. La règle Cursor qui pilote ce comportement est `.cursor/rules/workflow-personas.mdc`.

**Dernière mise à jour :** 21 février 2026

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
3. **2 à 3 propositions UI (mockups)** : description ou schémas/mockups visuels (HTML dans un document dédié), basés sur le design system et les composants existants. Pour chaque proposition : **lister les composants du design system à utiliser tels quels** et **ceux à faire évoluer** (avec raison courte).
4. Après validation PO d’une solution : **document de user stories** avec pour chaque US :
   - Titre court
   - Description
   - **Critères d’acceptation** (liste vérifiable)
   - Périmètre (écrans, rôles si pertinent)
   - **Référence mockup** : section ou zone du mockup correspondante (ex. « voir mockup lignes 34–51 » ou « bloc en-tête 2 lignes »)
   - *(Optionnel)* Zones de texte à prévoir en i18n (sans rédiger les clés ; indiquer le namespace probable, ex. `calendar`)

### Checklist avant livraison des US (à l’Architecte)

- [ ] Design system et composants existants consultés ; composants à réutiliser / à faire évoluer listés dans le doc.
- [ ] Mockup ouvert dans un navigateur et validé visuellement.
- [ ] Chaque user story comporte une **référence au mockup** (quelle zone ou écran correspond).

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
2. **Table des fichiers** (obligatoire) : pour chaque fichier concerné — Fichier | Rôle | Modif (créer / modifier). Permet au Développeur de savoir où agir sans ambiguïté.
3. **Modèle de données** : changements (nouvelles tables/colonnes, contraintes), rédaction des migrations (fichiers SQL). **Si aucun changement BDD** : le préciser clairement en tête de spec (ex. « Aucune modification du schéma, des migrations ou des RLS »).
4. **RLS** : politiques à ajouter/modifier par table, avec justification (qui peut lire/écrire quoi).
5. **Logique métier** : règles (ex. statuts offre draft/published/archived, snapshot frozen_* sur les demandes, création de souscription depuis la request).
6. **Points ouverts / questions PO** si cas non couverts par le Designer. Si une décision est laissée au Développeur (ex. « CSS-only vs hook viewport »), le marquer explicitement comme « à trancher en implémentation » avec les options.
7. **Section « Tests manuels recommandés »** : courte liste de vérifications pour que le Développeur valide la livraison (ex. « Redimensionner sous 768px », « Calendrier athlète + coach »).
8. **Spec ou brief pour le Développeur** : résumé exécutable (étapes, fichiers à toucher, ordre recommandé).

### Checklist avant livraison de la spec (au Développeur)

- [ ] Migrations numérotées et cohérentes avec `supabase/migrations/` (ou « aucun changement BDD » indiqué).
- [ ] RLS justifiées (qui lit/écrive quoi).
- [ ] Table des fichiers à modifier/créer présente.
- [ ] Cas limites listés (hydration, edge cases) le cas échéant.
- [ ] Tests manuels recommandés indiqués.

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
- **Suivre le mockup HTML** validé par le PO : vérifier que le rendu final respecte le mockup (layout, breakpoints, composants). En cas d’écart assumé, le signaler au PO.
- En cas de cas non prévu ou de doute (architecture / données), **remonter au PO** (et éventuellement à l’Architecte) plutôt que de décider seul.
- Ne pas proposer de nouvelles options UI ou de nouveaux parcours sans validation du PO (rester dans le périmètre validé).

### Livrable pour l’Analyste (en fin d’implémentation)

- **Liste des fichiers créés ou modifiés** (et, si utile, une phrase de résumé par feature). Facilite la mise à jour de la doc et de DOCS_INDEX sans relire tout le code.
- *(Optionnel)* Courte note de livraison pour le PO (ex. « Implémentation issue #44 terminée : AthleteCalendarPage, CoachAthleteCalendarPage, CalendarView ; breakpoint md ; pas de migration »).

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

### Règle Garder / Fusionner / Archiver (docs de feature)

Pour **chaque document de feature** (design, spec, mockup HTML) après livraison du Développeur :

| Décision | Quand | Action |
|----------|--------|--------|
| **Garder** | Le doc reste la référence courante (ex. spec encore utilisée pour des évolutions). | Laisser en documentation active ; mettre à jour DOCS_INDEX si besoin. |
| **Fusionner** | L’info doit vivre dans les docs permanents. | **Transférer** l’info utile vers les docs actifs (voir ci-dessous), puis **archiver** le doc dans `docs/archive/`. |
| **Archiver** | La feature est livrée, le doc n’est plus la référence du quotidien. | Déplacer dans `docs/archive/` (éventuellement sous-dossier par feature, ex. `docs/archive/calendar-mobile-44/`). Documenter dans DOCS_INDEX : date d’archivage, raison courte, « voir Project_context §X » ou « voir DESIGN_SYSTEM §Y ». |

**Où transférer l’info avant d’archiver :**

- **Comportement produit / feature** → `Project_context.md` (section features ou data model).
- **Comportement UI, responsive, nouveaux composants** → `docs/DESIGN_SYSTEM.md`.
- **Décisions techniques importantes** → `Project_context.md` ou section dédiée si elle existe.
- **Récap « ce qui a été fait »** → `DOCS_INDEX.md`, section « Changements récents ».

Ensuite : archiver le doc de feature (design, spec, mockup) pour ne pas encombrer la doc active ; l’historique reste disponible dans `docs/archive/`.

### Nettoyage et archivage

- **Archiver dans `docs/archive/`** : documents d'état des lieux, design/spec/mockup d'une feature livrée une fois l’info transférée dans les docs actifs (voir règle ci-dessus).
- **Ne pas supprimer** définitivement sans validation du PO.
- Après archivage : **vérifier la cohérence des liens** (DOCS_INDEX, « Pour trouver rapidement », liens cross-doc) et mettre à jour les renvois vers les docs archivés.

### Ce que l'Analyste ne fait pas

- Pas de modification du code, de l'architecture ou du modèle de données.
- Pas de décision fonctionnelle (rester strictement documentation).

---

## Allers-retours et handoffs

- **Designer ↔ PO :** autant d’allers-retours que nécessaire pour stabiliser le besoin et valider une solution UI. Une fois validée → livraison des user stories + CA (avec référence mockup) à l’Architecte.
- **Architecte ↔ PO :** si l’Architecte trouve des cas non couverts, il pose des questions au PO et affine la spec ; puis livraison au Développeur (table des fichiers + tests manuels recommandés).
- **Développeur → PO (ou Architecte) :** si un cas non prévu apparaît en implémentant, le Développeur signale et demande une décision avant de coder.
- **Développeur → Analyste :** après livraison, le Développeur fournit la liste des fichiers créés/modifiés ; le PO lance le mode Analyste pour mettre la doc à jour, transférer l’info utile puis archiver les docs de feature.

---

## Résumé rapide

| Personna   | Input principal        | Output principal |
|-----------|-------------------------|------------------|
| Designer  | Besoin PO              | User stories + CA + référence mockup, mockups UI (non implémentés), checklist avant livraison |
| Architecte| User stories + besoin  | Spec technique, table des fichiers, migrations/RLS, tests manuels recommandés, checklist avant livraison |
| Développeur | Spec + user stories  | Code (respect mockup + projet), liste fichiers modifiés pour l’Analyste |
| Analyste  | Livraison + liste fichiers | Doc à jour, transfert info → docs actifs, archivage docs de feature (Garder/Fusionner/Archiver) |

En pratique : ouvre une conversation, indique le mode (Designer / Architecte / Développeur / Analyste) et le contexte ; l’IA appliquera le comportement du personna correspondant (règle `workflow-personas.mdc`).
